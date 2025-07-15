import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  clamp,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

interface HueSliderProps {
  value: number; // 0-360
  onValueChange: (hue: number) => void;
  width?: number;
  height?: number;
}

export function HueSlider({
  value,
  onValueChange,
  width = 280,
  height = 40
}: HueSliderProps) {
  const translateX = useSharedValue((value / 360) * width);
  const thumbRadius = height / 2;
  const trackWidth = width - height; // Account for thumb size

  const updateHue = useCallback((newHue: number) => {
    onValueChange(Math.round(newHue));
  }, [onValueChange]);

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
      // Snap to final position with spring animation
      const finalX = (Math.round(interpolate(translateX.value, [0, trackWidth], [0, 360])) / 360) * trackWidth;
      translateX.value = withSpring(finalX);
    });

  const tapGesture = Gesture.Tap()
    .onStart((event) => {
      const newX = clamp(event.x - thumbRadius, 0, trackWidth);
      translateX.value = withSpring(newX);

      const newHue = interpolate(newX, [0, trackWidth], [0, 360]);
      runOnJS(updateHue)(newHue);
    });

  const composedGesture = Gesture.Simultaneous(panGesture, tapGesture);

  // Update thumb position when value changes externally
  React.useEffect(() => {
    translateX.value = withSpring((value / 360) * trackWidth);
  }, [value, trackWidth, translateX]);

  const thumbStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value - thumbRadius }],
    };
  });

  // Generate hue gradient colors - LinearGradient expects readonly tuple with at least 2 elements
  const gradientColors = [
    'hsl(0, 100%, 50%)',    // Red
    'hsl(30, 100%, 50%)',   // Orange
    'hsl(60, 100%, 50%)',   // Yellow
    'hsl(90, 100%, 50%)',   // Yellow-green
    'hsl(120, 100%, 50%)',  // Green
    'hsl(150, 100%, 50%)',  // Green-cyan
    'hsl(180, 100%, 50%)',  // Cyan
    'hsl(210, 100%, 50%)',  // Cyan-blue
    'hsl(240, 100%, 50%)',  // Blue
    'hsl(270, 100%, 50%)',  // Blue-purple
    'hsl(300, 100%, 50%)',  // Purple
    'hsl(330, 100%, 50%)',  // Purple-red
    'hsl(360, 100%, 50%)',  // Red (complete circle)
  ] as const;

  return (
    <GestureDetector gesture={composedGesture}>
      <View style={{ width, height, justifyContent: 'center' }}>
        {/* Gradient Track */}
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{
            width: trackWidth,
            height: height * 0.6, // Slightly thinner track
            borderRadius: (height * 0.6) / 2,
            marginLeft: thumbRadius,
          }}
        />

        {/* Thumb */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 0,
              left: thumbRadius,
              width: height,
              height: height,
              borderRadius: thumbRadius,
              backgroundColor: 'white',
              borderWidth: 3,
              borderColor: 'rgba(0,0,0,0.15)',
              shadowColor: '#000',
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
