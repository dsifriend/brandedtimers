import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { Appearance, ColorSchemeName } from "react-native";
import { ColorPresets, toReactNativeColor } from "../../../utils/colorUtils";

type FontFamily = "inter" | "merriweather";

interface ColorSystem {
  primary: string;
  secondary: string;
  background: string;
  accent: string;
  text: string;
  textSecondary: string;
}

interface HeaderConfig {
  mainHeading: string;
  mainHeadingRight: string;
  subheading: string;
  splitHeading: boolean;
  imageBase64: string | null;
}

interface CustomizationState {
  colorScheme: ColorSchemeName;
  primaryHue: number;
  secondaryHue: number;
  useBWPrimary: boolean;
  useBWSecondary: boolean;
  fontFamily: FontFamily;
  colors: ColorSystem;
  header: HeaderConfig;
  isLoading: boolean;
}

type CustomizationAction =
  | { type: "SET_COLOR_SCHEME"; scheme: ColorSchemeName }
  | { type: "SET_PRIMARY_HUE"; hue: number }
  | { type: "SET_SECONDARY_HUE"; hue: number }
  | { type: "SET_BW_PRIMARY"; useBW: boolean }
  | { type: "SET_BW_SECONDARY"; useBW: boolean }
  | { type: "SET_FONT_FAMILY"; fontFamily: FontFamily }
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "SET_HEADER_MAIN"; text: string }
  | { type: "SET_HEADER_MAIN_RIGHT"; text: string }
  | { type: "SET_HEADER_SUB"; text: string }
  | { type: "TOGGLE_SPLIT_HEADING"; preference: boolean | undefined }
  | { type: "SET_HEADER_IMAGE"; imageBase64: string | null }
  | { type: "RESTORE_SETTINGS"; settings: Partial<CustomizationState> };

// OKLCH-based color generation with React Native compatible output
const generateColors = (
  primaryHue: number,
  secondaryHue: number,
  scheme: ColorSchemeName,
  useBWPrimary: boolean = false,
  useBWSecondary: boolean = false,
): ColorSystem => {
  const presets = scheme === "dark" ? ColorPresets.dark : ColorPresets.light;

  return {
    // Primary surfaces - use B&W if enabled
    primary: toReactNativeColor(
      useBWPrimary
        ? {
            hue: primaryHue,
            saturation: 0,
            lightness: scheme === "dark" ? 10 : 90,
          }
        : presets.surfacePrimary(primaryHue),
    ),
    background: toReactNativeColor(
      useBWPrimary
        ? {
            hue: primaryHue,
            saturation: 0,
            lightness: scheme === "dark" ? 0 : 100,
          }
        : presets.backgroundPrimary(primaryHue),
    ),

    // Secondary/accent colors - use theme-appropriate grays if B&W enabled
    secondary: toReactNativeColor(
      useBWSecondary
        ? {
            hue: secondaryHue,
            saturation: 0,
            lightness: scheme === "dark" ? 60 : 20,
          }
        : presets.accentSecondary(secondaryHue),
    ),
    accent: toReactNativeColor(
      useBWSecondary
        ? {
            hue: secondaryHue,
            saturation: 0,
            lightness: scheme === "dark" ? 90 : 10,
          }
        : presets.accentPrimary(secondaryHue),
    ),

    // Text colors - use primary hue for consistency
    text: toReactNativeColor(
      useBWPrimary
        ? {
            hue: primaryHue,
            saturation: 0,
            lightness: scheme === "dark" ? 100 : 0,
          }
        : presets.textPrimary(primaryHue),
    ),
    textSecondary: toReactNativeColor(
      useBWPrimary
        ? {
            hue: primaryHue,
            saturation: 0,
            lightness: scheme === "dark" ? 70 : 30,
          }
        : presets.textSecondary(primaryHue),
    ),
  };
};

// Font family helper function
const getFontFamilyName = (fontFamily: FontFamily): string => {
  switch (fontFamily) {
    case "inter":
      return "Inter_400Regular";
    case "merriweather":
      return "Merriweather_400Regular";
    default:
      return "Inter_400Regular";
  }
};

