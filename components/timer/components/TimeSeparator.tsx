import React, { memo } from 'react';
import { Text } from 'react-native';
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
    <Text
      style={{
        color: customState.colors.text,
        verticalAlign: 'middle',
        fontFamily: 'Inter_400Regular',
        fontSize,
        opacity: visible ? 1 : 0,
      }}
    >
      ∶
    </Text>
  );
});
