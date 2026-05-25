import { router } from "expo-router";
import { ScrollView, StyleSheet, View, Pressable } from "react-native";

import {
  Heading,
  IbukiScreen,
  Kicker,
  PhotoBlock,
} from "@/components/ibuki-ui";
import { IbukiColors, IbukiSpacing } from "@/constants/ibuki-theme";
import { planterItems, getHobbyById, getGrowthStatus } from "@/data/ibuki";

export default function PlanterScreen() {
  function openPlanterDetail(sukiId: string) {
    router.push({
      pathname: "/planter/[id]",
      params: { id: sukiId },
    } as never);
  }

  return (
    <IbukiScreen withTabBar>
      <View style={styles.header}>
        <View>
          <Kicker>PLANTER · 育てている</Kicker>
          <Heading size="medium">今日のsuki{"\n"}たち</Heading>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      >
        {planterItems.map((item) => {
          const hobby = getHobbyById(item.sukiId);
          const growth = getGrowthStatus(item.sukiId);

          return (
            <Pressable
              key={item.id}
              onPress={() => openPlanterDetail(item.sukiId)}
              style={({ pressed }) => [
                styles.planterCard,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.cardContent}>
                <PhotoBlock
                  hobby={hobby}
                  height={120}
                  label={`Level ${growth.level}`}
                />
                <View style={styles.cardBody}>
                  <View style={styles.titleRow}>
                    <Heading size="small">{hobby.nameJa}</Heading>
                    <Kicker>L{growth.level}</Kicker>
                  </View>
                  <View style={styles.statsRow}>
                    <View style={styles.stat}>
                      <Kicker style={styles.statLabel}>アクション</Kicker>
                      <Heading size="small">{growth.actionCount}</Heading>
                    </View>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${growth.nextLevelProgressPercent}%`,
                          },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </IbukiScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: IbukiSpacing.md,
    paddingTop: IbukiSpacing.lg,
    paddingBottom: IbukiSpacing.md,
  },
  listContainer: {
    paddingHorizontal: IbukiSpacing.md,
    paddingBottom: IbukiSpacing.xl,
    gap: IbukiSpacing.md,
  },
  planterCard: {
    marginBottom: IbukiSpacing.sm,
  },
  pressed: {
    opacity: 0.7,
  },
  cardContent: {
    overflow: "hidden",
  },
  cardBody: {
    padding: IbukiSpacing.md,
    backgroundColor: IbukiColors.background,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: IbukiSpacing.sm,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: IbukiSpacing.md,
  },
  stat: {
    flex: 0,
  },
  statLabel: {
    marginBottom: IbukiSpacing.xs,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: IbukiColors.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: IbukiColors.success,
    borderRadius: 3,
  },
});
