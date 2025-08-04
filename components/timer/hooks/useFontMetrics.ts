import { timerConfig } from "@/styles/timer.styles";
import { useCallback, useDeferredValue, useEffect, useState } from "react";
import { Dimensions, Keyboard, Platform } from "react-native";
import {
  SharedValue,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

interface FontMetrics {
  fontSize: SharedValue<number>;
  digitWidth: SharedValue<number>;
  isReady: boolean;
}

export function useFontMetrics(
  totalMilliseconds: number | undefined,
  showHours: boolean,
  currentHours: number = 0,
  editingSegment: "hours" | "minutes" | "seconds" | null = null,
  editingValue: string = ""
) {
  const [isReady, setIsReady] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const deferredMilliseconds = useDeferredValue(totalMilliseconds);

  // Animated values for smooth transitions
  const fontSize = useSharedValue(48);
  const digitWidth = useSharedValue(
    48 * timerConfig.layout.characterWidthRatio
  );

  const calculateFontSize = useCallback(() => {
    const { width, height } = Dimensions.get("window");
    const availableWidth = width - 20; // Minimal padding

    // Adjust available height based on keyboard presence
    const availableHeight = (height - keyboardHeight) * 0.6; // Use more vertical space

    // Calculate actual character count based on real values
    // Handle undefined case - use default layout for empty timer
    const totalSeconds = deferredMilliseconds
      ? Math.floor(deferredMilliseconds / 1000)
      : 0;
    const hours = Math.floor(totalSeconds / 3600);

    // Determine actual digit counts, considering editing state
    const hasHours = hours > 0 || showHours || editingSegment === "hours";

    let hourDigits: number;
    let minuteDigits: number;
    let secondDigits: number;

    if (editingSegment && editingValue) {
      // Use editing value length for the segment being edited
      const editingLength = editingValue.length;

      // Use dynamic sizing
      hourDigits =
        editingSegment === "hours"
          ? editingLength
          : hasHours
          ? Math.max(2, hours.toString().length)
          : 0;
      minuteDigits =
        editingSegment === "minutes" ? Math.max(2, editingLength) : 2;
      secondDigits =
        editingSegment === "seconds" ? Math.max(2, editingLength) : 2;
    } else {
      // Normal behavior when not editing
      hourDigits = hasHours
        ? deferredMilliseconds === undefined
          ? 2
          : Math.max(2, hours.toString().length)
        : 0;
      minuteDigits = 2;
      secondDigits = 2;
    }

    const charCount = hourDigits + minuteDigits + secondDigits;

    // Add separator count
    const separatorCount = hasHours ? 2 : 1;

    // Calculate available width accounting for separator margins only first
    const separatorMargins =
      timerConfig.spacing.separatorSpacing * separatorCount;
    const availableForTextAndSeparators = availableWidth - separatorMargins;

    // Total character count including separators
    const totalCharCount = charCount + separatorCount; // Each ":" counts as one character
    const baseCharWidth = availableForTextAndSeparators / totalCharCount;

    // Use a reasonable character width ratio
    const maxFontSizeByWidth = Math.floor(
      baseCharWidth / timerConfig.layout.characterWidthRatio
    );
    const maxFontSizeByHeight = Math.floor(availableHeight * 0.9);

    const newFontSize = Math.min(maxFontSizeByWidth, maxFontSizeByHeight, 500); // Cap at 500
    const clampedFontSize = Math.max(24, newFontSize);
    const newDigitWidth =
      clampedFontSize * timerConfig.layout.characterWidthRatio;

    // Animate to new values with spring animation
    fontSize.value = withSpring(clampedFontSize, {
      damping: 20,
      stiffness: 300,
      mass: 0.8,
    });

    digitWidth.value = withSpring(newDigitWidth, {
      damping: 20,
      stiffness: 300,
      mass: 0.8,
    });

    if (!isReady) {
      setIsReady(true);
    }
  }, [
    deferredMilliseconds,
    showHours,
    currentHours,
    editingSegment,
    editingValue,
    keyboardHeight,
    fontSize,
    digitWidth,
    isReady,
  ]);

  useEffect(() => {
    calculateFontSize();
    const subscription = Dimensions.addEventListener(
      "change",
      calculateFontSize
    );
    return () => subscription?.remove();
  }, [calculateFontSize]);

  // Keyboard event listeners
  useEffect(() => {
    if (Platform.OS === "web") {
      // Skip keyboard handling on web
      return;
    }

    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return { fontSize, digitWidth, isReady };
}
