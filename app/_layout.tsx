import { CustomizationProvider, useCustomization } from '@/components/customization/context/CustomizationContext';
import { Inter_400Regular } from '@expo-google-fonts/inter';
import { Merriweather_400Regular } from '@expo-google-fonts/merriweather';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Keep the splash screen visible while fonts are loading
SplashScreen.preventAutoHideAsync();

function RootContainer() {
  const { state } = useCustomization();

  return (
    <Stack screenOptions={{
      headerShown: false,
      contentStyle: {
        flex: 1,
        backgroundColor: state.colors.background
      }
    }} />
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Merriweather_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <CustomizationProvider>
          <RootContainer />
        </CustomizationProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
