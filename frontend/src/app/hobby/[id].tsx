import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";

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
import { useAuth } from "@/contexts/auth";
import { getHobbyById } from "@/data/ibuki";
import {
  fetchLikeCardById,
  fetchOtherSukisByUserIds,
  mapLikeCardToHobby,
  saveEncounterBookmark,
} from "@/lib/encounters";
import {
  createPlanterItem,
  fetchWeeklyPlanterCount,
  WEEKLY_PLANT_LIMIT,
} from "@/lib/planter";
import { getUserPublicProfile } from "@/lib/user-profile";
import { useEncounterPreferences } from "@/state/encounter-preferences";

export default function HobbyDetailScreen() {
  const { cardId, encounterId, from, fromUserId, hideKey, id, source } = useLocalSearchParams<{
    id: string;
    from?: string;
    source?: string;
    cardId?: string;
    encounterId?: string;
    hideKey?: string;
    fromUserId?: string;
  }>();
  const { user } = useAuth();
  const isRemote = source === "remote" && typeof cardId === "string";
  const staticHobby = useMemo(() => getHobbyById(id), [id]);
  const [remoteHobby, setRemoteHobby] = useState<typeof staticHobby | null>(null);
  const [isLoadingRemote, setIsLoadingRemote] = useState(isRemote);
  const [remoteLoadError, setRemoteLoadError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPlanting, setIsPlanting] = useState(false);
  const [fromUserProfile, setFromUserProfile] = useState<{
    age_range: string | null;
    gender_label: string | null;
    is_profile_public: boolean;
  } | null>(null);
  const [otherSukis, setOtherSukis] = useState<string[]>([]);
  const { hideEncounter } = useEncounterPreferences();
  const hobby = (isRemote ? remoteHobby : staticHobby) ?? staticHobby;
  const canPlantFromBookmark =
    from === "bookmark" && user?.id && typeof cardId === "string";

  useEffect(() => {
    if (typeof fromUserId !== "string") return;
    void Promise.all([
      getUserPublicProfile(fromUserId),
      fetchOtherSukisByUserIds([fromUserId]),
    ]).then(([profile, sukiMap]) => {
      setFromUserProfile(profile);
      setOtherSukis(sukiMap[fromUserId] ?? []);
    });
  }, [fromUserId]);

  useEffect(() => {
    if (!isRemote || typeof cardId !== "string") {
      setIsLoadingRemote(false);
      setRemoteLoadError(null);
      return;
    }

    let active = true;

    const loadRemoteCard = async () => {
      try {
        setIsLoadingRemote(true);
        setRemoteLoadError(null);
        const likeCard = await fetchLikeCardById(cardId);
        if (active) {
          setRemoteHobby(mapLikeCardToHobby(likeCard));
        }
      } catch (loadError) {
        if (active) {
          setRemoteHobby(null);
          setRemoteLoadError(
            loadError instanceof Error
              ? loadError.message
              : "カードを取得できませんでした",
          );
        }
      } finally {
        if (active) {
          setIsLoadingRemote(false);
        }
      }
    };

    void loadRemoteCard();

    return () => {
      active = false;
    };
  }, [cardId, isRemote]);

  function markUninterested() {
    hideEncounter(typeof hideKey === "string" ? hideKey : hobby.id);
    router.replace("/encounters");
  }

  async function handleSave() {
    if (
      isRemote &&
      user?.id &&
      typeof cardId === "string" &&
      typeof encounterId === "string"
    ) {
      try {
        await saveEncounterBookmark({
          userId: user.id,
          encounterId,
          likeCardId: cardId,
        });
        setSaved(true);
        Alert.alert(
          "Bookmarkしました",
          `${hobby.nameJa}をbookmarkに追加しました`,
        );
      } catch (saveError) {
        Alert.alert(
          "保存できませんでした",
          saveError instanceof Error
            ? saveError.message
            : "bookmarkに失敗しました",
        );
      }
      return;
    }

    setSaved((current) => !current);
    if (!saved) {
      Alert.alert("Bookmarkしました", `${hobby.nameJa}をbookmarkに追加しました`);
    }
  }

  async function handlePlant() {
    if (!user?.id || typeof cardId !== "string" || isPlanting) {
      return;
    }

    try {
      setIsPlanting(true);
      const weeklyPlantCount = await fetchWeeklyPlanterCount(user.id);
      if (weeklyPlantCount >= WEEKLY_PLANT_LIMIT) {
        Alert.alert(
          "今週の上限に達しました",
          `今週はすでに${WEEKLY_PLANT_LIMIT}個まで植えています。来週また植えてください。`,
        );
        return;
      }

      const planterItem = await createPlanterItem({
        encounterId: typeof encounterId === "string" ? encounterId : null,
        likeCardId: cardId,
        userId: user.id,
      });
      Alert.alert("Planterに植えました", `${hobby.nameJa}の育成を始めます`);
      router.push({
        pathname: "/planter/[id]",
        params: { id: planterItem.id },
      } as never);
    } catch (plantError) {
      Alert.alert(
        "Planterに植えられませんでした",
        plantError instanceof Error
          ? plantError.message
          : "planterへの追加に失敗しました",
      );
    } finally {
      setIsPlanting(false);
    }
  }

  if (isLoadingRemote) {
    return (
      <IbukiScreen>
        <View style={styles.loadingState}>
          <ActivityIndicator color={IbukiColors.ink} />
          <Text style={styles.placeDistance}>カードを読み込み中です</Text>
        </View>
      </IbukiScreen>
    );
  }

  if (isRemote && (!hobby || remoteLoadError)) {
    return (
      <IbukiScreen>
        <View style={styles.loadingState}>
          <Text style={styles.placeDistance}>
            {remoteLoadError ?? "カードを取得できませんでした"}
          </Text>
        </View>
      </IbukiScreen>
    );
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

      {typeof fromUserId === "string" &&
        fromUserProfile &&
        (fromUserProfile.is_profile_public ||
          otherSukis.length > 0) ? (
        <View style={styles.fromUserCard}>
          <Kicker>この人について</Kicker>
          {fromUserProfile.is_profile_public &&
            (fromUserProfile.age_range ?? fromUserProfile.gender_label) ? (
            <Text style={styles.fromUserAttr}>
              {[fromUserProfile.age_range, fromUserProfile.gender_label]
                .filter(Boolean)
                .join(" · ")}
            </Text>
          ) : <Text style={styles.placeInfo}>プロフィール非公開</Text>}
          {otherSukis.length > 0 ? (
            <View style={styles.otherSukiSection}>
              <Text style={styles.otherSukiLabel}>この人の他のsuki</Text>
              <View style={styles.fromUserTagRow}>
                {otherSukis.slice(0, 4).map((title) => (
                  <View key={title} style={styles.fromUserTag}>
                    <Text style={styles.fromUserTagText}>{title}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </View>
      ) : null}

      {/* <View style={styles.placeCard}>
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
      </View> */}



      {canPlantFromBookmark ? (
        <PillButton
          label={isPlanting ? "植えています..." : "Planterに植える"}
          variant="accent"
          onPress={isPlanting ? undefined : handlePlant}
          style={styles.planterButton}
        />
      ) : (<View style={styles.actions}>
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
      </View>)}
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
  planterButton: {
    marginTop: IbukiSpacing.sm,
  },
  loadingState: {
    alignItems: "center",
    gap: IbukiSpacing.sm,
    justifyContent: "center",
    minHeight: 320,
  },
  actionShort: {
    flex: 0.9,
  },
  actionWide: {
    flex: 1.25,
  },
  fromUserCard: {
    backgroundColor: IbukiColors.surface,
    borderColor: IbukiColors.line,
    borderRadius: IbukiRadius.md,
    borderWidth: 1,
    gap: IbukiSpacing.sm,
    marginBottom: IbukiSpacing.lg,
    padding: IbukiSpacing.md,
  },
  fromUserAttr: {
    color: IbukiColors.ink,
    fontFamily: IbukiFonts?.sansBold,
    fontSize: 14,
    fontWeight: "700",
  },
  otherSukiSection: {
    gap: IbukiSpacing.xs,
  },
  otherSukiLabel: {
    color: IbukiColors.mid,
    fontFamily: IbukiFonts?.sans,
    fontSize: 11,
  },
  fromUserTagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: IbukiSpacing.xs,
  },
  fromUserTag: {
    backgroundColor: IbukiColors.surfaceMuted,
    borderColor: IbukiColors.line,
    borderRadius: IbukiRadius.pill,
    borderWidth: 1,
    paddingHorizontal: IbukiSpacing.sm,
    paddingVertical: 4,
  },
  fromUserTagText: {
    color: IbukiColors.inkSoft,
    fontFamily: IbukiFonts?.sans,
    fontSize: 12,
  },
});
