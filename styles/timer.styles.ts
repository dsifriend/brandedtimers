import { StyleSheet } from "react-native";

// Font configuration - change this to switch fonts easily
// Note: Make sure to install and load the font in app.tsx or _layout.tsx
// For Google Fonts, use: npx expo install @expo-google-fonts/FONT expo-font
// Then import and load: import { useFonts, FONT } from '@expo-google-fonts/FONT';
const FONT_FAMILY = "Inter_400Regular";

export const timerStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  timerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
    width: "100%",
  },
  timeDisplay: {
    flexDirection: "row",
    justifyContent: "center",
  },
  timeSegment: {
    color: "#fff",
    fontFamily: FONT_FAMILY,
    textAlign: "center",
    includeFontPadding: false,
  },
  timeSegmentInput: {
    color: "#fff",
    fontFamily: FONT_FAMILY,
    textAlign: "center",
    includeFontPadding: false,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 4,
    paddingHorizontal: 4,
    minWidth: 0, // Allow dynamic sizing
  },
  separator: {
    color: "#fff",
    fontFamily: FONT_FAMILY,
    includeFontPadding: false,
    textAlign: "center",
  },
  separatorContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    gap: 20,
  },
  controlButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 50,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  controlButtonActive: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
});

export const timerConfig = {
  fonts: {
    primary: FONT_FAMILY,
    // Fallback system font that should be available everywhere
    fallback: "System",
  },
  colors: {
    background: "#000",
    text: "#fff",
    buttonBackground: "rgba(255, 255, 255, 0.1)",
    buttonBackgroundActive: "rgba(255, 255, 255, 0.2)",
    inputBackground: "rgba(255, 255, 255, 0.1)",
  },
  spacing: {
    digitSpacing: 1,
    separatorSpacing: 8,
    controlGap: 40,
    containerPadding: 20,
  },
  timing: {
    blinkCycle: 1000, // milliseconds for full blink cycle
    updateInterval: 16, // ~60fps updates
  },
  layout: {
    // Generic character width ratio - works across most monospace and proportional fonts
    characterWidthRatio: 0.6,
    // Minimum character width for calculations
    minCharacterWidth: 2,
  },
};
