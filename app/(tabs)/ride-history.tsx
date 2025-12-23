import React, { useState } from "react";
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
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";

interface RideHistoryItem {
  id: number;
  date: string;
  time: string;
  from: string;
  to: string;
  distance: string;
  fare: string;
  driverName: string;
  rating: number;
  status: "completed" | "cancelled";
}

// Datos simulados para demostración
const MOCK_RIDES: RideHistoryItem[] = [
  {
    id: 1,
    date: "Hoy",
    time: "14:30",
    from: "Avenida Principal 123",
    to: "Centro Comercial Plaza Mayor",
    distance: "5.2 km",
    fare: "$12.50",
    driverName: "Juan García",
    rating: 5,
    status: "completed",
  },
  {
    id: 2,
    date: "Ayer",
    time: "09:15",
    from: "Estación Central",
    to: "Oficina Corporativa",
    distance: "8.7 km",
    fare: "$18.90",
    driverName: "María López",
    rating: 4,
    status: "completed",
  },
  {
    id: 3,
    date: "Hace 2 días",
    time: "19:45",
    from: "Centro Comercial",
    to: "Residencia",
    distance: "3.1 km",
    fare: "$8.75",
    driverName: "Carlos Rodríguez",
    rating: 5,
    status: "completed",
  },
  {
    id: 4,
    date: "Hace 3 días",
    time: "11:20",
    from: "Aeropuerto",
    to: "Hotel Downtown",
    distance: "15.3 km",
    fare: "$32.40",
    driverName: "Ana Martínez",
    rating: 4,
    status: "completed",
  },
  {
    id: 5,
    date: "Hace 4 días",
    time: "16:00",
    from: "Parque Central",
    to: "Estación de Tren",
    distance: "2.8 km",
    fare: "$7.50",
    driverName: "Pedro Sánchez",
    rating: 3,
    status: "cancelled",
  },
];

export default function RideHistoryScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { user, isAuthenticated } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // En producción, esto vendría de la API
  // const { data: rides, isLoading, refetch } = trpc.ride.getHistory.useQuery(
  //   {},
  //   { enabled: isAuthenticated }
  // );

  const rides = MOCK_RIDES;
  const isLoading = false;

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simular refresh
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleRidePress = (ride: RideHistoryItem) => {
    // Navegar a detalles del viaje
    Alert.alert(
      "Detalles del Viaje",
      `Viaje de ${ride.from} a ${ride.to}\n${ride.distance} - ${ride.fare}\nConductor: ${ride.driverName}`
    );
  };

  const renderStarRating = (rating: number) => {
    return (
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <ThemedText
            key={star}
            style={[styles.star, star <= rating ? styles.starFilled : styles.starEmpty]}
          >
            ★
          </ThemedText>
        ))}
      </View>
    );
  };

  const renderRideCard = ({ item }: { item: RideHistoryItem }) => (
    <Pressable onPress={() => handleRidePress(item)} style={styles.rideCard}>
      <View style={styles.cardHeader}>
        <View style={styles.dateTimeContainer}>
          <ThemedText style={styles.date}>{item.date}</ThemedText>
          <ThemedText style={styles.time}>{item.time}</ThemedText>
        </View>
        <View style={styles.statusBadge}>
          <ThemedText
            style={[
              styles.statusText,
              item.status === "cancelled" && styles.statusCancelled,
            ]}
          >
            {item.status === "completed" ? "✓ Completado" : "✗ Cancelado"}
          </ThemedText>
        </View>
      </View>

      <View style={styles.routeContainer}>
        <View style={styles.routePoint}>
          <View style={[styles.dot, { backgroundColor: "#4ECDC4" }]} />
          <ThemedText style={styles.routeText} numberOfLines={1}>
            {item.from}
          </ThemedText>
        </View>
        <View style={styles.routeLine} />
        <View style={styles.routePoint}>
          <View style={[styles.dot, { backgroundColor: "#FF6B6B" }]} />
          <ThemedText style={styles.routeText} numberOfLines={1}>
            {item.to}
          </ThemedText>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <ThemedText style={styles.detailLabel}>Distancia</ThemedText>
          <ThemedText style={styles.detailValue}>{item.distance}</ThemedText>
        </View>
        <View style={styles.detailDivider} />
        <View style={styles.detailItem}>
          <ThemedText style={styles.detailLabel}>Tarifa</ThemedText>
          <ThemedText style={[styles.detailValue, { color: "#00D9FF" }]}>
            {item.fare}
          </ThemedText>
        </View>
      </View>

      <View style={styles.driverContainer}>
        <View style={styles.driverAvatar}>
          <ThemedText style={styles.avatarText}>👨‍💼</ThemedText>
        </View>
        <View style={styles.driverInfo}>
          <ThemedText style={styles.driverName}>{item.driverName}</ThemedText>
          {renderStarRating(item.rating)}
        </View>
      </View>
    </Pressable>
  );

  if (!isAuthenticated) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <ThemedText type="title">Inicia sesión para ver tu historial</ThemedText>
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
        <ThemedText type="title">Historial de Viajes</ThemedText>
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      ) : rides.length === 0 ? (
        <View style={styles.centerContainer}>
          <ThemedText style={styles.emptyText}>No hay viajes en tu historial</ThemedText>
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
    borderWidth: 1,
    borderColor: "#2D3250",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  dateTimeContainer: {
    flex: 1,
  },
  date: {
    fontSize: 14,
    color: "#A0A8C0",
    marginBottom: 2,
  },
  time: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "rgba(78, 205, 196, 0.1)",
    borderWidth: 1,
    borderColor: "#4ECDC4",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4ECDC4",
  },
  statusCancelled: {
    color: "#FF6B6B",
    borderColor: "#FF6B6B",
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
  driverContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  driverAvatar: {
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
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    gap: 2,
  },
  star: {
    fontSize: 12,
  },
  starFilled: {
    color: "#FFD700",
  },
  starEmpty: {
    color: "#A0A8C0",
  },
});
