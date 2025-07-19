import { Inter_400Regular, useFonts } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import Timer from '../components/timer/Timer';

import { useCustomization } from '@/components/customization/context/CustomizationContext';
import { CustomizationPanel } from '@/components/customization/CustomizationPanel';
import { FloatingCustomizeButton } from '@/components/customization/FloatingCustomizeButton';

// Keep the splash screen visible while fonts are loading
SplashScreen.preventAutoHideAsync();

export default function Index() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
  });
  const { state } = useCustomization();

  const [showCustomization, setShowCustomization] = useState(false);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null; // Keep splash screen visible while loading
  }

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
