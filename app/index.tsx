import { Inter_400Regular, useFonts } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import Timer from '../components/timer/Timer';

// Keep the splash screen visible while fonts are loading
SplashScreen.preventAutoHideAsync();

export default function Index() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
  });

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
      <StatusBar style="light" backgroundColor="#000" />
      <Timer />
    </>
  );
}