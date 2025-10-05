// components/queue/components/QueueEntryRow.tsx
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
import { useTimer } from "@/components/timer/context/TimerContext";

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
  const { millisecondsToSegments, segmentsToMilliseconds } = useTimer();

  const [isEditingDuration, setIsEditingDuration] = useState(false);
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [durationText, setDurationText] = useState("");
  const [labelText, setLabelText] = useState(entry.label || "");

  // Animation for removal
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const heightAnim = useRef(new Animated.Value(70)).current;

  // Format duration for display (when not editing)
  const formatDuration = useCallback(
    (ms: number): string => {
      const segments = millisecondsToSegments(ms);
      const parts = [];
      if (segments.hours > 0) parts.push(`${segments.hours}h`);
      if (segments.minutes > 0) parts.push(`${segments.minutes}m`);
      if (segments.seconds > 0 || parts.length === 0)
        parts.push(`${segments.seconds}s`);
      return parts.join(" ");
    },
    [millisecondsToSegments],
  );

  // Format duration for editing (MM:SS or HH:MM:SS)
  const formatDurationForEdit = useCallback(
    (ms: number): string => {
      const segments = millisecondsToSegments(ms);
      if (segments.hours > 0) {
        return `${segments.hours}:${String(segments.minutes).padStart(2, "0")}:${String(segments.seconds).padStart(2, "0")}`;
      } else {
        return `${segments.minutes}:${String(segments.seconds).padStart(2, "0")}`;
      }
    },
    [millisecondsToSegments],
  );

  // Parse duration from simple text input (e.g., "5m", "1h30m", "90s")
  const parseDurationText = useCallback(
    (text: string): number | null => {
      const cleaned = text.toLowerCase().trim();

      // Match patterns like "1h", "30m", "45s", "1h30m", "2h15m30s"
      const hours = (cleaned.match(/(\d+)\s*h/i) || [])[1];
      const minutes = (cleaned.match(/(\d+)\s*m/i) || [])[1];
      const seconds = (cleaned.match(/(\d+)\s*s/i) || [])[1];

      // If just a number, treat as minutes
      if (/^\d+$/.test(cleaned)) {
        const value = parseInt(cleaned, 10);
        return segmentsToMilliseconds({ hours: 0, minutes: value, seconds: 0 });
      }

      const h = parseInt(hours || "0", 10);
      const m = parseInt(minutes || "0", 10);
      const s = parseInt(seconds || "0", 10);

      const totalMs = segmentsToMilliseconds({
        hours: h,
        minutes: m,
        seconds: s,
      });
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
        useNativeDriver: true,
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
          backgroundColor: isActive
            ? state.colors.accent
            : state.colors.primary,
          borderRadius: 12,
          padding: 12,
          marginBottom: 8,
          minHeight: 70,
        }}
      >
        {/* Drag Handle */}
        {dragHandleComponent || (
          <View style={{ marginRight: 12, opacity: 0.5 }}>
            <Ionicons
              name="reorder-three"
              size={24}
              color={state.colors.text}
            />
          </View>
        )}

        {/* Content */}
        <View style={{ flex: 1 }}>
          {/* Duration */}
          {isEditingDuration ? (
            <TextInput
              value={durationText}
              onChangeText={setDurationText}
              onSubmitEditing={handleDurationSubmit}
              onBlur={handleDurationSubmit}
              placeholder="e.g. 5m, 30s, 1h30m"
              placeholderTextColor={state.colors.textSecondary}
              keyboardType="default"
              autoFocus
              selectTextOnFocus
              style={{
                fontSize: 18,
                fontWeight: "600",
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
                  fontSize: 18,
                  fontWeight: "600",
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
                {entry.label || "Tap to add label"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Remove Button */}
        <TouchableOpacity
          onPress={handleRemove}
          disabled={isActive}
          style={{
            marginLeft: 12,
            padding: 8,
            opacity: isActive ? 0.3 : 1,
          }}
        >
          <Ionicons name="close-circle" size={24} color={state.colors.text} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}
