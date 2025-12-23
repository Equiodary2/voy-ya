import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { ENV } from "./env";

let io: SocketIOServer | null = null;

/**
 * Initialize Socket.io server for real-time ride tracking
 */
export function initializeSocket(httpServer: HTTPServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
  });

  // Connection event
  io.on("connection", (socket: Socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Join room for driver location updates
    socket.on("driver:join", (driverId: number) => {
      socket.join(`driver:${driverId}`);
      console.log(`[Socket.io] Driver ${driverId} joined room`);
    });

    // Leave driver room
    socket.on("driver:leave", (driverId: number) => {
      socket.leave(`driver:${driverId}`);
      console.log(`[Socket.io] Driver ${driverId} left room`);
    });

    // Join room for ride updates
    socket.on("ride:join", (rideId: number) => {
      socket.join(`ride:${rideId}`);
      console.log(`[Socket.io] Client joined ride ${rideId} room`);
    });

    // Leave ride room
    socket.on("ride:leave", (rideId: number) => {
      socket.leave(`ride:${rideId}`);
      console.log(`[Socket.io] Client left ride ${rideId} room`);
    });

    // Update driver location
    socket.on("driver:location", (data: { driverId: number; latitude: number; longitude: number }) => {
      // Broadcast to all clients in the driver's room
      io?.to(`driver:${data.driverId}`).emit("driver:location:update", {
        driverId: data.driverId,
        latitude: data.latitude,
        longitude: data.longitude,
        timestamp: new Date(),
      });
    });

    // Ride status update
    socket.on("ride:status", (data: { rideId: number; status: string; driverId?: number }) => {
      io?.to(`ride:${data.rideId}`).emit("ride:status:update", {
        rideId: data.rideId,
        status: data.status,
        timestamp: new Date(),
      });
    });

    // New ride request notification
    socket.on("ride:request", (data: { driverId: number; rideId: number; pickupLocation: string }) => {
      io?.to(`driver:${data.driverId}`).emit("ride:request:new", {
        rideId: data.rideId,
        pickupLocation: data.pickupLocation,
        timestamp: new Date(),
      });
    });

    // Driver accepted ride
    socket.on("ride:accepted", (data: { rideId: number; driverId: number; driverName: string }) => {
      io?.to(`ride:${data.rideId}`).emit("ride:accepted:update", {
        driverId: data.driverId,
        driverName: data.driverName,
        timestamp: new Date(),
      });
    });

    // Disconnect event
    socket.on("disconnect", () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });

    // Error handling
    socket.on("error", (error: any) => {
      console.error(`[Socket.io] Error: ${error}`);
    });
  });

  return io;
}

/**
 * Get the Socket.io instance
 */
export function getSocket(): SocketIOServer | null {
  return io;
}

/**
 * Emit event to a specific room
 */
export function emitToRoom(room: string, event: string, data: any): void {
  if (io) {
    io.to(room).emit(event, data);
  }
}

/**
 * Emit event to all connected clients
 */
export function emitToAll(event: string, data: any): void {
  if (io) {
    io.emit(event, data);
  }
}

/**
 * Broadcast driver location to all riders
 */
export function broadcastDriverLocation(
  driverId: number,
  latitude: number,
  longitude: number
): void {
  if (io) {
    io.to(`driver:${driverId}`).emit("driver:location:update", {
      driverId,
      latitude,
      longitude,
      timestamp: new Date(),
    });
  }
}

/**
 * Notify rider of driver arrival
 */
export function notifyDriverArrival(rideId: number, driverId: number, driverName: string): void {
  if (io) {
    io.to(`ride:${rideId}`).emit("driver:arrived", {
      driverId,
      driverName,
      timestamp: new Date(),
    });
  }
}

/**
 * Notify of ride completion
 */
export function notifyRideCompletion(rideId: number, fare: number): void {
  if (io) {
    io.to(`ride:${rideId}`).emit("ride:completed", {
      rideId,
      fare,
      timestamp: new Date(),
    });
  }
}
