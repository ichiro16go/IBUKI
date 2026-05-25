import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View, Alert } from "react-native";

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
import { useEncounterPreferences } from "@/state/encounter-preferences";

export default function HobbyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const hobby = getHobbyById(id);
  const [saved, setSaved] = useState(false);
  const { hideEncounter } = useEncounterPreferences();

  function markUninterested() {
    hideEncounter(hobby.id);
    router.replace("/encounters");
  }

  function handleSave() {
    setSaved((current) => !current);
    if (!saved) {
      Alert.alert("Bookmarkしました", `${hobby.nameJa}をbookmarkに追加しました`);
    }
  }

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
        <View style={styles.topBarSpacer} />
      </View>

      <PhotoBlock
        hobby={hobby}
        height={220}
        label={`${hobby.lastSeen}にすれ違い`}
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
        <Text style={styles.quoteMark}>&#34;</Text>
        <Text style={styles.quote}>{hobby.quote}</Text>
      </View>

      <View style={styles.infoGrid}>
        <View style={styles.infoCard}>
          <Kicker>HOW TO START</Kicker>
          <BodyText muted>{hobby.beginnerNote}</BodyText>
        </View>
      </View>

      <View style={styles.placeCard}>
        <Kicker>近くで体験できる場所</Kicker>
        <View style={styles.placeRow}>
          <View style={styles.placePin}>
            <Text style={styles.placePinIcon}>⌖</Text>
          </View>
          <View style={styles.placeInfo}>
            <Text style={styles.placeName}>渋谷ワークショップ</Text>
            <Text style={styles.placeDistance}>徒歩12分</Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <PillButton
          label="興味なし"
          variant="light"
          onPress={markUninterested}
          style={styles.actionShort}
        />
        <PillButton
          label={saved ? "★ 保存済み" : "☆ 保存する"}
          variant={saved ? "accent" : "dark"}
          onPress={handleSave}
          style={styles.actionWide}
        />
      </View>
    </IbukiScreen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  topBarSpacer: {
    height: 38,
    width: 38,
  },
  titleSection: {
    gap: IbukiSpacing.xs,
    marginTop: IbukiSpacing.md,
    marginBottom: IbukiSpacing.md,
  },
  subtitle: {
    color: IbukiColors.mid,
    fontFamily: IbukiFonts?.sansBold,
    fontSize: 12,
    fontWeight: "700",
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
    marginBottom: IbukiSpacing.lg,
  },
  quoteMark: {
    color: IbukiColors.accent,
    fontFamily: IbukiFonts?.sans,
    fontSize: 48,
    lineHeight: 52,
  },
  quote: {
    color: IbukiColors.ink,
    flex: 1,
    fontFamily: IbukiFonts?.sans,
    fontSize: 16,
    lineHeight: 24,
  },
  infoGrid: {
    marginBottom: IbukiSpacing.md,
  },
  infoCard: {
    backgroundColor: IbukiColors.surface,
    borderColor: IbukiColors.line,
    borderRadius: IbukiRadius.md,
    borderWidth: 1,
    padding: IbukiSpacing.md,
  },
  placeCard: {
    backgroundColor: IbukiColors.surface,
    borderColor: IbukiColors.line,
    borderRadius: IbukiRadius.md,
    borderWidth: 1,
    padding: IbukiSpacing.md,
    marginBottom: IbukiSpacing.lg,
  },
  placeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: IbukiSpacing.md,
    marginTop: IbukiSpacing.sm,
  },
  placePin: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: IbukiColors.accentTint,
    justifyContent: "center",
    alignItems: "center",
  },
  placePinIcon: {
    fontSize: 20,
    color: IbukiColors.accent,
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    color: IbukiColors.ink,
    fontFamily: IbukiFonts?.sansBold,
    fontSize: 14,
    fontWeight: "600",
  },
  placeDistance: {
    color: IbukiColors.mid,
    fontFamily: IbukiFonts?.sans,
    fontSize: 12,
  },
  actions: {
    flexDirection: "row",
    gap: IbukiSpacing.sm,
  },
  actionShort: {
    flex: 0.9,
  },
  actionWide: {
    flex: 1.25,
  },
});
