import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import React, { useCallback, useMemo, useRef } from 'react';
import { ScrollView, Switch, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontFamily, useCustomization } from './context/CustomizationContext';
import { HueSlider } from './HueSlider';

interface CustomizationPanelProps {
  isVisible: boolean;
  onClose: () => void;
}

// Custom Segmented Control for Font Selection
function FontFamilySelector({
  selectedFont,
  onFontChange,
  colors
}: {
  selectedFont: FontFamily;
  onFontChange: (font: FontFamily) => void;
  colors: any;
}) {
  return (
    <View style={{
      flexDirection: 'row',
      backgroundColor: colors.primary,
      borderRadius: 8,
      padding: 4,
    }}>
      <TouchableOpacity
        style={{
          flex: 1,
          alignItems: 'center',
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: 6,
          backgroundColor: selectedFont === 'inter' ? colors.accent : 'transparent',
        }}
        onPress={() => onFontChange('inter')}
      >
        <Text style={{
          fontFamily: 'Inter_400Regular',
          fontSize: 18,
          fontWeight: '600',
          color: selectedFont === 'inter'
            ? (colors.text)
            : colors.textSecondary,
          marginBottom: 4,
        }}>
          12
        </Text>
        <Text style={{
          fontSize: 12,
          color: selectedFont === 'inter'
            ? colors.text
            : colors.textSecondary,
          fontFamily: 'Inter_400Regular',
        }}>
          Sans
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          flex: 1,
          alignItems: 'center',
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: 6,
          backgroundColor: selectedFont === 'merriweather' ? colors.accent : 'transparent',
        }}
        onPress={() => onFontChange('merriweather')}
      >
        <Text style={{
          fontFamily: 'Merriweather_400Regular',
          fontSize: 18,
          fontWeight: '600',
          color: selectedFont === 'merriweather'
            ? colors.text
            : colors.textSecondary,
          marginBottom: 4,
        }}>
          12
        </Text>
        <Text style={{
          fontSize: 12,
          color: selectedFont === 'merriweather'
            ? colors.text
            : colors.textSecondary,
          fontFamily: 'Inter_400Regular',
        }}>
          Serif
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export function CustomizationPanel({ isVisible, onClose }: CustomizationPanelProps) {
  const {
    state,
    setPrimaryHue,
    setSecondaryHue,
    setColorScheme,
    setFontFamily,
    setHeaderMain,
    setHeaderMainRight,
    setHeaderSub,
    toggleSplitHeading
  } = useCustomization();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Determine if we should use bottom sheet or sidebar
  const useBottomSheet = width < 768;

  // Bottom sheet setup
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['25%', '90%'], []); // Increased for more content

  // Sidebar animation - initialize properly based on layout
  const sidebarTranslateX = useSharedValue(useBottomSheet ? 0 : -320);

  // Initialize proper state on mount
  React.useEffect(() => {
    if (useBottomSheet) {
      // Force close bottom sheet on mount if not visible
      if (!isVisible && bottomSheetRef.current) {
        bottomSheetRef.current.close();
      }
    } else {
      // Ensure sidebar starts in correct position
      sidebarTranslateX.value = isVisible ? 0 : -320;
    }
  }, []); // Run once on mount

  // Handle visibility changes
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

  // Update sidebar position when layout changes
  React.useEffect(() => {
    if (!useBottomSheet) {
      // Reset sidebar position when switching to desktop mode
      sidebarTranslateX.value = isVisible ? 0 : -320;
    }
  }, [useBottomSheet, isVisible, sidebarTranslateX]);

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
      marginLeft: useBottomSheet ? 0 : insets.left,
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
          fontFamily: state.fontFamily === 'inter' ? 'Inter_400Regular' : 'Merriweather_400Regular',
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

      {/* Header Text Section */}
      <View style={{ marginBottom: 30 }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '500',
          color: state.colors.text,
          marginBottom: 12,
          fontFamily: state.fontFamily === 'inter' ? 'Inter_400Regular' : 'Merriweather_400Regular',
        }}>
          Header Text
        </Text>

        {/* Main Heading */}
        <TextInput
          value={state.header.mainHeading}
          onChangeText={setHeaderMain}
          placeholder="Main heading"
          placeholderTextColor={state.colors.textSecondary}
          style={{
            backgroundColor: state.colors.primary,
            borderRadius: 12,
            padding: 16,
            fontSize: 16,
            color: state.colors.text,
            fontFamily: state.fontFamily === 'inter' ? 'Inter_400Regular' : 'Merriweather_400Regular',
            marginBottom: 12,
          }}
        />

        {/* Split Heading Toggle */}
        <TouchableOpacity
          onPress={toggleSplitHeading}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: state.colors.primary,
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
          }}
        >
          <Text style={{
            fontSize: 16,
            color: state.colors.text,
            fontFamily: state.fontFamily === 'inter' ? 'Inter_400Regular' : 'Merriweather_400Regular',
          }}>
            Split Heading
          </Text>
          <Switch
            value={state.header.splitHeading}
            onValueChange={toggleSplitHeading}
            trackColor={{ false: state.colors.textSecondary, true: state.colors.accent }}
            thumbColor={state.colors.background}
          />
        </TouchableOpacity>

        {/* Right Half of Main Heading (conditional) */}
        {state.header.splitHeading && (
          <TextInput
            value={state.header.mainHeadingRight}
            onChangeText={setHeaderMainRight}
            placeholder="Main heading (right)"
            placeholderTextColor={state.colors.textSecondary}
            style={{
              backgroundColor: state.colors.primary,
              borderRadius: 12,
              padding: 16,
              fontSize: 16,
              color: state.colors.text,
              fontFamily: state.fontFamily === 'inter' ? 'Inter_400Regular' : 'Merriweather_400Regular',
              marginBottom: 12,
            }}
          />
        )}

        {/* Subheading */}
        <TextInput
          value={state.header.subheading}
          onChangeText={setHeaderSub}
          placeholder="Subheading"
          placeholderTextColor={state.colors.textSecondary}
          style={{
            backgroundColor: state.colors.primary,
            borderRadius: 12,
            padding: 16,
            fontSize: 16,
            color: state.colors.text,
            fontFamily: state.fontFamily === 'inter' ? 'Inter_400Regular' : 'Merriweather_400Regular',
          }}
        />
      </View>

      {/* Color Scheme Toggle */}
      <View style={{ marginBottom: 30 }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '500',
          color: state.colors.text,
          marginBottom: 12,
          fontFamily: state.fontFamily === 'inter' ? 'Inter_400Regular' : 'Merriweather_400Regular',
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
            fontFamily: state.fontFamily === 'inter' ? 'Inter_400Regular' : 'Merriweather_400Regular',
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

      {/* Font Family Selection */}
      <View style={{ marginBottom: 30 }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '500',
          color: state.colors.text,
          marginBottom: 12,
          fontFamily: state.fontFamily === 'inter' ? 'Inter_400Regular' : 'Merriweather_400Regular',
        }}>
          Font Family
        </Text>
        <FontFamilySelector
          selectedFont={state.fontFamily}
          onFontChange={setFontFamily}
          colors={state.colors}
        />
      </View>

      {/* Primary Color */}
      <View style={{ marginBottom: 30 }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '500',
          color: state.colors.text,
          marginBottom: 12,
          fontFamily: state.fontFamily === 'inter' ? 'Inter_400Regular' : 'Merriweather_400Regular',
        }}>
          Primary Color
        </Text>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 16,
        }}>
          <View style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: state.colors.primary,
            borderWidth: 2,
            borderColor: state.colors.textSecondary,
          }} />
          <HueSlider
            value={state.primaryHue}
            onValueChange={setPrimaryHue}
            style={{ flex: 1 }}
          />
        </View>
      </View>

      {/* Secondary Color */}
      <View style={{ marginBottom: 30 }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '500',
          color: state.colors.text,
          marginBottom: 12,
          fontFamily: state.fontFamily === 'inter' ? 'Inter_400Regular' : 'Merriweather_400Regular',
        }}>
          Accent Color
        </Text>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 16,
        }}>
          <View style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: state.colors.accent,
            borderWidth: 2,
            borderColor: state.colors.textSecondary,
          }} />
          <HueSlider
            value={state.secondaryHue}
            onValueChange={setSecondaryHue}
            style={{ flex: 1 }}
          />
        </View>
      </View>
    </View>
  );

  if (useBottomSheet) {
    return (
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        index={-1} // Start closed
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
        <ScrollView>
          {renderContent()}
        </ScrollView>
      </Animated.View>
    </>
  );
}