const initialState: CustomizationState = {
  colorScheme: Appearance.getColorScheme() || "dark",
  primaryHue: 220, // Default blue
  secondaryHue: 280, // Default purple
  useBWPrimary: false,
  useBWSecondary: false,
  fontFamily: "inter", // Default font
  colors: generateColors(
    220,
    280,
    Appearance.getColorScheme() || "dark",
    false,
    false,
  ),
  header: {
    mainHeading: "",
    mainHeadingRight: "",
    subheading: "",
    splitHeading: false,
    imageBase64: null,
  },
  isLoading: true,
};

function customizationReducer(
  state: CustomizationState,
  action: CustomizationAction,
): CustomizationState {
  switch (action.type) {
    case "SET_COLOR_SCHEME": {
      const newColors = generateColors(
        state.primaryHue,
        state.secondaryHue,
        action.scheme,
        state.useBWPrimary,
        state.useBWSecondary,
      );
      return {
        ...state,
        colorScheme: action.scheme,
        colors: newColors,
      };
    }

    case "SET_PRIMARY_HUE": {
      const newColors = generateColors(
        action.hue,
        state.secondaryHue,
        state.colorScheme,
        state.useBWPrimary,
        state.useBWSecondary,
      );
      return {
        ...state,
        primaryHue: action.hue,
        colors: newColors,
      };
    }

    case "SET_SECONDARY_HUE": {
      const newColors = generateColors(
        state.primaryHue,
        action.hue,
        state.colorScheme,
        state.useBWPrimary,
        state.useBWSecondary,
      );
      return {
        ...state,
        secondaryHue: action.hue,
        colors: newColors,
      };
    }

    case "SET_BW_PRIMARY": {
      const newColors = generateColors(
        state.primaryHue,
        state.secondaryHue,
        state.colorScheme,
        action.useBW,
        state.useBWSecondary,
      );
      return {
        ...state,
        useBWPrimary: action.useBW,
        colors: newColors,
      };
    }

    case "SET_BW_SECONDARY": {
      const newColors = generateColors(
        state.primaryHue,
        state.secondaryHue,
        state.colorScheme,
        state.useBWPrimary,
        action.useBW,
      );
      return {
        ...state,
        useBWSecondary: action.useBW,
        colors: newColors,
      };
    }

    case "SET_FONT_FAMILY":
      return {
        ...state,
        fontFamily: action.fontFamily,
      };

    case "SET_HEADER_MAIN":
      return {
        ...state,
        header: {
          ...state.header,
          mainHeading: action.text,
        },
      };

    case "SET_HEADER_MAIN_RIGHT":
      return {
        ...state,
        header: {
          ...state.header,
          mainHeadingRight: action.text,
        },
      };

    case "SET_HEADER_SUB":
      return {
        ...state,
        header: {
          ...state.header,
          subheading: action.text,
        },
      };

    case "SET_HEADER_IMAGE":
      return {
        ...state,
        header: {
          ...state.header,
          imageBase64: action.imageBase64,
        },
      };

    case "TOGGLE_SPLIT_HEADING":
      return {
        ...state,
        header: {
          ...state.header,
          splitHeading:
            action.preference === undefined
              ? !state.header.splitHeading
              : action.preference,
          mainHeadingRight: !state.header.splitHeading
            ? state.header.mainHeadingRight
            : "",
        },
      };

    case "SET_LOADING":
      return { ...state, isLoading: action.loading };

    case "RESTORE_SETTINGS": {
      const restoredState = { ...state, ...action.settings };
      return {
        ...restoredState,
        colors: generateColors(
          restoredState.primaryHue,
          restoredState.secondaryHue,
          restoredState.colorScheme,
          restoredState.useBWPrimary,
          restoredState.useBWSecondary,
        ),
      };
    }

    default:
      return state;
  }
}

interface CustomizationContextValue {
  state: CustomizationState;
  setPrimaryHue: (hue: number) => void;
  setSecondaryHue: (hue: number) => void;
  setColorScheme: (scheme: ColorSchemeName) => void;
  setFontFamily: (fontFamily: FontFamily) => void;
  setBWPrimary: (useBW: boolean) => void;
  setBWSecondary: (useBW: boolean) => void;
  setHeaderMain: (text: string) => void;
  setHeaderMainRight: (text: string) => void;
  setHeaderSub: (text: string) => void;
  setHeaderImage: (imageBase64: string | null) => void;
  toggleSplitHeading: (preference?: boolean) => void;
  getFontFamilyName: () => string;
  resetToDefaults: () => void;
}

