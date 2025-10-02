import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useState } from "react";
import { LayoutChangeEvent, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  clamp,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { ColorPresets, toReactNativeColor } from "@/utils/colorUtils";

interface HueSliderProps {
  value: number; // 0-360
  onValueChange: (hue: number) => void;
  onThumbPress?: () => void;
  colorScheme?: "light" | "dark"; // For realistic color preview
  saturationMultiplier?: number; // 0 = grayscale, 1 = full saturation
  isAccent?: boolean; // true = accent colors, false = surface colors
  width?: number;
  height?: number;
  style?: any;
}

export function HueSlider({
  value,
  onValueChange,
  onThumbPress,
  colorScheme = "dark",
  saturationMultiplier = 1,
  isAccent = false,
  width,
  height = 40,
  style,
}: HueSliderProps) {
  const [containerWidth, setContainerWidth] = useState(width || 280);
  const effectiveWidth = width || containerWidth;

  const translateX = useSharedValue((value / 360) * (effectiveWidth - height));
  const thumbRadius = height / 2;
  const trackWidth = effectiveWidth - height;

  const updateHue = useCallback(
    (newHue: number) => {
      onValueChange(Math.round(newHue));
    },
    [onValueChange],
  );

  const panGesture = Gesture.Pan()
    .onStart(() => {
      // Optional: Add haptic feedback here if needed
    })
    .onUpdate((event) => {
      const newX = clamp(event.x - thumbRadius, 0, trackWidth);
      translateX.value = newX;

      const newHue = interpolate(newX, [0, trackWidth], [0, 360]);
      runOnJS(updateHue)(newHue);
    })
    .onEnd(() => {
      const finalX =
        (Math.round(interpolate(translateX.value, [0, trackWidth], [0, 360])) /
          360) *
        trackWidth;
      translateX.value = withSpring(finalX);
    });

  const tapGesture = Gesture.Tap().onStart((event) => {
    // Any tap triggers mode switch to color
    if (onThumbPress) {
      runOnJS(onThumbPress)();
    }

    // Tap on track - adjust hue
    const newX = clamp(event.x - thumbRadius, 0, trackWidth);
    translateX.value = withSpring(newX);

    const newHue = interpolate(newX, [0, trackWidth], [0, 360]);
    runOnJS(updateHue)(newHue);
  });

  const composedGesture = Gesture.Simultaneous(panGesture, tapGesture);

  // Update thumb position when value or width changes
  React.useEffect(() => {
    translateX.value = withSpring((value / 360) * trackWidth);
  }, [value, trackWidth, translateX]);

  // Handle dynamic width measurement
  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      if (!width) {
        const { width: measuredWidth } = event.nativeEvent.layout;
        setContainerWidth(measuredWidth);
      }
    },
    [width],
  );

  const thumbStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value - thumbRadius },
        { translateY: -8 },
      ],
    };
  });

  // Generate thumb color based on current hue and settings
  const presets = ColorPresets[colorScheme];
  const thumbColorHSL = isAccent
    ? presets.accentPrimary(value, saturationMultiplier)
    : presets.surfacePrimary(value, saturationMultiplier);
  const thumbColor = toReactNativeColor(thumbColorHSL);

  // Generate realistic gradient colors for track
  const gradientColors = Array.from({ length: 13 }, (_, i) => {
    const hue = (i * 30) % 360; // 0, 30, 60, ..., 360
    const colorHSL = isAccent
      ? presets.accentPrimary(hue, saturationMultiplier)
      : presets.surfacePrimary(hue, saturationMultiplier);
    return toReactNativeColor(colorHSL);
  }) as readonly [string, string, ...string[]];

  return (
    <GestureDetector gesture={composedGesture}>
      <View
        style={[
          {
            width: width,
            height,
            justifyContent: "center",
            flex: width ? 0 : 1,
          },
          style,
        ]}
        onLayout={handleLayout}
      >
        {/* Gradient Track */}
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{
            width: trackWidth,
            height: height * 0.6,
            borderRadius: (height * 0.6) / 2,
            marginLeft: thumbRadius,
          }}
        />

        {/* Thumb - now shows current hue color */}
        <Animated.View
          style={[
            {
              position: "absolute",
              top: 0,
              left: thumbRadius,
              width: height,
              height: height,
              borderRadius: thumbRadius,
              backgroundColor: thumbColor,
              borderWidth: 3,
              borderColor: "rgba(255,255,255,0.8)",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
            },
            thumbStyle,
          ]}
        />
      </View>
    </GestureDetector>
  );
}
