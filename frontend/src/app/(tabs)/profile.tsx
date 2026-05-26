import { useEffect, useState, useCallback } from "react";
import { router } from "expo-router";
import { useFocusEffect } from "expo-router";
import { Image } from "expo-image";

import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { HobbyRecommendationModal } from "@/components/hobby-recommendation-modal";
import {
  Heading,
  IbukiScreen,
  IconButton,
  Kicker,
  PillButton,
  TopBar,
} from "@/components/ibuki-ui";
import {
  IbukiColors,
  IbukiFonts,
  IbukiRadius,
  IbukiSpacing,
} from "@/constants/ibuki-theme";
import {
  useHobbyRecommendations,
  type RecommendedHobby,
} from "@/hooks/use-hobby-recommendations";
import { useAuth } from "@/contexts/auth";
import { createLikeCard, getMyLikeCards, getPlantedCountByCardIds, type LikeCard } from "@/lib/like-cards";
import { fetchSavedCards } from "@/lib/encounters";
import { getMyProfile } from "@/lib/user-profile";
import {profileSummary} from "../../data/ibuki";


const MAX_SHARED_HOBBIES = 5;

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [likeCards, setLikeCards] = useState<LikeCard[]>([]);
  const [savedCount, setSavedCount] = useState(0);
  const [plantedCounts, setPlantedCounts] = useState<Record<string, number>>({});
  const [nickname, setNickname] = useState<string | null>(null);
  const [isProfilePublic, setIsProfilePublic] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const { state, recommend, reset } = useHobbyRecommendations();

  const canAddMore = likeCards.length < MAX_SHARED_HOBBIES;

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      setLoading(true);
      Promise.all([getMyLikeCards(), fetchSavedCards(user.id), getMyProfile()])
        .then(async ([cards, saved, profile]) => {
          setLikeCards(cards);
          setSavedCount(saved.length);
          if (profile) {
            setNickname(profile.nickname ?? null);
            setIsProfilePublic(profile.is_profile_public);
          }
          const counts = await getPlantedCountByCardIds(cards.map((c) => c.id));
          setPlantedCounts(counts);
        })
        .catch(() => Alert.alert("エラー", "カードの取得に失敗しました"))
        .finally(() => setLoading(false));
    }, [user]),
  );

  function openRecommendations() {
    if (!canAddMore) return;
    setModalVisible(true);
    void recommend();
  }

  function closeRecommendations() {
    setModalVisible(false);
    reset();
  }

  async function addHobbyFromRecommendation(hobby: RecommendedHobby) {
    try {
      const newCard = await createLikeCard({
        title: hobby.nameJa,
        category: hobby.nameEn,
        detail: hobby.reason,
      });
      setLikeCards((current) => [newCard, ...current]);
      closeRecommendations();
    } catch {
      Alert.alert("エラー", "カードの追加に失敗しました");
    }
  }

  function handleSignOutPress() {
    Alert.alert("サインアウト", "サインアウトしますか？", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "サインアウト",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
            router.replace({ pathname: "/sign-in" } as never);
          } catch {
            Alert.alert("エラー", "サインアウトに失敗しました");
          }
        },
      },
    ]);
  }

  return (
    <IbukiScreen withTabBar>
      <TopBar
        left={<Kicker>PROFILE</Kicker>}
        right={
          <IconButton
            icon={{ ios: "gearshape", android: "settings", web: "gearshape" }}
            onPress={handleSignOutPress}
            label="設定"
          />
        }
      />

      <View style={styles.identity}>
        <View style={styles.avatar}>
          <Text style={styles.avatarGlyph}>◌</Text>
          <Text style={styles.avatarLevel}>{profileSummary.level}</Text>
        </View>
        <View style={styles.identityCopy}>
          <View style={styles.publicBadgeRow}>
            <View style={[styles.publicBadge, isProfilePublic ? styles.publicBadgeOn : styles.publicBadgeOff]}>
              <Text style={[styles.publicBadgeText, isProfilePublic ? styles.publicBadgeTextOn : styles.publicBadgeTextOff]}>
                {isProfilePublic ? "公開中" : "非公開"}
              </Text>
            </View>
          </View>
          <Heading size="medium">
            {nickname ?? "まだ名前のない\n誰か"}
          </Heading>
          <Text style={styles.metaText}>
            {profileSummary.location} · since {profileSummary.since}
          </Text>
        </View>
      </View>

      <View style={styles.stats}>
        <ProfileStat
          value={String(likeCards.length).padStart(2, "0")}
          label="すきカード"
        />
        <ProfileStat
          value={String(savedCount).padStart(2, "0")}
          label="保存したsuki"
        />
      </View>

      <PillButton
        label="プロフィールを編集"
        onPress={() =>
          router.push({ pathname: "/profile-edit" } as never)
        }
        style={styles.editProfileButton}
        variant="light"
      />

      <View style={styles.segmentRow}>
        <Text style={styles.segmentActive}>自分のsukiカード</Text>
      </View>

      <View style={styles.sectionHeader}>
        <Kicker>
          すきカード · {likeCards.length} / {MAX_SHARED_HOBBIES}
        </Kicker>
      </View>

      {loading ? (
        <ActivityIndicator color={IbukiColors.ink} style={{ marginTop: 40 }} />
      ) : (
        <View style={styles.grid}>
          {likeCards.map((card) => (
            <View key={card.id} style={styles.gridItem}>
              <LikeCardTile
                card={card}
                plantedCount={plantedCounts[card.id] ?? 0}
                onPress={() =>
                  router.push({
                    pathname: "/suki/[id]",
                    params: { id: card.id },
                  } as never)
                }
              />
            </View>
          ))}
          <Pressable
            accessibilityLabel="AIにsukiを提案してもらう"
            accessibilityRole="button"
            disabled={!canAddMore}
            onPress={openRecommendations}
            style={({ pressed }) => [
              styles.gridItem,
              styles.addCard,
              !canAddMore && styles.addCardDisabled,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.addPlus}>＋</Text>
            <Text style={styles.addText}>
              {canAddMore ? "sukiを追加" : "上限に達しました"}
            </Text>
          </Pressable>
        </View>
      )}

      <HobbyRecommendationModal
        visible={modalVisible}
        status={state.status}
        recommendations={
          state.status === "success" ? state.recommendations : []
        }
        errorMessage={state.status === "error" ? state.message : undefined}
        onClose={closeRecommendations}
        onAdd={addHobbyFromRecommendation}
        onRetry={() => void recommend()}
      />
    </IbukiScreen>
  );
}

