import React from 'react';
import { Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCustomization } from './customization/context/CustomizationContext';

export function Header() {
  const { state, getFontFamilyName } = useCustomization();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const fontFamily = getFontFamilyName();

  const { mainHeading, mainHeadingRight, subheading, splitHeading } = state.header;

  // Don't render if all fields are empty
  if (!mainHeading && !mainHeadingRight && !subheading) {
    return null;
  }

  // Calculate if split heading should stack
  const shouldStack = splitHeading && mainHeadingRight && (
    // Stack if combined text is too long for the screen width
    (mainHeading.length + mainHeadingRight.length) * 12 > width * 0.7
  );

  return (
    <View style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      paddingTop: Math.max(insets.top, 20),
      paddingHorizontal: 20,
      paddingBottom: 16,
      backgroundColor: state.colors.background,
      borderBottomWidth: 2,
      borderBottomColor: state.colors.textSecondary,
      zIndex: 10,
    }}>
      <View style={{
        alignItems: 'center',
      }}>
        {/* Main Heading */}
        {mainHeading && (
          <View style={{
            flexDirection: shouldStack ? 'column' : 'row',
            alignItems: 'center',
            gap: shouldStack ? 8 : 16,
          }}>
            <Text style={{
              fontSize: 24,
              fontWeight: '600',
              fontFamily,
              color: state.colors.accent,
              textAlign: 'center',
            }}>
              {mainHeading}
            </Text>

            {splitHeading && mainHeadingRight && (
              <Text style={{
                fontSize: 24,
                fontWeight: '600',
                fontFamily,
                color: state.colors.accent,
                textAlign: 'center',
              }}>
                {mainHeadingRight}
              </Text>
            )}
          </View>
        )}

        {/* Subheading */}
        {subheading && (
          <Text style={{
            fontSize: 16,
            fontFamily,
            color: state.colors.textSecondary,
            textAlign: 'center',
            marginTop: mainHeading ? 8 : 0,
          }}>
            {subheading}
          </Text>
        )}
      </View>
    </View>
  );
}

// Helper hook to get header height for other components
export function useHeaderHeight() {
  const { state } = useCustomization();
  const insets = useSafeAreaInsets();

  const { mainHeading, mainHeadingRight, subheading } = state.header;
  const hasContent = mainHeading || mainHeadingRight || subheading;

  if (!hasContent) return 0;

  // Base padding
  let height = Math.max(insets.top, 20) + 16; // top + bottom padding

  // Main heading height
  if (mainHeading || mainHeadingRight) {
    height += 32; // Approximate height of 24px font with line height
  }

  // Subheading height
  if (subheading) {
    height += mainHeading ? 8 : 0; // margin
    height += 24; // Approximate height of 16px font with line height
  }

  return height;
}

