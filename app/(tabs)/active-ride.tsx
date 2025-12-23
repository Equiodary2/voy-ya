import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { MapView } from "@/components/ui/map-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuth } from "@/hooks/use-auth";
import { useDriverLocation, useRideStatus } from "@/hooks/use-socket";
import { calculateDistance } from "@/hooks/use-location";
import { trpc } from "@/lib/trpc";

export default function ActiveRideScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { user, isAuthenticated } = useAuth();

  // Simular ID de viaje activo (en producción vendría de la navegación)
  const rideId = 1;
  const driverId = 1;

  // Obtener información del viaje
  const { data: ride, isLoading: rideLoading } = trpc.ride.get.useQuery(
    { rideId },
    { enabled: isAuthenticated }
  );

  // Obtener ubicación del conductor en tiempo real
  const driverLocation = useDriverLocation(driverId);

  // Obtener estado del viaje en tiempo real
  const rideStatus = useRideStatus(rideId);

  const [eta, setEta] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  // Calcular ETA y distancia cuando hay ubicación del conductor
  useEffect(() => {
    if (driverLocation && ride) {
      const dist = calculateDistance(
        parseFloat(ride.pickupLatitude),
        parseFloat(ride.pickupLongitude),
        driverLocation.latitude,
        driverLocation.longitude
      );

      setDistance(dist);

      // Estimar ETA: ~3 minutos por km
      const estimatedMinutes = Math.ceil(dist * 3);
      setEta(estimatedMinutes);
    }
  }, [driverLocation, ride]);

  const handleCancelRide = () => {
    Alert.alert("Cancelar Viaje", "¿Estás seguro de que deseas cancelar este viaje?", [
      { text: "No", onPress: () => {} },
      {
        text: "Sí, cancelar",
        onPress: async () => {
          try {
            // Aquí iría la lógica para cancelar el viaje
            Alert.alert("Viaje cancelado", "Tu viaje ha sido cancelado");
            router.push("/rider");
          } catch (error) {
            Alert.alert("Error", "No pudimos cancelar tu viaje");
          }
        },
      },
    ]);
  };

  const handleContactDriver = () => {
    Alert.alert("Contactar Conductor", "Llamando al conductor...");
  };

  if (!isAuthenticated) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <ThemedText type="title">Inicia sesión para continuar</ThemedText>
        <Button
          title="Ir a Inicio"
          onPress={() => router.push("/")}
          style={{ marginTop: 16 }}
        />
      </ThemedView>
    );
  }

  if (rideLoading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color={colors.tint} />
      </ThemedView>
    );
  }

  if (!ride) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title">No hay viaje activo</ThemedText>
        <Button
          title="Solicitar Viaje"
          onPress={() => router.push("/request-ride")}
          style={{ marginTop: 16 }}
        />
      </ThemedView>
    );
  }

  const statusText =
    rideStatus?.status === "driver_arriving"
      ? "Conductor llegando"
      : rideStatus?.status === "in_progress"
        ? "Viaje en curso"
        : "Buscando conductor";

  return (
    <ThemedView
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, 16),
          paddingBottom: Math.max(insets.bottom, 16),
        },
      ]}
    >
      {/* Map with driver location */}
      <View style={styles.mapContainer}>
        <MapView
          pickupLocation={{
            latitude: parseFloat(ride.pickupLatitude),
            longitude: parseFloat(ride.pickupLongitude),
            title: "Recogida",
          }}
          dropoffLocation={{
            latitude: parseFloat(ride.dropoffLatitude),
            longitude: parseFloat(ride.dropoffLongitude),
            title: "Destino",
          }}
          driverLocation={driverLocation || undefined}
          showRoute={true}
          style={{ flex: 1 }}
        />
      </View>

      {/* Status and ETA */}
      <View style={styles.statusContainer}>
        <View style={styles.statusHeader}>
          <ThemedText type="subtitle">{statusText}</ThemedText>
          {eta !== null && (
            <ThemedText style={styles.eta}>
              ETA: {eta} min {distance ? `(${distance.toFixed(1)} km)` : ""}
            </ThemedText>
          )}
        </View>

        {/* Driver Info */}
        {driverLocation && (
          <View style={styles.driverCard}>
            <View style={styles.driverHeader}>
              <View style={styles.driverAvatar}>
                <ThemedText style={styles.avatarText}>👨‍💼</ThemedText>
              </View>
              <View style={styles.driverInfo}>
                <ThemedText style={styles.driverName}>Juan García</ThemedText>
                <ThemedText style={styles.driverRating}>★ 4.9 (245 viajes)</ThemedText>
              </View>
            </View>

            <View style={styles.vehicleInfo}>
              <ThemedText style={styles.vehicleLabel}>Vehículo</ThemedText>
              <ThemedText style={styles.vehicleDetails}>
                🚙 Toyota Prius Blanco • ABC-1234
              </ThemedText>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="📞 Llamar"
            onPress={handleContactDriver}
            variant="secondary"
            size="medium"
            style={{ flex: 1, marginRight: 8 }}
          />
          <Button
            title="💬 Mensaje"
            onPress={() => Alert.alert("Mensaje", "Enviando mensaje...")}
            variant="secondary"
            size="medium"
            style={{ flex: 1 }}
          />
        </View>

        {/* Trip Details */}
        <View style={styles.tripDetails}>
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Recogida</ThemedText>
            <ThemedText style={styles.detailValue}>{ride.pickupAddress}</ThemedText>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Destino</ThemedText>
            <ThemedText style={styles.detailValue}>{ride.dropoffAddress}</ThemedText>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Tarifa Estimada</ThemedText>
            <ThemedText style={[styles.detailValue, { color: "#00D9FF" }]}>
              ${ride.totalFare}
            </ThemedText>
          </View>
        </View>

        {/* Cancel Button */}
        <Button
          title="Cancelar Viaje"
          onPress={handleCancelRide}
          variant="danger"
          size="medium"
          style={{ marginTop: 16 }}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0E27",
  },
  mapContainer: {
    flex: 1,
    borderRadius: 0,
  },
  statusContainer: {
    backgroundColor: "#1A1F3A",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    maxHeight: "40%",
  },
  statusHeader: {
    marginBottom: 16,
  },
  eta: {
    fontSize: 14,
    color: "#00D9FF",
    marginTop: 4,
    fontWeight: "600",
  },
  driverCard: {
    backgroundColor: "#252B45",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#2D3250",
  },
  driverHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#00D9FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 24,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  driverRating: {
    fontSize: 12,
    color: "#A0A8C0",
  },
  vehicleInfo: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#2D3250",
  },
  vehicleLabel: {
    fontSize: 12,
    color: "#A0A8C0",
    marginBottom: 4,
  },
  vehicleDetails: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  tripDetails: {
    backgroundColor: "#252B45",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#2D3250",
  },
  detailRow: {
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: "#A0A8C0",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#2D3250",
    marginVertical: 8,
  },
});
