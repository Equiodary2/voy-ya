import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  bio: string;
  userType: "rider" | "driver" | "both";
  rating: number;
  totalRides: number;
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { user, isAuthenticated, logout } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: user?.name || "Usuario",
    email: user?.email || "usuario@example.com",
    phone: "+1 (555) 123-4567",
    bio: "Viajero frecuente en la ciudad",
    userType: "both",
    rating: 4.8,
    totalRides: 127,
  });

  const [editedProfile, setEditedProfile] = useState(profile);

  const handleSaveProfile = async () => {
    try {
      // Aquí iría la lógica para guardar el perfil en la API
      setProfile(editedProfile);
      setIsEditing(false);
      Alert.alert("Éxito", "Tu perfil ha sido actualizado");
    } catch (error) {
      Alert.alert("Error", "No pudimos actualizar tu perfil");
    }
  };

  const handleLogout = () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro de que deseas cerrar sesión?", [
      { text: "Cancelar", onPress: () => {} },
      {
        text: "Cerrar Sesión",
        onPress: () => {
          logout();
        },
      },
    ]);
  };

  if (!isAuthenticated) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <ThemedText type="title">Inicia sesión para ver tu perfil</ThemedText>
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
          <ThemedText type="title">Mi Perfil</ThemedText>
        </View>

        {/* Profile Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <ThemedText style={styles.avatarText}>👤</ThemedText>
          </View>
          <View style={styles.userBasicInfo}>
            <ThemedText style={styles.userName}>{profile.name}</ThemedText>
            <ThemedText style={styles.userEmail}>{profile.email}</ThemedText>
          </View>
        </View>

        {/* Rating and Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>⭐ {profile.rating}</ThemedText>
            <ThemedText style={styles.statLabel}>Calificación</ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>🚗 {profile.totalRides}</ThemedText>
            <ThemedText style={styles.statLabel}>Viajes</ThemedText>
          </View>
        </View>

        {/* Profile Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle">Información Personal</ThemedText>
            <Pressable onPress={() => setIsEditing(!isEditing)}>
              <ThemedText style={styles.editButton}>
                {isEditing ? "Cancelar" : "Editar"}
              </ThemedText>
            </Pressable>
          </View>

          {isEditing ? (
            <>
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Nombre</ThemedText>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Tu nombre"
                  placeholderTextColor={colors.icon}
                  value={editedProfile.name}
                  onChangeText={(text) =>
                    setEditedProfile({ ...editedProfile, name: text })
                  }
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Email</ThemedText>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Tu email"
                  placeholderTextColor={colors.icon}
                  value={editedProfile.email}
                  editable={false}
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Teléfono</ThemedText>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Tu teléfono"
                  placeholderTextColor={colors.icon}
                  value={editedProfile.phone}
                  onChangeText={(text) =>
                    setEditedProfile({ ...editedProfile, phone: text })
                  }
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Biografía</ThemedText>
                <TextInput
                  style={[styles.input, styles.bioInput, { color: colors.text }]}
                  placeholder="Cuéntanos sobre ti"
                  placeholderTextColor={colors.icon}
                  value={editedProfile.bio}
                  onChangeText={(text) =>
                    setEditedProfile({ ...editedProfile, bio: text })
                  }
                  multiline
                  numberOfLines={3}
                />
              </View>

              <Button
                title="Guardar Cambios"
                onPress={handleSaveProfile}
                size="medium"
                style={{ marginTop: 16 }}
              />
            </>
          ) : (
            <>
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Teléfono</ThemedText>
                <ThemedText style={styles.infoValue}>{profile.phone}</ThemedText>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Tipo de Usuario</ThemedText>
                <ThemedText style={styles.infoValue}>
                  {profile.userType === "rider"
                    ? "Pasajero"
                    : profile.userType === "driver"
                      ? "Conductor"
                      : "Ambos"}
                </ThemedText>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Biografía</ThemedText>
                <ThemedText style={styles.infoValue}>{profile.bio}</ThemedText>
              </View>
            </>
          )}
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <ThemedText type="subtitle">Métodos de Pago</ThemedText>
          <View style={styles.paymentCard}>
            <ThemedText style={styles.paymentIcon}>💳</ThemedText>
            <View style={styles.paymentInfo}>
              <ThemedText style={styles.paymentName}>Tarjeta Visa</ThemedText>
              <ThemedText style={styles.paymentDetails}>•••• •••• •••• 4242</ThemedText>
            </View>
            <ThemedText style={styles.paymentDefault}>Predeterminada</ThemedText>
          </View>
          <Button
            title="Agregar Método de Pago"
            onPress={() => Alert.alert("Agregar Pago", "Funcionalidad próximamente")}
            variant="secondary"
            size="medium"
            style={{ marginTop: 12 }}
          />
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <ThemedText type="subtitle">Preferencias</ThemedText>
          <View style={styles.preferenceItem}>
            <ThemedText style={styles.preferenceName}>Notificaciones Push</ThemedText>
            <View style={styles.toggle}>
              <View style={styles.toggleActive} />
            </View>
          </View>
          <View style={styles.preferenceDivider} />
          <View style={styles.preferenceItem}>
            <ThemedText style={styles.preferenceName}>Compartir Ubicación</ThemedText>
            <View style={styles.toggle}>
              <View style={styles.toggleActive} />
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <Button
          title="Cerrar Sesión"
          onPress={handleLogout}
          variant="danger"
          size="medium"
          style={{ marginTop: 24, marginBottom: 16 }}
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
  avatarSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    backgroundColor: "#1A1F3A",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#2D3250",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#00D9FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: {
    fontSize: 32,
  },
  userBasicInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#A0A8C0",
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#1A1F3A",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#2D3250",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#00D9FF",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#A0A8C0",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#2D3250",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  editButton: {
    fontSize: 14,
    color: "#00D9FF",
    fontWeight: "600",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    color: "#A0A8C0",
    marginBottom: 8,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#1A1F3A",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#2D3250",
  },
  bioInput: {
    textAlignVertical: "top",
    paddingTop: 12,
  },
  infoRow: {
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: "#A0A8C0",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  infoDivider: {
    height: 1,
    backgroundColor: "#2D3250",
    marginVertical: 8,
  },
  paymentCard: {
    backgroundColor: "#1A1F3A",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2D3250",
    flexDirection: "row",
    alignItems: "center",
  },
  paymentIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  paymentDetails: {
    fontSize: 12,
    color: "#A0A8C0",
  },
  paymentDefault: {
    fontSize: 11,
    color: "#00D9FF",
    fontWeight: "600",
    backgroundColor: "rgba(0, 217, 255, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  preferenceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  preferenceName: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#2D3250",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 4,
  },
  toggleActive: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#00D9FF",
  },
  preferenceDivider: {
    height: 1,
    backgroundColor: "#2D3250",
  },
});
