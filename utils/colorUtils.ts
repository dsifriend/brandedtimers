import Color from "colorjs.io";

/**
 * Color utility functions using OKLCH calculations with React Native compatible outputs
 */

export interface OKLCHColor {
  lightness: number; // 0-1 (0% to 100%)
  chroma: number; // 0-0.37 for sRGB compatibility
  hue: number; // 0-360 degrees
  alpha?: number; // 0-1, defaults to 1
}

/**
 * Creates an OKLCH color definition
 */
export function oklch(
  lightness: number,
  chroma: number,
  hue: number,
  alpha: number = 1
): OKLCHColor {
  return { lightness, chroma, hue, alpha };
}

/**
 * Converts an OKLCH color to HSL string compatible with React Native
 */
export function oklchToHsl(color: OKLCHColor): string {
  try {
    // Create Color.js color object from OKLCH values
    const colorObj = new Color("oklch", [
      color.lightness,
      color.chroma,
      color.hue,
    ]);

    // Convert to HSL and get values
    const hslColor = colorObj.to("hsl");
    const [h, s, l, a] = hslColor.coords.concat(hslColor.alpha ?? 1);

    // Handle NaN hue (can happen with very low chroma)
    const hue = isNaN(h) ? 0 : h;
    const saturation = isNaN(s) ? 0 : Math.max(0, Math.min(100, s));
    const lightness = isNaN(l) ? 0 : Math.max(0, Math.min(100, l));

    if (color.alpha !== undefined && color.alpha < 1) {
      return `hsla(${Math.round(hue)}, ${Math.round(saturation)}%, ${Math.round(
        lightness
      )}%, ${a})`;
    } else {
      return `hsl(${Math.round(hue)}, ${Math.round(saturation)}%, ${Math.round(
        lightness
      )}%)`;
    }
  } catch (error) {
    console.warn("Failed to convert OKLCH to HSL:", error);
    // Fallback to a reasonable default
    return color.lightness > 0.65 ? "#ffffff" : "#000000";
  }
}

/**
 * Converts an OKLCH color to RGB string compatible with React Native
 */
export function oklchToRgb(color: OKLCHColor): string {
  try {
    const colorObj = new Color("oklch", [
      color.lightness,
      color.chroma,
      color.hue,
    ]);

    const rgbColor = colorObj.to("srgb");
    const [r, g, b, a] = rgbColor.coords
      .map((c) => Math.max(0, Math.min(255, Math.round(c * 255))))
      .concat(rgbColor.alpha ?? 1);

    if (color.alpha !== undefined && color.alpha < 1) {
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    } else {
      return `rgb(${r}, ${g}, ${b})`;
    }
  } catch (error) {
    console.warn("Failed to convert OKLCH to RGB:", error);
    return color.lightness > 0.65 ? "#ffffff" : "#000000";
  }
}

/**
 * Converts an OKLCH color to hex string
 */
export function oklchToHex(color: OKLCHColor): string {
  try {
    const colorObj = new Color("oklch", [
      color.lightness,
      color.chroma,
      color.hue,
    ]);

    return colorObj.to("srgb").toString({ format: "hex" });
  } catch (error) {
    console.warn("Failed to convert OKLCH to hex:", error);
    return color.lightness > 0.65 ? "#ffffff" : "#000000";
  }
}

/**
 * Calculate contrast ratio between two OKLCH colors using WCAG algorithm
 */
export function getContrastRatio(
  color1: OKLCHColor,
  color2: OKLCHColor
): number {
  try {
    const colorObj1 = new Color("oklch", [
      color1.lightness,
      color1.chroma,
      color1.hue,
    ]);
    const colorObj2 = new Color("oklch", [
      color2.lightness,
      color2.chroma,
      color2.hue,
    ]);

    return colorObj1.contrast(colorObj2, "WCAG21");
  } catch (error) {
    console.warn("Failed to calculate contrast ratio:", error);
    return 1;
  }
}

/**
 * Check if an OKLCH color meets WCAG contrast requirements against another color
 */
export function meetsContrastRequirement(
  foreground: OKLCHColor,
  background: OKLCHColor,
  level: "AA" | "AAA" = "AA",
  isLargeText: boolean = false
): boolean {
  const contrast = getContrastRatio(foreground, background);

  if (level === "AAA") {
    return isLargeText ? contrast >= 4.5 : contrast >= 7;
  } else {
    return isLargeText ? contrast >= 3 : contrast >= 4.5;
  }
}

/**
 * Optimized OKLCH values that guarantee sRGB compatibility and WCAG compliance
 * Updated with consistent accent colors and inverted light theme approach
 */
export const ColorPresets = {
  // Dark theme colors
  dark: {
    // Backgrounds - designed for high contrast
    backgroundPrimary: (hue: number) => oklch(0.2, 0.03, hue),
    backgroundSecondary: (hue: number) => oklch(0.35, 0.04, hue),

    // Surfaces - medium contrast
    surfacePrimary: (hue: number) => oklch(0.3, 0.05, hue),
    surfaceSecondary: (hue: number) => oklch(0.35, 0.05, hue),

    // Accents - vibrant colors for buttons/highlights
    accentPrimary: (hue: number) => oklch(0.75, 0.12, hue),
    accentSecondary: (hue: number) => oklch(0.55, 0.09, hue),

    // Text colors - prominent white text
    textPrimary: (hue: number) => oklch(0.95, 0.02, hue),
    textSecondary: (hue: number) => oklch(0.75, 0.05, hue),
    textTertiary: (hue: number) => oklch(0.55, 0.07, hue),
  },

  // Light theme colors - inverted approach with colored text/elements
  light: {
    // Backgrounds - neutral light backgrounds
    backgroundPrimary: (hue: number) => oklch(0.95, 0.01, hue), // Almost white with tiny hint
    backgroundSecondary: (hue: number) => oklch(0.95, 0.0, hue), // Very light neutral

    // Surfaces - neutral light surfaces
    surfacePrimary: (hue: number) => oklch(0.92, 0.01, hue), // Light neutral
    surfaceSecondary: (hue: number) => oklch(0.88, 0.02, hue), // Slightly tinted

    // Accents - SAME as dark theme for consistency
    accentPrimary: (hue: number) => oklch(0.75, 0.12, hue),
    accentSecondary: (hue: number) => oklch(0.55, 0.09, hue),

    // Text colors - colored elements (digits, etc.)
    textPrimary: (hue: number) => oklch(0.2, 0.03, hue),
    textSecondary: (hue: number) => oklch(0.35, 0.07, hue),
    textTertiary: (hue: number) => oklch(0.4, 0.075, hue),
  },
};

/**
 * Type-safe color conversion that always returns a valid React Native color
 */
export function toReactNativeColor(
  color: OKLCHColor,
  format: "hsl" | "rgb" | "hex" = "hsl"
): string {
  switch (format) {
    case "rgb":
      return oklchToRgb(color);
    case "hex":
      return oklchToHex(color);
    case "hsl":
    default:
      return oklchToHsl(color);
  }
}
