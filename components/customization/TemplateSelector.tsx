import React, { useState, useCallback } from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { useCustomization } from "./context/CustomizationContext";
import { ThemeTemplate } from "@/types/template";

// Import templates
import brandedTimers from "@/assets/templates/brandedTimers.json";
import citrusIndustries from "@/assets/templates/citrusIndustries.json";
import nineties from "@/assets/templates/nineties.json";
import tradeMarker from "@/assets/templates/tradeMarker.json";

const TEMPLATES: ThemeTemplate[] = [
  brandedTimers as ThemeTemplate,
  citrusIndustries as ThemeTemplate,
  nineties as ThemeTemplate,
  tradeMarker as ThemeTemplate,
];

interface TemplatePreviewProps {
  template: ThemeTemplate;
  onPress: () => void;
  onHoverIn?: () => void;
  onHoverOut?: () => void;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  template,
  onPress,
  onHoverIn,
  onHoverOut,
}) => {
  const { state } = useCustomization();

  // Generate preview colors using the same logic as the context
  const getPrimaryColor = (hue: number, useBW: boolean): string => {
    if (useBW) {
      return state.colorScheme === "dark"
        ? `hsl(${hue}, 0%, 10%)`
        : `hsl(${hue}, 0%, 90%)`;
    }
    return `hsl(${hue}, 70%, ${state.colorScheme === "dark" ? 25 : 75}%)`;
  };

  const getAccentColor = (hue: number, useBW: boolean): string => {
    if (useBW) {
      return state.colorScheme === "dark"
        ? `hsl(${hue}, 0%, 80%)`
        : `hsl(${hue}, 0%, 20%)`;
    }
    return `hsl(${hue}, 85%, ${state.colorScheme === "dark" ? 60 : 50}%)`;
  };

  const primaryColor = getPrimaryColor(
    template.primaryHue,
    template.useBWPrimary,
  );
  const accentColor = getAccentColor(
    template.secondaryHue,
    template.useBWSecondary,
  );

  return (
    <Pressable
      style={styles.templateButton}
      onPress={onPress}
      onHoverIn={Platform.OS === "web" ? onHoverIn : undefined}
      onHoverOut={Platform.OS === "web" ? onHoverOut : undefined}
    >
      <View style={styles.colorPreview}>
        <View
          style={[
            styles.colorCircle,
            styles.colorCirclePrimary,
            { backgroundColor: primaryColor },
          ]}
        />
        <View
          style={[
            styles.colorCircle,
            styles.colorCircleAccent,
            { backgroundColor: accentColor },
          ]}
        />
      </View>
      <Text
        style={[
          styles.templateName,
          {
            fontFamily:
              template.fontFamily === "inter"
                ? "Inter_400Regular"
                : "Merriweather_400Regular",
            color: state.colors.text,
          },
        ]}
      >
        {template.name}
      </Text>
    </Pressable>
  );
};

export const TemplateSelector: React.FC = () => {
  const { state, applyTemplate } = useCustomization();
  const [savedSettings, setSavedSettings] = useState<Partial<
    typeof state
  > | null>(null);

  const handleApplyTemplate = useCallback(
    (template: ThemeTemplate) => {
      applyTemplate(template);
    },
    [applyTemplate],
  );

  const handlePreviewStart = useCallback(
    (template: ThemeTemplate) => {
      // Save current settings
      setSavedSettings({
        colorScheme: state.colorScheme,
        primaryHue: state.primaryHue,
        secondaryHue: state.secondaryHue,
        useBWPrimary: state.useBWPrimary,
        useBWSecondary: state.useBWSecondary,
        fontFamily: state.fontFamily,
        header: { ...state.header },
      });
      // Apply template for preview
      applyTemplate(template);
    },
    [state, applyTemplate],
  );

  const handlePreviewEnd = useCallback(() => {
    // Restore saved settings
    if (savedSettings) {
      applyTemplate(savedSettings as ThemeTemplate);
      setSavedSettings(null);
    }
  }, [savedSettings, applyTemplate]);

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: state.colors.text }]}>
        Templates
      </Text>
      {TEMPLATES.map((template, index) => (
        <TemplatePreview
          key={index}
          template={template}
          onPress={() => handleApplyTemplate(template)}
          onHoverIn={() => handlePreviewStart(template)}
          onHoverOut={handlePreviewEnd}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  templateButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 16,
  },
  colorPreview: {
    width: 48,
    height: 48,
    position: "relative",
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    position: "absolute",
  },
  colorCirclePrimary: {
    top: 0,
    left: 0,
    zIndex: 1,
  },
  colorCircleAccent: {
    top: 16,
    left: 16,
    zIndex: 2,
  },
  templateName: {
    fontSize: 16,
    flex: 1,
  },
});
