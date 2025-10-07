import { useEffect, useRef, useCallback } from "react";
import { useQueue } from "../context/QueueContext";
import { useTimer } from "../../timer/context/TimerContext";

/**
 * This hook should only be used inside components that are wrapped in TimerProvider
 */
export function useQueueIntegration() {
  const {
    state: queueState,
    getCurrentEntry,
    hasNextEntry,
    advanceQueue,
  } = useQueue();
  const { state: timerState, dispatch: timerDispatch } = useTimer();
  const lastLoadedEntryId = useRef<string | null>(null);
  const wasRunning = useRef(false);

  // Load current queue entry into timer when queue starts or advances
  useEffect(() => {
    if (!queueState.isActive) {
      lastLoadedEntryId.current = null;
      return;
    }

    const currentEntry = getCurrentEntry();
    if (!currentEntry) return;

    // Only load if this is a different entry
    if (currentEntry.id !== lastLoadedEntryId.current) {
      lastLoadedEntryId.current = currentEntry.id;

      // Stop any running timer first
      timerDispatch({ type: "STOP" });

      // Load the new duration
      timerDispatch({ type: "SET_DURATION", duration: currentEntry.duration });

      // Auto-start if in continuous mode and not the first entry
      if (queueState.continuousMode && wasRunning.current) {
        // Small delay to ensure UI updates
        setTimeout(() => {
          timerDispatch({ type: "START" });
        }, 100);
      }
    }
  }, [
    queueState.isActive,
    queueState.currentIndex,
    queueState.continuousMode,
    getCurrentEntry,
    timerDispatch,
  ]);

  // Monitor timer completion
  useEffect(() => {
    // Track if timer was running (for continuous mode)
    if (timerState.status === "running") {
      wasRunning.current = true;
    }

    // Check if timer just completed while queue is active
    if (
      queueState.isActive &&
      timerState.status === "stopped" &&
      timerState.totalMilliseconds === 0 &&
      wasRunning.current
    ) {
      // Advance to next entry if available
      if (hasNextEntry()) {
        advanceQueue();
      } else {
        // Queue completed
        advanceQueue();
        wasRunning.current = false;
      }
    }
  }, [
    timerState.status,
    timerState.totalMilliseconds,
    queueState.isActive,
    hasNextEntry,
    advanceQueue,
  ]);

  // Get current entry label for display
  const getCurrentLabel = useCallback((): string | undefined => {
    if (!queueState.isActive) return undefined;
    const entry = getCurrentEntry();
    return entry?.label;
  }, [queueState.isActive, getCurrentEntry]);

  // Check if we should show queue controls
  const isQueueMode = queueState.isActive;
  const queueProgress = {
    current: queueState.currentIndex + 1,
    total: queueState.entries.length,
  };

  return {
    isQueueMode,
    queueProgress,
    currentLabel: getCurrentLabel(),
  };
}
