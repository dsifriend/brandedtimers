import React, { useEffect, useState } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { useTimer } from '../context/TimerContext';
import { useFontMetrics } from '../hooks/useFontMetrics';
import { useSegmentEditing } from '../hooks/useSegmentEditing';
import { useTimerAnimation } from '../hooks/useTimerAnimation';
import { TimeSegment } from './TimeSegment';
import { TimeSeparator } from './TimeSeparator';
import { TimerControls } from './TimerControls';

export function TimeDisplay() {
  const { state, millisecondsToSegments } = useTimer();
  const { editingSegment } = useSegmentEditing();
  const [blinkVisible, setBlinkVisible] = useState(true);
  const dimensions = useWindowDimensions();

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
    <>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center', // Ensure all elements align on the same baseline
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

      <View style={{
        position: 'absolute',
        transform: [{ translateY: metrics.fontSize / 2 + Math.min(32, (dimensions.height - metrics.fontSize) / 8) }]
      }}>
        <TimerControls />
      </View>
    </>
  );
}
