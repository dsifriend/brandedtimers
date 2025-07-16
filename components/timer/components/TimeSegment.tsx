import React, { memo } from 'react';
import { Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useCustomization } from '../../customization/context/CustomizationContext';
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

  const { state: customState } = useCustomization();

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
          style={{
            color: customState.colors.text, // This will be colored in light mode, white in dark mode
            fontFamily: 'Inter_400Regular',
            textAlign: 'center',
            minWidth: 0,
            maxWidth: inputWidth + 8,
            fontSize,
            textAlignVertical: 'center',
            ...(Platform.OS === 'android' && {
              paddingTop: 0,
              paddingBottom: 0,
            }),
          }}
          caretHidden={false}
          value={editingValue}
          placeholder="00"
          placeholderTextColor={customState.colors.textSecondary}
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
      style={{
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      {digits.map((digit, index) => (
        <Text
          key={index}
          style={{
            color: customState.colors.text, // Colored text in light mode, white in dark mode
            fontFamily: 'Inter_400Regular',
            textAlign: 'center',
            includeFontPadding: false,
            fontSize,
            width: digitWidth,
          }}
        >
          {digit}
        </Text>
      ))}
    </TouchableOpacity>
  );
});
