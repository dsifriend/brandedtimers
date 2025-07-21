import React, { memo, useEffect, useRef } from 'react';
import { Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useCustomization } from '../../customization/context/CustomizationContext';
import { useTimer } from '../context/TimerContext';
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

  const { state: timerState } = useTimer();
  const { state: customState } = useCustomization();
  const inputRef = useRef<TextInput>(null);

  const isEditing = editingSegment === segment;
  const isTimerEmpty = timerState.totalMilliseconds === undefined;

  // Focus the input when this segment becomes the editing segment
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  // Calculate display value
  const displayValue = isTimerEmpty
    ? '--'
    : value.toString().padStart(
      segment === 'hours' ? Math.max(2, value.toString().length) : 2,
      '0'
    );

  const digits = displayValue.split('');
  const inputWidth = digitWidth * Math.max(2, (isEditing ? editingValue : displayValue).length);

  return (
    <View
      style={{
        flexDirection: 'row',
        height: fontSize,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Always render TextInput for tab navigation */}
      <TextInput
        ref={inputRef}
        style={{
          position: isEditing ? 'relative' : 'absolute',
          color: isEditing ? customState.colors.text : 'transparent',
          fontFamily: 'Inter_400Regular',
          textAlign: 'center',
          minWidth: 0,
          maxWidth: inputWidth + 8,
          width: isEditing ? inputWidth + 8 : digitWidth * digits.length,
          fontSize,
          textAlignVertical: 'center',
          backgroundColor: isEditing ? 'transparent' : 'transparent',
          borderWidth: 0,
          opacity: isEditing ? 1 : 0,
          pointerEvents: isEditing ? 'auto' : 'none',
          ...(Platform.OS === 'android' && {
            paddingTop: 0,
            paddingBottom: 0,
          }),
        }}
        caretHidden={false}
        value={isEditing ? editingValue : ''}
        placeholder="--"
        placeholderTextColor={customState.colors.textSecondary}
        onChangeText={handleSegmentChange}
        onBlur={handleSegmentSubmit}
        onSubmitEditing={handleSegmentSubmit}
        onFocus={() => {
          if (!isEditing && timerState.status !== 'running') {
            handleSegmentPress(segment);
          }
        }}
        keyboardType="number-pad"
        selectTextOnFocus
        autoFocus={isEditing}
        returnKeyType="done"
        underlineColorAndroid="transparent"
        editable={timerState.status !== 'running'}
      />

      {/* Display text (visible when not editing) */}
      {!isEditing && (
        <TouchableOpacity
          onPress={() => handleSegmentPress(segment)}
          disabled={editingSegment !== null || timerState.status === 'running'}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          {digits.map((digit, index) => (
            <Text
              key={index}
              style={{
                color: customState.colors.text,
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
      )}
    </View>
  );
});
