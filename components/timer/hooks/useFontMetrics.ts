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
  hasActiveEdit: boolean
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
    const availableWidth = width - timerConfig.spacing.containerPadding * 2;
    const availableHeight = height * 0.4;

    // Determine character count based on duration
    const totalSeconds = Math.floor(deferredMilliseconds / 1000);
    const hasHours = totalSeconds >= 3600 || hasActiveEdit;
    const charCount = hasHours ? 8 : 5; // "HH:MM:SS" or "MM:SS"
    const separatorCount = hasHours ? 2 : 1;
    const separatorWidth =
      timerConfig.spacing.separatorSpacing * 2 * separatorCount;

    const availableForText = availableWidth - separatorWidth;
    const baseCharWidth = availableForText / charCount;

    // Use a reasonable character width ratio
    const maxFontSizeByWidth = Math.floor(
      baseCharWidth / timerConfig.layout.characterWidthRatio
    );
    const maxFontSizeByHeight = Math.floor(availableHeight * 0.8);

    const newFontSize = Math.min(maxFontSizeByWidth, maxFontSizeByHeight);
    const clampedFontSize = Math.max(24, newFontSize);

    setMetrics((prev) => ({
      ...prev,
      fontSize: clampedFontSize,
      digitWidth: clampedFontSize * timerConfig.layout.characterWidthRatio,
      isReady: true,
    }));
  }, [deferredMilliseconds, hasActiveEdit]);

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
