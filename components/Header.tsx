import React from "react";
import { Image, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCustomization } from "./customization/context/CustomizationContext";
import { useQueueHeader } from "./queue/hooks/useQueueHeader";

export function Header() {
  const { state, getFontFamilyName } = useCustomization();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const fontFamily = getFontFamilyName();

  // Queue integration
  const { isQueueActive, queueLabel, queueProgress } = useQueueHeader();

  const {
    mainHeading,
    mainHeadingRight,
    subheading,
    splitHeading,
    imageBase64,
  } = state.header;

  // Don't render if all fields are empty (including queue label)
  if (!mainHeading && !mainHeadingRight && !subheading && !queueLabel) {
    return null;
  }

  const imageSize = Math.min(width, height) <= 768 ? 48 : 96;

  const image = imageBase64 ? (
    <Image
      source={{ uri: `data:image/png;base64,${imageBase64}` }}
      style={{
        width: imageSize,
        height: imageSize,
        margin: 16,
        borderRadius: 8,
      }}
    />
  ) : null;

  // Calculate responsive font sizes
  const isSmallScreen = Math.min(width, height) <= 768;
  const mainFontSize = isSmallScreen ? 28 : 36;
  const subFontSize = isSmallScreen ? 18 : 24;
  const queueFontSize = isSmallScreen ? 14 : 18;

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        paddingTop: Math.max(insets.top, 20),
        paddingHorizontal: 20,
        paddingBottom: 16,
        backgroundColor: state.colors.background,
        alignItems: "center",
        zIndex: 10, // Ensure header is above other elements
      }}
    >
      {/* Non-split image */}
      {!splitHeading && imageBase64 && image}

      {/* Main heading row */}
      {(mainHeading || mainHeadingRight || (splitHeading && imageBase64)) && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            width: "100%",
          }}
        >
          {/* Left column */}
          <View
            style={{
              flex: splitHeading ? 1 : 0,
              alignItems: "center",
              paddingRight: splitHeading ? 8 : 0,
            }}
          >
            {mainHeading && (
              <Text
                style={{
                  fontSize: mainFontSize,
                  fontWeight: "600",
                  fontFamily,
                  color: state.colors.accent,
                  textAlign: "center",
                  width: "100%",
                }}
              >
                {mainHeading}
              </Text>
            )}
          </View>

          {/* Center column - only when split */}
          {splitHeading && imageBase64 && (
            <View
              style={{
                alignItems: "center",
                paddingHorizontal: 8,
              }}
            >
              {image}
            </View>
          )}

          {/* Right column - only when split */}
          {splitHeading && mainHeadingRight && (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                paddingLeft: 8,
              }}
            >
              <Text
                style={{
                  fontSize: mainFontSize,
                  fontWeight: "600",
                  fontFamily,
                  color: state.colors.accent,
                  textAlign: "center",
                  width: "100%",
                }}
              >
                {mainHeadingRight}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Subheading */}
      {subheading && (
        <Text
          style={{
            fontSize: subFontSize,
            fontFamily,
            color: state.colors.textSecondary,
            textAlign: "center",
            marginTop: mainHeading || imageBase64 ? 8 : 0,
          }}
        >
          {subheading}
        </Text>
      )}

      {/* Queue Label - Third level heading */}
      {isQueueActive && queueLabel && (
        <Text
          style={{
            fontSize: queueFontSize,
            fontFamily,
            color: state.colors.textSecondary,
            textAlign: "center",
            marginTop: 6,
            opacity: 0.8,
          }}
        >
          {queueLabel}
          {queueProgress && (
            <Text
              style={{
                fontSize: queueFontSize * 0.9,
                opacity: 0.7,
              }}
            >
              {` (${queueProgress.current} of ${queueProgress.total})`}
            </Text>
          )}
        </Text>
      )}
    </View>
  );
}
