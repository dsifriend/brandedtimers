import { CustomizationProvider, useCustomization } from '@/components/customization/context/CustomizationContext';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

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
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
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
