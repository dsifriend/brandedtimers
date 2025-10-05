import React, { useEffect, useState } from "react";
import { View, useWindowDimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCustomization } from "../customization/context/CustomizationContext";
import { TimeSegment } from "./components/TimeSegment";
import { TimeSeparator } from "./components/TimeSeparator";
import { TimerControls } from "./components/TimerControls";
import { TimerProvider, useTimer } from "./context/TimerContext";
import { useFontMetrics } from "./hooks/useFontMetrics";
import { useSegmentEditing } from "./hooks/useSegmentEditing";
import { useTimerAnimation } from "./hooks/useTimerAnimation";
import { useTimerCompletion } from "./hooks/useTimerCompletion";

function TimerContent() {
  const { state, millisecondsToSegments } = useTimer();
  const { state: customState } = useCustomization();
  const { editingSegment } = useSegmentEditing();
  const [blinkVisible, setBlinkVisible] = useState(true);
  const dimensions = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Use the animation hook
  useTimerAnimation();

  // Use the completion hook
  const { flashOpacity } = useTimerCompletion();

  const segments = millisecondsToSegments(state.totalMilliseconds);
  const showHours = segments.hours > 0 || editingSegment === "hours";

  // Pass editing state for dynamic sizing
  const metrics = useFontMetrics(
    state.totalMilliseconds,
    showHours,
    segments.hours,
    state.editingSegment,
    state.editingValue,
  );

  // Hours segment fade animation
  const hoursOpacity = useSharedValue(showHours ? 1 : 0);

  useEffect(() => {
    hoursOpacity.value = withTiming(showHours ? 1 : 0, {
      duration: 300,
    });
  }, [showHours, hoursOpacity]);

  const hoursAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: hoursOpacity.value,
      transform: [
        {
          scaleX: hoursOpacity.value,
        },
      ],
    };
  });

  // Blink effect for separators
  useEffect(() => {
    if (state.status !== "running") {
      setBlinkVisible(true);
      return;
    }

    const interval = setInterval(() => {
      setBlinkVisible((prev) => !prev);
    }, 500);

    return () => clearInterval(interval);
  }, [state.status]);

  // Flash overlay animation
  const flashAnimatedStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
  }));

  return (
    <View
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
      }}
    >
      {/* Flash overlay */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: customState.colors.accent,
            pointerEvents: "none",
          },
          flashAnimatedStyle,
        ]}
      />

      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
        }}
      >
        {/* Time Display */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          {showHours && (
            <Animated.View
              style={[
                {
                  flexDirection: "row",
                  alignItems: "center",
                },
                hoursAnimatedStyle,
              ]}
            >
              <TimeSegment
                value={segments.hours}
                segment="hours"
                metrics={metrics}
              />
              <TimeSeparator visible={blinkVisible} metrics={metrics} />
            </Animated.View>
          )}

          <TimeSegment
            value={segments.minutes}
            segment="minutes"
            metrics={metrics}
          />
          <TimeSeparator visible={blinkVisible} metrics={metrics} />
          <TimeSegment
            value={segments.seconds}
            segment="seconds"
            metrics={metrics}
          />
        </View>

        {/* Timer Controls */}
        <Animated.View
          style={[
            {
              position: "absolute",
            },
            useAnimatedStyle(() => ({
              transform: [
                {
                  translateY:
                    metrics.fontSize.value / 2 +
                    Math.max(
                      32,
                      (dimensions.height - metrics.fontSize.value) / 8,
                    ),
                },
              ],
            })),
          ]}
        >
          <TimerControls />
        </Animated.View>
      </View>
    </View>
  );
}

export default function Timer() {
  return (
    <TimerProvider>
      <TimerContent />
    </TimerProvider>
  );
}
