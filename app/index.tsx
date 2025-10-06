import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import Timer from "../components/timer/Timer";
import { useCustomization } from "@/components/customization/context/CustomizationContext";
import { CustomizationPanel } from "@/components/customization/CustomizationPanel";
import { FloatingCustomizeButton } from "@/components/customization/FloatingCustomizeButton";
import { Header } from "@/components/Header";
import { QueueProvider } from "@/components/queue/context/QueueContext";
import { QueuePanel } from "@/components/queue/QueuePanel";
import { FloatingQueueButton } from "@/components/queue/FloatingQueueButton";
import { TimerProvider } from "@/components/timer/context/TimerContext";

function AppContent() {
  const [showCustomization, setShowCustomization] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const { state } = useCustomization();

  const content = (
    <View style={{ flex: 1, backgroundColor: state.colors.background }}>
      {/* Header - positioned absolutely at top */}
      <Header />

      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        <Timer />
      </View>

      {/* Panels */}
      <CustomizationPanel
        isVisible={showCustomization}
        onClose={() => setShowCustomization(false)}
      />

      <QueuePanel isVisible={showQueue} onClose={() => setShowQueue(false)} />

      {/* Floating Buttons */}
      <FloatingCustomizeButton
        onPress={() => {
          setShowCustomization(!showCustomization);
          if (showQueue) setShowQueue(false); // Close queue if open
        }}
      />

      <FloatingQueueButton
        onPress={() => {
          setShowQueue(!showQueue);
          if (showCustomization) setShowCustomization(false); // Close customization if open
        }}
      />
    </View>
  );

  // Return content, wrapped in `KeyboardAvoidingView` on mobile
  if (Platform.OS === "ios" || Platform.OS === "android") {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {content}
      </KeyboardAvoidingView>
    );
  } else {
    return content;
  }
}

// Main export with providers
// TimerProvider wraps everything so QueuePanel can use timer functions
export default function Index() {
  return (
    <TimerProvider>
      <QueueProvider>
        <AppContent />
      </QueueProvider>
    </TimerProvider>
  );
}
