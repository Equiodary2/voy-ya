import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
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

export default function RiderScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch rider's ride history
  const { data: rideHistory, isLoading } = trpc.ride.getRiderHistory.useQuery(
    { limit: 10 },
    { enabled: isAuthenticated }
  );

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
          <ThemedText type="title">¿A dónde vamos?</ThemedText>
          <ThemedText style={styles.subtitle}>
            Hola, {user?.name || "Pasajero"}
          </ThemedText>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Ingresa tu destino"
            placeholderTextColor={colors.icon}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Quick Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="Solicitar Viaje"
            onPress={() => router.push("/modal")}
            size="large"
            style={{ flex: 1 }}
          />
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
                  origin={item.pickupAddress || "Ubicación actual"}
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
              No hay viajes recientes. ¡Solicita tu primer viaje!
            </ThemedText>
          )}
        </View>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <ThemedText type="subtitle">Consejos de Seguridad</ThemedText>
          <View style={styles.tipItem}>
            <ThemedText style={styles.tipNumber}>1</ThemedText>
            <ThemedText style={styles.tipText}>
              Verifica siempre los detalles del conductor antes de subir
            </ThemedText>
          </View>
          <View style={styles.tipItem}>
            <ThemedText style={styles.tipNumber}>2</ThemedText>
            <ThemedText style={styles.tipText}>
              Comparte tu viaje con amigos o familia
            </ThemedText>
          </View>
          <View style={styles.tipItem}>
            <ThemedText style={styles.tipNumber}>3</ThemedText>
            <ThemedText style={styles.tipText}>
              Califica al conductor después de cada viaje
            </ThemedText>
          </View>
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
  searchContainer: {
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: "#1A1F3A",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#2D3250",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
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
  tipsSection: {
    backgroundColor: "#1A1F3A",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#2D3250",
  },
  tipItem: {
    flexDirection: "row",
    marginTop: 12,
    alignItems: "flex-start",
  },
  tipNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#00D9FF",
    color: "#0A0E27",
    textAlign: "center",
    lineHeight: 28,
    fontWeight: "bold",
    marginRight: 12,
  },
  tipText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 20,
  },
});
