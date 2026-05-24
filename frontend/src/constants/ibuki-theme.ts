import { Platform } from "react-native";

export const IbukiColors = {
  background: "#EDE8DC",
  appBackdrop: "#E4DDCF",
  surface: "#F7F3EA",
  surfaceMuted: "#F1ECE1",
  surfaceWarm: "#EFE8D7",
  ink: "#2E2620",
  inkSoft: "#5B4E43",
  mid: "#7A6A5A",
  soft: "#A79785",
  line: "#D6CCBC",
  lineSoft: "#E6DECF",
  accent: "#B17F59",
  accentDeep: "#8B5F3D",
  accentTint: "#EFE2D6",
  accentTintStrong: "#E7D8C8",
  good: "#A5B68D",
  hot: "#B17F59",
  mapLand: "#EDE8DC",
  mapBlock: "#E4DDCF",
  mapWater: "#DCE5D0",
  mapPark: "#C1CFA1",
  mapRoad: "#F7F3EA",
  mapRoadWarm: "#EFE8D7",
} as const;

export const IbukiSpacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const IbukiRadius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

export const IbukiFonts = {
  sans: "ZenMaruGothic_500Medium",
  sansRegular: "ZenMaruGothic_400Regular",
  sansBold: "ZenMaruGothic_700Bold",
  serif: "ZenMaruGothic_500Medium",
  serifRegular: "ZenMaruGothic_400Regular",
  serifBold: "ZenMaruGothic_700Bold",
  mono: "MPLUS1_500Medium",
  monoRegular: "MPLUS1_400Regular",
  monoBold: "MPLUS1_700Bold",
} as const;

export const IbukiShadow = {
  card: Platform.select({
    web: {
      boxShadow:
        "0 1px 2px rgba(20,19,15,0.05), 0 8px 24px rgba(20,19,15,0.07)",
    },
    default: {
      shadowColor: "#1A1C12",
      shadowOpacity: 0.09,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 8 },
      elevation: 3,
    },
  }),
  soft: Platform.select({
    web: {
      boxShadow: "0 1px 1px rgba(20,19,15,0.03)",
    },
    default: {
      shadowColor: "#1A1C12",
      shadowOpacity: 0.05,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 1,
    },
  }),
} as const;

export const PhoneMaxWidth = 430;
export const TabBarHeight = 86;
