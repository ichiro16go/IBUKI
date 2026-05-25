import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Alert,
} from "react-native";

import {
  BodyText,
  Chip,
  Heading,
  IbukiScreen,
  IconButton,
  Kicker,
  PhotoBlock,
} from "@/components/ibuki-ui";
import {
  IbukiColors,
  IbukiFonts,
  IbukiRadius,
  IbukiSpacing,
  TabBarHeight,
} from "@/constants/ibuki-theme";
import { getHobbyById } from "@/data/ibuki";
import { useEncounterPreferences } from "@/state/encounter-preferences";

export default function HobbyDetailScreen() {
  const { id, from } = useLocalSearchParams<{ id: string; from?: string }>();
  const hobby = getHobbyById(id);
  const [saved, setSaved] = useState(false);
  const { hideEncounter } = useEncounterPreferences();

  function markUninterested() {
    hideEncounter(hobby.id);
    router.replace("/encounters");
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

      {/* Quote */}
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

          {/* Beginner Note */}
          <View style={styles.noteSection}>
            <Kicker>GETTING STARTED</Kicker>
            <BodyText muted>{hobby.beginnerNote}</BodyText>
          </View>
        </ScrollView>

        {/* Fixed Bottom Action Bar */}
        <View style={[styles.actionBar, { bottom: TabBarHeight }]}>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.secondaryButton,
              pressed && styles.pressed,
            ]}
            onPress={() => router.back()}
          >
            <Text style={styles.secondaryButtonText}>Bye</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.primaryButton,
              isBookmarked || isPlanted ? styles.primaryButtonActive : {},
              pressed && styles.pressed,
            ]}
            onPress={handlePrimaryAction}
          >
            <Text style={styles.primaryButtonText}>{primaryButtonLabel}</Text>
          </Pressable>
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
          label={saved ? "保存済み" : "保存する"}
          variant="dark"
          onPress={() => setSaved((current) => !current)}
          style={styles.actionWide}
        />
      </View>
    </IbukiScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: IbukiSpacing.md,
    paddingTop: 0,
  },
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
    color: IbukiColors.muted,
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
    borderColor: IbukiColors.border,
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
    color: IbukiColors.text,
    flex: 1,
    fontFamily: IbukiFonts?.sans,
    fontSize: 16,
    lineHeight: 24,
  },
  descriptionSection: {
    marginBottom: IbukiSpacing.lg,
  },
  stepsSection: {
    marginBottom: IbukiSpacing.lg,
  },
  stepsList: {
    gap: IbukiSpacing.md,
    marginTop: IbukiSpacing.md,
  },
  stepItem: {
    flexDirection: "row",
    gap: IbukiSpacing.md,
    alignItems: "flex-start",
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: IbukiColors.accent,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  stepNumberText: {
    color: IbukiColors.background,
    fontFamily: IbukiFonts?.sansBold,
    fontSize: 16,
    fontWeight: "700",
  },
  stepText: {
    flex: 1,
    color: IbukiColors.text,
    fontFamily: IbukiFonts?.sans,
    fontSize: 14,
    lineHeight: 20,
    paddingTop: IbukiSpacing.xs,
  },
  noteSection: {
    backgroundColor: IbukiColors.surface,
    borderColor: IbukiColors.border,
    borderRadius: IbukiRadius.md,
    borderWidth: 1,
    padding: IbukiSpacing.md,
    marginBottom: IbukiSpacing.lg,
  },
  actionBar: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: IbukiColors.background,
    borderTopWidth: 1,
    borderTopColor: IbukiColors.border,
    flexDirection: "row",
    gap: IbukiSpacing.sm,
    paddingHorizontal: IbukiSpacing.md,
    paddingVertical: IbukiSpacing.md,
  },
  actionButton: {
    paddingHorizontal: IbukiSpacing.md,
    paddingVertical: IbukiSpacing.sm,
    borderRadius: IbukiRadius.md,
    justifyContent: "center",
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
});
