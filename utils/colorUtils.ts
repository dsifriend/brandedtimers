/**
 * Color utility functions using pure HSL for guaranteed valid colors
 */

export interface HSLColor {
  hue: number; // 0-360 degrees
  saturation: number; // 0-100%
  lightness: number; // 0-100%
  alpha?: number; // 0-1, defaults to 1
}

/**
 * Creates an HSL color definition
 */
export function hsl(
  hue: number,
  saturation: number,
  lightness: number,
  alpha: number = 1,
): HSLColor {
  return { hue, saturation, lightness, alpha };
}

/**
 * Converts an HSL color to HSL string compatible with React Native
 */
export function hslToString(color: HSLColor): string {
  const h = Math.round(color.hue);
  const s = Math.round(color.saturation);
  const l = Math.round(color.lightness);

  if (color.alpha !== undefined && color.alpha < 1) {
    return `hsla(${h}, ${s}%, ${l}%, ${color.alpha})`;
  } else {
    return `hsl(${h}, ${s}%, ${l}%)`;
  }
}

/**
 * HSL color presets for dark and light themes
 * All values guarantee valid sRGB colors with good visual separation
 */
export const ColorPresets = {
  // Dark theme colors
  dark: {
    // Backgrounds - dark with subtle color
    backgroundPrimary: (hue: number) => hsl(hue, 15, 15),
    backgroundSecondary: (hue: number) => hsl(hue, 20, 25),

    // Surfaces - slightly lighter than backgrounds
    surfacePrimary: (hue: number) => hsl(hue, 20, 22),
    surfaceSecondary: (hue: number) => hsl(hue, 25, 28),

    // Accents - vibrant colors for buttons/highlights
    accentPrimary: (hue: number) => hsl(hue, 70, 65),
    accentSecondary: (hue: number) => hsl(hue, 60, 50),

    // Text colors - bright with subtle tint
    textPrimary: (hue: number) => hsl(hue, 10, 95),
    textSecondary: (hue: number) => hsl(hue, 20, 70),
    textTertiary: (hue: number) => hsl(hue, 30, 55),
  },

  // Light theme colors
  light: {
    // Backgrounds - very light with minimal color
    backgroundPrimary: (hue: number) => hsl(hue, 10, 96),
    backgroundSecondary: (hue: number) => hsl(hue, 15, 92),

    // Surfaces - slightly darker than backgrounds
    surfacePrimary: (hue: number) => hsl(hue, 15, 92),
    surfaceSecondary: (hue: number) => hsl(hue, 20, 88),

    // Accents - same as dark theme for consistency
    accentPrimary: (hue: number) => hsl(hue, 70, 65),
    accentSecondary: (hue: number) => hsl(hue, 60, 50),

    // Text colors - dark with color tint
    textPrimary: (hue: number) => hsl(hue, 15, 20),
    textSecondary: (hue: number) => hsl(hue, 25, 35),
    textTertiary: (hue: number) => hsl(hue, 30, 45),
  },
};

/**
 * Type-safe color conversion that always returns a valid React Native color
 */
export function toReactNativeColor(color: HSLColor): string {
  return hslToString(color);
}
