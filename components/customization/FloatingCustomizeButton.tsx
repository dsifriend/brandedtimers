import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCustomization } from "./context/CustomizationContext";

interface FloatingCustomizeButtonProps {
  onPress: () => void;
}

export function FloatingCustomizeButton({
  onPress,
}: FloatingCustomizeButtonProps) {
  const { state } = useCustomization();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Use bottom positioning for mobile, top-left for desktop
  const useBottomPosition = width < 768;

  const baseStyle = {
    position: "absolute" as const,
    aspectRatio: 1,
    margin: 10,
    padding: 12,
    borderRadius: 28,
    backgroundColor: state.colors.primary,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.3)",
    elevation: 8,
    zIndex: 100,
  };

  const positionStyle = useBottomPosition
    ? {
        bottom: Math.max(insets.bottom, 20), // Ensure minimum 20px from edge
        right: width / 2, // Center horizontally
      }
    : {
        top: Math.max(insets.top, 20),
        left: Math.max(insets.left, 20), // Respect left safe area
      };

  return (
    <TouchableOpacity
      style={[baseStyle, positionStyle]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons name="color-palette" size={24} color={state.colors.text} />
    </TouchableOpacity>
  );
}
