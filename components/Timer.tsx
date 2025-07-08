import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { timerConfig, timerStyles } from '../styles/timer.styles';

type TimerStatus = 'stopped' | 'running' | 'paused';
type EditingSegment = 'hours' | 'minutes' | 'seconds' | null;

interface TimeSegments {
  hours: number;
  minutes: number;
  seconds: number;
}

interface FontMetrics {
  digitWidth: number;
  isReady: boolean;
}

export default function Timer() {
  const [totalMilliseconds, setTotalMilliseconds] = useState(0);
  const [status, setStatus] = useState<TimerStatus>('stopped');
  const [editingSegment, setEditingSegment] = useState<EditingSegment>(null);
  const [editingValue, setEditingValue] = useState('');
  const [fontSize, setFontSize] = useState(48);
  const [currentTime, setCurrentTime] = useState(0);
  const [originalDuration, setOriginalDuration] = useState(0);
  const [fontMetrics, setFontMetrics] = useState<FontMetrics>({ digitWidth: 0, isReady: false });

  const startTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);
  const initialDurationRef = useRef<number>(0);
  const fontMetricsCache = useRef<Record<string, number>>({});
  const currentFontRef = useRef<string>(timerConfig.fonts.primary);

  // Font Measurement System
  const measureFontWidth = useCallback((fontFamily: string, fontSize: number) => {
    return new Promise<number>((resolve) => {
      const cacheKey = `${fontFamily}-${fontSize}`;

      // Check cache first
      if (fontMetricsCache.current[cacheKey]) {
        resolve(fontMetricsCache.current[cacheKey]);
        return;
      }

      // Test characters: mix of narrow (1), wide (0, 8), and control (W)
      const testChars = ['0', '1', '8', 'W'];
      let maxWidth = 0;
      let measured = 0;

      const handleLayout = (width: number) => {
        maxWidth = Math.max(maxWidth, width);
        measured++;

        if (measured === testChars.length) {
          // Add small buffer for safety and cache result
          const finalWidth = maxWidth * 1.1;
          fontMetricsCache.current[cacheKey] = finalWidth;
          resolve(finalWidth);
        }
      };

      // This will trigger measurements via the hidden measurement component
      setMeasurementRequest({ fontFamily, fontSize, testChars, onMeasured: handleLayout });
    });
  }, []);

  const [measurementRequest, setMeasurementRequest] = useState<{
    fontFamily: string;
    fontSize: number;
    testChars: string[];
    onMeasured: (width: number) => void;
  } | null>(null);

  // Update font metrics when font or size changes
  useEffect(() => {
    const currentFont = timerConfig.fonts.primary;

    if (fontSize > 0 && (currentFont !== currentFontRef.current || !fontMetrics.isReady)) {
      currentFontRef.current = currentFont;
      setFontMetrics({ digitWidth: 0, isReady: false });

      measureFontWidth(currentFont, fontSize).then((digitWidth) => {
        setFontMetrics({ digitWidth, isReady: true });
      });
    }
  }, [fontSize, measureFontWidth]);

  // Utility Functions
  const millisecondsToSegments = useCallback((ms: number): TimeSegments => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return { hours, minutes, seconds };
  }, []);

  const segmentsToMilliseconds = useCallback((segments: TimeSegments): number => {
    return (segments.hours * 3600 + segments.minutes * 60 + segments.seconds) * 1000;
  }, []);

  const getSeparatorVisibility = useCallback(() => {
    if (status !== 'running') return true;

    const cyclePosition = currentTime % timerConfig.timing.blinkCycle;
    return cyclePosition < timerConfig.timing.blinkCycle / 2;
  }, [status, currentTime]);

  // Font Size Calculation
  const calculateFontSize = useCallback(() => {
    const { width, height } = Dimensions.get('window');
    const availableWidth = width - timerConfig.spacing.containerPadding * 2;
    const availableHeight = height * 0.4;

    // Account for separators and spacing in width calculation
    const currentSegments = millisecondsToSegments(totalMilliseconds);
    const hasHours = currentSegments.hours > 0 || editingSegment === 'hours';
    const charCount = hasHours ? 8 : 5; // "HH:MM:SS" or "MM:SS"
    const separatorCount = hasHours ? 2 : 1;
    const separatorWidth = timerConfig.spacing.separatorSpacing * 2 * separatorCount;

    // Use measured font width if available, otherwise use fallback
    const digitWidth = fontMetrics.isReady ? fontMetrics.digitWidth : fontSize * 0.7;
    const availableForText = availableWidth - separatorWidth;

    // Calculate maximum font size that fits both width and height
    const maxFontSizeByWidth = Math.floor((availableForText / charCount) * (fontSize / digitWidth));
    const maxFontSizeByHeight = Math.floor(availableHeight * 0.8);

    const newFontSize = Math.min(maxFontSizeByWidth, maxFontSizeByHeight);
    setFontSize(Math.max(24, newFontSize));
  }, [totalMilliseconds, editingSegment, millisecondsToSegments, fontMetrics]);

  // Timer Control Functions
  const handleStartPause = useCallback(() => {
    if (status === 'stopped') {
      if (totalMilliseconds > 0) {
        setOriginalDuration(totalMilliseconds);
        startTimeRef.current = performance.now();
        initialDurationRef.current = totalMilliseconds;
        setStatus('running');
      }
    } else if (status === 'running') {
      setStatus('paused');
    } else if (status === 'paused') {
      startTimeRef.current = performance.now();
      initialDurationRef.current = totalMilliseconds;
      setStatus('running');
    }
  }, [status, totalMilliseconds]);

  const handleStopReset = useCallback(() => {
    if (status === 'running') {
      // Stop: restore original duration and go to stopped state
      setTotalMilliseconds(originalDuration);
      setStatus('stopped');
    } else {
      // Reset: zero out everything
      setTotalMilliseconds(0);
      setOriginalDuration(0);
      setStatus('stopped');
    }
  }, [status, originalDuration]);

  // Segment Editing Functions
  const handleSegmentPress = useCallback((segment: 'hours' | 'minutes' | 'seconds') => {
    if (status === 'running') return;

    const currentSegments = millisecondsToSegments(totalMilliseconds);
    const currentValue = currentSegments[segment];

    setEditingSegment(segment);
    setEditingValue(currentValue.toString());
  }, [status, totalMilliseconds, millisecondsToSegments]);

  const handleSegmentChange = useCallback((value: string) => {
    const cleanValue = value.replace(/[^0-9]/g, '');
    setEditingValue(cleanValue);
  }, []);

  const handleSegmentSubmit = useCallback(() => {
    if (editingSegment === null) return;

    const numValue = parseInt(editingValue || '0', 10);
    const currentSegments = millisecondsToSegments(totalMilliseconds);

    const newSegments = {
      ...currentSegments,
      [editingSegment]: numValue,
    };

    setTotalMilliseconds(segmentsToMilliseconds(newSegments));
    setEditingSegment(null);
    setEditingValue('');
    Keyboard.dismiss();
  }, [editingSegment, editingValue, totalMilliseconds, millisecondsToSegments, segmentsToMilliseconds]);

  const handleSegmentBlur = useCallback(() => {
    handleSegmentSubmit();
  }, [handleSegmentSubmit]);

  // Icon Helper Functions
  const getStartPauseIcon = useCallback(() => {
    if (status === 'stopped' || status === 'paused') {
      return 'play';
    }
    return 'pause';
  }, [status]);

  const getStopResetIcon = useCallback(() => {
    if (status === 'running') {
      return 'stop';
    }
    return 'close';
  }, [status]);

  // Individual Digit Rendering
  const renderDigit = useCallback((digit: string, index: number, isEditing: boolean = false) => {
    const digitWidth = fontMetrics.isReady ? fontMetrics.digitWidth : fontSize * 0.7;

    return (
      <Text
        key={index}
        style={[
          isEditing ? timerStyles.timeSegmentInput : timerStyles.timeSegment,
          {
            fontSize,
            width: digitWidth,
            lineHeight: fontSize,
            textAlign: 'center',
          }
        ]}
      >
        {digit}
      </Text>
    );
  }, [fontSize, fontMetrics]);

  // Render Helper Functions
  const renderTimeSegment = useCallback((
    value: number,
    segment: 'hours' | 'minutes' | 'seconds',
    showAlways: boolean = false
  ) => {
    const isEditing = editingSegment === segment;

    if (!showAlways && segment === 'hours' && value === 0 && !isEditing) {
      return null;
    }

    if (isEditing) {
      const digitWidth = fontMetrics.isReady ? fontMetrics.digitWidth : fontSize * 0.7;
      const inputWidth = digitWidth * Math.max(2, editingValue.length);

      return (
        <TextInput
          key={`${segment}-input`}
          style={[
            timerStyles.timeSegmentInput,
            {
              fontSize,
              width: inputWidth,
              lineHeight: fontSize,
              textAlign: 'center',
            }
          ]}
          value={editingValue}
          placeholder="00"
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          onChangeText={handleSegmentChange}
          onBlur={handleSegmentBlur}
          onSubmitEditing={handleSegmentSubmit}
          keyboardType="number-pad"
          selectTextOnFocus
          autoFocus
          returnKeyType="done"
        />
      );
    }

    // Convert value to individual digits
    const displayValue = value.toString().padStart(segment === 'hours' ? Math.max(2, value.toString().length) : 2, '0');
    const digits = displayValue.split('');

    return (
      <TouchableOpacity
        key={`${segment}-display`}
        onPress={() => handleSegmentPress(segment)}
        disabled={status === 'running'}
        style={{ flexDirection: 'row' }}
      >
        {digits.map((digit, index) => renderDigit(digit, index))}
      </TouchableOpacity>
    );
  }, [editingSegment, editingValue, fontSize, fontMetrics, status, handleSegmentPress, handleSegmentChange, handleSegmentBlur, handleSegmentSubmit, renderDigit]);

  const renderSeparator = useCallback((key: string, visible: boolean) => (
    <View
      key={key}
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
  ), [fontSize]);

  const renderControls = useCallback(() => {
    const canStart = status === 'stopped' && totalMilliseconds > 0;
    const canPause = status === 'running';
    const canResume = status === 'paused';
    const canStopReset = status !== 'stopped' || totalMilliseconds > 0;

    return (
      <View style={timerStyles.controlsContainer}>
        <TouchableOpacity
          style={[
            timerStyles.controlButton,
            canStopReset && timerStyles.controlButtonActive,
          ]}
          onPress={handleStopReset}
          disabled={!canStopReset}
        >
          <Ionicons
            name={getStopResetIcon()}
            size={32}
            color={timerConfig.colors.text}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            timerStyles.controlButton,
            (canStart || canPause || canResume) && timerStyles.controlButtonActive,
          ]}
          onPress={handleStartPause}
          disabled={!canStart && !canPause && !canResume}
        >
          <Ionicons
            name={getStartPauseIcon()}
            size={32}
            color={timerConfig.colors.text}
          />
        </TouchableOpacity>
      </View>
    );
  }, [status, totalMilliseconds, handleStartPause, handleStopReset, getStartPauseIcon, getStopResetIcon]);

  // Hidden measurement component
  const renderMeasurementComponent = () => {
    if (!measurementRequest) return null;

    return (
      <View style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}>
        {measurementRequest.testChars.map((char, index) => (
          <Text
            key={`measure-${char}-${index}`}
            style={{
              fontFamily: measurementRequest.fontFamily,
              fontSize: measurementRequest.fontSize,
              includeFontPadding: false,
            }}
            onTextLayout={(event) => {
              const width = event.nativeEvent.lines[0]?.width || 0;
              measurementRequest.onMeasured(width);
            }}
          >
            {char}
          </Text>
        ))}
      </View>
    );
  };

  // Effects
  useEffect(() => {
    calculateFontSize();

    const subscription = Dimensions.addEventListener('change', () => {
      calculateFontSize();
    });

    return () => subscription?.remove();
  }, [calculateFontSize]);

  useEffect(() => {
    if (status === 'running') {
      const updateTimer = () => {
        const now = performance.now();
        const elapsed = now - startTimeRef.current;
        const remaining = Math.max(0, initialDurationRef.current - elapsed);

        setTotalMilliseconds(remaining);
        setCurrentTime(now);

        if (remaining <= 0) {
          setStatus('stopped');
          setTotalMilliseconds(0);
        } else {
          animationFrameRef.current = requestAnimationFrame(updateTimer);
        }
      };

      animationFrameRef.current = requestAnimationFrame(updateTimer);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [status]);

  // Render
  const currentSegments = millisecondsToSegments(totalMilliseconds);
  const separatorVisible = getSeparatorVisibility();

  return (
    <View style={timerStyles.container}>
      {renderMeasurementComponent()}

      <View style={timerStyles.timerContainer}>
        <View style={timerStyles.timeDisplay}>
          {currentSegments.hours > 0 && (
            <>
              {renderTimeSegment(currentSegments.hours, 'hours', true)}
              {renderSeparator('hours-sep', separatorVisible)}
            </>
          )}
          {renderTimeSegment(currentSegments.minutes, 'minutes', true)}
          {renderSeparator('minutes-sep', separatorVisible)}
          {renderTimeSegment(currentSegments.seconds, 'seconds', true)}
        </View>

        {renderControls()}
      </View>
    </View>
  );
}
