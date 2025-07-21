import { Ionicons } from '@expo/vector-icons';
import React, { memo, useCallback } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useCustomization } from '../../customization/context/CustomizationContext';
import { useTimer } from '../context/TimerContext';

export const TimerControls = memo(function TimerControls() {
  const { state, dispatch } = useTimer();
  const { state: customState } = useCustomization();

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

  const canStart = state.status === 'stopped' && state.totalMilliseconds !== undefined && state.totalMilliseconds > 0;
  const canPause = state.status === 'running';
  const canResume = state.status === 'paused';
  const canStopReset = state.status !== 'stopped' ||
    state.totalMilliseconds !== undefined ||
    (state.totalMilliseconds === 0 && state.originalDuration !== undefined);

  return (
    <View style={{
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 20,
    }}>
      <TouchableOpacity
        style={{
          backgroundColor: canStopReset ? customState.colors.secondary : customState.colors.primary,
          borderRadius: 50,
          padding: 16,
          justifyContent: 'center',
          alignItems: 'center',
          opacity: canStopReset ? 1 : 0.5,
        }}
        onPress={handleStopReset}
        disabled={!canStopReset}
      >
        <Ionicons
          name={getStopResetIcon()}
          size={24}
          color={customState.colorScheme === 'dark' ? customState.colors.text : customState.colors.background}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          backgroundColor: (canStart || canPause || canResume) ? customState.colors.accent : customState.colors.secondary,
          borderRadius: 50,
          padding: 16,
          justifyContent: 'center',
          alignItems: 'center',
          opacity: (canStart || canPause || canResume) ? 1 : 0.5,
        }}
        onPress={handleStartPause}
        disabled={!canStart && !canPause && !canResume}
      >
        <Ionicons
          name={getStartPauseIcon()}
          size={24}
          color={customState.colorScheme === 'dark' ? customState.colors.text : customState.colors.background}
        />
      </TouchableOpacity>
    </View>
  );
});
