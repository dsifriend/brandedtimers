import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { QueueEntry } from "../types";
import { useCustomization } from "@/components/customization/context/CustomizationContext";
import {
  millisecondsToSegments,
  segmentsToMilliseconds,
} from "@/utils/timerUtils";

interface QueueEntryRowProps {
  entry: QueueEntry;
  isActive: boolean;
  onUpdate: (id: string, updates: Partial<Omit<QueueEntry, "id">>) => void;
  onRemove: (id: string) => void;
  dragHandleComponent?: React.ReactNode; // Will be provided by draggable list
}

export function QueueEntryRow({
  entry,
  isActive,
  onUpdate,
  onRemove,
  dragHandleComponent,
}: QueueEntryRowProps) {
  const { state } = useCustomization();

  const [isEditingDuration, setIsEditingDuration] = useState(false);
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [durationText, setDurationText] = useState("");
  const [labelText, setLabelText] = useState(entry.label || "");

  // Animation for removal
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const heightAnim = useRef(new Animated.Value(70)).current;

  // Format duration for display/editing (always MM:SS minimum, or HH:MM:SS)
  const formatDuration = useCallback(
    (ms: number): string => {
      const segments = millisecondsToSegments(ms);
      if (segments.hours > 0) {
        return `${segments.hours}:${String(segments.minutes).padStart(2, "0")}:${String(segments.seconds).padStart(2, "0")}`;
      } else {
        return `${String(segments.minutes).padStart(2, "0")}:${String(segments.seconds).padStart(2, "0")}`;
      }
    },
    [millisecondsToSegments],
  );

  // Parse duration from colon-separated format (HH:MM:SS, MM:SS, or SS)
  const parseDurationText = useCallback(
    (text: string): number | null => {
      const cleaned = text.trim();
      const parts = cleaned.split(":").map((p) => parseInt(p, 10));

      // Filter out NaN values
      if (parts.some((p) => isNaN(p))) {
        return null;
      }

      let hours = 0;
      let minutes = 0;
      let seconds = 0;

      if (parts.length === 1) {
        // SS format
        seconds = parts[0];
      } else if (parts.length === 2) {
        // MM:SS format
        minutes = parts[0];
        seconds = parts[1];
      } else if (parts.length === 3) {
        // HH:MM:SS format
        hours = parts[0];
        minutes = parts[1];
        seconds = parts[2];
      } else {
        return null;
      }

      const totalMs = segmentsToMilliseconds({ hours, minutes, seconds });
      return totalMs > 0 ? totalMs : null;
    },
    [segmentsToMilliseconds],
  );

  // Handle duration edit start
  const handleDurationPress = useCallback(() => {
    if (isActive) return; // Don't allow editing while active
    setDurationText(formatDuration(entry.duration));
    setIsEditingDuration(true);
  }, [isActive, entry.duration, formatDuration]);

  // Handle duration edit submit
  const handleDurationSubmit = useCallback(() => {
    const newDuration = parseDurationText(durationText);
    if (newDuration && newDuration !== entry.duration) {
      onUpdate(entry.id, { duration: newDuration });
    }
    setIsEditingDuration(false);
    Keyboard.dismiss();
  }, [durationText, entry.duration, entry.id, onUpdate, parseDurationText]);

  // Handle label edit
  const handleLabelSubmit = useCallback(() => {
    if (labelText !== entry.label) {
      onUpdate(entry.id, { label: labelText || undefined });
    }
    setIsEditingLabel(false);
    Keyboard.dismiss();
  }, [labelText, entry.label, entry.id, onUpdate]);

  // Handle remove with animation
  const handleRemove = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false, // Crashes with `true` on iOS
      }),
      Animated.timing(heightAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start(() => {
      onRemove(entry.id);
    });
  }, [fadeAnim, heightAnim, entry.id, onRemove]);

  const fontFamily =
    state.fontFamily === "inter"
      ? "Inter_400Regular"
      : "Merriweather_400Regular";

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        height: heightAnim,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: state.colors.primary,
          borderRadius: 12,
          padding: 8,
          marginVertical: 12,
        }}
      >
        {/* Content */}
        <View style={{ flex: 1 }}>
          {/* Duration */}
          {isEditingDuration ? (
            <TextInput
              value={durationText}
              onChangeText={setDurationText}
              onSubmitEditing={handleDurationSubmit}
              onBlur={handleDurationSubmit}
              placeholder="05:00"
              placeholderTextColor={state.colors.textSecondary}
              keyboardType="numbers-and-punctuation"
              autoFocus
              selectTextOnFocus
              style={{
                fontSize: 16,
                fontWeight: "400",
                color: state.colors.text,
                fontFamily,
                borderBottomWidth: 1,
                borderBottomColor: state.colors.text,
                paddingBottom: 2,
              }}
            />
          ) : (
            <TouchableOpacity onPress={handleDurationPress} disabled={isActive}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "400",
                  color: state.colors.text,
                  fontFamily,
                }}
              >
                {formatDuration(entry.duration)}
              </Text>
            </TouchableOpacity>
          )}

          {/* Label */}
          {isEditingLabel ? (
            <TextInput
              value={labelText}
              onChangeText={setLabelText}
              onSubmitEditing={handleLabelSubmit}
              onBlur={handleLabelSubmit}
              placeholder="Timer label (optional)"
              placeholderTextColor={state.colors.textSecondary}
              autoFocus
              style={{
                fontSize: 14,
                color: state.colors.textSecondary,
                fontFamily,
                marginTop: 4,
                borderBottomWidth: 1,
                borderBottomColor: state.colors.textSecondary,
                paddingBottom: 2,
              }}
            />
          ) : (
            <TouchableOpacity
              onPress={() => !isActive && setIsEditingLabel(true)}
              disabled={isActive}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: state.colors.textSecondary,
                  fontFamily,
                  marginTop: 4,
                  fontStyle: entry.label ? "normal" : "italic",
                }}
              >
                {entry.label || "(Add a Label)"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Drag Handle */}
        {dragHandleComponent || (
          <View>
            <Ionicons name="reorder-three" size={8} color={state.colors.text} />
          </View>
        )}

        {/* Remove Button */}
        <TouchableOpacity
          onPress={handleRemove}
          disabled={isActive}
          style={{
            padding: 4,
            opacity: isActive ? 0.3 : 1,
          }}
        >
          <Ionicons name="close-circle" size={24} color={state.colors.text} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}
