import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import {
  BodyText,
  Chip,
  Heading,
  IbukiScreen,
  IconButton,
  Kicker,
  PhotoBlock,
  PillButton,
} from "@/components/ibuki-ui";
import {
  IbukiColors,
  IbukiFonts,
  IbukiRadius,
  IbukiSpacing,
} from "@/constants/ibuki-theme";
import { getHobbyById } from "@/data/ibuki";

export default function HobbyDetailScreen() {
  const { id } = useLocalSearchParams();
  const hobby = getHobbyById(id);
  const [interested, setInterested] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <IbukiScreen>
      <View style={styles.topBar}>
        <IconButton
          label="Back"
          icon={{
            ios: "chevron.left",
            android: "arrow_back",
            web: "chevron.left",
          }}
          onPress={() => router.back()}
        />
        <Kicker>NO. {hobby.number} · CARD DETAIL</Kicker>
        <IconButton
          icon={{
            ios: "square.and.arrow.up",
            android: "share",
            web: "square.and.arrow.up",
          }}
        />
      </View>

      <PhotoBlock
        hobby={hobby}
        height={220}
        label={`${hobby.lastSeen}にすれ違い · ${hobby.distance}`}
      />

      <View style={styles.titleSection}>
        <Kicker>A HOBBY YOU DIDN&apos;T KNOW</Kicker>
        <Heading size="medium">{hobby.nameJa}</Heading>
        <Text style={styles.subtitle}>
          {hobby.nameEn} · No. {hobby.number}
        </Text>
        <View style={styles.tagRow}>
          {hobby.tags.map((tag) => (
            <Chip key={tag} label={tag} />
          ))}
          <Chip label="ひとりで始めやすい" />
        </View>
      </View>

      <View style={styles.quoteBox}>
        <Text style={styles.quoteMark}>“</Text>
        <Text style={styles.quote}>{hobby.quote}</Text>
      </View>

      <View style={styles.infoGrid}>
        <View style={styles.infoCard}>
          <Kicker>HOW TO START</Kicker>
          <BodyText muted>{hobby.beginnerNote}</BodyText>
        </View>
        <View style={styles.infoCard}>
          <Kicker>NEARBY</Kicker>
          <BodyText muted>{hobby.nearbyPlace}</BodyText>
        </View>
      </View>

      <View style={styles.placeCard}>
        <Kicker>近くで体験できる場所</Kicker>
        <View style={styles.placeRow}>
          <View style={styles.placePin}>
            <Text style={styles.placePinIcon}>⌖</Text>
          </View>
          <View style={styles.placeCopy}>
            <Text style={styles.placeTitle}>{hobby.nearbyPlace}</Text>
            <Text style={styles.subtitle}>はじめて歓迎 · 予約可</Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <PillButton
          label={interested ? "気になる中" : "気になる"}
          variant={interested ? "accent" : "light"}
          onPress={() => setInterested((current) => !current)}
          style={styles.actionShort}
        />
        <PillButton
          label={saved ? "保存済み" : "保存する"}
          variant="dark"
          onPress={() => setSaved((current) => !current)}
          style={styles.actionWide}
        />
        <IconButton
          icon={{ ios: "ellipsis", android: "more_horiz", web: "ellipsis" }}
        />
      </View>
      <Text style={styles.footerLink}>入口を見る · 体験スポットを探す</Text>
    </IbukiScreen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  titleSection: {
    gap: IbukiSpacing.xs,
  },
  subtitle: {
    color: IbukiColors.mid,
    fontFamily: IbukiFonts?.sansBold,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 18,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: IbukiSpacing.xs,
    marginTop: IbukiSpacing.xs,
  },
  quoteBox: {
    backgroundColor: IbukiColors.surface,
    borderColor: IbukiColors.line,
    borderRadius: IbukiRadius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: IbukiSpacing.sm,
    padding: IbukiSpacing.lg,
  },
  quoteMark: {
    color: IbukiColors.accent,
    fontFamily: IbukiFonts?.serif,
    fontSize: 48,
    lineHeight: 52,
  },
  quote: {
    color: IbukiColors.ink,
    flex: 1,
    fontFamily: IbukiFonts?.serif,
    fontSize: 18,
    lineHeight: 28,
  },
  infoGrid: {
    flexDirection: "row",
    gap: IbukiSpacing.sm,
  },
  infoCard: {
    backgroundColor: IbukiColors.surface,
    borderColor: IbukiColors.line,
    borderRadius: IbukiRadius.md,
    borderWidth: 1,
    flex: 1,
    gap: IbukiSpacing.xs,
    padding: IbukiSpacing.md,
  },
  placeCard: {
    backgroundColor: IbukiColors.surfaceWarm,
    borderColor: IbukiColors.line,
    borderRadius: IbukiRadius.md,
    borderWidth: 1,
    gap: IbukiSpacing.md,
    padding: IbukiSpacing.md,
  },
  placeRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: IbukiSpacing.md,
  },
  placePin: {
    alignItems: "center",
    backgroundColor: IbukiColors.accentTint,
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  placePinIcon: {
    color: IbukiColors.accentDeep,
    fontSize: 19,
    fontWeight: "700",
  },
  placeCopy: {
    flex: 1,
  },
  placeTitle: {
    color: IbukiColors.ink,
    fontFamily: IbukiFonts?.sansBold,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20,
  },
  actions: {
    alignItems: "center",
    flexDirection: "row",
    gap: IbukiSpacing.xs,
  },
  actionShort: {
    flex: 0.9,
  },
  actionWide: {
    flex: 1.25,
  },
  footerLink: {
    color: IbukiColors.mid,
    fontFamily: IbukiFonts?.monoBold,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    textAlign: "center",
  },
});
