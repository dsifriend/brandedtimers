import React, { useState } from 'react';
import Timer from '../components/timer/Timer';

import { CustomizationPanel } from '@/components/customization/CustomizationPanel';
import { FloatingCustomizeButton } from '@/components/customization/FloatingCustomizeButton';

export default function Index() {
  const [showCustomization, setShowCustomization] = useState(false);
  return (
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
}
