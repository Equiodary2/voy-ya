import { useEffect, useState, useCallback } from "react";
import * as Location from "expo-location";

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
}

interface UseLocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

/**
 * Hook para obtener la ubicación actual del usuario
 */
export function useLocation(options: UseLocationOptions = {}) {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const requestLocationPermission = async () => {
      try {
        setLoading(true);
        setError(null);

        // Solicitar permiso de ubicación
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          throw new Error("Permiso de ubicación denegado");
        }

        // Obtener ubicación actual
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: options.enableHighAccuracy
            ? Location.Accuracy.Highest
            : Location.Accuracy.High,
        });

        if (isMounted) {
          setLocation({
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
            accuracy: currentLocation.coords.accuracy || undefined,
            altitude: currentLocation.coords.altitude || undefined,
            heading: currentLocation.coords.heading || undefined,
            speed: currentLocation.coords.speed || undefined,
          });
        }
      } catch (err) {
        if (isMounted) {
          const errorMessage = err instanceof Error ? err.message : "Error desconocido";
          setError(errorMessage);
          console.error("[Location] Error:", errorMessage);

          // Usar ubicación por defecto (Nueva York) en caso de error
          setLocation({
            latitude: 40.7128,
            longitude: -74.006,
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    requestLocationPermission();

    return () => {
      isMounted = false;
    };
  }, [options.enableHighAccuracy, options.timeout]);

  return { location, loading, error };
}

/**
 * Hook para seguimiento continuo de ubicación
 */
export function useLocationTracking(
  onLocationChange?: (location: UserLocation) => void,
  options: UseLocationOptions = {}
) {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  const startTracking = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Solicitar permiso de ubicación
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        throw new Error("Permiso de ubicación denegado");
      }

      // Iniciar seguimiento de ubicación
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: options.enableHighAccuracy
            ? Location.Accuracy.Highest
            : Location.Accuracy.High,
          timeInterval: 1000, // Actualizar cada 1 segundo
          distanceInterval: 10, // O cuando se mueva 10 metros
        },
        (newLocation) => {
          const userLocation: UserLocation = {
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
            accuracy: newLocation.coords.accuracy || undefined,
            altitude: newLocation.coords.altitude || undefined,
            heading: newLocation.coords.heading || undefined,
            speed: newLocation.coords.speed || undefined,
          };

          setLocation(userLocation);
          onLocationChange?.(userLocation);
        }
      );

      setIsTracking(true);
      setLoading(false);

      return subscription;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      console.error("[LocationTracking] Error:", errorMessage);
      setLoading(false);
      return null;
    }
  }, [options.enableHighAccuracy, onLocationChange]);

  const stopTracking = useCallback((subscription: Location.LocationSubscription | null) => {
    if (subscription) {
      subscription.remove();
      setIsTracking(false);
    }
  }, []);

  return { location, loading, error, isTracking, startTracking, stopTracking };
}

/**
 * Hook para obtener dirección a partir de coordenadas (reverse geocoding)
 */
export function useReverseGeocoding(latitude?: number, longitude?: number) {
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!latitude || !longitude) {
      return;
    }

    const reverseGeocode = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (result.length > 0) {
          const { street, city, region, postalCode } = result[0];
          const addressString = [street, city, region, postalCode]
            .filter(Boolean)
            .join(", ");
          setAddress(addressString || "Ubicación desconocida");
        } else {
          setAddress("Ubicación desconocida");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Error desconocido";
        setError(errorMessage);
        console.error("[ReverseGeocoding] Error:", errorMessage);
      } finally {
        setLoading(false);
      }
    };

    reverseGeocode();
  }, [latitude, longitude]);

  return { address, loading, error };
}

/**
 * Hook para geocoding (obtener coordenadas a partir de dirección)
 */
export function useGeocoding(address?: string) {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      return;
    }

    const geocode = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await Location.geocodeAsync(address);

        if (result.length > 0) {
          const { latitude, longitude, accuracy } = result[0];
          setLocation({
            latitude,
            longitude,
            accuracy: accuracy || undefined,
          });
        } else {
          setError("Ubicación no encontrada");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Error desconocido";
        setError(errorMessage);
        console.error("[Geocoding] Error:", errorMessage);
      } finally {
        setLoading(false);
      }
    };

    geocode();
  }, [address]);

  return { location, loading, error };
}

/**
 * Calcular distancia entre dos puntos (Haversine formula)
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