const CustomizationContext = createContext<
  CustomizationContextValue | undefined
>(undefined);

const STORAGE_KEY = "customization_settings";

export function CustomizationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(customizationReducer, initialState);

  // Save settings to AsyncStorage
  const saveSettings = useCallback(async (newState: CustomizationState) => {
    try {
      const settings = {
        colorScheme: newState.colorScheme,
        primaryHue: newState.primaryHue,
        secondaryHue: newState.secondaryHue,
        useBWPrimary: newState.useBWPrimary,
        useBWSecondary: newState.useBWSecondary,
        fontFamily: newState.fontFamily,
        header: newState.header,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.warn("Failed to save customization settings:", error);
    }
  }, []);

  // Load settings from AsyncStorage
  const loadSettings = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const settings = JSON.parse(stored);
        dispatch({ type: "RESTORE_SETTINGS", settings });
      }
    } catch (error) {
      console.warn("Failed to load customization settings:", error);
    } finally {
      dispatch({ type: "SET_LOADING", loading: false });
    }
  }, []);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Save settings whenever they change
  useEffect(() => {
    if (!state.isLoading) {
      saveSettings(state);
    }
  }, [state, saveSettings]);

  // Listen to system color scheme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      dispatch({ type: "SET_COLOR_SCHEME", scheme: colorScheme });
    });
    return () => subscription?.remove();
  }, []);

  const setPrimaryHue = useCallback((hue: number) => {
    dispatch({ type: "SET_PRIMARY_HUE", hue });
  }, []);

  const setSecondaryHue = useCallback((hue: number) => {
    dispatch({ type: "SET_SECONDARY_HUE", hue });
  }, []);

  const setColorScheme = useCallback((scheme: ColorSchemeName) => {
    dispatch({ type: "SET_COLOR_SCHEME", scheme });
  }, []);

  const setFontFamily = useCallback((fontFamily: FontFamily) => {
    dispatch({ type: "SET_FONT_FAMILY", fontFamily });
  }, []);

  const setBWPrimary = useCallback((useBW: boolean) => {
    dispatch({ type: "SET_BW_PRIMARY", useBW });
  }, []);

  const setBWSecondary = useCallback((useBW: boolean) => {
    dispatch({ type: "SET_BW_SECONDARY", useBW });
  }, []);

  const setHeaderMain = useCallback((text: string) => {
    dispatch({ type: "SET_HEADER_MAIN", text });
  }, []);

  const setHeaderMainRight = useCallback((text: string) => {
    dispatch({ type: "SET_HEADER_MAIN_RIGHT", text });
  }, []);

  const setHeaderSub = useCallback((text: string) => {
    dispatch({ type: "SET_HEADER_SUB", text });
  }, []);

  const setHeaderImage = useCallback((imageBase64: string | null) => {
    dispatch({ type: "SET_HEADER_IMAGE", imageBase64 });
  }, []);

  const toggleSplitHeading = useCallback((preference?: boolean) => {
    dispatch({ type: "TOGGLE_SPLIT_HEADING", preference });
  }, []);

  const getCurrentFontFamilyName = useCallback(() => {
    return getFontFamilyName(state.fontFamily);
  }, [state.fontFamily]);

  const resetToDefaults = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      dispatch({
        type: "RESTORE_SETTINGS",
        settings: {
          colorScheme: "dark",
          primaryHue: 220,
          secondaryHue: 280,
          useBWPrimary: false,
          useBWSecondary: false,
          fontFamily: "inter",
          header: {
            mainHeading: "",
            mainHeadingRight: "",
            subheading: "",
            splitHeading: false,
            imageBase64: null,
          },
        },
      });
    } catch (error) {
      console.warn("Failed to reset settings:", error);
    }
  }, []);

  return (
    <CustomizationContext.Provider
      value={{
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
        getFontFamilyName: getCurrentFontFamilyName,
        resetToDefaults,
      }}
    >
      {children}
    </CustomizationContext.Provider>
  );
}

export function useCustomization() {
  const context = useContext(CustomizationContext);
  if (!context) {
    throw new Error(
      "useCustomization must be used within a CustomizationProvider",
    );
  }
  return context;
}

export type { ColorSystem, FontFamily, HeaderConfig };
