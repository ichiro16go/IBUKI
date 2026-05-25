import { router } from "expo-router";
import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import {
  Heading,
  IbukiScreen,
  Kicker,
  PhotoBlock,
} from "@/components/ibuki-ui";
import { IbukiColors, IbukiRadius, IbukiSpacing } from "@/constants/ibuki-theme";
import { useAuth } from "@/contexts/auth";
import { fetchPlanterFeed, type PlanterFeedItem } from "@/lib/planter";

export default function PlanterScreen() {
  const { user } = useAuth();
  const [planterItems, setPlanterItems] = useState<PlanterFeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPlanterItems = useCallback(async () => {
    if (!user?.id) {
      setPlanterItems([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const nextPlanterItems = await fetchPlanterFeed(user.id);
      setPlanterItems(nextPlanterItems);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "planterの取得に失敗しました",
      );
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      void loadPlanterItems();
    }, [loadPlanterItems]),
  );

  function openPlanterDetail(planterItemId: string) {
    router.push({
      pathname: "/planter/[id]",
      params: { id: planterItemId },
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

      {isLoading ? (
        <View style={styles.stateBlock}>
          <ActivityIndicator color={IbukiColors.ink} />
          <Text style={styles.stateText}>planterを読み込み中です</Text>
        </View>
      ) : error ? (
        <View style={styles.stateBlock}>
          <Text style={styles.stateText}>{error}</Text>
        </View>
      ) : planterItems.length === 0 ? (
        <View style={styles.stateBlock}>
          <Text style={styles.stateText}>
            まだ planter に植えた suki がありません。
          </Text>
          <Text style={styles.stateSubtext}>
            bookmark した suki を planter に送ると、ここで育成を始められます。
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        >
          {planterItems.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => openPlanterDetail(item.id)}
              style={({ pressed }) => [styles.planterCard, pressed && styles.pressed]}
            >
              <View style={styles.cardContent}>
                <PhotoBlock
                  hobby={item.hobby}
                  height={180}
                  label={`L${item.level}`}
                />
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>{item.hobby.nameJa}</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </IbukiScreen>
  );
}

const styles = StyleSheet.create({
  cardBody: {
    backgroundColor: IbukiColors.background,
    paddingHorizontal: IbukiSpacing.sm,
    paddingVertical: IbukiSpacing.sm,
  },
  cardContent: {
    backgroundColor: IbukiColors.surface,
    borderRadius: IbukiRadius.md,
    overflow: "hidden",
  },
  cardTitle: {
    color: IbukiColors.ink,
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    paddingBottom: IbukiSpacing.md,
    paddingHorizontal: IbukiSpacing.md,
    paddingTop: IbukiSpacing.lg,
  },
  listContainer: {
    gap: IbukiSpacing.md,
    paddingBottom: IbukiSpacing.xxl,
    paddingHorizontal: IbukiSpacing.md,
  },
  planterCard: {
    marginBottom: IbukiSpacing.xs,
  },
  pressed: {
    opacity: 0.7,
  },
  scrollView: {
    flex: 1,
  },
  stateBlock: {
    alignItems: "center",
    gap: IbukiSpacing.sm,
    justifyContent: "center",
    paddingHorizontal: IbukiSpacing.xl,
    paddingVertical: IbukiSpacing.xxl,
  },
  stateSubtext: {
    color: IbukiColors.mid,
    fontSize: 12,
    textAlign: "center",
  },
  stateText: {
    color: IbukiColors.ink,
    textAlign: "center",
  },
});
