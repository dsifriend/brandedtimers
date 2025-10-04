import { StyleSheet } from "react-native";

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
    textAlign: "center",
    includeFontPadding: false,
    // fontFamily will be set dynamically via useCustomization
  },
  timeSegmentInput: {
    color: "#fff",
    textAlign: "center",
    includeFontPadding: false,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 4,
    paddingHorizontal: 4,
    minWidth: 0, // Allow dynamic sizing
    // fontFamily will be set dynamically via useCustomization
  },
  separator: {
    color: "#fff",
    includeFontPadding: false,
    textAlign: "center",
    // fontFamily will be set dynamically via useCustomization
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
