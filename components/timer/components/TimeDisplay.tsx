import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { timerStyles } from '../../../styles/timer.styles';
import { useTimer } from '../context/TimerContext';
import { useFontMetrics } from '../hooks/useFontMetrics';
import { useSegmentEditing } from '../hooks/useSegmentEditing';
import { useTimerAnimation } from '../hooks/useTimerAnimation';
import { TimeSegment } from './TimeSegment';
import { TimeSeparator } from './TimeSeparator';

export function TimeDisplay() {
  const { state, millisecondsToSegments } = useTimer();
  const { editingSegment } = useSegmentEditing();
  const [blinkVisible, setBlinkVisible] = useState(true);

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
    <View style={timerStyles.timeDisplay}>
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
  );
}
