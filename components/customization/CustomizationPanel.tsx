import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import React, { useState, useCallback, useMemo, useRef } from "react";
import {
  Alert,
  Image,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FontFamily, useCustomization } from "./context/CustomizationContext";
import { HueSlider } from "./HueSlider";
import { ImageCropModal } from "./ImageCropModal";
import { TemplateSelector } from "./TemplateSelector";

interface CustomizationPanelProps {
  isVisible: boolean;
  onClose: () => void;
}

// Custom Segmented Control for Font Selection
function FontFamilySelector({
  selectedFont,
  onFontChange,
  colors,
}: {
  selectedFont: FontFamily;
  onFontChange: (font: FontFamily) => void;
  colors: any;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: colors.primary,
        borderRadius: 8,
        padding: 4,
      }}
    >
      <TouchableOpacity
        style={{
          flex: 1,
          alignItems: "center",
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: 6,
          backgroundColor:
            selectedFont === "inter" ? colors.accent : "transparent",
        }}
        onPress={() => onFontChange("inter")}
      >
        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 18,
            fontWeight: "600",
            color:
              selectedFont === "inter" ? colors.text : colors.textSecondary,
            marginBottom: 4,
          }}
        >
          12
        </Text>
        <Text
          style={{
            fontSize: 12,
            color:
              selectedFont === "inter" ? colors.text : colors.textSecondary,
            fontFamily: "Inter_400Regular",
          }}
        >
          Sans
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          flex: 1,
          alignItems: "center",
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: 6,
          backgroundColor:
            selectedFont === "merriweather" ? colors.accent : "transparent",
        }}
        onPress={() => onFontChange("merriweather")}
      >
        <Text
          style={{
            fontFamily: "Merriweather_400Regular",
            fontSize: 18,
            fontWeight: "600",
            color:
              selectedFont === "merriweather"
                ? colors.text
                : colors.textSecondary,
            marginBottom: 4,
          }}
        >
          12
        </Text>
        <Text
          style={{
            fontSize: 12,
            color:
              selectedFont === "merriweather"
                ? colors.text
                : colors.textSecondary,
            fontFamily: "Inter_400Regular",
          }}
        >
          Serif
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export function CustomizationPanel({
  isVisible,
  onClose,
}: CustomizationPanelProps) {
  const {
    state,
    setPrimaryHue,
    setSecondaryHue,
    setColorScheme,
    setFontFamily,
    setBWPrimary,
    setBWSecondary,
    setHeaderMain,
    setHeaderMainRight,
    setHeaderSub,
    setHeaderImage,
    toggleSplitHeading,
  } = useCustomization();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [cropModalVisible, setCropModalVisible] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);

  // Determine if we should use bottom sheet or sidebar
  const useBottomSheet = width < 768;

  // Bottom sheet setup
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["25%", "85%"], []);

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
  }); // Run once on mount

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
    setColorScheme(state.colorScheme === "dark" ? "light" : "dark");
  }, [state.colorScheme, setColorScheme]);

  const handlePickImage = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];

        // Check if image is nearly square (within 1/32 threshold)
        const aspectRatio = asset.width / asset.height;
        const isNearlySquare = Math.abs(aspectRatio - 1) < 1 / 32;

        if (isNearlySquare) {
          // Image is close enough to square, process directly
          const manipulated = await ImageManipulator.manipulateAsync(
            asset.uri,
            [{ resize: { width: 256, height: 256 } }],
            {
              compress: 0.8,
              format: ImageManipulator.SaveFormat.PNG,
              base64: true,
            },
          );
          // Add data URI prefix to match template format
          const dataUri = manipulated.base64
            ? `data:image/png;base64,${manipulated.base64}`
            : null;
          setHeaderImage(dataUri);
        } else {
          // Image needs cropping - show crop modal
          setSelectedImageUri(asset.uri);
          setCropModalVisible(true);
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
  }, [setHeaderImage]);

  // Crop handlers
  const handleCropComplete = useCallback(
    async (cropData: {
      originX: number;
      originY: number;
      width: number;
      height: number;
    }) => {
      if (!selectedImageUri) return;

      try {
        // First crop to square
        const cropped = await ImageManipulator.manipulateAsync(
          selectedImageUri,
          [{ crop: cropData }],
          { compress: 1, format: ImageManipulator.SaveFormat.PNG },
        );

        // Then resize to 256x256 and get base64
        const manipulated = await ImageManipulator.manipulateAsync(
          cropped.uri,
          [{ resize: { width: 256, height: 256 } }],
          {
            compress: 0.8,
            format: ImageManipulator.SaveFormat.PNG,
            base64: true,
          },
        );

        // Add data URI prefix to match template format
        const dataUri = manipulated.base64 ? `${manipulated.base64}` : null;
        setHeaderImage(dataUri);
        setCropModalVisible(false);
        setSelectedImageUri(null);
      } catch (error) {
        Alert.alert("Error", "Failed to crop image");
        setCropModalVisible(false);
      }
    },
    [selectedImageUri, setHeaderImage],
  );

  const handleCropCancel = useCallback(() => {
    setCropModalVisible(false);
    setSelectedImageUri(null);
  }, []);

  const handleRemoveImage = useCallback(() => {
    setHeaderImage(null);
    setHeaderMainRight("");
    toggleSplitHeading(false);
  }, [setHeaderImage, setHeaderMainRight, toggleSplitHeading]);

  const renderContent = () => (
    <View
      style={{
        flex: 1,
        padding: 20,
        marginLeft: useBottomSheet ? 0 : insets.left,
        backgroundColor: state.colors.background,
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 30,
        }}
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: "600",
            color: state.colors.text,
            fontFamily:
              state.fontFamily === "inter"
                ? "Inter_400Regular"
                : "Merriweather_400Regular",
          }}
        >
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
        <Text
          style={{
            fontSize: 16,
            fontWeight: "500",
            color: state.colors.text,
            marginBottom: 12,
            fontFamily:
              state.fontFamily === "inter"
                ? "Inter_400Regular"
                : "Merriweather_400Regular",
          }}
        >
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
            fontFamily:
              state.fontFamily === "inter"
                ? "Inter_400Regular"
                : "Merriweather_400Regular",
            marginBottom: 4,
          }}
        />

        {/* Split Heading Toggle, only available if image present */}
        {state.header.imageBase64 && (
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: state.colors.primary,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 8,
              marginBottom: state.header.splitHeading ? 4 : 12,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                color: state.colors.text,
                fontFamily:
                  state.fontFamily === "inter"
                    ? "Inter_400Regular"
                    : "Merriweather_400Regular",
              }}
            >
              Split Heading
            </Text>
            <Switch
              value={state.header.splitHeading}
              onValueChange={toggleSplitHeading}
              trackColor={{
                false: state.colors.background,
                true: state.colors.background,
              }}
              thumbColor={state.colors.text}
              //@ts-expect-error type
              activeThumbColor={state.colors.text}
            />
          </TouchableOpacity>
        )}

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
              fontFamily:
                state.fontFamily === "inter"
                  ? "Inter_400Regular"
                  : "Merriweather_400Regular",
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
            fontFamily:
              state.fontFamily === "inter"
                ? "Inter_400Regular"
                : "Merriweather_400Regular",
            marginBottom: 12,
          }}
        />

        {/* Image Picker */}
        <View style={{ marginBottom: 12 }}>
          {state.header.imageBase64 ? (
            <View
              style={{
                backgroundColor: state.colors.primary,
                borderRadius: 12,
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-around",
              }}
            >
              <Image
                source={{
                  uri: `${state.header.imageBase64}`,
                }}
                style={{
                  width: 128,
                  height: 128,
                  borderRadius: 4,
                }}
              />
              <TouchableOpacity
                onPress={handleRemoveImage}
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: state.colors.accent,
                  borderRadius: 50,
                  padding: 8,
                }}
              >
                <Ionicons name="close" size={24} color={state.colors.text} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handlePickImage}
              style={{
                backgroundColor: state.colors.primary,
                borderRadius: 12,
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                name="image-outline"
                size={20}
                color={state.colors.text}
                style={{ marginRight: 8 }}
              />
              <Text
                style={{
                  color: state.colors.text,
                  fontSize: 16,
                  fontFamily:
                    state.fontFamily === "inter"
                      ? "Inter_400Regular"
                      : "Merriweather_400Regular",
                }}
              >
                Add Logo
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Color Scheme Toggle */}
      <View style={{ marginBottom: 30 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "500",
            color: state.colors.text,
            marginBottom: 12,
            fontFamily:
              state.fontFamily === "inter"
                ? "Inter_400Regular"
                : "Merriweather_400Regular",
          }}
        >
          Background / Screen Type
        </Text>
        <TouchableOpacity
          onPress={toggleColorScheme}
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 16,
            backgroundColor: state.colors.primary,
            borderRadius: 12,
          }}
        >
          <Ionicons
            name="bulb-outline"
            size={20}
            color={state.colors.text}
            style={{ marginRight: 12 }}
          />
          <Text
            style={{
              fontSize: 16,
              color: state.colors.text,
              flex: 1,
              fontFamily:
                state.fontFamily === "inter"
                  ? "Inter_400Regular"
                  : "Merriweather_400Regular",
            }}
          >
            {state.colorScheme === "dark"
              ? "Dark / Backlit"
              : "Light / Projector"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Font Family Selection */}
      <View style={{ marginBottom: 30 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "500",
            color: state.colors.text,
            marginBottom: 12,
            fontFamily:
              state.fontFamily === "inter"
                ? "Inter_400Regular"
                : "Merriweather_400Regular",
          }}
        >
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
        <Text
          style={{
            fontSize: 16,
            fontWeight: "500",
            color: state.colors.text,
            marginBottom: 12,
            fontFamily:
              state.fontFamily === "inter"
                ? "Inter_400Regular"
                : "Merriweather_400Regular",
          }}
        >
          Primary Color
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
          }}
        >
          {/* B&W Circle */}
          <TouchableOpacity
            onPress={() => setBWPrimary(true)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: state.colorScheme === "dark" ? "#000" : "#fff",
              borderWidth: 2,
              borderColor: state.useBWPrimary
                ? state.colors.text
                : state.colors.textSecondary,
            }}
          />

          {/* Hue Slider with interactive thumb */}
          <View style={{ flex: 1, opacity: state.useBWPrimary ? 0.3 : 1 }}>
            <HueSlider
              value={state.primaryHue}
              onValueChange={setPrimaryHue}
              onThumbPress={() => setBWPrimary(false)}
              colorScheme={state.colorScheme}
              saturationMultiplier={state.useBWPrimary ? 0 : 1}
              isAccent={false}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>

      {/* Secondary Color */}
      <View style={{ marginBottom: 30 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "500",
            color: state.colors.text,
            marginBottom: 12,
            fontFamily:
              state.fontFamily === "inter"
                ? "Inter_400Regular"
                : "Merriweather_400Regular",
          }}
        >
          Accent Color
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
          }}
        >
          {/* B&W Circle */}
          <TouchableOpacity
            onPress={() => setBWSecondary(true)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor:
                state.colorScheme === "dark" ? "#4d4d4d" : "#b3b3b3",
              borderWidth: 2,
              borderColor: state.useBWSecondary
                ? state.colors.text
                : state.colors.textSecondary,
            }}
          />

          {/* Hue Slider with interactive thumb */}
          <View style={{ flex: 1, opacity: state.useBWSecondary ? 0.3 : 1 }}>
            <HueSlider
              value={state.secondaryHue}
              onValueChange={setSecondaryHue}
              onThumbPress={() => setBWSecondary(false)}
              colorScheme={state.colorScheme}
              saturationMultiplier={state.useBWSecondary ? 0 : 1}
              isAccent={true}
              style={{ flex: 1 }}
            />
          </View>
        </View>

        {/* Theme Templates */}
        <TemplateSelector />
      </View>
    </View>
  );

  if (useBottomSheet) {
    return (
      <>
        <BottomSheet
          ref={bottomSheetRef}
          snapPoints={snapPoints}
          index={-1} // Start closed
          enablePanDownToClose
          onClose={onClose}
          backgroundStyle={{ backgroundColor: state.colors.background }}
          handleIndicatorStyle={{ backgroundColor: state.colors.textSecondary }}
          enableOverDrag={false}
        >
          <BottomSheetScrollView style={{ marginBottom: insets.bottom + 8 }}>
            {renderContent()}
          </BottomSheetScrollView>
        </BottomSheet>

        {/* Crop Modal */}
        {selectedImageUri && (
          <ImageCropModal
            visible={cropModalVisible}
            imageUri={selectedImageUri}
            onCrop={handleCropComplete}
            onCancel={handleCropCancel}
          />
        )}
      </>
    );
  }

  // Sidebar for desktop
  return (
    <>
      {/* Backdrop */}
      {isVisible && (
        <TouchableOpacity
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
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
            position: "absolute",
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
        <ScrollView>{renderContent()}</ScrollView>
      </Animated.View>

      {/* Crop Modal */}
      {selectedImageUri && (
        <ImageCropModal
          visible={cropModalVisible}
          imageUri={selectedImageUri}
          onCrop={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </>
  );
}
