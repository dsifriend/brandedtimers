import React, { useCallback } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCustomization } from "./context/CustomizationContext";
import { exportTheme, importTheme } from "@/utils/themeImportExport";

export const ThemeImportExport: React.FC = () => {
  const { state, applyTemplate } = useCustomization();

  const handleExport = useCallback(async () => {
    await exportTheme(state);
  }, [state]);

  const handleImport = useCallback(async () => {
    await importTheme(applyTemplate);
  }, [applyTemplate]);

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: state.colors.text }]}>
        Save/Load
      </Text>

      <View style={styles.buttonContainer}>
        <Pressable
          style={[styles.button, { backgroundColor: state.colors.primary }]}
          onPress={handleImport}
        >
          <Ionicons
            name="cloud-upload-outline"
            size={20}
            color={state.colors.text}
          />
          <Text
            style={[
              styles.buttonText,
              {
                color: state.colors.text,
                fontFamily:
                  state.fontFamily === "inter"
                    ? "Inter_400Regular"
                    : "Merriweather_400Regular",
              },
            ]}
          >
            Import Theme
          </Text>
        </Pressable>

        <Pressable
          style={[styles.button, { backgroundColor: state.colors.primary }]}
          onPress={handleExport}
        >
          <Ionicons
            name="download-outline"
            size={20}
            color={state.colors.text}
          />
          <Text
            style={[
              styles.buttonText,
              {
                color: state.colors.text,
                fontFamily:
                  state.fontFamily === "inter"
                    ? "Inter_400Regular"
                    : "Merriweather_400Regular",
              },
            ]}
          >
            Export Theme
          </Text>
        </Pressable>
      </View>
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
  buttonContainer: {
    gap: 8,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 12,
  },
  buttonText: {
    fontSize: 16,
  },
});
