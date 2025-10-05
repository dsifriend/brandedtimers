import { Audio } from "expo-av";
import { useEffect, useRef } from "react";
import {
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useTimer } from "../context/TimerContext";

export function useTimerCompletion() {
  const { state } = useTimer();
  const soundRef = useRef<Audio.Sound | null>(null);
  const previousMilliseconds = useRef<number | undefined>(
    state.totalMilliseconds,
  );
  const flashOpacity = useSharedValue(0);

  // Load sound on mount
  useEffect(() => {
    let isMounted = true;

    async function loadSound() {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require("@/assets/timer-complete.mp3"),
          { shouldPlay: false },
        );
        if (isMounted) {
          // Preload by setting position to 0
          await sound.setPositionAsync(0);
          soundRef.current = sound;
        }
      } catch (error) {
        console.error("Failed to load completion sound:", error);
      }
    }

    loadSound();

    return () => {
      isMounted = false;
      soundRef.current?.unloadAsync();
    };
  }, []);

  // Watch for completion (trigger at 500ms)
  useEffect(() => {
    const wasAbove500 =
      previousMilliseconds.current !== undefined &&
      previousMilliseconds.current > 500;
    const isNowBelow500 =
      state.totalMilliseconds !== undefined && state.totalMilliseconds <= 500;
    const justCrossed500 = wasAbove500 && isNowBelow500;

    if (justCrossed500) {
      // Play sound immediately - reset to start and play
      if (soundRef.current) {
        soundRef.current
          .setPositionAsync(0)
          .then(() => {
            soundRef.current?.playAsync();
          })
          .catch((error) => {
            console.error("Failed to play completion sound:", error);
          });
      }

      // Start flash on next frame
      requestAnimationFrame(() => {
        flashOpacity.value = withSequence(
          withTiming(1, { duration: 200 }),
          withTiming(0, { duration: 200 }),
        );
      });
    }

    previousMilliseconds.current = state.totalMilliseconds;
  }, [state.totalMilliseconds, flashOpacity]);

  return { flashOpacity };
}
