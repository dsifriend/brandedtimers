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
  const { isQueueActive, queueLabel } = useQueueHeader();

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

  const image = (
    <Image
      source={{ uri: `${imageBase64}` }}
      style={{
        width: Math.min(width, height) <= 768 ? 48 : 96,
        height: Math.min(width, height) <= 768 ? 48 : 96,
        margin: Math.min(width, height) <= 768 ? 8 : 16,
      }}
    />
  );

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        paddingTop: Math.max(insets.top, 20),
        paddingHorizontal: 20,
        marginBottom: Math.min(width, height) <= 768 ? 16 : 32,
        backgroundColor: state.colors.background,
        alignItems: "center",
      }}
    >
      {!splitHeading && !!imageBase64 ? image : null}
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
            flex: 1,
            alignItems: "center",
            paddingRight: splitHeading ? 8 : 0,
          }}
        >
          <Text
            style={{
              fontSize: 36,
              fontWeight: "600",
              fontFamily,
              color: state.colors.accent,
              textAlign: "center",
              width: "100%",
            }}
          >
            {mainHeading}
          </Text>
        </View>

        {/* Center column - only when split */}
        {!!splitHeading ? (
          <View
            style={{
              alignItems: "center",
              paddingHorizontal: 8,
            }}
          >
            {image}
          </View>
        ) : null}

        {/* Right column - only when split */}
        {!!splitHeading && !!mainHeadingRight ? (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              paddingLeft: 8,
            }}
          >
            <Text
              style={{
                fontSize: 36,
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
        ) : null}
      </View>
      {/* Subheading */}
      {!!subheading ? (
        <Text
          style={{
            fontSize: 24,
            fontFamily,
            color: state.colors.textSecondary,
            textAlign: "center",
            marginTop: mainHeading || imageBase64 ? 8 : 0,
          }}
        >
          {subheading}
        </Text>
      ) : null}
      {/* Queue Label - Third level heading */}
      {isQueueActive && !!queueLabel ? (
        <Text
          style={{
            fontSize: 18,
            fontFamily,
            color: state.colors.accent,
            textAlign: "center",
            marginTop: 6,
            opacity: 0.8,
          }}
        >
          {queueLabel}
        </Text>
      ) : null}
    </View>
  );
}
