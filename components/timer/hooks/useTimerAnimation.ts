import { useEffect, useRef } from "react";
import { useTimer } from "../context/TimerContext";

export function useTimerAnimation() {
  const { state, dispatch } = useTimer();
  const startTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);
  const initialDurationRef = useRef<number>(0);

  useEffect(() => {
    if (state.status === "running" && state.totalMilliseconds !== undefined) {
      // Set initial values when starting
      if (startTimeRef.current === 0) {
        startTimeRef.current = performance.now();
        initialDurationRef.current = state.totalMilliseconds;
      }

      const updateTimer = () => {
        const now = performance.now();
        const elapsed = now - startTimeRef.current;
        const remaining = Math.max(0, initialDurationRef.current - elapsed);

        dispatch({ type: "TICK", remaining });

        if (remaining > 0 && state.status === "running") {
          animationFrameRef.current = requestAnimationFrame(updateTimer);
        }
      };

      animationFrameRef.current = requestAnimationFrame(updateTimer);
    } else {
      // Reset refs when not running
      startTimeRef.current = 0;
      initialDurationRef.current = 0;
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [state.status, state.totalMilliseconds, dispatch]);
}
