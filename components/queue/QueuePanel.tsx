import React, { useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Modal,
  useWindowDimensions,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useCustomization } from "@/components/customization/context/CustomizationContext";
import { useQueue } from "./context/QueueContext";
import { QueueEntryRow } from "./components/QueueEntryRow";
// Removed AddTimerModal import - not needed

interface QueuePanelProps {
  isVisible: boolean;
  onClose: () => void;
}

export function QueuePanel({ isVisible, onClose }: QueuePanelProps) {
  const { state: customState } = useCustomization();
  const {
    state: queueState,
    addTimer,
    removeTimer,
    updateTimer,
    startQueue,
    stopQueue,
    resetQueue,
    dispatch,
  } = useQueue();

  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Determine if we should use sidebar or bottom sheet
  const useBottomSheet = Platform.OS !== "web" || width < 768;
  const panelWidth = useBottomSheet ? "100%" : 400;

  const fontFamily =
    customState.fontFamily === "inter"
      ? "Inter_400Regular"
      : "Merriweather_400Regular";

  const handleContinuousModeToggle = useCallback(
    (value: boolean) => {
      dispatch({ type: "SET_CONTINUOUS_MODE", enabled: value });
    },
    [dispatch],
  );

  const handleAddTimer = useCallback(() => {
    // Add a new timer with default 5 minute duration
    addTimer(5 * 60 * 1000); // 5 minutes in milliseconds
  }, [addTimer]);

  const handleQueueControl = useCallback(() => {
    if (queueState.isActive) {
      stopQueue();
    } else if (queueState.entries.length > 0) {
      startQueue();
    }
  }, [queueState.isActive, queueState.entries.length, startQueue, stopQueue]);

  const renderContent = () => (
    <View
      style={{
        flex: 1,
        padding: 20,
        paddingTop: useBottomSheet ? 20 : Math.max(insets.top, 20),
        backgroundColor: customState.colors.background,
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: "600",
            color: customState.colors.text,
            fontFamily,
          }}
        >
          Timer Queue
        </Text>
        <TouchableOpacity
          onPress={onClose}
          style={{
            padding: 8,
            borderRadius: 20,
            backgroundColor: customState.colors.primary,
          }}
        >
          <Ionicons name="close" size={20} color={customState.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Continuous Mode Toggle */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: customState.colors.primary,
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 12,
          marginBottom: 20,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            color: customState.colors.text,
            fontFamily,
          }}
        >
          Continuous Mode
        </Text>
        <Switch
          value={queueState.continuousMode}
          onValueChange={handleContinuousModeToggle}
          trackColor={{
            false: customState.colors.background,
            true: customState.colors.background,
          }}
          thumbColor={customState.colors.text}
          disabled={queueState.isActive}
        />
      </View>

      {/* Queue Status */}
      {queueState.isActive && (
        <View
          style={{
            backgroundColor: customState.colors.accent,
            borderRadius: 12,
            padding: 12,
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              color: customState.colors.text,
              fontFamily,
              textAlign: "center",
            }}
          >
            Queue Running • Timer {queueState.currentIndex + 1} of{" "}
            {queueState.entries.length}
          </Text>
        </View>
      )}

      {/* Queue List */}
      <ScrollView
        style={{
          flex: 1,
          marginBottom: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {queueState.entries.length === 0 ? (
          <View
            style={{
              padding: 40,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                color: customState.colors.textSecondary,
                fontFamily,
                textAlign: "center",
                marginBottom: 20,
              }}
            >
              No timers in queue
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: customState.colors.textSecondary,
                fontFamily,
                textAlign: "center",
                opacity: 0.7,
              }}
            >
              Tap "Add Timer" to create your first timer
            </Text>
          </View>
        ) : (
          queueState.entries.map((entry, index) => (
            <QueueEntryRow
              key={entry.id}
              entry={entry}
              isActive={
                queueState.isActive && index === queueState.currentIndex
              }
              onUpdate={updateTimer}
              onRemove={removeTimer}
            />
          ))
        )}
      </ScrollView>

      {/* Control Buttons */}
      <View style={{ gap: 12 }}>
        {/* Add Timer Button */}
        <TouchableOpacity
          onPress={handleAddTimer}
          style={{
            backgroundColor: customState.colors.primary,
            borderRadius: 12,
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name="add-circle"
            size={24}
            color={customState.colors.text}
            style={{ marginRight: 8 }}
          />
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: customState.colors.text,
              fontFamily,
            }}
          >
            Add Timer
          </Text>
        </TouchableOpacity>

        {/* Queue Controls */}
        <View style={{ flexDirection: "row", gap: 12 }}>
          <TouchableOpacity
            onPress={resetQueue}
            disabled={!queueState.isActive && queueState.currentIndex === 0}
            style={{
              flex: 1,
              backgroundColor: customState.colors.primary,
              borderRadius: 12,
              padding: 16,
              alignItems: "center",
              opacity:
                !queueState.isActive && queueState.currentIndex === 0 ? 0.5 : 1,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: customState.colors.text,
                fontFamily,
              }}
            >
              Reset
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleQueueControl}
            disabled={queueState.entries.length === 0}
            style={{
              flex: 2,
              backgroundColor: queueState.isActive
                ? customState.colors.secondary
                : customState.colors.accent,
              borderRadius: 12,
              padding: 16,
              alignItems: "center",
              opacity: queueState.entries.length === 0 ? 0.5 : 1,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: customState.colors.text,
                fontFamily,
              }}
            >
              {queueState.isActive ? "Stop Queue" : "Start Queue"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (!isVisible) return null;

  // Bottom sheet for mobile
  if (useBottomSheet) {
    return (
      <Modal
        visible={isVisible}
        animationType="slide"
        transparent
        onRequestClose={onClose}
      >
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={onClose}
          >
            <BlurView
              intensity={80}
              tint={customState.colorScheme === "dark" ? "dark" : "light"}
              style={{ flex: 1 }}
            />
          </TouchableOpacity>
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: height * 0.8,
              backgroundColor: customState.colors.background,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.25,
              shadowRadius: 10,
              elevation: 5,
            }}
          >
            {renderContent()}
          </View>
        </View>
      </Modal>
    );
  }

  // Sidebar for desktop/web
  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        width: panelWidth,
        backgroundColor: customState.colors.background,
        shadowColor: "#000",
        shadowOffset: { width: -2, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 5,
        zIndex: 1000,
      }}
    >
      {renderContent()}
    </View>
  );
}
