import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import {
  BodyText,
  EntryStepCard,
  Heading,
  IbukiScreen,
  IconButton,
  Kicker,
  PhotoBlock,
  PillButton,
  TopBar,
} from "@/components/ibuki-ui";
import { IbukiColors, IbukiFonts, IbukiRadius, IbukiSpacing } from "@/constants/ibuki-theme";
import { entrySteps, hobbies } from "@/data/ibuki";

export default function EntryScreen() {
  const [activeStepId, setActiveStepId] = useState("book");
  const togei = hobbies.find((hobby) => hobby.id === "togei") ?? hobbies[1];
  const activeIndex = entrySteps.findIndex((step) => step.id === activeStepId);

  return (
    <IbukiScreen withTabBar>
      <TopBar
        kicker="ENTRY · 入口"
        right={<IconButton icon={{ ios: "bookmark", android: "bookmark_border", web: "bookmark" }} />}
      />

      <View style={styles.heroCard}>
        <PhotoBlock hobby={togei} height={220} label="togei studio" />
        <View style={styles.heroCopy}>
          <Kicker>START FROM HERE · NO. {togei.number}</Kicker>
          <Heading size="medium">陶芸Togei</Heading>
          <BodyText muted>{togei.intro}</BodyText>
        </View>
      </View>

      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Kicker>1 / 4 STEPS</Kicker>
          <Kicker>DAY 07</Kicker>
        </View>
        <View style={styles.growthStage}>
          <View style={styles.pot} />
          <View style={styles.stem} />
          <View style={[styles.leaf, styles.leafLeft]} />
          <View style={[styles.leaf, styles.leafRight]} />
          <Text style={styles.stageLabel}>SPROUT · めばえ</Text>
        </View>
      </View>

      <View style={styles.stepsHeader}>
        <Kicker>タップして進める</Kicker>
        <Text style={styles.remainingText}>あと {Math.max(0, 4 - activeIndex - 1)} ステップで満開</Text>
      </View>
      <View style={styles.steps}>
        {entrySteps.map((step) => (
          <EntryStepCard
            key={step.id}
            step={step}
            active={step.id === activeStepId}
            onPress={() => setActiveStepId(step.id)}
          />
        ))}
      </View>

      <View style={styles.actions}>
        <PillButton label="体験を探す" variant="dark" style={styles.actionButton} />
        <PillButton
          label="初心者ガイドを読む"
          icon={{ ios: "arrow.up.right", android: "open_in_new", web: "arrow.up.right" }}
          style={styles.actionButtonWide}
        />
      </View>
    </IbukiScreen>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: IbukiColors.surface,
    borderColor: IbukiColors.line,
    borderRadius: IbukiRadius.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  heroCopy: {
    gap: IbukiSpacing.xs,
    padding: IbukiSpacing.lg,
  },
  progressCard: {
    backgroundColor: IbukiColors.surface,
    borderColor: IbukiColors.line,
    borderRadius: IbukiRadius.lg,
    borderWidth: 1,
    padding: IbukiSpacing.sm,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: IbukiSpacing.sm,
  },
  growthStage: {
    alignItems: "center",
    backgroundColor: IbukiColors.surfaceWarm,
    borderRadius: IbukiRadius.md,
    height: 240,
    justifyContent: "center",
    overflow: "hidden",
  },
  pot: {
    backgroundColor: IbukiColors.hot,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    height: 48,
    marginTop: 108,
    width: 90,
  },
  stem: {
    backgroundColor: IbukiColors.good,
    borderRadius: 4,
    height: 110,
    position: "absolute",
    top: 74,
    width: 8,
  },
  leaf: {
    backgroundColor: IbukiColors.good,
    borderBottomLeftRadius: 28,
    borderTopRightRadius: 28,
    height: 44,
    position: "absolute",
    top: 102,
    width: 64,
  },
  leafLeft: {
    right: "50%",
    transform: [{ rotate: "-22deg" }],
  },
  leafRight: {
    left: "50%",
    transform: [{ rotate: "22deg" }],
  },
  stageLabel: {
    color: IbukiColors.mid,
    fontFamily: IbukiFonts?.monoBold,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    position: "absolute",
    top: IbukiSpacing.md,
  },
  stepsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  remainingText: {
    color: IbukiColors.mid,
    fontFamily: IbukiFonts?.sansBold,
    fontSize: 12,
    fontWeight: "700",
  },
  steps: {
    gap: IbukiSpacing.xs,
  },
  actions: {
    flexDirection: "row",
    gap: IbukiSpacing.xs,
  },
  actionButton: {
    flex: 0.9,
  },
  actionButtonWide: {
    flex: 1.35,
  },
});
