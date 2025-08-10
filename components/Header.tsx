import React from 'react';
import { Image, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCustomization } from './customization/context/CustomizationContext';

export function Header() {
  const { state, getFontFamilyName } = useCustomization();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const fontFamily = getFontFamilyName();

  const { mainHeading, mainHeadingRight, subheading, splitHeading, imageBase64 } = state.header;

  // Don't render if all fields are empty
  if (!mainHeading && !mainHeadingRight && !subheading) {
    return null;
  }

  const image = (
    <Image
      source={{ uri: `data:image/png;base64,${imageBase64}` }}
      style={{
        width: Math.min(width, height) <= 768 ? 48 : 96,
        height: Math.min(width, height) <= 768 ? 48 : 96,
      }}
    />
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
      alignItems: 'center',
    }}>
      {!splitHeading && imageBase64 && image}

      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
      }}>
        {/* Left column */}
        <View style={{
          flex: splitHeading ? 1 : 0,
          alignItems: 'center',
          paddingRight: splitHeading ? 8 : 0,
        }}>
          <Text style={{
            fontSize: 36,
            fontWeight: '600',
            fontFamily,
            color: state.colors.accent,
            textAlign: 'center',
            width: '100%',
          }}>
            {mainHeading}
          </Text>
        </View>

        {/* Center column - only when split */}
        {splitHeading && imageBase64 && (
          <View style={{
            alignItems: 'center',
            paddingHorizontal: 8,
          }}>
            {image}
          </View>
        )}

        {/* Right column - only when split */}
        {splitHeading && mainHeadingRight && (
          <View style={{
            flex: 1,
            alignItems: 'center',
            paddingLeft: 8,
          }}>
            <Text style={{
              fontSize: 36,
              fontWeight: '600',
              fontFamily,
              color: state.colors.accent,
              textAlign: 'center',
              width: '100%',
            }}>
              {mainHeadingRight}
            </Text>
          </View>
        )}
      </View>

      {/* Subheading */}
      {subheading && (
        <Text style={{
          fontSize: 24,
          fontFamily,
          color: state.colors.textSecondary,
          textAlign: 'center',
          marginTop: (mainHeading || imageBase64) ? 8 : 0,
        }}>
          {subheading}
        </Text>
      )}
    </View>
  );
}
