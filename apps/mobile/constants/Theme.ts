import { DefaultTheme, DarkTheme } from "@react-navigation/native";

// --- Bảng màu hệ thống ---
export const Colors = {
  light: {
    primary: "#eab308", // yellow-500
    background: "#fafafa", // zinc-50
    card: "#ffffff",
    text: "#09090b", // zinc-950
    border: "#e4e4e7", // zinc-200
    notification: "#ef4444", // red-500
    zinc: {
      50: "#fafafa",
      100: "#f4f4f5",
      200: "#e4e4e7",
      300: "#d4d4d8",
      400: "#a1a1aa",
      500: "#71717a",
      600: "#52525b",
      700: "#3f3f46",
      800: "#27272a",
      900: "#18181b",
      950: "#09090b",
    },
  },
  dark: {
    primary: "#eab308", // yellow-500
    background: "#09090b", // zinc-950
    card: "#18181b", // zinc-900
    text: "#fafafa", // zinc-50
    border: "#27272a", // zinc-800
    notification: "#ef4444", // red-500
    zinc: {
      50: "#fafafa",
      100: "#f4f4f5",
      200: "#e4e4e7",
      300: "#d4d4d8",
      400: "#a1a1aa",
      500: "#71717a",
      600: "#52525b",
      700: "#3f3f46",
      800: "#27272a",
      900: "#18181b",
      950: "#09090b",
    },
  },
};

// --- Cấu hình Theme cho React Navigation ---
export const customLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.light.primary,
    background: Colors.light.background,
    card: Colors.light.card,
    text: Colors.light.text,
    border: Colors.light.border,
  },
};

export const customDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.dark.primary,
    background: Colors.dark.background,
    card: Colors.dark.card,
    text: Colors.dark.text,
    border: Colors.dark.border,
  },
};
