import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  Chip,
  EncounterCard,
  Heading,
  IbukiScreen,
  IconButton,
  NotificationModal,
} from "@/components/ibuki-ui";
import { SwipeableEncounterCard } from "@/components/swipeable-encounter-card";
import { IbukiColors, IbukiFonts, IbukiSpacing } from "@/constants/ibuki-theme";
import { hobbies } from "@/data/ibuki";
import { useAuth } from "@/contexts/auth";
import {
  fetchEncounterFeed,
  saveEncounterBookmark,
  type EncounterFeedItem,
} from "@/lib/encounters";
import { useEncounterPreferences } from "@/state/encounter-preferences";

export default function EncountersScreen() {
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [encounters, setEncounters] = useState<EncounterFeedItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { hideEncounter, isEncounterHidden } = useEncounterPreferences();

  const loadEncounters = useCallback(async () => {
    if (!user?.id) {
      setEncounters([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const nextEncounters = await fetchEncounterFeed(user.id);
      setEncounters(nextEncounters);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "すれ違いカードの取得に失敗しました",
      );
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      void loadEncounters();
    }, [loadEncounters]),
  );

  const visibleEncounters = useMemo(
    () => encounters.filter((encounter) => !isEncounterHidden(encounter.id)),
    [encounters, isEncounterHidden],
  );

  async function handleBookmark(encounter: EncounterFeedItem) {
    if (!user?.id) return;

    try {
      await saveEncounterBookmark({
        userId: user.id,
        encounterId: encounter.encounterId,
        likeCardId: encounter.likeCardId,
      });
      hideEncounter(encounter.id);
    } catch (saveError) {
      Alert.alert(
        "保存できませんでした",
        saveError instanceof Error
          ? saveError.message
          : "bookmarkに失敗しました",
      );
    }
  }

  function openHobbyDetail(encounter: EncounterFeedItem) {
    router.push({
      pathname: "/hobby/[id]",
      params: {
        id: encounter.hobby.id,
        from: "encounters",
        source: "remote",
        cardId: encounter.likeCardId,
        encounterId: encounter.encounterId,
        hideKey: encounter.id,
      },
    } as never);
  }

  const featuredEncounter = visibleEncounters[0] ?? null;
  const featuredHobby = featuredEncounter?.hobby ?? hobbies[0];

  return (
    <IbukiScreen withTabBar>
      <View style={styles.header}>
        <View>
          <Heading size="medium">今日すれ違った{"\n"}趣味たち</Heading>
        </View>
        <IconButton
          label="Show arrival notification"
          icon={{
            ios: "bell.badge",
            android: "notifications",
            web: "bell.badge",
          }}
          onPress={() => setNotificationVisible(true)}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        <Chip label="全て" count={visibleEncounters.length} selected />
      </ScrollView>

      <View style={styles.feed}>
        {isLoading ? (
          <View style={styles.stateBlock}>
            <ActivityIndicator color={IbukiColors.ink} />
            <Text style={styles.stateText}>すれ違いカードを読み込み中です</Text>
          </View>
        ) : error ? (
          <View style={styles.stateBlock}>
            <Text style={styles.stateText}>{error}</Text>
          </View>
        ) : visibleEncounters.length === 0 ? (
          <View style={styles.stateBlock}>
            <Text style={styles.stateText}>
              まだ表示できるすれ違いカードがありません。
            </Text>
          </View>
        ) : (
          visibleEncounters.map((encounter) => (
            <SwipeableEncounterCard
              key={encounter.id}
              onSwipeLeft={() => hideEncounter(encounter.id)}
              onSwipeRight={() => {
                void handleBookmark(encounter);
              }}
            >
              <EncounterCard
                hobby={encounter.hobby}
                time={encounter.time}
                context={encounter.context}
                isNew={encounter.isNew}
                onPress={() => openHobbyDetail(encounter)}
              />
            </SwipeableEncounterCard>
          ))
        )}
      </View>

      <Text style={styles.disclaimer}>人ではなく、sukiだけが届きます。</Text>

      <NotificationModal
        visible={notificationVisible}
        hobby={featuredHobby}
        onClose={() => setNotificationVisible(false)}
        onOpen={() => {
          setNotificationVisible(false);
          if (featuredEncounter) {
            openHobbyDetail(featuredEncounter);
          }
        }}
      />
    </IbukiScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  filterRow: {
    gap: IbukiSpacing.xs,
    paddingRight: IbukiSpacing.lg,
  },
  feed: {
    gap: IbukiSpacing.md,
  },
  disclaimer: {
    color: IbukiColors.mid,
    fontFamily: IbukiFonts?.sans,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  stateBlock: {
    alignItems: "center",
    gap: IbukiSpacing.sm,
    paddingVertical: IbukiSpacing.xxl,
  },
  stateText: {
    color: IbukiColors.mid,
    fontFamily: IbukiFonts.sans,
    fontSize: 14,
    textAlign: "center",
  },
});
