import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  IbukiColors,
  IbukiFonts,
  IbukiRadius,
  IbukiShadow,
  IbukiSpacing,
} from "@/constants/ibuki-theme";
import type { EntryStep, Hobby, PhotoTone } from "@/data/ibuki";

import { AppSymbol } from "./_internal";
import { Heading, Kicker } from "./typography";

const photoToneColors: Record<
  PhotoTone,
  { base: string; accent: string; ink: string }
> = {
  warm: { base: "#E8D9C5", accent: "#C7A07A", ink: "#8E6A4C" },
  dawn: { base: "#DCE4ED", accent: "#B7C3D0", ink: "#6F8398" },
  dusk: { base: "#E8C9B0", accent: "#B68B72", ink: "#5F4137" },
  night: { base: "#4A4E62", accent: "#2F2E3A", ink: "#F7F1E6" },
  clay: { base: "#DDC4A8", accent: "#BB8E6A", ink: "#7A5238" },
  moss: { base: "#D2D9C2", accent: "#95A77B", ink: "#5A6B4A" },
  ink: { base: "#D0CCC2", accent: "#807A6E", ink: "#F7F1E6" },
  mint: { base: "#DDE9DD", accent: "#A4C2B0", ink: "#5B7D72" },
  paper: { base: "#F2EEE2", accent: "#DDD6C2", ink: "#332F28" },
};

export function PhotoBlock({
  hobby,
  height = 170,
  label,
}: {
  hobby: Hobby;
  height?: number;
  label?: string;
}) {
  const tone = photoToneColors[hobby.photoTone];

  return (
    <View style={[styles.photoBlock, { height, backgroundColor: tone.base }]}>
      {hobby.image ? (
        <>
          <Image
            source={hobby.image}
            style={styles.photoImage}
            contentFit="cover"
            transition={160}
          />
          <View style={styles.photoScrim} />
        </>
      ) : (
        <>
          <View
            style={[styles.photoCircleLarge, { backgroundColor: tone.accent }]}
          />
          <View style={[styles.photoCircleSmall, { borderColor: tone.ink }]} />
        </>
      )}
      {label && (
        <View style={styles.photoLabel}>
          <Text style={styles.photoLabelText}>{label}</Text>
        </View>
      )}
    </View>
  );
}

