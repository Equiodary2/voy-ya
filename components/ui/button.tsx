import React from "react";
import { Pressable, StyleSheet, ViewStyle } from "react-native";
import { ThemedText } from "../themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: "primary" | "secondary" | "danger";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({
  onPress,
  title,
  variant = "primary",
  size = "medium",
  disabled = false,
  style,
}: ButtonProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const getBackgroundColor = () => {
    if (disabled) return "#5A6280";
    switch (variant) {
      case "primary":
        return colors.tint; // #00D9FF
      case "secondary":
        return "#252B45";
      case "danger":
        return "#FF6B6B";
      default:
        return colors.tint;
    }
  };

  const getTextColor = () => {
    if (variant === "secondary") return colors.tint;
    return "#FFFFFF";
  };

  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return styles.smallButton;
      case "large":
        return styles.largeButton;
      default:
        return styles.mediumButton;
    }
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        getSizeStyles(),
        {
          backgroundColor: getBackgroundColor(),
          opacity: pressed && !disabled ? 0.8 : 1,
        },
        style,
      ]}
    >
      <ThemedText
        style={{
          color: getTextColor(),
          fontWeight: "600",
          textAlign: "center",
        }}
      >
        {title}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minHeight: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  mediumButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  largeButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    minHeight: 56,
    justifyContent: "center",
    alignItems: "center",
  },
});
