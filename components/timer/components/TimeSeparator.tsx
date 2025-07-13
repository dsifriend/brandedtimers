import React, { memo } from 'react';
import { Text, View } from 'react-native';
import { timerConfig, timerStyles } from '../../../styles/timer.styles';

interface TimeSeparatorProps {
  visible: boolean;
  fontSize: number;
}

export const TimeSeparator = memo(function TimeSeparator({
  visible,
  fontSize
}: TimeSeparatorProps) {
  return (
    <View
      style={[
        timerStyles.separatorContainer,
        {
          height: fontSize,
          marginHorizontal: timerConfig.spacing.separatorSpacing,
        }
      ]}
    >
      <Text
        style={[
          timerStyles.separator,
          {
            fontSize,
            opacity: visible ? 1 : 0,
            lineHeight: fontSize,
            transform: [{ translateY: -fontSize * 0.05 }],
          }
        ]}
      >
        :
      </Text>
    </View>
  );
});
