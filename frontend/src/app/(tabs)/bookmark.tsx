import { router } from "expo-router";
import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";

import {
  Chip,
  Heading,
  HobbyCard,
  IbukiScreen,
  Kicker,
} from "@/components/ibuki-ui";
import { IbukiSpacing } from "@/constants/ibuki-theme";
import { useAuth } from "@/contexts/auth";
import { fetchSavedCards, type SavedFeedItem } from "@/lib/encounters";

export default function BookmarkScreen() {
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState("全て");
  const [savedCards, setSavedCards] = useState<SavedFeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSavedCards = useCallback(async () => {
    if (!user?.id) {
      setSavedCards([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const nextSavedCards = await fetchSavedCards(user.id);
      setSavedCards(nextSavedCards);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "bookmarkの取得に失敗しました",
      );
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      void loadSavedCards();
    }, [loadSavedCards]),
  );

  return (
    <IbukiScreen withTabBar>
      <View style={styles.header}>
        <View>
          <Kicker>BOOKMARK · {savedCards.length} suki</Kicker>
          <Heading size="medium">気になった{"\n"}suki</Heading>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        <Chip
          label="全て"
          count={savedCards.length}
          selected={selectedFilter === "全て"}
          onPress={() => setSelectedFilter("全て")}
        />
      </ScrollView>

      {isLoading ? (
        <View style={styles.stateBlock}>
          <ActivityIndicator />
          <Text style={styles.stateText}>bookmarkを読み込み中です</Text>
        </View>
      ) : error ? (
        <View style={styles.stateBlock}>
          <Text style={styles.stateText}>{error}</Text>
        </View>
      ) : savedCards.length === 0 ? (
        <View style={styles.stateBlock}>
          <Text style={styles.stateText}>まだbookmarkされたカードがありません。</Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {savedCards.map((savedCard) => (
            <View key={savedCard.id} style={styles.gridItem}>
              <HobbyCard
                hobby={savedCard.hobby}
                compact
                onPress={() =>
                  router.push({
                    pathname: "/hobby/[id]",
                    params: {
                      id: savedCard.hobby.id,
                      from: "bookmark",
                      source: "remote",
                      cardId: savedCard.likeCardId,
                      encounterId: savedCard.encounterId,
                    },
                  } as never)
                }
              />
            </View>
          ))}
        </View>
      )}
    </IbukiScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  filterRow: {
    gap: IbukiSpacing.xs,
    paddingRight: IbukiSpacing.lg,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: IbukiSpacing.sm,
  },
  gridItem: {
    width: "48.2%",
  },
  stateBlock: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: IbukiSpacing.xxl,
    gap: IbukiSpacing.sm,
  },
  stateText: {
    textAlign: "center",
  },
});
