import React, { memo } from 'react';
import { Text, View } from 'react-native';
import { useCustomization } from '../../customization/context/CustomizationContext';

interface TimeSeparatorProps {
  visible: boolean;
  fontSize: number;
}

export const TimeSeparator = memo(function TimeSeparator({
  visible,
  fontSize
}: TimeSeparatorProps) {
  const { state: customState } = useCustomization();

  return (
    <View
      style={{
        height: fontSize,
        marginHorizontal: 4, // separatorSpacing / 2
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text
        style={{
          color: customState.colors.text, // Colored separators in light mode, white in dark mode
          fontFamily: 'Inter_400Regular',
          includeFontPadding: false,
          textAlign: 'center',
          fontSize,
          opacity: visible ? 1 : 0,
          lineHeight: fontSize,
          transform: [{ translateY: -fontSize * 0.05 }],
        }}
      >
        :
      </Text>
    </View>
  );
});
