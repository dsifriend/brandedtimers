import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { View } from 'react-native';
import { timerStyles } from '../../styles/timer.styles';
import { TimeDisplay } from './components/TimeDisplay';
import { TimerControls } from './components/TimerControls';
import { TimerProvider } from './context/TimerContext';

export default function Timer() {
  return (
    <TimerProvider>
      <StatusBar style="light" backgroundColor="#000" />
      <View style={timerStyles.container}>
        <View style={timerStyles.timerContainer}>
          <TimeDisplay />
          <TimerControls />
        </View>
      </View>
    </TimerProvider>
  );
}
