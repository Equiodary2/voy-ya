import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuth } from "@/hooks/use-auth";
import { useRideNotifications } from "@/hooks/use-notifications";

interface AvailableRide {
  id: number;
  pickupAddress: string;
  dropoffAddress: string;
  distance: string;
  estimatedFare: string;
  passengerName: string;
  passengerRating: number;
  pickupTime: string;
  urgency: "low" | "medium" | "high";
}

// Datos simulados para demostración
const MOCK_AVAILABLE_RIDES: AvailableRide[] = [
  {
    id: 1,
    pickupAddress: "Avenida Principal 123",
    dropoffAddress: "Centro Comercial Plaza Mayor",
    distance: "5.2 km",
    estimatedFare: "$12.50",
    passengerName: "Carlos Mendoza",
    passengerRating: 4.8,
    pickupTime: "Ahora",
    urgency: "high",
  },
  {
    id: 2,
    pickupAddress: "Estación Central",
    dropoffAddress: "Oficina Corporativa",
    distance: "8.7 km",
    estimatedFare: "$18.90",
    passengerName: "Ana García",
    passengerRating: 4.9,
    pickupTime: "En 2 min",
    urgency: "high",
  },
  {
    id: 3,
    pickupAddress: "Centro Comercial",
    dropoffAddress: "Residencia Privada",
    distance: "3.1 km",
    estimatedFare: "$8.75",
    passengerName: "Juan Pérez",
    passengerRating: 4.5,
    pickupTime: "En 5 min",
    urgency: "medium",
  },
  {
    id: 4,
    pickupAddress: "Aeropuerto Internacional",
    dropoffAddress: "Hotel Downtown",
    distance: "15.3 km",
    estimatedFare: "$32.40",
    passengerName: "María López",
    passengerRating: 5.0,
    pickupTime: "En 10 min",
    urgency: "medium",
  },
  {
    id: 5,
    pickupAddress: "Parque Central",
    dropoffAddress: "Estación de Tren",
    distance: "2.8 km",
    estimatedFare: "$7.50",
    passengerName: "Roberto Sánchez",
    passengerRating: 4.3,
    pickupTime: "En 15 min",
    urgency: "low",
  },
];

