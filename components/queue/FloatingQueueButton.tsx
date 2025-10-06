import React from "react";
import { TouchableOpacity, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCustomization } from "@/components/customization/context/CustomizationContext";
import { useQueue } from "./context/QueueContext";

interface FloatingQueueButtonProps {
  onPress: () => void;
}

export function FloatingQueueButton({ onPress }: FloatingQueueButtonProps) {
  const { state } = useCustomization();
  const { state: queueState } = useQueue();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Use bottom positioning for mobile, top-right for desktop
  const useBottomPosition = width < 768;

  const baseStyle = {
    position: "absolute" as const,
    aspectRatio: 1,
    margin: 10,
    padding: 12,
    borderRadius: 28,
    backgroundColor: queueState.isActive
      ? state.colors.accent
      : state.colors.primary,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.3)",
    elevation: 8,
    zIndex: 100,
  };

  const positionStyle = useBottomPosition
    ? {
        bottom: Math.max(insets.bottom, 20), // Ensure minimum 20px from edge
        left: width / 2, // Center horizontally
      }
    : {
        top: Math.max(insets.top, 20),
        right: Math.max(insets.right, 20), // Respect right safe area
      };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[baseStyle, positionStyle]}
      activeOpacity={0.8}
    >
      <Ionicons
        name={queueState.isActive ? "list" : "list-outline"}
        size={24}
        color={state.colors.text}
      />
    </TouchableOpacity>
  );
}
