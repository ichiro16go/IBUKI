import type { ReactNode } from "react";
import { StyleSheet, Text, type StyleProp, type TextStyle } from "react-native";

import { IbukiColors, IbukiFonts } from "@/constants/ibuki-theme";

export function Kicker({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
}) {
  return <Text style={[styles.kicker, style]}>{children}</Text>;
}

export function Heading({
  children,
  size = "large",
  style,
}: {
  children: ReactNode;
  size?: "large" | "medium" | "small";
  style?: StyleProp<TextStyle>;
}) {
  return (
    <Text
      style={[
        styles.heading,
        size === "medium" && styles.headingMedium,
        size === "small" && styles.headingSmall,
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function BodyText({
  children,
  muted = false,
}: {
  children: ReactNode;
  muted?: boolean;
}) {
  return (
    <Text style={[styles.bodyText, muted && styles.mutedText]}>{children}</Text>
  );
}

const styles = StyleSheet.create({
  kicker: {
    color: IbukiColors.mid,
    fontFamily: IbukiFonts?.mono,
    fontSize: 10.5,
    fontWeight: "500",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  heading: {
    color: IbukiColors.ink,
    fontFamily: IbukiFonts?.sansBold,
    fontSize: 34,
    fontWeight: "700",
    lineHeight: 42,
    letterSpacing: 0,
  },
  headingMedium: {
    fontSize: 26,
    lineHeight: 32,
  },
  headingSmall: {
    fontSize: 22,
    lineHeight: 28,
  },
  bodyText: {
    color: IbukiColors.inkSoft,
    fontFamily: IbukiFonts?.sansRegular,
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 23,
  },
  mutedText: {
    color: IbukiColors.mid,
  },
});