export function HobbyCard({
  hobby,
  compact = false,
  onPress,
}: {
  hobby: Hobby;
  compact?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <View style={[styles.hobbyCard, compact && styles.hobbyCardCompact]}>
        <PhotoBlock
          hobby={hobby}
          height={compact ? 92 : 138}
          label={`NO. ${hobby.number}`}
        />
        <View style={styles.hobbyCardBody}>
          <View style={styles.rowBetween}>
            <Kicker>NO. {hobby.number}</Kicker>
            <AppSymbol
              name={{ ios: "heart", android: "favorite_border", web: "heart" }}
              size={14}
              tintColor={IbukiColors.hot}
            />
          </View>
          <Text style={styles.cardTitle}>{hobby.nameJa}</Text>
          <Text style={styles.cardSubtitle}>{hobby.nameEn}</Text>
          {!compact && (
            <View style={styles.tagRow}>
              {hobby.tags.slice(0, 2).map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

export function EncounterCard({
  hobby,
  time,
  context,
  isNew,
  otherSukiTitles,
  fromUserProfile,
  onPress,
}: {
  hobby: Hobby;
  time: string;
  context: string;
  isNew: boolean;
  otherSukiTitles?: string[];
  fromUserProfile?: { ageRange: string | null; genderLabel: string | null; isProfilePublic: boolean } | null;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <View style={styles.encounterCard}>
        <View style={styles.encounterMeta}>
          <View style={styles.liveDot} />
          <Kicker>
            {isNew ? "NEW" : "PASS"} · {time}
          </Kicker>
        </View>
        <View style={styles.encounterContent}>
          <PhotoBlock hobby={hobby} height={116} label={context} />
          <View style={styles.encounterCopy}>
            <Heading size="small">{hobby.nameJa}</Heading>
            <Text style={styles.cardSubtitle}>
              {hobby.nameEn} · No. {hobby.number}
            </Text>
            <Text style={styles.quoteText}>"{hobby.quote}"</Text>
            <View style={styles.tagRow}>
              {hobby.tags.slice(0, 3).map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
            {fromUserProfile?.isProfilePublic &&
              (fromUserProfile.ageRange ?? fromUserProfile.genderLabel) ? (
              <View style={styles.userAttributeRow}>
                <Text style={styles.userAttributeText}>
                  {[fromUserProfile.ageRange, fromUserProfile.genderLabel]
                    .filter(Boolean)
                    .join(" · ")}
                </Text>
              </View>
            ) : null}
            {otherSukiTitles && otherSukiTitles.length > 0 && (
              <View style={styles.otherSukiSection}>
                <Text style={styles.otherSukiLabel}>この人の他のsuki</Text>
                <View style={styles.tagRow}>
                  {otherSukiTitles.slice(0, 3).map((title) => (
                    <View key={title} style={styles.otherSukiTag}>
                      <Text style={styles.otherSukiTagText}>{title}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export function StatsRow() {
  return (
    <View style={styles.statsRow}>
      <Stat value="7" label="件 · TODAY" />
      <Stat value="2.4km" label="歩いた距離" />
      <Stat value="1" label="新しい趣味" />
      <Text style={styles.dateText}>5/24</Text>
    </View>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Kicker>{label}</Kicker>
    </View>
  );
}

export function EntryStepCard({
  step,
  active,
  onPress,
}: {
  step: EntryStep;
  active: boolean;
  onPress: () => void;
}) {
  const done = step.status === "done";
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <View style={[styles.entryStep, active && styles.entryStepActive]}>
        <View
          style={[
            styles.stepMark,
            done && styles.stepMarkDone,
            active && styles.stepMarkActive,
          ]}
        >
          <Text
            style={[
              styles.stepMarkText,
              done && styles.stepMarkTextDone,
              active && styles.stepMarkTextActive,
            ]}
          >
            {done ? "✓" : active ? "•" : "○"}
          </Text>
        </View>
        <View style={styles.stepCopy}>
          <Text style={styles.stepTitle}>{step.title}</Text>
          <Text style={styles.cardSubtitle}>{step.description}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.72,
  },
  rowBetween: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  photoBlock: {
    borderRadius: IbukiRadius.md,
    overflow: "hidden",
    position: "relative",
  },
  photoImage: {
    height: "100%",
    width: "100%",
  },
  photoScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(20,19,15,0.06)",
  },
  photoCircleLarge: {
    borderRadius: 140,
    height: 230,
    opacity: 0.42,
    position: "absolute",
    right: -86,
    top: -62,
    width: 230,
  },
  photoCircleSmall: {
    borderRadius: 90,
    borderWidth: 1,
    height: 118,
    opacity: 0.22,
    position: "absolute",
    left: -34,
    top: 36,
    width: 118,
  },
  photoLabel: {
    backgroundColor: "rgba(255,255,255,0.78)",
    borderRadius: 4,
    left: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
    position: "absolute",
    top: 10,
  },
  photoLabelText: {
    color: IbukiColors.ink,
    fontFamily: IbukiFonts?.monoBold,
    fontSize: 9.5,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  hobbyCard: {
    backgroundColor: IbukiColors.surface,
    borderColor: IbukiColors.line,
    borderRadius: IbukiRadius.md,
    borderWidth: 1,
    overflow: "hidden",
    ...IbukiShadow.soft,
  },
  hobbyCardCompact: {
    minHeight: 210,
  },
  hobbyCardBody: {
    gap: IbukiSpacing.xs,
    padding: IbukiSpacing.sm,
  },
  cardTitle: {
    color: IbukiColors.ink,
    fontFamily: IbukiFonts?.sans,
    fontSize: 20,
    fontWeight: "500",
    lineHeight: 25,
  },
  cardSubtitle: {
    color: IbukiColors.mid,
    fontFamily: IbukiFonts?.sans,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 17,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tag: {
    backgroundColor: IbukiColors.accentTint,
    borderColor: IbukiColors.line,
    borderRadius: IbukiRadius.pill,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    color: IbukiColors.inkSoft,
    fontFamily: IbukiFonts?.sansBold,
    fontSize: 11,
    fontWeight: "600",
  },
  encounterCard: {
    backgroundColor: IbukiColors.surface,
    borderColor: IbukiColors.line,
    borderRadius: IbukiRadius.lg,
    borderWidth: 1,
    gap: IbukiSpacing.sm,
    padding: IbukiSpacing.md,
    ...IbukiShadow.card,
  },
  encounterMeta: {
    alignItems: "center",
    flexDirection: "row",
    gap: IbukiSpacing.xs,
  },
  liveDot: {
    backgroundColor: IbukiColors.hot,
    borderRadius: 5,
    height: 9,
    width: 9,
  },
  encounterContent: {
    gap: IbukiSpacing.md,
  },
  encounterCopy: {
    gap: IbukiSpacing.xs,
  },
  quoteText: {
    color: IbukiColors.inkSoft,
    fontFamily: IbukiFonts?.sans,
    fontSize: 15,
    lineHeight: 23,
  },
  userAttributeRow: {
    marginTop: IbukiSpacing.xs,
  },
  userAttributeText: {
    color: IbukiColors.mid,
    fontFamily: IbukiFonts?.sansBold,
    fontSize: 11,
  },
  otherSukiSection: {
    borderTopColor: IbukiColors.line,
    borderTopWidth: 1,
    marginTop: IbukiSpacing.xs,
    paddingTop: IbukiSpacing.xs,
  },
  otherSukiLabel: {
    color: IbukiColors.mid,
    fontFamily: IbukiFonts?.sans,
    fontSize: 10,
    marginBottom: IbukiSpacing.xs,
  },
  otherSukiTag: {
    backgroundColor: IbukiColors.surfaceMuted,
    borderColor: IbukiColors.line,
    borderRadius: IbukiRadius.pill,
    borderWidth: 1,
    paddingHorizontal: IbukiSpacing.sm,
    paddingVertical: 2,
  },
  otherSukiTagText: {
    color: IbukiColors.inkSoft,
    fontFamily: IbukiFonts?.sans,
    fontSize: 10,
  },
  statsRow: {
    alignItems: "center",
    backgroundColor: IbukiColors.surface,
    borderColor: IbukiColors.line,
    borderRadius: IbukiRadius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: IbukiSpacing.md,
    padding: IbukiSpacing.md,
  },
  statItem: {
    flex: 1,
    gap: 3,
  },
  statValue: {
    color: IbukiColors.ink,
    fontFamily: IbukiFonts?.sans,
    fontSize: 24,
    fontWeight: "500",
  },
  dateText: {
    color: IbukiColors.mid,
    fontFamily: IbukiFonts?.monoBold,
    fontSize: 11,
    fontWeight: "700",
  },
  entryStep: {
    alignItems: "center",
    backgroundColor: IbukiColors.surface,
    borderColor: IbukiColors.line,
    borderRadius: IbukiRadius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: IbukiSpacing.md,
    minHeight: 58,
    padding: IbukiSpacing.sm,
  },
  entryStepActive: {
    borderColor: IbukiColors.good,
    backgroundColor: IbukiColors.accentTint,
  },
  stepMark: {
    alignItems: "center",
    borderColor: IbukiColors.line,
    borderRadius: 17,
    borderWidth: 1,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  stepMarkDone: {
    backgroundColor: IbukiColors.good,
    borderColor: IbukiColors.good,
  },
  stepMarkActive: {
    backgroundColor: IbukiColors.accentDeep,
    borderColor: IbukiColors.accentDeep,
  },
  stepMarkText: {
    color: IbukiColors.mid,
    fontSize: 16,
    fontWeight: "700",
  },
  stepMarkTextDone: {
    color: IbukiColors.ink,
  },
  stepMarkTextActive: {
    color: IbukiColors.surface,
  },
  stepCopy: {
    flex: 1,
    gap: 3,
  },
  stepTitle: {
    color: IbukiColors.ink,
    fontFamily: IbukiFonts?.sansBold,
    fontSize: 14,
    fontWeight: "700",
  },
});
