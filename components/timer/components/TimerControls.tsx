import { Ionicons } from '@expo/vector-icons';
import React, { memo, useCallback } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { timerConfig, timerStyles } from '../../../styles/timer.styles';
import { useTimer } from '../context/TimerContext';

export const TimerControls = memo(function TimerControls() {
  const { state, dispatch } = useTimer();

  const handleStartPause = useCallback(() => {
    if (state.status === 'stopped') {
      dispatch({ type: 'START' });
    } else if (state.status === 'running') {
      dispatch({ type: 'PAUSE' });
    } else {
      dispatch({ type: 'START' });
    }
  }, [state.status, dispatch]);

  const handleStopReset = useCallback(() => {
    if (state.status === 'running') {
      dispatch({ type: 'STOP' });
    } else {
      dispatch({ type: 'RESET' });
    }
  }, [state.status, dispatch]);

  const getStartPauseIcon = () => {
    return state.status === 'running' ? 'pause' : 'play';
  };

  const getStopResetIcon = () => {
    return state.status === 'running' ? 'stop' : 'arrow-undo';
  };

  const canStart = state.status === 'stopped' && state.totalMilliseconds > 0;
  const canPause = state.status === 'running';
  const canResume = state.status === 'paused';
  const canStopReset = state.status !== 'stopped' || state.totalMilliseconds > 0;

  return (
    <View style={timerStyles.controlsContainer}>
      <TouchableOpacity
        style={[
          timerStyles.controlButton,
          canStopReset && timerStyles.controlButtonActive,
        ]}
        onPress={handleStopReset}
        disabled={!canStopReset}
      >
        <Ionicons
          name={getStopResetIcon()}
          size={32}
          color={timerConfig.colors.text}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          timerStyles.controlButton,
          (canStart || canPause || canResume) && timerStyles.controlButtonActive,
        ]}
        onPress={handleStartPause}
        disabled={!canStart && !canPause && !canResume}
      >
        <Ionicons
          name={getStartPauseIcon()}
          size={32}
          color={timerConfig.colors.text}
        />
      </TouchableOpacity>
    </View>
  );
});
