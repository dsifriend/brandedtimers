import React from "react";
import {
  TouchableOpacity,
  useWindowDimensions,
  Platform,
  View,
  Text,
} from "react-native";
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
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  // Determine if we should use bottom sheet (mobile) or sidebar (desktop)
  const useBottomSheet = Platform.OS !== "web" || width < 768;

  // Position based on panel type
  const position = useBottomSheet
    ? {
        // Bottom sheet: position next to customize button
        bottom: Math.max(insets.bottom, 20),
        right: 80, // Offset from customize button which is at 20
      }
    : {
        // Sidebar: position on left side of screen
        bottom: Math.max(insets.bottom, 20),
        left: 20,
      };

  // Show badge if queue has items
  const showBadge = queueState.entries.length > 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        position: "absolute",
        ...position,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: queueState.isActive
          ? state.colors.accent
          : state.colors.primary,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        zIndex: 999,
      }}
    >
      <Ionicons
        name={queueState.isActive ? "list" : "list-outline"}
        size={28}
        color={state.colors.text}
      />

      {/* Badge showing queue count */}
      {showBadge && (
        <View
          style={{
            position: "absolute",
            top: -4,
            right: -4,
            backgroundColor: state.colors.secondary,
            borderRadius: 10,
            minWidth: 20,
            height: 20,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 4,
          }}
        >
          <Text
            style={{
              color: state.colors.text,
              fontSize: 12,
              fontWeight: "600",
            }}
          >
            {queueState.entries.length}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
