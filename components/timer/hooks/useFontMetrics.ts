import {
  useCallback,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
} from "react";
import { Dimensions } from "react-native";
import { timerConfig } from "../../../styles/timer.styles";

interface FontMetrics {
  fontSize: number;
  digitWidth: number;
  isReady: boolean;
}

export function useFontMetrics(
  totalMilliseconds: number,
  showHours: boolean,
  currentHours: number = 0
) {
  const [metrics, setMetrics] = useState<FontMetrics>({
    fontSize: 48,
    digitWidth: 0,
    isReady: false,
  });

  const deferredMilliseconds = useDeferredValue(totalMilliseconds);
  const measurementCache = useRef<Record<string, number>>({});

  const calculateFontSize = useCallback(() => {
    const { width, height } = Dimensions.get("window");
    const availableWidth = width - 20; // Minimal padding
    const availableHeight = height * 0.6; // Use more vertical space

    // Calculate actual character count based on real values
    const totalSeconds = Math.floor(deferredMilliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);

    // Determine actual digit counts
    const hasHours = hours > 0 || showHours;
    const hourDigits = hasHours ? Math.max(2, hours.toString().length) : 0;
    const charCount = hourDigits + 2 + 2; // +2 for minutes, seconds

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

    const newFontSize = Math.min(maxFontSizeByWidth, maxFontSizeByHeight, 300); // Cap at 300
    const clampedFontSize = Math.max(24, newFontSize);

    setMetrics((prev) => ({
      ...prev,
      fontSize: clampedFontSize,
      digitWidth: clampedFontSize * timerConfig.layout.characterWidthRatio,
      isReady: true,
    }));
  }, [deferredMilliseconds, showHours, currentHours]);

  useEffect(() => {
    calculateFontSize();
    const subscription = Dimensions.addEventListener(
      "change",
      calculateFontSize
    );
    return () => subscription?.remove();
  }, [calculateFontSize]);

  return metrics;
}
