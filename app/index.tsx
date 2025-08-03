import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import Timer from '../components/timer/Timer';

import { CustomizationPanel } from '@/components/customization/CustomizationPanel';
import { FloatingCustomizeButton } from '@/components/customization/FloatingCustomizeButton';

export default function Index() {
  const [showCustomization, setShowCustomization] = useState(false);

  const content = (
    <>
      <Timer />

      <CustomizationPanel
        isVisible={showCustomization}
        onClose={() => setShowCustomization(false)}
      />

      <FloatingCustomizeButton
        onPress={() => setShowCustomization(!showCustomization)}
      />
    </>
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
