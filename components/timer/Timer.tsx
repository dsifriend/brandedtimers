import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { CustomizationProvider, useCustomization } from '../customization/context/CustomizationContext';
import { CustomizationPanel } from '../customization/CustomizationPanel';
import { FloatingCustomizeButton } from '../customization/FloatingCustomizeButton';
import { TimeDisplay } from './components/TimeDisplay';
import { TimerControls } from './components/TimerControls';
import { TimerProvider } from './context/TimerContext';

function TimerContent() {
  const { state } = useCustomization();
  const [showCustomization, setShowCustomization] = useState(false);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar
        style={state.colorScheme === 'dark' ? 'light' : 'dark'}
        backgroundColor={state.colors.background}
      />
      <View style={{
        flex: 1,
        backgroundColor: state.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
      }}>
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 100,
          width: '100%',
        }}>
          <TimeDisplay />
          <TimerControls />
        </View>
      </View>

      <FloatingCustomizeButton
        onPress={() => setShowCustomization(true)}
      />

      <CustomizationPanel
        isVisible={showCustomization}
        onClose={() => setShowCustomization(false)}
      />
    </GestureHandlerRootView>
  );
}

export default function Timer() {
  return (
    <CustomizationProvider>
      <TimerProvider>
        <TimerContent />
      </TimerProvider>
    </CustomizationProvider>
  );
}
