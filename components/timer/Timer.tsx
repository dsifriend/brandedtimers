import React, { useEffect, useState } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCustomization } from '../customization/context/CustomizationContext';
import { TimeSegment } from './components/TimeSegment';
import { TimeSeparator } from './components/TimeSeparator';
import { TimerControls } from './components/TimerControls';
import { TimerProvider, useTimer } from './context/TimerContext';
import { useFontMetrics } from './hooks/useFontMetrics';
import { useSegmentEditing } from './hooks/useSegmentEditing';
import { useTimerAnimation } from './hooks/useTimerAnimation';

function TimerContent() {
  const { state, millisecondsToSegments } = useTimer();
  const { state: customState } = useCustomization();
  const { editingSegment } = useSegmentEditing();
  const [blinkVisible, setBlinkVisible] = useState(true);
  const dimensions = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Use the animation hook
  useTimerAnimation();

  const segments = millisecondsToSegments(state.totalMilliseconds);
  const showHours = segments.hours > 0 || editingSegment === 'hours';

  // Pass actual hour value for dynamic sizing
  const metrics = useFontMetrics(
    state.totalMilliseconds,
    showHours,
    segments.hours
  );

  // Blink effect for separators
  useEffect(() => {
    if (state.status !== 'running') {
      setBlinkVisible(true);
      return;
    }

    const interval = setInterval(() => {
      setBlinkVisible(prev => !prev);
    }, 500);

    return () => clearInterval(interval);
  }, [state.status]);

  return (
    <View style={{
      flex: 1,
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    }}>
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
      }}>
        {/* Time Display */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}>
          {showHours && (
            <>
              <TimeSegment
                value={segments.hours}
                segment="hours"
                fontSize={metrics.fontSize}
                digitWidth={metrics.digitWidth}
              />
              <TimeSeparator
                visible={blinkVisible}
                fontSize={metrics.fontSize}
              />
            </>
          )}
          <TimeSegment
            value={segments.minutes}
            segment="minutes"
            fontSize={metrics.fontSize}
            digitWidth={metrics.digitWidth}
          />
          <TimeSeparator
            visible={blinkVisible}
            fontSize={metrics.fontSize}
          />
          <TimeSegment
            value={segments.seconds}
            segment="seconds"
            fontSize={metrics.fontSize}
            digitWidth={metrics.digitWidth}
          />
        </View>

        {/* Timer Controls */}
        <View style={{
          position: 'absolute',
          transform: [{ translateY: metrics.fontSize / 2 + Math.min(32, (dimensions.height - metrics.fontSize) / 8) }]
        }}>
          <TimerControls />
        </View>
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
