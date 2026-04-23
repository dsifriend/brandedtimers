import * as DocumentPicker from "expo-document-picker";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Platform, Alert } from "react-native";
import { CustomizationState } from "@/components/customization/context/CustomizationContext";
import { ThemeTemplate } from "@/types/template";
import { QueueState } from "@/components/queue/types";

/**
 * Normalize a string for use as a filename
 * Removes/replaces characters that aren't filesystem-safe
 */
export function normalizeFilename(text: string): string {
  return text
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "") // Remove invalid chars
    .replace(/\s+/g, "_") // Replace spaces with underscores
    .replace(/^\.+/, "") // Remove leading dots
    .substring(0, 200); // Limit length
}

/**
 * Generate a filename from the current state
 */
function generateFilename(state: CustomizationState): string {
  const baseName =
    normalizeFilename(state.header.mainHeading) ||
    `theme_${new Date().getTime()}`;
  return `${baseName}.tmtimer`;
}

/**
 * Export the current theme with queue data to a .tmtimer file
 */
export async function exportTheme(
  state: CustomizationState,
  queueState?: QueueState,
): Promise<void> {
  try {
    // Create the theme object matching ThemeTemplate structure
    const theme: ThemeTemplate = {
      name: state.header.mainHeading || "Custom Theme",
      colorScheme: state.colorScheme,
      primaryHue: state.primaryHue,
      secondaryHue: state.secondaryHue,
      useBWPrimary: state.useBWPrimary,
      useBWSecondary: state.useBWSecondary,
      fontFamily: state.fontFamily,
      header: state.header,
    };

    // Add queue data if provided
    if (queueState && queueState.entries.length > 0) {
      theme.queue = {
        entries: queueState.entries,
        continuousMode: queueState.continuousMode,
      };
    }

    const jsonString = JSON.stringify(theme, null, 2);
    const filename = generateFilename(state);

    if (Platform.OS === "web") {
      // Web: Create blob and trigger download
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      // Mobile: Write to cache and share using new File API
      const file = new File(Paths.cache, filename);
      file.create({ overwrite: true });
      file.write(jsonString, {});

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
          mimeType: "application/json",
          dialogTitle: "Export Theme",
          UTI: "public.json",
        });
      } else {
        Alert.alert("Error", "Sharing is not available on this device");
      }
    }
  } catch (error) {
    console.error("Export error:", error);
    Alert.alert("Export Failed", "Could not export theme");
  }
}

/**
 * Import a theme from a .tmtimer or .json file
 */
export async function importTheme(
  applyTemplate: (template: Partial<ThemeTemplate>) => void,
  applyQueue?: (queueData: { entries: any[]; continuousMode: boolean }) => void,
): Promise<void> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/json", "text/plain", ".tmtimer", "*/*"],
      copyToCacheDirectory: true,
    });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];

    // Read file content
    let content: string;
    if (Platform.OS === "web") {
      // Web: asset.uri is a blob URL or data URI
      const response = await fetch(asset.uri);
      content = await response.text();
    } else {
      // Mobile: read using new File API
      const file = new File(asset.uri);
      content = await file.text();
    }

    // Parse JSON
    const parsed = JSON.parse(content) as Partial<ThemeTemplate>;

    // Handle potentially corrupt image data
    if (parsed.header?.imageBase64) {
      try {
        // Basic validation: check if it looks like valid base64 data URI
        const imageData = parsed.header.imageBase64;
        if (
          !imageData.startsWith("data:image/") ||
          !imageData.includes("base64,")
        ) {
          console.warn("Invalid image data format, skipping image");
          parsed.header.imageBase64 = null;
        }
      } catch (error) {
        console.warn("Error validating image data, skipping:", error);
        if (parsed.header) {
          parsed.header.imageBase64 = null;
        }
      }
    }

    // Apply the theme using the existing context function
    applyTemplate(parsed);

    // Apply queue data if present and handler provided
    if (parsed.queue && applyQueue) {
      // Validate queue entries
      const validEntries = parsed.queue.entries.filter(
        (entry: any) =>
          typeof entry.id === "string" &&
          typeof entry.duration === "number" &&
          entry.duration > 0,
      );

      if (validEntries.length > 0) {
        applyQueue({
          entries: validEntries,
          continuousMode: parsed.queue.continuousMode ?? false,
        });
      }
    }
  } catch (error) {
    console.error("Import error:", error);
    if (error instanceof SyntaxError) {
      Alert.alert("Import Failed", "Invalid theme file format");
    } else {
      Alert.alert("Import Failed", "Could not import theme");
    }
  }
}
