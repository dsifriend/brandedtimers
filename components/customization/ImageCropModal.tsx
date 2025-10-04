import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  StyleSheet,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useCustomization } from "./context/CustomizationContext";

interface ImageCropModalProps {
  visible: boolean;
  imageUri: string;
  onCrop: (cropData: {
    originX: number;
    originY: number;
    width: number;
    height: number;
  }) => void;
  onCancel: () => void;
}

export function ImageCropModal({
  visible,
  imageUri,
  onCrop,
  onCancel,
}: ImageCropModalProps) {
  const { state } = useCustomization();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  // Get image dimensions on mount (works for all platforms)
  useEffect(() => {
    if (visible && imageUri) {
      Image.getSize(
        imageUri,
        (width, height) => {
          setImageSize({ width, height });
        },
        (error) => {
          console.error("Failed to get image size:", error);
        },
      );
    }
  }, [visible, imageUri]);

  // Calculate crop frame size with room for buttons and padding
  const availableHeight = screenHeight * 0.8; // Leave 20% for buttons and padding
  const availableWidth = screenWidth * 0.9;
  const maxCropSize = Math.min(availableWidth, availableHeight - 150); // Reserve 150px for header + buttons
  const cropSize = Math.min(screenWidth, screenHeight) * 0.6; // Start smaller
  const finalCropSize = Math.min(cropSize, maxCropSize);

  // Calculate display size - scale image to ensure crop frame fits entirely within it
  // We want the smaller dimension of the image to match finalCropSize
  let displayWidth: number;
  let displayHeight: number;

  if (imageSize.width > 0 && imageSize.height > 0) {
    const imageAspect = imageSize.width / imageSize.height;

    if (imageAspect > 1) {
      // Landscape: height is limiting
      displayHeight = finalCropSize;
      displayWidth = finalCropSize * imageAspect;
    } else {
      // Portrait or square: width is limiting
      displayWidth = finalCropSize;
      displayHeight = finalCropSize / imageAspect;
    }
  } else {
    displayWidth = finalCropSize;
    displayHeight = finalCropSize;
  }

  // Convert to shared values for worklet compatibility
  const displayWidthSV = useSharedValue(displayWidth);
  const displayHeightSV = useSharedValue(displayHeight);
  const cropSizeSV = useSharedValue(finalCropSize);

  // Update shared values when dimensions change
  useEffect(() => {
    displayWidthSV.value = displayWidth;
    displayHeightSV.value = displayHeight;
    cropSizeSV.value = finalCropSize;
  }, [displayWidth, displayHeight, finalCropSize]);

  // Pan gesture values
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate((e) => {
      "worklet";
      // Calculate boundaries inline using shared values
      const maxX = Math.max(0, (displayWidthSV.value - cropSizeSV.value) / 2);
      const maxY = Math.max(0, (displayHeightSV.value - cropSizeSV.value) / 2);

      // Pan moves opposite to gesture direction (image moves, frame stays fixed)
      const newX = startX.value + e.translationX;
      const newY = startY.value + e.translationY;

      translateX.value = Math.max(-maxX, Math.min(maxX, newX));
      translateY.value = Math.max(-maxY, Math.min(maxY, newY));
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  const handleCrop = () => {
    // Calculate the crop area in original image coordinates
    // The crop frame is centered in the display, and we need to account for pan offset
    const scale = imageSize.width / displayWidth;

    // Center point of crop frame in display coordinates
    const cropCenterX = displayWidth / 2;
    const cropCenterY = displayHeight / 2;

    // Actual crop origin in display coordinates (accounting for pan)
    const displayCropX = cropCenterX - finalCropSize / 2 - translateX.value;
    const displayCropY = cropCenterY - finalCropSize / 2 - translateY.value;

    // Convert to original image coordinates
    const originX = displayCropX * scale;
    const originY = displayCropY * scale;
    const cropDimension = finalCropSize * scale;

    onCrop({
      originX: Math.max(0, Math.round(originX)),
      originY: Math.max(0, Math.round(originY)),
      width: Math.round(cropDimension),
      height: Math.round(cropDimension),
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.container,
            { backgroundColor: state.colors.background },
          ]}
        >
          {/* Header */}
          <Text
            style={[
              styles.header,
              {
                color: state.colors.text,
                fontFamily:
                  state.fontFamily === "inter"
                    ? "Inter_400Regular"
                    : "Merriweather_400Regular",
              },
            ]}
          >
            Please crop your image to fit
          </Text>

          {/* Crop Area */}
          <View
            style={[
              styles.cropContainer,
              {
                width: Math.max(displayWidth, finalCropSize),
                height: Math.max(displayHeight, finalCropSize),
              },
            ]}
          >
            {/* Image with pan gesture */}
            <GestureDetector gesture={panGesture}>
              <Animated.View
                style={[
                  animatedStyle,
                  {
                    position: "absolute",
                    top:
                      (Math.max(displayHeight, finalCropSize) - displayHeight) /
                      2,
                    left:
                      (Math.max(displayWidth, finalCropSize) - displayWidth) /
                      2,
                  },
                ]}
              >
                <Image
                  source={{ uri: imageUri }}
                  style={{
                    width: displayWidth,
                    height: displayHeight,
                  }}
                  onError={(e) => {
                    console.error("Image load error:", e.nativeEvent);
                  }}
                />
              </Animated.View>
            </GestureDetector>

            {/* Crop frame border - always centered */}
            <View
              style={[
                styles.cropFrame,
                {
                  width: finalCropSize,
                  height: finalCropSize,
                  borderColor: state.colors.accent,
                  position: "absolute",
                  top:
                    (Math.max(displayHeight, finalCropSize) - finalCropSize) /
                    2,
                  left:
                    (Math.max(displayWidth, finalCropSize) - finalCropSize) / 2,
                },
              ]}
            />

            {/* Dimmed overlays */}
            <View
              style={[
                styles.overlay,
                {
                  top: 0,
                  left: 0,
                  right: 0,
                  height:
                    (Math.max(displayHeight, finalCropSize) - finalCropSize) /
                    2,
                },
              ]}
            />
            <View
              style={[
                styles.overlay,
                {
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height:
                    (Math.max(displayHeight, finalCropSize) - finalCropSize) /
                    2,
                },
              ]}
            />
            <View
              style={[
                styles.overlay,
                {
                  top:
                    (Math.max(displayHeight, finalCropSize) - finalCropSize) /
                    2,
                  left: 0,
                  width:
                    (Math.max(displayWidth, finalCropSize) - finalCropSize) / 2,
                  height: finalCropSize,
                },
              ]}
            />
            <View
              style={[
                styles.overlay,
                {
                  top:
                    (Math.max(displayHeight, finalCropSize) - finalCropSize) /
                    2,
                  right: 0,
                  width:
                    (Math.max(displayWidth, finalCropSize) - finalCropSize) / 2,
                  height: finalCropSize,
                },
              ]}
            />
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: state.colors.primary }]}
              onPress={onCancel}
            >
              <Text
                style={[
                  styles.buttonText,
                  { color: state.colors.textSecondary },
                ]}
              >
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: state.colors.accent }]}
              onPress={handleCrop}
            >
              <Text style={[styles.buttonText, { color: state.colors.text }]}>
                Crop
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    maxWidth: "90%",
    maxHeight: "90%",
  },
  header: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  cropContainer: {
    position: "relative",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    position: "absolute",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    pointerEvents: "none",
  },
  cropFrame: {
    position: "absolute",
    borderWidth: 2,
    pointerEvents: "none",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
