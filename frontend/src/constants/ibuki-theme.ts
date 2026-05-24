import { Platform } from "react-native";

export const IbukiColors = {
  background: "#FBF5DD",
  appBackdrop: "#E7E1B1",
  surface: "#FFFCEC",
  surfaceMuted: "#F0EBC8",
  surfaceWarm: "#F6F0CF",
  ink: "#1A1C12",
  inkSoft: "#3A3D2C",
  mid: "#6E705A",
  soft: "#A8A682",
  line: "#DDD7A8",
  lineSoft: "#ECE6BC",
  accent: "#306D29",
  accentDeep: "#0D530E",
  accentTint: "#E2E8C6",
  accentTintStrong: "#D3E3C8",
  good: "#5E9D55",
  hot: "#D16B4A",
  mapLand: "#F0EBC8",
  mapBlock: "#E7E1B1",
  mapWater: "#D6DFB7",
  mapPark: "#CFDDA8",
  mapRoad: "#FFFCEC",
  mapRoadWarm: "#F6F0CF",
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
  sans: "ZenKakuGothicNew_500Medium",
  sansRegular: "ZenKakuGothicNew_400Regular",
  sansBold: "ZenKakuGothicNew_700Bold",
  serif: "ShipporiMinchoB1_500Medium",
  serifRegular: "ShipporiMinchoB1_400Regular",
  serifBold: "ShipporiMinchoB1_700Bold",
  mono: "JetBrainsMono_500Medium",
  monoRegular: "JetBrainsMono_400Regular",
  monoBold: "JetBrainsMono_700Bold",
} as const;

export const IbukiShadow = {
  card: Platform.select({
    web: {
      boxShadow: "0 1px 2px rgba(20,19,15,0.05), 0 8px 24px rgba(20,19,15,0.07)",
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
