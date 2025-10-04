import React, { memo } from 'react';
import Animated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { useCustomization } from '../../customization/context/CustomizationContext';

interface FontMetrics {
  fontSize: SharedValue<number>;
  digitWidth: SharedValue<number>;
  isReady: boolean;
}

interface TimeSeparatorProps {
  visible: boolean;
  metrics: FontMetrics;
}

const AnimatedText = Animated.createAnimatedComponent(Animated.Text);

export const TimeSeparator = memo(function TimeSeparator({
  visible,
  metrics
}: TimeSeparatorProps) {
  const { state: customState, getFontFamilyName } = useCustomization();
  const fontFamily = getFontFamilyName();

  const animatedStyle = useAnimatedStyle(() => ({
    fontSize: metrics.fontSize.value,
    transform: [{ translateY: -metrics.fontSize.value * 0.0625 }],
  }));

  return (
    <AnimatedText
      style={[
        {
          color: customState.colors.text,
          verticalAlign: 'middle',
          fontFamily,
          opacity: visible ? 1 : 0,
        },
        animatedStyle,
      ]}
    >
      :
    </AnimatedText>
  );
});
