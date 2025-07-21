import React, { memo } from 'react';
import { Text } from 'react-native';
import { useCustomization, } from '../../customization/context/CustomizationContext';

interface TimeSeparatorProps {
  visible: boolean;
  fontSize: number;
}

export const TimeSeparator = memo(function TimeSeparator({
  visible,
  fontSize
}: TimeSeparatorProps) {
  const { state: customState, getFontFamilyName } = useCustomization();
  const fontFamily = getFontFamilyName();

  return (
    <Text
      style={{
        color: customState.colors.text,
        verticalAlign: 'middle',
        fontFamily,
        fontSize,
        opacity: visible ? 1 : 0,
        transform: [{ translateY: -fontSize * 0.0625 }]
      }}
    >
      :
    </Text>
  );
});
