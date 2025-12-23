import React, { useEffect, useRef } from "react";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import { ThemedView } from "../themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

interface Location {
  latitude: number;
  longitude: number;
  title?: string;
}

interface MapViewProps {
  pickupLocation?: Location;
  dropoffLocation?: Location;
  driverLocation?: Location;
  userLocation?: Location;
  onMapReady?: () => void;
  onLocationSelect?: (location: Location) => void;
  showRoute?: boolean;
  style?: any;
}

/**
 * Componente de mapa interactivo para Voy Ya
 * 
 * Nota: Esta es una implementación base que requiere:
 * 1. Integración con react-native-maps
 * 2. Configuración de Google Maps API key
 * 3. Implementación de cálculo de rutas
 * 
 * Para producción, instalar: pnpm add react-native-maps
 */
export function MapView({
  pickupLocation,
  dropoffLocation,
  driverLocation,
  userLocation,
  onMapReady,
  onLocationSelect,
  showRoute = false,
  style,
}: MapViewProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const mapRef = useRef<any>(null);

  useEffect(() => {
    // Cuando el mapa esté listo, ajustar la vista
    if (onMapReady) {
      onMapReady();
    }
  }, [onMapReady]);

  // Función para calcular región del mapa basada en ubicaciones
  const calculateRegion = () => {
    if (!userLocation && !pickupLocation && !dropoffLocation) {
      // Ubicación por defecto (Nueva York)
      return {
        latitude: 40.7128,
        longitude: -74.006,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }

    const locations = [
      userLocation,
      pickupLocation,
      dropoffLocation,
      driverLocation,
    ].filter(Boolean) as Location[];

    if (locations.length === 0) {
      return {
        latitude: 40.7128,
        longitude: -74.006,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }

    const minLat = Math.min(...locations.map((l) => l.latitude));
    const maxLat = Math.max(...locations.map((l) => l.latitude));
    const minLng = Math.min(...locations.map((l) => l.longitude));
    const maxLng = Math.max(...locations.map((l) => l.longitude));

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(maxLat - minLat, 0.05) * 1.5,
      longitudeDelta: Math.max(maxLng - minLng, 0.05) * 1.5,
    };
  };

  return (
    <ThemedView style={[styles.container, style]}>
      {/* Placeholder para mapa */}
      <View style={styles.mapPlaceholder}>
        <ActivityIndicator
          size="large"
          color={colors.tint}
          style={styles.loader}
        />
        
        {/* Información de ubicaciones */}
        <View style={styles.infoContainer}>
          {userLocation && (
            <View style={styles.infoItem}>
              <View style={[styles.dot, { backgroundColor: "#00D9FF" }]} />
              <View style={styles.infoText}>
                <View style={styles.infoLabel}>Mi ubicación</View>
                <View style={styles.infoCoords}>
                  {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
                </View>
              </View>
            </View>
          )}

          {pickupLocation && (
            <View style={styles.infoItem}>
              <View style={[styles.dot, { backgroundColor: "#4ECDC4" }]} />
              <View style={styles.infoText}>
                <View style={styles.infoLabel}>
                  {pickupLocation.title || "Recogida"}
                </View>
                <View style={styles.infoCoords}>
                  {pickupLocation.latitude.toFixed(4)}, {pickupLocation.longitude.toFixed(4)}
                </View>
              </View>
            </View>
          )}

          {dropoffLocation && (
            <View style={styles.infoItem}>
              <View style={[styles.dot, { backgroundColor: "#FF6B6B" }]} />
              <View style={styles.infoText}>
                <View style={styles.infoLabel}>
                  {dropoffLocation.title || "Destino"}
                </View>
                <View style={styles.infoCoords}>
                  {dropoffLocation.latitude.toFixed(4)}, {dropoffLocation.longitude.toFixed(4)}
                </View>
              </View>
            </View>
          )}

          {driverLocation && (
            <View style={styles.infoItem}>
              <View style={[styles.dot, { backgroundColor: "#FFB800" }]} />
              <View style={styles.infoText}>
                <View style={styles.infoLabel}>Conductor</View>
                <View style={styles.infoCoords}>
                  {driverLocation.latitude.toFixed(4)}, {driverLocation.longitude.toFixed(4)}
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Nota sobre integración */}
        <View style={styles.noteContainer}>
          <Text style={styles.note}>
            Para ver el mapa interactivo, instala react-native-maps:
            pnpm add react-native-maps
          </Text>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#1A1F3A",
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: "#252B45",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  loader: {
    marginBottom: 16,
  },
  infoContainer: {
    marginTop: 16,
    backgroundColor: "#1A1F3A",
    borderRadius: 12,
    padding: 12,
    maxHeight: 200,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#2D3250",
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600" as any,
    color: "#FFFFFF",
    marginBottom: 4,
  } as any,
  infoCoords: {
    fontSize: 12,
    color: "#A0A8C0",
  } as any,
  noteContainer: {
    marginTop: 16,
    backgroundColor: "rgba(0, 217, 255, 0.1)" as any,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#00D9FF",
  },
  note: {
    fontSize: 12,
    color: "#00D9FF",
    textAlign: "center" as any,
    lineHeight: 18,
  } as any,
});
