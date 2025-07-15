import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import React, { useCallback, useMemo, useRef } from 'react';
import { Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCustomization } from '../customization/context/CustomizationContext';
import { HueSlider } from './HueSlider';

interface CustomizationPanelProps {
  isVisible: boolean;
  onClose: () => void;
}

export function CustomizationPanel({ isVisible, onClose }: CustomizationPanelProps) {
  const { state, setPrimaryHue, setSecondaryHue, setColorScheme } = useCustomization();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Determine if we should use bottom sheet or sidebar
  const useBottomSheet = width < 768;

  // Bottom sheet setup
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['50%', '75%'], []);

  // Sidebar animation
  const sidebarTranslateX = useSharedValue(useBottomSheet ? 0 : -320);

  React.useEffect(() => {
    if (useBottomSheet) {
      if (isVisible) {
        bottomSheetRef.current?.expand();
      } else {
        bottomSheetRef.current?.close();
      }
    } else {
      sidebarTranslateX.value = withSpring(isVisible ? 0 : -320, {
        damping: 20,
        stiffness: 300,
      });
    }
  }, [isVisible, useBottomSheet, sidebarTranslateX]);

  const sidebarStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: sidebarTranslateX.value }],
    };
  });

  const toggleColorScheme = useCallback(() => {
    setColorScheme(state.colorScheme === 'dark' ? 'light' : 'dark');
  }, [state.colorScheme, setColorScheme]);

  const renderContent = () => (
    <View style={{
      flex: 1,
      padding: 20,
      backgroundColor: state.colors.background,
    }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
      }}>
        <Text style={{
          fontSize: 24,
          fontWeight: '600',
          color: state.colors.text,
        }}>
          Customize
        </Text>
        <TouchableOpacity
          onPress={onClose}
          style={{
            padding: 8,
            borderRadius: 20,
            backgroundColor: state.colors.primary,
          }}
        >
          <Ionicons name="close" size={20} color={state.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Color Scheme Toggle */}
      <View style={{ marginBottom: 30 }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '500',
          color: state.colors.text,
          marginBottom: 12,
        }}>
          Appearance
        </Text>
        <TouchableOpacity
          onPress={toggleColorScheme}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            backgroundColor: state.colors.primary,
            borderRadius: 12,
          }}
        >
          <Ionicons
            name={state.colorScheme === 'dark' ? 'moon' : 'sunny'}
            size={20}
            color={state.colors.text}
            style={{ marginRight: 12 }}
          />
          <Text style={{
            fontSize: 16,
            color: state.colors.text,
            flex: 1,
          }}>
            {state.colorScheme === 'dark' ? 'Dark Mode' : 'Light Mode'}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={state.colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Primary Color */}
      <View style={{ marginBottom: 30 }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '500',
          color: state.colors.text,
          marginBottom: 12,
        }}>
          Primary Color
        </Text>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 16,
        }}>
          <View style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: state.colors.primary,
            marginRight: 16,
            borderWidth: 2,
            borderColor: state.colors.textSecondary,
          }} />
          <Text style={{
            fontSize: 14,
            color: state.colors.textSecondary,
          }}>
            Hue: {state.primaryHue}°
          </Text>
        </View>
        <HueSlider
          value={state.primaryHue}
          onValueChange={setPrimaryHue}
          width={Math.min(280, width - 80)}
        />
      </View>

      {/* Secondary Color */}
      <View style={{ marginBottom: 30 }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '500',
          color: state.colors.text,
          marginBottom: 12,
        }}>
          Accent Color
        </Text>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 16,
        }}>
          <View style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: state.colors.accent,
            marginRight: 16,
            borderWidth: 2,
            borderColor: state.colors.textSecondary,
          }} />
          <Text style={{
            fontSize: 14,
            color: state.colors.textSecondary,
          }}>
            Hue: {state.secondaryHue}°
          </Text>
        </View>
        <HueSlider
          value={state.secondaryHue}
          onValueChange={setSecondaryHue}
          width={Math.min(280, width - 80)}
        />
      </View>
    </View>
  );

  if (useBottomSheet) {
    return (
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={onClose}
        backgroundStyle={{ backgroundColor: state.colors.background }}
        handleIndicatorStyle={{ backgroundColor: state.colors.textSecondary }}
      >
        <BottomSheetView style={{ flex: 1 }}>
          {renderContent()}
        </BottomSheetView>
      </BottomSheet>
    );
  }

  // Sidebar for desktop
  return (
    <>
      {/* Backdrop */}
      {isVisible && (
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 999,
          }}
          onPress={onClose}
          activeOpacity={1}
        />
      )}

      {/* Sidebar */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            width: 320,
            height: height,
            backgroundColor: state.colors.background,
            borderRightWidth: 1,
            borderRightColor: state.colors.primary,
            zIndex: 1000,
            paddingTop: insets.top,
          },
          sidebarStyle,
        ]}
      >
        {renderContent()}
      </Animated.View>
    </>
  );
}
