import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { HobbyRecommendationModal } from "@/components/hobby-recommendation-modal";
import {
  Heading,
  HobbyCard,
  IbukiScreen,
  IconButton,
  Kicker,
  TopBar,
} from "@/components/ibuki-ui";
import {
  IbukiColors,
  IbukiFonts,
  IbukiRadius,
  IbukiSpacing,
} from "@/constants/ibuki-theme";
import { hobbies, profileSummary } from "@/data/ibuki";
import { useHobbyRecommendations } from "@/hooks/use-hobby-recommendations";

const INITIAL_SHARED_HOBBY_IDS = ["sauna", "bookstores", "jazz-kissa"];
const MAX_SHARED_HOBBIES = 5;

export default function ProfileScreen() {
  const [sharedHobbyIds] = useState(INITIAL_SHARED_HOBBY_IDS);
  const [modalVisible, setModalVisible] = useState(false);
  const { state, recommend, reset } = useHobbyRecommendations();

  const sharedHobbies = sharedHobbyIds.flatMap((hobbyId) => {
    const hobby = hobbies.find((candidate) => candidate.id === hobbyId);
    return hobby ? [hobby] : [];
  });
  const canAddMore = sharedHobbyIds.length < MAX_SHARED_HOBBIES;

  function openRecommendations() {
    if (!canAddMore) return;
    setModalVisible(true);
    void recommend();
  }

  function closeRecommendations() {
    setModalVisible(false);
    reset();
  }

  return (
    <IbukiScreen withTabBar>
      <TopBar
        left={<Kicker>PROFILE</Kicker>}
        right={
          <IconButton
            icon={{ ios: "gearshape", android: "settings", web: "gearshape" }}
          />
        }
      />

      <View style={styles.identity}>
        <View style={styles.avatar}>
          <Text style={styles.avatarGlyph}>◌</Text>
          <Text style={styles.avatarLevel}>{profileSummary.level}</Text>
        </View>
        <View style={styles.identityCopy}>
          <Kicker>{profileSummary.handle} · 匿名表示</Kicker>
          <Heading size="medium">まだ名前のない{"\n"}誰か</Heading>
          <Text style={styles.metaText}>
            {profileSummary.location} · since {profileSummary.since}
          </Text>
        </View>
      </View>

      <View style={styles.stats}>
        <ProfileStat
          value={profileSummary.savedCount.toString()}
          label="保存したsuki"
        />
        <ProfileStat
          value={String(sharedHobbyIds.length).padStart(2, "0")}
          label="共有中"
        />
      </View>

      <View style={styles.segmentRow}>
        <Text style={styles.segmentActive}>自分のsukiカード</Text>
        <Text style={styles.segment}>保存</Text>
        <Text style={styles.segment}>SNSリンク</Text>
      </View>

      <View style={styles.sectionHeader}>
        <Kicker>
          共有中 · {sharedHobbyIds.length} / {MAX_SHARED_HOBBIES}
        </Kicker>
        <Kicker>↓ ドラッグで並べ替え</Kicker>
      </View>

      <View style={styles.grid}>
        {sharedHobbies.map((hobby) => (
          <View key={hobby.id} style={styles.gridItem}>
            <HobbyCard hobby={hobby} compact />
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

      <HobbyRecommendationModal
        visible={modalVisible}
        status={state.status}
        recommendations={
          state.status === "success" ? state.recommendations : []
        }
        errorMessage={state.status === "error" ? state.message : undefined}
        onClose={closeRecommendations}
        onRetry={() => void recommend()}
      />
    </IbukiScreen>
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
