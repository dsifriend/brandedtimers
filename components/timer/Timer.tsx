import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CustomizationProvider, useCustomization } from '../customization/context/CustomizationContext';
import { CustomizationPanel } from '../customization/CustomizationPanel';
import { FloatingCustomizeButton } from '../customization/FloatingCustomizeButton';
import { TimeDisplay } from './components/TimeDisplay';
import { TimerControls } from './components/TimerControls';
import { TimerProvider } from './context/TimerContext';

function TimerContent() {
  const { state } = useCustomization();
  const [showCustomization, setShowCustomization] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <>
      <StatusBar
        style={state.colorScheme === 'dark' ? 'light' : 'dark'}
        backgroundColor={state.colors.background}
      />
      {/* Background fills entire screen including safe areas */}
      <View style={{
        flex: 1,
        backgroundColor: state.colors.background,
      }}>
        {/* Content respects safe areas */}
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
            <TimeDisplay />
            <TimerControls />
          </View>
        </View>
      </View>

      <FloatingCustomizeButton
        onPress={() => setShowCustomization(true)}
      />

      <CustomizationPanel
        isVisible={showCustomization}
        onClose={() => setShowCustomization(false)}
      />
    </>
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
