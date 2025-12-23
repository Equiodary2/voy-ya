import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

interface RideRating {
  rideId: number;
  driverName: string;
  driverAvatar: string;
  pickupAddress: string;
  dropoffAddress: string;
  fare: string;
  distance: string;
  duration: string;
}

// Datos simulados para demostración
const MOCK_RIDE: RideRating = {
  rideId: 1,
  driverName: "Juan García",
  driverAvatar: "👨‍💼",
  pickupAddress: "Avenida Principal 123",
  dropoffAddress: "Centro Comercial Plaza Mayor",
  fare: "$12.50",
  distance: "5.2 km",
  duration: "18 min",
};

export default function RateRideScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleRating = (value: number) => {
    setRating(value);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert("Calificación Requerida", "Por favor selecciona una calificación");
      return;
    }

    setSubmitting(true);
    try {
      // Simular envío de calificación
      await new Promise((resolve) => setTimeout(resolve, 1500));

      Alert.alert("✅ Gracias", "Tu calificación ha sido registrada", [
        {
          text: "OK",
          onPress: () => {
            // Navegar de vuelta al historial
            router.push("/(tabs)/ride-history");
          },
        },
      ]);
    } catch (error) {
      Alert.alert("Error", "No pudimos registrar tu calificación. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Pressable
            key={star}
            onPress={() => handleRating(star)}
            style={[styles.starButton, rating >= star && styles.starButtonActive]}
          >
            <ThemedText
              style={[
                styles.starIcon,
                rating >= star ? styles.starIconActive : styles.starIconInactive,
              ]}
            >
              ★
            </ThemedText>
          </Pressable>
        ))}
      </View>
    );
  };

  const getRatingLabel = () => {
    switch (rating) {
      case 1:
        return "Muy Malo";
      case 2:
        return "Malo";
      case 3:
        return "Regular";
      case 4:
        return "Bueno";
      case 5:
        return "Excelente";
      default:
        return "Selecciona una calificación";
    }
  };

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
          <ThemedText type="title">Califica tu Viaje</ThemedText>
        </View>

        {/* Ride Summary */}
        <View style={styles.rideSummary}>
          <View style={styles.routeInfo}>
            <View style={styles.routePoint}>
              <View style={[styles.dot, { backgroundColor: "#4ECDC4" }]} />
              <ThemedText style={styles.routeText} numberOfLines={1}>
                {MOCK_RIDE.pickupAddress}
              </ThemedText>
            </View>
            <View style={styles.routeLine} />
            <View style={styles.routePoint}>
              <View style={[styles.dot, { backgroundColor: "#FF6B6B" }]} />
              <ThemedText style={styles.routeText} numberOfLines={1}>
                {MOCK_RIDE.dropoffAddress}
              </ThemedText>
            </View>
          </View>

          <View style={styles.rideDetails}>
            <View style={styles.detailItem}>
              <ThemedText style={styles.detailLabel}>Distancia</ThemedText>
              <ThemedText style={styles.detailValue}>{MOCK_RIDE.distance}</ThemedText>
            </View>
            <View style={styles.detailDivider} />
            <View style={styles.detailItem}>
              <ThemedText style={styles.detailLabel}>Duración</ThemedText>
              <ThemedText style={styles.detailValue}>{MOCK_RIDE.duration}</ThemedText>
            </View>
            <View style={styles.detailDivider} />
            <View style={styles.detailItem}>
              <ThemedText style={styles.detailLabel}>Tarifa</ThemedText>
              <ThemedText style={[styles.detailValue, { color: "#00D9FF" }]}>
                {MOCK_RIDE.fare}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Driver Info */}
        <View style={styles.driverSection}>
          <View style={styles.driverHeader}>
            <View style={styles.driverAvatar}>
              <ThemedText style={styles.avatarText}>{MOCK_RIDE.driverAvatar}</ThemedText>
            </View>
            <View style={styles.driverInfo}>
              <ThemedText style={styles.driverName}>{MOCK_RIDE.driverName}</ThemedText>
              <ThemedText style={styles.driverSubtitle}>Conductor</ThemedText>
            </View>
          </View>
        </View>

        {/* Rating Section */}
        <View style={styles.ratingSection}>
          <ThemedText type="subtitle" style={{ marginBottom: 16 }}>
            ¿Cómo fue tu experiencia?
          </ThemedText>

          {renderStars()}

          <ThemedText style={styles.ratingLabel}>{getRatingLabel()}</ThemedText>
        </View>

        {/* Comment Section */}
        <View style={styles.commentSection}>
          <ThemedText style={styles.commentLabel}>Comentario (Opcional)</ThemedText>
          <TextInput
            style={[styles.commentInput, { color: colors.text }]}
            placeholder="Comparte tu experiencia..."
            placeholderTextColor={colors.icon}
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
            maxLength={500}
          />
          <ThemedText style={styles.charCount}>
            {comment.length}/500
          </ThemedText>
        </View>

        {/* Quick Tags */}
        <View style={styles.tagsSection}>
          <ThemedText style={styles.tagsLabel}>Aspectos Positivos (Opcional)</ThemedText>
          <View style={styles.tagsContainer}>
            {["Puntual", "Amable", "Limpio", "Seguro", "Rápido"].map((tag) => (
              <Pressable key={tag} style={styles.tag}>
                <ThemedText style={styles.tagText}>+ {tag}</ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Submit Button */}
        <Button
          title={submitting ? "Enviando..." : "Enviar Calificación"}
          onPress={handleSubmit}
          disabled={submitting || rating === 0}
          size="medium"
          style={{ marginTop: 24, marginBottom: 16 }}
        />

        {/* Skip Button */}
        <Pressable
          onPress={() => router.push("/(tabs)/ride-history")}
          disabled={submitting}
        >
          <ThemedText style={styles.skipText}>Omitir por ahora</ThemedText>
        </Pressable>
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
  rideSummary: {
    backgroundColor: "#1A1F3A",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#2D3250",
  },
  routeInfo: {
    marginBottom: 16,
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
  rideDetails: {
    flexDirection: "row",
    backgroundColor: "#252B45",
    borderRadius: 12,
    padding: 12,
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
  driverSection: {
    backgroundColor: "#1A1F3A",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#2D3250",
  },
  driverHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  driverAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#00D9FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: {
    fontSize: 28,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  driverSubtitle: {
    fontSize: 13,
    color: "#A0A8C0",
  },
  ratingSection: {
    backgroundColor: "#1A1F3A",
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#2D3250",
    alignItems: "center",
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 16,
  },
  starButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#252B45",
    justifyContent: "center",
    alignItems: "center",
  },
  starButtonActive: {
    backgroundColor: "rgba(0, 217, 255, 0.2)",
    borderWidth: 2,
    borderColor: "#00D9FF",
  },
  starIcon: {
    fontSize: 28,
  },
  starIconActive: {
    color: "#FFD700",
  },
  starIconInactive: {
    color: "#A0A8C0",
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#00D9FF",
    textAlign: "center",
  },
  commentSection: {
    marginBottom: 24,
  },
  commentLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  commentInput: {
    backgroundColor: "#1A1F3A",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#2D3250",
    textAlignVertical: "top",
    marginBottom: 8,
  },
  charCount: {
    fontSize: 12,
    color: "#A0A8C0",
    textAlign: "right",
  },
  tagsSection: {
    marginBottom: 24,
  },
  tagsLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: "rgba(0, 217, 255, 0.1)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#00D9FF",
  },
  tagText: {
    fontSize: 12,
    color: "#00D9FF",
    fontWeight: "500",
  },
  skipText: {
    fontSize: 14,
    color: "#A0A8C0",
    textAlign: "center",
    fontWeight: "500",
  },
});
