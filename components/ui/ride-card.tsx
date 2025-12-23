import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { ThemedText } from "../themed-text";
import { ThemedView } from "../themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

interface RideCardProps {
  origin: string;
  destination: string;
  distance?: string;
  duration?: string;
  fare?: string;
  status?: "pending" | "accepted" | "in_progress" | "completed";
  driverName?: string;
  driverRating?: number;
  onPress?: () => void;
}

export function RideCard({
  origin,
  destination,
  distance,
  duration,
  fare,
  status,
  driverName,
  driverRating,
  onPress,
}: RideCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const getStatusColor = () => {
    switch (status) {
      case "pending":
        return "#FFB800";
      case "accepted":
        return "#00D9FF";
      case "in_progress":
        return "#4ECDC4";
      case "completed":
        return "#4ECDC4";
      default:
        return colors.icon;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "pending":
        return "Pendiente";
      case "accepted":
        return "Aceptado";
      case "in_progress":
        return "En progreso";
      case "completed":
        return "Completado";
      default:
        return "";
    }
  };

  return (
    <Pressable onPress={onPress}>
      <ThemedView style={styles.card}>
        {/* Header with status */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <ThemedText type="defaultSemiBold" style={styles.route}>
              {origin} → {destination}
            </ThemedText>
          </View>
          {status && (
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor() },
              ]}
            >
              <ThemedText style={styles.statusText}>{getStatusText()}</ThemedText>
            </View>
          )}
        </View>

        {/* Details row */}
        <View style={styles.detailsRow}>
          {distance && (
            <View style={styles.detailItem}>
              <ThemedText style={styles.detailLabel}>Distancia</ThemedText>
              <ThemedText style={styles.detailValue}>{distance}</ThemedText>
            </View>
          )}
          {duration && (
            <View style={styles.detailItem}>
              <ThemedText style={styles.detailLabel}>Duración</ThemedText>
              <ThemedText style={styles.detailValue}>{duration}</ThemedText>
            </View>
          )}
          {fare && (
            <View style={styles.detailItem}>
              <ThemedText style={styles.detailLabel}>Tarifa</ThemedText>
              <ThemedText style={[styles.detailValue, { color: "#00D9FF" }]}>
                {fare}
              </ThemedText>
            </View>
          )}
        </View>

        {/* Driver info if available */}
        {driverName && (
          <View style={styles.driverInfo}>
            <ThemedText style={styles.driverName}>{driverName}</ThemedText>
            {driverRating && (
              <ThemedText style={styles.rating}>
                ★ {driverRating.toFixed(1)}
              </ThemedText>
            )}
          </View>
        )}
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    backgroundColor: "#1A1F3A",
    borderWidth: 1,
    borderColor: "#2D3250",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
  },
  route: {
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0A0E27",
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#2D3250",
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
  driverInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  driverName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  rating: {
    fontSize: 14,
    color: "#FFB800",
    fontWeight: "600",
  },
});
