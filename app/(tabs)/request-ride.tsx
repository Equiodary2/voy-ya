import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
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
import { trpc } from "@/lib/trpc";

export default function RequestRideScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { user, isAuthenticated } = useAuth();

  const [pickupAddress, setPickupAddress] = useState("");
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [vehicleType, setVehicleType] = useState<"economy" | "comfort" | "premium">("economy");
  const [estimatedFare, setEstimatedFare] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Mutation para crear solicitud de viaje
  const createRideMutation = trpc.ride.create.useMutation();

  const handleCalculateFare = async () => {
    if (!pickupAddress || !dropoffAddress) {
      alert("Por favor ingresa ambas ubicaciones");
      return;
    }

    setIsCalculating(true);
    try {
      // Simulación: en producción, esto calcularía la distancia real
      const distance = Math.random() * 20 + 1; // 1-21 km
      const duration = Math.ceil(distance * 3); // ~3 min por km

      // Tarifas base
      const rates: Record<string, { base: number; perKm: number; perMin: number }> = {
        economy: { base: 2.5, perKm: 1.5, perMin: 0.25 },
        comfort: { base: 4.0, perKm: 2.0, perMin: 0.35 },
        premium: { base: 6.0, perKm: 2.5, perMin: 0.5 },
      };

      const rate = rates[vehicleType];
      const fare = rate.base + distance * rate.perKm + duration * rate.perMin;
      setEstimatedFare(parseFloat(fare.toFixed(2)));
    } catch (error) {
      console.error("Error calculating fare:", error);
      alert("Error al calcular la tarifa");
    } finally {
      setIsCalculating(false);
    }
  };

  const handleRequestRide = async () => {
    if (!pickupAddress || !dropoffAddress) {
      alert("Por favor ingresa ambas ubicaciones");
      return;
    }

    try {
      await createRideMutation.mutateAsync({
        pickupLatitude: 40.7128,
        pickupLongitude: -74.006,
        pickupAddress,
        dropoffLatitude: 40.758,
        dropoffLongitude: -73.9855,
        dropoffAddress,
        vehicleType,
        baseFare: vehicleType === "economy" ? 2.5 : vehicleType === "comfort" ? 4.0 : 6.0,
        totalFare: estimatedFare || 0,
      });

      alert("¡Viaje solicitado! Buscando conductor...");
      router.push("/rider");
    } catch (error) {
      console.error("Error requesting ride:", error);
      alert("Error al solicitar viaje");
    }
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

  return (
    <ThemedView
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, 16),
          paddingBottom: Math.max(insets.bottom, 16),
          paddingLeft: Math.max(insets.left, 16),
          paddingRight: Math.max(insets.right, 16),
        },
      ]}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title">Solicitar Viaje</ThemedText>
        </View>

        {/* Map Preview */}
        <View style={styles.mapContainer}>
          <MapView
            pickupLocation={{
              latitude: 40.7128,
              longitude: -74.006,
              title: "Mi ubicación",
            }}
            dropoffLocation={
              dropoffAddress
                ? {
                    latitude: 40.758,
                    longitude: -73.9855,
                    title: "Destino",
                  }
                : undefined
            }
            style={{ height: 200 }}
          />
        </View>

        {/* Location Inputs */}
        <View style={styles.section}>
          <ThemedText type="subtitle">Ubicaciones</ThemedText>

          <View style={styles.inputContainer}>
            <View style={styles.inputLabel}>
              <View style={[styles.dot, { backgroundColor: "#4ECDC4" }]} />
              <ThemedText style={styles.label}>Recogida</ThemedText>
            </View>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Tu ubicación actual"
              placeholderTextColor={colors.icon}
              value={pickupAddress}
              onChangeText={setPickupAddress}
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputLabel}>
              <View style={[styles.dot, { backgroundColor: "#FF6B6B" }]} />
              <ThemedText style={styles.label}>Destino</ThemedText>
            </View>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="¿A dónde vas?"
              placeholderTextColor={colors.icon}
              value={dropoffAddress}
              onChangeText={setDropoffAddress}
            />
          </View>
        </View>

        {/* Vehicle Type Selection */}
        <View style={styles.section}>
          <ThemedText type="subtitle">Tipo de Vehículo</ThemedText>

          <View style={styles.vehicleOptions}>
            {(["economy", "comfort", "premium"] as const).map((type) => (
              <Pressable
                key={type}
                onPress={() => setVehicleType(type)}
                style={[
                  styles.vehicleOption,
                  vehicleType === type && styles.vehicleOptionSelected,
                ]}
              >
                <ThemedText
                  style={[
                    styles.vehicleOptionText,
                    vehicleType === type && styles.vehicleOptionTextSelected,
                  ]}
                >
                  {type === "economy"
                    ? "🚗 Economía"
                    : type === "comfort"
                      ? "🚙 Confort"
                      : "🚕 Premium"}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Fare Calculation */}
        <View style={styles.section}>
          <Button
            title={isCalculating ? "Calculando..." : "Calcular Tarifa"}
            onPress={handleCalculateFare}
            disabled={isCalculating || !pickupAddress || !dropoffAddress}
            size="medium"
            style={{ marginBottom: 16 }}
          />

          {estimatedFare !== null && (
            <View style={styles.fareCard}>
              <ThemedText style={styles.fareLabel}>Tarifa Estimada</ThemedText>
              <ThemedText style={styles.fareAmount}>${estimatedFare.toFixed(2)}</ThemedText>
              <ThemedText style={styles.fareNote}>
                Precio puede variar según demanda y tráfico
              </ThemedText>
            </View>
          )}
        </View>

        {/* Request Button */}
        <Button
          title={createRideMutation.isPending ? "Solicitando..." : "Solicitar Viaje"}
          onPress={handleRequestRide}
          disabled={createRideMutation.isPending || !pickupAddress || !dropoffAddress}
          size="large"
          style={{ marginTop: 16 }}
        />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0E27",
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    marginBottom: 20,
  },
  mapContainer: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: "hidden",
  },
  section: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  input: {
    backgroundColor: "#1A1F3A",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#2D3250",
  },
  vehicleOptions: {
    flexDirection: "row",
    gap: 12,
  },
  vehicleOption: {
    flex: 1,
    backgroundColor: "#1A1F3A",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "#2D3250",
    alignItems: "center",
  },
  vehicleOptionSelected: {
    backgroundColor: "rgba(0, 217, 255, 0.1)",
    borderColor: "#00D9FF",
  },
  vehicleOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#A0A8C0",
    textAlign: "center",
  },
  vehicleOptionTextSelected: {
    color: "#00D9FF",
  },
  fareCard: {
    backgroundColor: "#1A1F3A",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#2D3250",
    alignItems: "center",
  },
  fareLabel: {
    fontSize: 14,
    color: "#A0A8C0",
    marginBottom: 8,
  },
  fareAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#00D9FF",
    marginBottom: 8,
  },
  fareNote: {
    fontSize: 12,
    color: "#A0A8C0",
    textAlign: "center",
  },
});
