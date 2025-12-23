import { useEffect, useRef, useState } from "react";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Configurar el manejador de notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  } as any),
});

export interface NotificationData {
  title: string;
  body: string;
  data?: Record<string, any>;
}

/**
 * Hook para gestionar notificaciones push
 */
export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  useEffect(() => {
    registerForPushNotifications();

    // Escuchar notificaciones recibidas
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification);
      console.log("[Notifications] Received:", notification);
    }) as any;

    // Escuchar respuestas a notificaciones (cuando el usuario toca la notificación)
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("[Notifications] Response:", response);
      handleNotificationResponse(response);
    }) as any;

    return () => {
      if (notificationListener.current) {
        (notificationListener.current as any).remove();
      }
      if (responseListener.current) {
        (responseListener.current as any).remove();
      }
    };
  }, []);

  const registerForPushNotifications = async () => {
    try {
      // Solicitar permiso de notificaciones
      const { status } = await Notifications.requestPermissionsAsync();

      if (status !== "granted") {
        console.log("[Notifications] Permission denied");
        return;
      }

      // Obtener token de Expo Push
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      setExpoPushToken(token);
      console.log("[Notifications] Expo Push Token:", token);
    } catch (error) {
      console.error("[Notifications] Error registering:", error);
    }
  };

  const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
    const { notification } = response;
    const data = notification.request.content.data;

    // Aquí puedes manejar acciones específicas según el tipo de notificación
    if (data.type === "new_ride_request") {
      console.log("[Notifications] New ride request:", data);
      // Navegar a pantalla de solicitud
    } else if (data.type === "driver_arriving") {
      console.log("[Notifications] Driver arriving:", data);
      // Mostrar alerta
    } else if (data.type === "ride_completed") {
      console.log("[Notifications] Ride completed:", data);
      // Navegar a pantalla de calificación
    }
  };

  /**
   * Enviar notificación local (para testing)
   */
  const sendLocalNotification = async (data: NotificationData) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: data.title,
          body: data.body,
          data: data.data || {},
          sound: "default",
          badge: 1,
        },
        trigger: {
          type: "time" as any,
          seconds: 2,
        },
      });
      console.log("[Notifications] Local notification scheduled");
    } catch (error) {
      console.error("[Notifications] Error sending local notification:", error);
    }
  };

  /**
   * Enviar notificación a través del servidor (requiere backend)
   */
  const sendPushNotification = async (
    targetToken: string,
    data: NotificationData
  ) => {
    try {
      const message = {
        to: targetToken,
        sound: "default",
        title: data.title,
        body: data.body,
        data: data.data || {},
        ttl: 24 * 60 * 60 * 1000, // 24 horas
      };

      const response = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Accept-encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });

      const result = await response.json();
      console.log("[Notifications] Push sent:", result);
      return result;
    } catch (error) {
      console.error("[Notifications] Error sending push notification:", error);
      throw error;
    }
  };

  return {
    expoPushToken,
    notification,
    sendLocalNotification,
    sendPushNotification,
  };
}

/**
 * Hook para notificaciones específicas de viajes
 */
export function useRideNotifications() {
  const { sendLocalNotification, sendPushNotification } = useNotifications();

  const notifyNewRideRequest = async (
    driverToken?: string,
    rideDetails?: { pickupAddress: string; dropoffAddress: string; fare: string }
  ) => {
    const data: NotificationData = {
      title: "🚗 Nueva Solicitud de Viaje",
      body: rideDetails
        ? `De ${rideDetails.pickupAddress} a ${rideDetails.dropoffAddress} - ${rideDetails.fare}`
        : "Tienes una nueva solicitud de viaje",
      data: {
        type: "new_ride_request",
        ...rideDetails,
      },
    };

    if (driverToken) {
      await sendPushNotification(driverToken, data);
    } else {
      await sendLocalNotification(data);
    }
  };

  const notifyDriverArriving = async (
    riderToken?: string,
    driverName?: string
  ) => {
    const data: NotificationData = {
      title: "🚗 Conductor Llegando",
      body: driverName ? `${driverName} está llegando a tu ubicación` : "Tu conductor está llegando",
      data: {
        type: "driver_arriving",
        driverName,
      },
    };

    if (riderToken) {
      await sendPushNotification(riderToken, data);
    } else {
      await sendLocalNotification(data);
    }
  };

  const notifyRideCompleted = async (
    riderToken?: string,
    fare?: string
  ) => {
    const data: NotificationData = {
      title: "✅ Viaje Completado",
      body: fare ? `Total: ${fare}. Califica tu experiencia` : "Por favor califica tu viaje",
      data: {
        type: "ride_completed",
        fare,
      },
    };

    if (riderToken) {
      await sendPushNotification(riderToken, data);
    } else {
      await sendLocalNotification(data);
    }
  };

  const notifyRideCancelled = async (
    token?: string,
    reason?: string
  ) => {
    const data: NotificationData = {
      title: "❌ Viaje Cancelado",
      body: reason || "Tu viaje ha sido cancelado",
      data: {
        type: "ride_cancelled",
        reason,
      },
    };

    if (token) {
      await sendPushNotification(token, data);
    } else {
      await sendLocalNotification(data);
    }
  };

  return {
    notifyNewRideRequest,
    notifyDriverArriving,
    notifyRideCompleted,
    notifyRideCancelled,
  };
}