export default function AvailableRidesScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { user, isAuthenticated } = useAuth();
  const { notifyNewRideRequest } = useRideNotifications();

  const [rides, setRides] = useState(MOCK_AVAILABLE_RIDES);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRide, setSelectedRide] = useState<number | null>(null);
  const [acceptingRide, setAcceptingRide] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simular actualización
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleAcceptRide = async (ride: AvailableRide) => {
    setAcceptingRide(true);
    try {
      // Simular aceptación de viaje
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Enviar notificación al pasajero
      await notifyNewRideRequest(undefined, {
        pickupAddress: ride.pickupAddress,
        dropoffAddress: ride.dropoffAddress,
        fare: ride.estimatedFare,
      });

      // Remover viaje de la lista
      setRides(rides.filter((r) => r.id !== ride.id));
      setSelectedRide(null);

      Alert.alert("✅ Viaje Aceptado", `Has aceptado el viaje de ${ride.passengerName}`);
    } catch (error) {
      Alert.alert("Error", "No pudimos aceptar el viaje. Intenta de nuevo.");
    } finally {
      setAcceptingRide(false);
    }
  };

  const handleRejectRide = (rideId: number) => {
    setRides(rides.filter((r) => r.id !== rideId));
    setSelectedRide(null);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "#FF6B6B";
      case "medium":
        return "#FFD700";
      case "low":
        return "#4ECDC4";
      default:
        return "#A0A8C0";
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "Urgente";
      case "medium":
        return "Normal";
      case "low":
        return "Flexible";
      default:
        return "Normal";
    }
  };

  const renderStarRating = (rating: number) => {
    return (
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <ThemedText
            key={star}
            style={[styles.star, star <= Math.floor(rating) ? styles.starFilled : styles.starEmpty]}
          >
            ★
          </ThemedText>
        ))}
        <ThemedText style={styles.ratingValue}>{rating.toFixed(1)}</ThemedText>
      </View>
    );
  };

  const renderRideCard = ({ item }: { item: AvailableRide }) => (
    <Pressable
      onPress={() => setSelectedRide(selectedRide === item.id ? null : item.id)}
      style={[styles.rideCard, selectedRide === item.id && styles.rideCardSelected]}
    >
      {/* Header con urgencia */}
      <View style={styles.cardHeader}>
        <View style={styles.urgencyBadge}>
          <View
            style={[
              styles.urgencyDot,
              { backgroundColor: getUrgencyColor(item.urgency) },
            ]}
          />
          <ThemedText style={styles.urgencyLabel}>
            {getUrgencyLabel(item.urgency)}
          </ThemedText>
        </View>
        <ThemedText style={styles.pickupTime}>{item.pickupTime}</ThemedText>
      </View>

      {/* Ruta */}
      <View style={styles.routeContainer}>
        <View style={styles.routePoint}>
          <View style={[styles.dot, { backgroundColor: "#4ECDC4" }]} />
          <ThemedText style={styles.routeText} numberOfLines={1}>
            {item.pickupAddress}
          </ThemedText>
        </View>
        <View style={styles.routeLine} />
        <View style={styles.routePoint}>
          <View style={[styles.dot, { backgroundColor: "#FF6B6B" }]} />
          <ThemedText style={styles.routeText} numberOfLines={1}>
            {item.dropoffAddress}
          </ThemedText>
        </View>
      </View>

      {/* Detalles */}
      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <ThemedText style={styles.detailLabel}>Distancia</ThemedText>
          <ThemedText style={styles.detailValue}>{item.distance}</ThemedText>
        </View>
        <View style={styles.detailDivider} />
        <View style={styles.detailItem}>
          <ThemedText style={styles.detailLabel}>Tarifa</ThemedText>
          <ThemedText style={[styles.detailValue, { color: "#00D9FF" }]}>
            {item.estimatedFare}
          </ThemedText>
        </View>
      </View>

      {/* Pasajero */}
      <View style={styles.passengerContainer}>
        <View style={styles.passengerAvatar}>
          <ThemedText style={styles.avatarText}>👤</ThemedText>
        </View>
        <View style={styles.passengerInfo}>
          <ThemedText style={styles.passengerName}>{item.passengerName}</ThemedText>
          {renderStarRating(item.passengerRating)}
        </View>
      </View>

      {/* Botones de acción (mostrar solo si está seleccionado) */}
      {selectedRide === item.id && (
        <View style={styles.actionButtons}>
          <Button
            title={acceptingRide ? "Aceptando..." : "✓ Aceptar Viaje"}
            onPress={() => handleAcceptRide(item)}
            disabled={acceptingRide}
            size="medium"
            style={{ flex: 1, marginRight: 8 }}
          />
          <Button
            title="Rechazar"
            onPress={() => handleRejectRide(item.id)}
            variant="secondary"
            size="medium"
            style={{ flex: 1 }}
          />
        </View>
      )}
    </Pressable>
  );

  if (!isAuthenticated) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <ThemedText type="title">Inicia sesión como conductor</ThemedText>
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
        },
      ]}
    >
      <View style={styles.header}>
        <ThemedText type="title">Viajes Disponibles</ThemedText>
        <ThemedText style={styles.subtitle}>{rides.length} viajes cercanos</ThemedText>
      </View>

      {rides.length === 0 ? (
        <View style={styles.centerContainer}>
          <ThemedText style={styles.emptyText}>
            No hay viajes disponibles en este momento
          </ThemedText>
          <Button
            title="Actualizar"
            onPress={handleRefresh}
            size="medium"
            style={{ marginTop: 16 }}
          />
        </View>
      ) : (
        <FlatList
          data={rides}
          renderItem={renderRideCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.tint}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0E27",
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    color: "#A0A8C0",
    marginTop: 4,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#A0A8C0",
    textAlign: "center",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  rideCard: {
    backgroundColor: "#1A1F3A",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#2D3250",
  },
  rideCardSelected: {
    borderColor: "#00D9FF",
    backgroundColor: "rgba(0, 217, 255, 0.05)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  urgencyBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "rgba(255, 107, 107, 0.1)",
  },
  urgencyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  urgencyLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FF6B6B",
  },
  pickupTime: {
    fontSize: 12,
    color: "#A0A8C0",
    fontWeight: "500",
  },
  routeContainer: {
    marginBottom: 12,
  },
  routePoint: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  routeText: {
    fontSize: 13,
    color: "#FFFFFF",
    flex: 1,
  },
  routeLine: {
    width: 2,
    height: 16,
    backgroundColor: "#2D3250",
    marginLeft: 3,
    marginVertical: 4,
  },
  detailsContainer: {
    flexDirection: "row",
    backgroundColor: "#252B45",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: "#A0A8C0",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  detailDivider: {
    width: 1,
    backgroundColor: "#2D3250",
    marginHorizontal: 12,
  },
  passengerContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  passengerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#00D9FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
  },
  passengerInfo: {
    flex: 1,
  },
  passengerName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  star: {
    fontSize: 11,
  },
  starFilled: {
    color: "#FFD700",
  },
  starEmpty: {
    color: "#A0A8C0",
  },
  ratingValue: {
    fontSize: 11,
    color: "#A0A8C0",
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: "row",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#2D3250",
  },
});
