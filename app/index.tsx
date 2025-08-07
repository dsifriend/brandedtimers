import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import Timer from '../components/timer/Timer';

import { useCustomization } from '@/components/customization/context/CustomizationContext';
import { CustomizationPanel } from '@/components/customization/CustomizationPanel';
import { FloatingCustomizeButton } from '@/components/customization/FloatingCustomizeButton';
import { Header } from '@/components/Header';

export default function Index() {
  const [showCustomization, setShowCustomization] = useState(false);
  const { state } = useCustomization();

  const content = (
    <View style={{ flex: 1, backgroundColor: state.colors.background }}>
      {/* Header - positioned absolutely at top */}
      <Header />

      {/* Timer - takes full screen, centered */}
      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}>
        <Timer />
      </View>

      <CustomizationPanel
        isVisible={showCustomization}
        onClose={() => setShowCustomization(false)}
      />

      <FloatingCustomizeButton
        onPress={() => setShowCustomization(!showCustomization)}
      />
    </View>
  );

  {/* Return content, wrapped in `KeyboardAvoidingView` on mobile. */ }
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {content}
      </KeyboardAvoidingView>
    );
  }
  else {
    return content;
  }
}
