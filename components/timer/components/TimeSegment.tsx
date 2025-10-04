import React, { memo, useEffect, useRef } from 'react';
import { Platform, Text, TextInput, TouchableOpacity } from 'react-native';
import Animated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { useCustomization } from '../../customization/context/CustomizationContext';
import { useTimer } from '../context/TimerContext';
import { useSegmentEditing } from '../hooks/useSegmentEditing';

interface FontMetrics {
  fontSize: SharedValue<number>;
  digitWidth: SharedValue<number>;
  isReady: boolean;
}

interface TimeSegmentProps {
  value: number;
  segment: 'hours' | 'minutes' | 'seconds';
  metrics: FontMetrics;
}

const AnimatedText = Animated.createAnimatedComponent(Text);
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export const TimeSegment = memo(function TimeSegment({
  value,
  segment,
  metrics
}: TimeSegmentProps) {
  const {
    editingSegment,
    editingValue,
    handleSegmentPress,
    handleSegmentChange,
    handleSegmentSubmit
  } = useSegmentEditing();

  const { state: timerState } = useTimer();
  const { state: customState, getFontFamilyName } = useCustomization();
  const inputRef = useRef<TextInput>(null);

  const isEditing = editingSegment === segment;
  const isTimerEmpty = timerState.totalMilliseconds === undefined;
  const fontFamily = getFontFamilyName();

  // Focus the input when this segment becomes the editing segment
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  // Calculate display value
  const displayValue = isTimerEmpty
    ? '╌'
    : value.toString().padStart(
      segment === 'hours' ? Math.max(2, value.toString().length) : 2,
      '0'
    );

  const digits = displayValue.split('');

  // Animated styles for text elements
  const animatedTextStyle = useAnimatedStyle(() => ({
    fontSize: metrics.fontSize.value,
    width: metrics.digitWidth.value,
  }));

  const animatedInputStyle = useAnimatedStyle(() => ({
    fontSize: metrics.fontSize.value,
    width: metrics.digitWidth.value * Math.max(2, (isEditing ? editingValue : displayValue).length),
  }));

  const animatedContainerStyle = useAnimatedStyle(() => ({
    width: Math.max(
      metrics.digitWidth.value * digits.length,
      metrics.digitWidth.value * Math.max(2, (isEditing ? editingValue : displayValue).length)
    ),
  }));

  // Common text styles for both input and display
  const baseTextStyle = {
    fontFamily,
    textAlign: 'center' as const,
    textAlignVertical: 'center' as const,
    includeFontPadding: false,
    color: customState.colors.text,
    ...(Platform.OS === 'android' && {
      paddingTop: 0,
      paddingBottom: 0,
    }),
  };

  return (
    <Animated.View style={animatedContainerStyle}>
      {/* TextInput - absolutely positioned */}
      <AnimatedTextInput
        ref={inputRef}
        style={[
          baseTextStyle,
          animatedInputStyle,
          {
            position: 'absolute',
            backgroundColor: 'transparent',
            borderWidth: 0,
            opacity: isEditing ? 1 : 0,
            pointerEvents: isEditing ? 'auto' : 'none',
          }
        ]}
        value={isEditing ? editingValue : ''}
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

      {/* Display text */}
      <TouchableOpacity
        onPress={() => handleSegmentPress(segment)}
        disabled={editingSegment !== null || timerState.status === 'running'}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isEditing ? 0 : 1,
          pointerEvents: isEditing ? 'none' : 'auto',
        }}
      >
        {digits.map((digit, index) => (
          <AnimatedText
            key={index}
            style={[
              baseTextStyle,
              animatedTextStyle,
            ]}
          >
            {digit}
          </AnimatedText>
        ))}
      </TouchableOpacity>
    </Animated.View>
  );
});
