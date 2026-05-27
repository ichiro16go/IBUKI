import { StyleSheet, Text, View, type ViewStyle } from "react-native";

import {
  IbukiColors,
  IbukiFonts,
  IbukiRadius,
  IbukiShadow,
  IbukiSpacing,
} from "@/constants/ibuki-theme";
import type { Hobby } from "@/data/ibuki";

import { AppSymbol } from "./_internal";

const radarBubblePositions: ViewStyle[] = [
  { top: 74, left: 64 },
  { top: 58, right: 52 },
  { top: 190, left: 36 },
  { top: 222, right: 42 },
  { bottom: 78, left: 142 },
];

export function RadarView({ hobbies }: { hobbies: Hobby[] }) {
  return (
    <View style={styles.radarCard}>
      <View style={styles.radarGrid}>
        <View style={styles.radarRingOuter} />
        <View style={styles.radarRingMiddle} />
        <View style={styles.radarRingInner} />
        <Text style={[styles.radarAxis, styles.radarNorth]}>N</Text>
        <Text style={[styles.radarAxis, styles.radarEast]}>E</Text>
        <Text style={[styles.radarAxis, styles.radarSouth]}>S</Text>
        <Text style={[styles.radarAxis, styles.radarWest]}>W</Text>
        <View style={styles.youPin}>
          <Text style={styles.youPinText}>YOU</Text>
        </View>
        {hobbies.slice(0, 5).map((hobby, index) => (
          <View
            key={hobby.id}
            style={[styles.radarBubble, radarBubblePositions[index]]}
          >
            <Text style={styles.radarBubbleTitle}>{hobby.nameJa}</Text>
            <Text style={styles.radarBubbleMeta}>{hobby.distance}</Text>
          </View>
        ))}
      </View>
      <View style={styles.radarFooter}>
        <AppSymbol
          name={{ ios: "sparkles", android: "auto_awesome", web: "sparkles" }}
          size={16}
          tintColor={IbukiColors.accentDeep}
        />
        <View>
          <Text style={styles.radarFooterTitle}>5件の新しい趣味</Text>
          <Text style={styles.radarFooterSub}>近くで揺れている趣味を表示中</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  radarCard: {
    backgroundColor: IbukiColors.surface,
    borderColor: IbukiColors.line,
    borderRadius: IbukiRadius.lg,
    borderWidth: 1,
    gap: IbukiSpacing.md,
    padding: IbukiSpacing.sm,
    ...IbukiShadow.card,
  },
  radarGrid: {
    backgroundColor: IbukiColors.mapLand,
    borderRadius: IbukiRadius.md,
    height: 430,
    overflow: "hidden",
    position: "relative",
  },
  radarRingOuter: {
    borderColor: IbukiColors.line,
    borderRadius: 180,
    borderWidth: 1,
    height: 330,
    left: 30,
    position: "absolute",
    top: 50,
    width: 330,
  },
  radarRingMiddle: {
    borderColor: IbukiColors.line,
    borderRadius: 124,
    borderWidth: 1,
    height: 235,
    left: 78,
    position: "absolute",
    top: 98,
    width: 235,
  },
  radarRingInner: {
    borderColor: IbukiColors.line,
    borderRadius: 72,
    borderWidth: 1,
    height: 140,
    left: 126,
    position: "absolute",
    top: 146,
    width: 140,
  },
  radarAxis: {
    color: IbukiColors.mid,
    fontFamily: IbukiFonts?.mono,
    fontSize: 10,
    fontWeight: "700",
    position: "absolute",
  },
  radarNorth: { left: "50%", top: 14 },
  radarEast: { right: 15, top: "50%" },
  radarSouth: { bottom: 14, left: "50%" },
  radarWest: { left: 15, top: "50%" },
  youPin: {
    alignItems: "center",
    backgroundColor: IbukiColors.accentDeep,
    borderRadius: IbukiRadius.pill,
    left: "44%",
    paddingHorizontal: 10,
    paddingVertical: 5,
    position: "absolute",
    top: "48%",
  },
  youPinText: {
    color: IbukiColors.background,
    fontFamily: IbukiFonts?.monoBold,
    fontSize: 10,
    fontWeight: "700",
  },
  radarBubble: {
    backgroundColor: "rgba(247,243,234,0.92)",
    borderColor: IbukiColors.line,
    borderRadius: IbukiRadius.md,
    borderWidth: 1,
    padding: IbukiSpacing.xs,
    position: "absolute",
  },
  radarBubbleTitle: {
    color: IbukiColors.ink,
    fontFamily: IbukiFonts?.sansBold,
    fontSize: 12,
    fontWeight: "700",
  },
  radarBubbleMeta: {
    color: IbukiColors.mid,
    fontFamily: IbukiFonts?.mono,
    fontSize: 10,
    marginTop: 2,
  },
  radarFooter: {
    alignItems: "center",
    backgroundColor: IbukiColors.accentTint,
    borderRadius: IbukiRadius.md,
    flexDirection: "row",
    gap: IbukiSpacing.md,
    padding: IbukiSpacing.md,
  },
  radarFooterTitle: {
    color: IbukiColors.ink,
    fontFamily: IbukiFonts?.sansBold,
    fontSize: 14,
    fontWeight: "700",
  },
  radarFooterSub: {
    color: IbukiColors.mid,
    fontFamily: IbukiFonts?.sans,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 17,
  },
});