function LikeCardTile({
  card,
  plantedCount,
  onPress,
}: {
  card: LikeCard;
  plantedCount: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.tileCard, pressed && styles.pressed]}
    >
      {card.photo_url ? (
        <Image source={{ uri: card.photo_url }} style={styles.tilePhoto} />
      ) : (
        <View style={styles.tilePhotoPlaceholder} />
      )}
      <View style={styles.tileCopy}>
        <Kicker>{card.category}</Kicker>
        <Text style={styles.tileTitle} numberOfLines={2}>
          {card.title}
        </Text>
        {card.detail ? (
          <Text style={styles.tileDetail} numberOfLines={2}>
            {card.detail}
          </Text>
        ) : null}
        {/* {plantedCount > 1 ? (
          <Text style={styles.plantedCount}>他{plantedCount - 1}人が育てています。</Text>
        ) : null} */}
      </View>
    </Pressable>
  );
}

function ProfileStat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.profileStat}>
      <Text style={styles.profileStatValue}>{value}</Text>
      <Text style={styles.profileStatLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  identity: {
    alignItems: "center",
    flexDirection: "row",
    gap: IbukiSpacing.md,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: IbukiColors.accentTint,
    borderColor: IbukiColors.line,
    borderRadius: 38,
    borderWidth: 1,
    height: 76,
    justifyContent: "center",
    overflow: "hidden",
    width: 76,
  },
  avatarGlyph: {
    color: IbukiColors.accentDeep,
    fontSize: 34,
  },
  avatarLevel: {
    backgroundColor: IbukiColors.ink,
    borderRadius: IbukiRadius.pill,
    bottom: 0,
    color: IbukiColors.background,
    fontFamily: IbukiFonts?.monoBold,
    fontSize: 10,
    fontWeight: "700",
    paddingHorizontal: 7,
    paddingVertical: 3,
    position: "absolute",
    right: 0,
  },
  identityCopy: {
    flex: 1,
    gap: 3,
  },
  publicBadgeRow: {
    flexDirection: "row",
    marginBottom: 2,
  },
  publicBadge: {
    borderRadius: IbukiRadius.pill,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  publicBadgeOn: {
    backgroundColor: IbukiColors.accentTint,
    borderColor: IbukiColors.accent,
  },
  publicBadgeOff: {
    backgroundColor: IbukiColors.surfaceMuted,
    borderColor: IbukiColors.line,
  },
  publicBadgeText: {
    fontFamily: IbukiFonts?.sansBold,
    fontSize: 10,
    fontWeight: "700",
  },
  publicBadgeTextOn: {
    color: IbukiColors.accentDeep,
  },
  publicBadgeTextOff: {
    color: IbukiColors.mid,
  },
  metaText: {
    color: IbukiColors.mid,
    fontFamily: IbukiFonts?.sansBold,
    fontSize: 12,
    fontWeight: "700",
  },
  stats: {
    backgroundColor: IbukiColors.surface,
    borderColor: IbukiColors.line,
    borderRadius: IbukiRadius.md,
    borderWidth: 1,
    flexDirection: "row",
  },
  profileStat: {
    alignItems: "center",
    flex: 1,
    gap: 5,
    paddingVertical: IbukiSpacing.md,
  },
  profileStatValue: {
    color: IbukiColors.ink,
    fontFamily: IbukiFonts?.sans,
    fontSize: 28,
    fontWeight: "500",
  },
  profileStatLabel: {
    color: IbukiColors.mid,
    fontFamily: IbukiFonts?.sansBold,
    fontSize: 11,
    fontWeight: "700",
  },
  segmentRow: {
    flexDirection: "row",
    gap: IbukiSpacing.xs,
  },
  segmentActive: {
    backgroundColor: IbukiColors.ink,
    borderRadius: IbukiRadius.pill,
    color: IbukiColors.background,
    fontFamily: IbukiFonts?.sansBold,
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  segment: {
    backgroundColor: IbukiColors.surface,
    borderRadius: IbukiRadius.pill,
    color: IbukiColors.mid,
    fontFamily: IbukiFonts?.sansBold,
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: IbukiSpacing.sm,
  },
  gridItem: {
    width: "48.2%",
  },
  pressed: {
    opacity: 0.72,
  },
  tileCard: {
    backgroundColor: IbukiColors.surface,
    borderColor: IbukiColors.line,
    borderRadius: IbukiRadius.md,
    borderWidth: 1,
    minHeight: 210,
    overflow: "hidden",
  },
  tilePhoto: {
    height: 120,
    width: "100%",
  },
  tilePhotoPlaceholder: {
    backgroundColor: IbukiColors.accentTint,
    height: 120,
    width: "100%",
  },
  tileCopy: {
    gap: 4,
    padding: IbukiSpacing.sm,
  },
  tileTitle: {
    color: IbukiColors.ink,
    fontFamily: IbukiFonts?.sansBold,
    fontSize: 14,
    fontWeight: "700",
  },
  tileDetail: {
    color: IbukiColors.inkSoft,
    fontFamily: IbukiFonts?.sans,
    fontSize: 11,
    fontWeight: "500",
    lineHeight: 15,
  },
  plantedCount: {
    color: IbukiColors.mid,
    fontFamily: IbukiFonts?.sans,
    fontSize: 10,
    marginTop: 2,
  },
  editProfileButton: {
    marginBottom: IbukiSpacing.md,
    width: "100%",
  },
  addCard: {
    alignItems: "center",
    backgroundColor: IbukiColors.surfaceMuted,
    borderColor: IbukiColors.line,
    borderRadius: IbukiRadius.md,
    borderStyle: "dashed",
    borderWidth: 1,
    gap: IbukiSpacing.xs,
    justifyContent: "center",
    minHeight: 210,
  },
  addCardDisabled: {
    opacity: 0.62,
  },
  addPlus: {
    color: IbukiColors.mid,
    fontSize: 34,
    lineHeight: 38,
  },
  addText: {
    color: IbukiColors.mid,
    fontFamily: IbukiFonts?.sansBold,
    fontSize: 12,
    fontWeight: "700",
  },
});
