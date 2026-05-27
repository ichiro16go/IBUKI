import { Platform } from "react-native";
import { Text } from "react-native";
import { SymbolView } from "expo-symbols";

export type SymbolName = {
  ios: string;
  android?: string;
  web?: string;
};

const symbolFallbacks: Record<string, string> = {
  "arrow.right": "→",
  "arrow.up.right": "↗",
  auto_awesome: "✦",
  bell: "◔",
  "bell.badge": "◔",
  bookmark: "□",
  bookmark_border: "□",
  chevron: "‹",
  "chevron.left": "‹",
  "dot.radiowaves.left.and.right": "◉",
  eco: "⌁",
  ellipsis: "…",
  favorite: "♥",
  favorite_border: "♡",
  gearshape: "⚙",
  heart: "♡",
  "heart.fill": "♥",
  leaf: "⌁",
  more_horiz: "…",
  notifications: "◔",
  "person.crop.circle": "○",
  place: "⌖",
  search: "⌕",
  settings: "⚙",
  share: "↗",
  "slider.horizontal.3": "≡",
  sparkles: "✦",
  square: "□",
  "square.and.arrow.up": "↗",
  tune: "≡",
};

export function AppSymbol({
  name,
  size,
  tintColor,
}: {
  name: SymbolName;
  size: number;
  tintColor: string;
}) {
  const symbolName =
    Platform.OS === "android"
      ? (name.android ?? name.ios)
      : Platform.OS === "web"
        ? (name.web ?? name.ios)
        : name.ios;
  const fallback =
    symbolFallbacks[symbolName] ??
    symbolFallbacks[name.ios] ??
    symbolFallbacks[name.web ?? ""] ??
    symbolFallbacks[name.android ?? ""] ??
    "•";

  if (Platform.OS !== "ios") {
    return (
      <Text
        style={{
          color: tintColor,
          fontSize: size,
          fontWeight: "700",
          lineHeight: size + 2,
        }}
      >
        {fallback}
      </Text>
    );
  }

  return (
    <SymbolView
      fallback={fallback}
      name={symbolName as never}
      size={size}
      tintColor={tintColor}
    />
  );
}
