import { useEffect, useState, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

let globalSocket: Socket | null = null;

/**
 * Hook para conectarse a Socket.io y manejar eventos en tiempo real
 */
export function useSocket() {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Reutilizar conexión global si existe
    if (globalSocket && globalSocket.connected) {
      socketRef.current = globalSocket;
      setConnected(true);
      return;
    }

    // Conectar a Socket.io
    const socket = io(process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000", {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socket.on("connect", () => {
      console.log("[Socket.io] Connected:", socket.id);
      setConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("[Socket.io] Disconnected");
      setConnected(false);
    });

    socket.on("error", (error: any) => {
      console.error("[Socket.io] Error:", error);
    });

    socketRef.current = socket;
    globalSocket = socket;

    return () => {
      // No desconectar globalmente, solo limpiar referencia local
    };
  }, []);

  // Función para emitir eventos
  const emit = useCallback((event: string, data?: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn("[Socket.io] Socket not connected, cannot emit:", event);
    }
  }, []);

  // Función para escuchar eventos
  const on = useCallback((event: string, callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  }, []);

  // Función para dejar de escuchar eventos
  const off = useCallback((event: string, callback?: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  }, []);

  // Función para unirse a una sala
  const joinRoom = useCallback((room: string) => {
    emit("room:join", { room });
  }, [emit]);

  // Función para salir de una sala
  const leaveRoom = useCallback((room: string) => {
    emit("room:leave", { room });
  }, [emit]);

  return {
    socket: socketRef.current,
    connected,
    emit,
    on,
    off,
    joinRoom,
    leaveRoom,
  };
}

/**
 * Hook específico para seguimiento de ubicación del conductor
 */
export function useDriverLocation(driverId: number) {
  const { emit, on, off } = useSocket();
  const [driverLocation, setDriverLocation] = useState<{
    latitude: number;
    longitude: number;
    timestamp: Date;
  } | null>(null);

  useEffect(() => {
    if (!driverId) return;

    // Unirse a la sala del conductor
    emit("driver:join", driverId);

    // Escuchar actualizaciones de ubicación
    const handleLocationUpdate = (data: any) => {
      setDriverLocation({
        latitude: data.latitude,
        longitude: data.longitude,
        timestamp: new Date(data.timestamp),
      });
    };

    on("driver:location:update", handleLocationUpdate);

    return () => {
      off("driver:location:update", handleLocationUpdate);
      emit("driver:leave", driverId);
    };
  }, [driverId, emit, on, off]);

  return driverLocation;
}

/**
 * Hook específico para actualizaciones de estado de viaje
 */
export function useRideStatus(rideId: number) {
  const { emit, on, off } = useSocket();
  const [rideStatus, setRideStatus] = useState<{
    status: string;
    timestamp: Date;
  } | null>(null);

  useEffect(() => {
    if (!rideId) return;

    // Unirse a la sala del viaje
    emit("ride:join", rideId);

    // Escuchar actualizaciones de estado
    const handleStatusUpdate = (data: any) => {
      setRideStatus({
        status: data.status,
        timestamp: new Date(data.timestamp),
      });
    };

    on("ride:status:update", handleStatusUpdate);

    return () => {
      off("ride:status:update", handleStatusUpdate);
      emit("ride:leave", rideId);
    };
  }, [rideId, emit, on, off]);

  return rideStatus;
}

/**
 * Hook para notificaciones de nuevos viajes (para conductores)
 */
export function useNewRideNotification(driverId: number) {
  const { emit, on, off } = useSocket();
  const [newRide, setNewRide] = useState<any | null>(null);

  useEffect(() => {
    if (!driverId) return;

    // Unirse a la sala del conductor
    emit("driver:join", driverId);

    // Escuchar nuevas solicitudes de viaje
    const handleNewRide = (data: any) => {
      setNewRide(data);
    };

    on("ride:request:new", handleNewRide);

    return () => {
      off("ride:request:new", handleNewRide);
      emit("driver:leave", driverId);
    };
  }, [driverId, emit, on, off]);

  return newRide;
}
