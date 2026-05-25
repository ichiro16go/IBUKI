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
import { getHobbyById, planterItems, PlanterItem } from "@/data/ibuki";

type ScreenSource = "encounters" | "bookmark";

export default function HobbyDetailScreen() {
  const { id, from } = useLocalSearchParams<{ id: string; from?: string }>();
  const hobby = getHobbyById(id);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isPlanted, setIsPlanted] = useState(false);

  const source: ScreenSource = (from as ScreenSource) || "encounters";
  const isFromEncounters = source === "encounters";

  const handlePrimaryAction = () => {
    if (isFromEncounters) {
      // Bookmark action
      setIsBookmarked(!isBookmarked);
      if (!isBookmarked) {
        // TODO: Call API to add to bookmarks
        Alert.alert("Bookmarkしました", `${hobby.nameJa}をbookmarkに追加しました`);
      }
    } else {
      // Plant action
      setIsPlanted(!isPlanted);
      if (!isPlanted) {
        // TODO: Call API to add to planter
        const newPlanterItem: PlanterItem = {
          id: `planter-${Date.now()}`,
          sukiId: hobby.id,
          startDate: new Date().toISOString().split("T")[0],
          level: 1,
          actionCount: 0,
          lastActionDate: new Date().toISOString().split("T")[0],
        };
        planterItems.push(newPlanterItem);
        Alert.alert("種を植えました", `${hobby.nameJa}をplanterに追加しました`);
      }
    }
  };

  const primaryButtonLabel = isFromEncounters
    ? isBookmarked
      ? "✓ Bookmarkした"
      : "Bookmarkする"
    : isPlanted
      ? "✓ 植えた"
      : "種を植える";

  return (
    <IbukiScreen>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 80 + TabBarHeight },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
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
            <Kicker>NO. {hobby.number} · DETAIL</Kicker>
            <IconButton
              icon={{
                ios: "square.and.arrow.up",
                android: "share",
                web: "square.and.arrow.up",
              }}
            />
          </View>

          {/* Photo */}
          <PhotoBlock hobby={hobby} height={220} label={hobby.number} />

          {/* Title Section */}
          <View style={styles.titleSection}>
            <Kicker>DISCOVER</Kicker>
            <Heading size="medium">{hobby.nameJa}</Heading>
            <Text style={styles.subtitle}>{hobby.nameEn}</Text>
            <View style={styles.tagRow}>
              {hobby.tags.map((tag) => (
                <Chip key={tag} label={tag} />
              ))}
            </View>
          </View>

          {/* Quote */}
          <View style={styles.quoteBox}>
            <Text style={styles.quoteMark}>&#34;</Text>
            <Text style={styles.quote}>{hobby.quote}</Text>
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <BodyText>{hobby.intro}</BodyText>
          </View>

          {/* How to Start Steps */}
          <View style={styles.stepsSection}>
            <Kicker>HOW TO START</Kicker>
            <View style={styles.stepsList}>
              {hobby.howToStart.map((step, index) => (
                <View key={index} style={styles.stepItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
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
    marginBottom: IbukiSpacing.md,
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
    minHeight: 44,
  },
  secondaryButton: {
    flex: 0.6,
    backgroundColor: IbukiColors.surface,
    borderWidth: 1,
    borderColor: IbukiColors.border,
  },
  secondaryButtonText: {
    color: IbukiColors.text,
    fontFamily: IbukiFonts?.sans,
    fontSize: 14,
    fontWeight: "600",
  },
  primaryButton: {
    flex: 1,
    backgroundColor: IbukiColors.primary,
  },
  primaryButtonActive: {
    backgroundColor: IbukiColors.success,
  },
  primaryButtonText: {
    color: IbukiColors.background,
    fontFamily: IbukiFonts?.sansBold,
    fontSize: 14,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.7,
  },
});
