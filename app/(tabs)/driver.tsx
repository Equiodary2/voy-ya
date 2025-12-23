import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Switch,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { RideCard } from "@/components/ui/ride-card";
import { useAuth } from "@/hooks/use-auth";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { trpc } from "@/lib/trpc";

export default function DriverScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { user, isAuthenticated } = useAuth();
  const [isAvailable, setIsAvailable] = useState(false);

  // Fetch driver's ride history
  const { data: rideHistory, isLoading } = trpc.ride.getDriverHistory.useQuery(
    { limit: 10 },
    { enabled: isAuthenticated }
  );

  // Update driver availability
  const updateAvailabilityMutation = trpc.driver.updateAvailability.useMutation();

  const handleAvailabilityToggle = async (value: boolean) => {
    setIsAvailable(value);
    try {
      await updateAvailabilityMutation.mutateAsync({ isAvailable: value });
    } catch (error) {
      console.error("Error updating availability:", error);
      setIsAvailable(!value); // Revert on error
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title">Panel del Conductor</ThemedText>
          <ThemedText style={styles.subtitle}>
            Hola, {user?.name || "Conductor"}
          </ThemedText>
        </View>

        {/* Availability Toggle */}
        <View style={styles.availabilityCard}>
          <View style={styles.availabilityContent}>
            <View>
              <ThemedText style={styles.availabilityLabel}>
                {isAvailable ? "Disponible" : "No disponible"}
              </ThemedText>
              <ThemedText style={styles.availabilitySubtext}>
                {isAvailable
                  ? "Aceptando nuevas solicitudes"
                  : "Toca para aceptar viajes"}
              </ThemedText>
            </View>
            <Switch
              value={isAvailable}
              onValueChange={handleAvailabilityToggle}
              trackColor={{ false: "#5A6280", true: "#00D9FF" }}
              thumbColor={isAvailable ? "#0A0E27" : "#A0A8C0"}
            />
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <ThemedText style={styles.statLabel}>Ingresos Hoy</ThemedText>
            <ThemedText style={styles.statValue}>$0.00</ThemedText>
          </View>
          <View style={styles.statCard}>
            <ThemedText style={styles.statLabel}>Viajes</ThemedText>
            <ThemedText style={styles.statValue}>0</ThemedText>
          </View>
          <View style={styles.statCard}>
            <ThemedText style={styles.statLabel}>Calificación</ThemedText>
            <ThemedText style={styles.statValue}>★ 5.0</ThemedText>
          </View>
        </View>

        {/* Recent Rides Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle">Viajes Recientes</ThemedText>

          {isLoading ? (
            <ActivityIndicator
              color={colors.tint}
              size="large"
              style={{ marginTop: 16 }}
            />
          ) : rideHistory && rideHistory.length > 0 ? (
            <FlatList
              data={rideHistory}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <RideCard
                  origin={item.pickupAddress || "Ubicación de recogida"}
                  destination={item.dropoffAddress || "Destino"}
                  distance={
                    item.distance ? `${parseFloat(item.distance).toFixed(1)} km` : undefined
                  }
                  duration={
                    item.actualDuration
                      ? `${item.actualDuration} min`
                      : undefined
                  }
                  fare={
                    item.totalFare
                      ? `$${parseFloat(item.totalFare).toFixed(2)}`
                      : undefined
                  }
                  status={item.status as any}
                  onPress={() => router.push("/modal")}
                />
              )}
              scrollEnabled={false}
            />
          ) : (
            <ThemedText style={styles.emptyText}>
              No hay viajes recientes. ¡Activa tu disponibilidad para comenzar!
            </ThemedText>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Button
            title="Ver Perfil"
            onPress={() => router.push("/modal")}
            variant="secondary"
            size="medium"
            style={{ marginBottom: 12 }}
          />
          <Button
            title="Configuración"
            onPress={() => router.push("/modal")}
            variant="secondary"
            size="medium"
          />
        </View>
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
    marginBottom: 24,
  },
  subtitle: {
    color: "#A0A8C0",
    marginTop: 8,
    fontSize: 16,
  },
  availabilityCard: {
    backgroundColor: "#1A1F3A",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#2D3250",
  },
  availabilityContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  availabilityLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  availabilitySubtext: {
    fontSize: 14,
    color: "#A0A8C0",
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#1A1F3A",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#2D3250",
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    color: "#A0A8C0",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#00D9FF",
  },
  section: {
    marginBottom: 24,
  },
  emptyText: {
    color: "#A0A8C0",
    textAlign: "center",
    marginTop: 16,
    fontSize: 14,
  },
  actionsSection: {
    marginTop: 16,
  },
});
