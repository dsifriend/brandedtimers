import { ColorSchemeName } from "react-native";

export type FontFamily = "inter" | "merriweather";

export interface HeaderConfig {
  mainHeading: string;
  mainHeadingRight: string;
  subheading: string;
  splitHeading: boolean;
  imageBase64: string | null;
}

export interface ThemeTemplate {
  name: string;
  colorScheme: ColorSchemeName;
  primaryHue: number;
  secondaryHue: number;
  useBWPrimary: boolean;
  useBWSecondary: boolean;
  fontFamily: FontFamily;
  header: HeaderConfig;
}
