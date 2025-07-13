import React, { memo } from 'react';
import { Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { timerStyles } from '../../../styles/timer.styles';
import { useSegmentEditing } from '../hooks/useSegmentEditing';

interface TimeSegmentProps {
  value: number;
  segment: 'hours' | 'minutes' | 'seconds';
  fontSize: number;
  digitWidth: number;
}

export const TimeSegment = memo(function TimeSegment({
  value,
  segment,
  fontSize,
  digitWidth
}: TimeSegmentProps) {
  const {
    editingSegment,
    editingValue,
    handleSegmentPress,
    handleSegmentChange,
    handleSegmentSubmit
  } = useSegmentEditing();

  const isEditing = editingSegment === segment;

  if (isEditing) {
    const inputWidth = digitWidth * Math.max(2, editingValue.length);

    return (
      <View
        style={{
          flexDirection: 'row',
          height: fontSize,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <TextInput
          style={[
            timerStyles.timeSegmentInput,
            {
              fontSize,
              width: inputWidth,
              height: fontSize,
              lineHeight: fontSize,
              padding: 0,
              margin: 0,
              paddingVertical: 0,
              paddingHorizontal: 4,
              textAlignVertical: 'center',
              ...(Platform.OS === 'android' && {
                paddingTop: 0,
                paddingBottom: 0,
              }),
            }
          ]}
          value={editingValue}
          placeholder="00"
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          onChangeText={handleSegmentChange}
          onBlur={handleSegmentSubmit}
          onSubmitEditing={handleSegmentSubmit}
          keyboardType="number-pad"
          selectTextOnFocus
          autoFocus
          returnKeyType="done"
          underlineColorAndroid="transparent"
        />
      </View>
    );
  }

  const displayValue = value.toString().padStart(
    segment === 'hours' ? Math.max(2, value.toString().length) : 2,
    '0'
  );
  const digits = displayValue.split('');

  return (
    <TouchableOpacity
      onPress={() => handleSegmentPress(segment)}
      disabled={editingSegment !== null}
      style={{ flexDirection: 'row' }}
    >
      {digits.map((digit, index) => (
        <Text
          key={index}
          style={[
            timerStyles.timeSegment,
            {
              fontSize,
              width: digitWidth,
              lineHeight: fontSize,
            }
          ]}
        >
          {digit}
        </Text>
      ))}
    </TouchableOpacity>
  );
});
