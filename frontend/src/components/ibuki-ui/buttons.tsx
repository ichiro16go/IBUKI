import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { IbukiColors, IbukiFonts, IbukiRadius } from "@/constants/ibuki-theme";

import { AppSymbol, type SymbolName } from "./_internal";

export function PillButton({
  label,
  variant = "light",
  icon,
  onPress,
  style,
}: {
  label: string;
  variant?: "dark" | "light" | "accent" | "danger";
  icon?: SymbolName;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const isDark = variant === "dark";
  const isAccent = variant === "accent";
  const isDanger = variant === "danger";
  const tintColor =
    isDark || isAccent || isDanger ? IbukiColors.background : IbukiColors.ink;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [pressed && styles.pressed, style]}
    >
      <View
        style={[
          styles.pillButton,
          isDark && styles.pillButtonDark,
          isAccent && styles.pillButtonAccent,
          isDanger && styles.pillButtonDanger,
        ]}
      >
        <Text
          style={[
            styles.pillButtonText,
            (isDark || isAccent || isDanger) && styles.pillButtonTextLight,
          ]}
        >
          {label}
        </Text>
        {icon && <AppSymbol name={icon} size={18} tintColor={tintColor} />}
      </View>
    </Pressable>
  );
}

export function IconButton({
  icon,
  onPress,
  label,
}: {
  icon: SymbolName;
  onPress?: () => void;
  label?: string;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <View style={styles.iconButton}>
        <AppSymbol name={icon} size={20} tintColor={IbukiColors.ink} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.72,
  },
  pillButton: {
    alignItems: "center",
    backgroundColor: IbukiColors.surface,
    borderColor: IbukiColors.line,
    borderRadius: IbukiRadius.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: 4,
    justifyContent: "center",
    minHeight: 50,
    paddingHorizontal: 18,
  },
  pillButtonDark: {
    backgroundColor: IbukiColors.accentDeep,
    borderColor: IbukiColors.accentDeep,
  },
  pillButtonAccent: {
    backgroundColor: IbukiColors.good,
    borderColor: IbukiColors.good,
  },
  pillButtonDanger: {
    backgroundColor: IbukiColors.hot,
    borderColor: IbukiColors.hot,
  },
  pillButtonText: {
    color: IbukiColors.ink,
    fontFamily: IbukiFonts?.sansBold,
    fontSize: 14.5,
    fontWeight: "700",
  },
  pillButtonTextLight: {
    color: IbukiColors.background,
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: IbukiColors.surface,
    borderColor: IbukiColors.line,
    borderRadius: 19,
    borderWidth: 1,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
});
