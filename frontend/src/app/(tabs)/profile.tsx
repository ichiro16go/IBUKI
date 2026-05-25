import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  Heading,
  HobbyCard,
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
import { hobbies, profileSummary } from "@/data/ibuki";

const INITIAL_SHARED_HOBBY_IDS = ["sauna", "bookstores", "jazz-kissa"];
const MAX_SHARED_HOBBIES = 5;

export default function ProfileScreen() {
  const [sharedHobbyIds, setSharedHobbyIds] = useState(
    INITIAL_SHARED_HOBBY_IDS,
  );
  const [pickerVisible, setPickerVisible] = useState(false);
  const sharedHobbies = sharedHobbyIds.flatMap((hobbyId) => {
    const hobby = hobbies.find((candidate) => candidate.id === hobbyId);
    return hobby ? [hobby] : [];
  });
  const availableHobbies = hobbies.filter(
    (hobby) => !sharedHobbyIds.includes(hobby.id),
  );
  const canAddMore = sharedHobbyIds.length < MAX_SHARED_HOBBIES;

  function openPicker() {
    if (canAddMore) {
      setPickerVisible(true);
    }
  }

  function addHobby(hobbyId: string) {
    setSharedHobbyIds((currentIds) => {
      if (
        currentIds.length >= MAX_SHARED_HOBBIES ||
        currentIds.includes(hobbyId)
      ) {
        return currentIds;
      }

      return [...currentIds, hobbyId];
    });
    setPickerVisible(false);
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
          label="保存した趣味"
        />
        <ProfileStat
          value={String(sharedHobbyIds.length).padStart(2, "0")}
          label="共有中"
        />
      </View>

      <View style={styles.segmentRow}>
        <Text style={styles.segmentActive}>自分の趣味カード</Text>
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
          accessibilityLabel="趣味を追加"
          accessibilityRole="button"
          disabled={!canAddMore}
          onPress={openPicker}
          style={({ pressed }) => [
            styles.gridItem,
            styles.addCard,
            !canAddMore && styles.addCardDisabled,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.addPlus}>＋</Text>
          <Text style={styles.addText}>
            {canAddMore ? "趣味を追加" : "上限に達しました"}
          </Text>
        </Pressable>
      </View>

      <Modal
        animationType="fade"
        onRequestClose={() => setPickerVisible(false)}
        transparent
        visible={pickerVisible}
      >
        <Pressable
          accessibilityLabel="趣味追加ピッカーを閉じる"
          style={styles.modalBackdrop}
          onPress={() => setPickerVisible(false)}
        >
          <Pressable
            style={styles.pickerSheet}
            onPress={(event) => event.stopPropagation()}
          >
            <View style={styles.pickerHeader}>
              <View style={styles.pickerTitleCopy}>
                <Kicker>ADD HOBBY</Kicker>
                <Heading size="small">共有する趣味を選ぶ</Heading>
              </View>
              <Text style={styles.pickerCount}>
                {sharedHobbyIds.length} / {MAX_SHARED_HOBBIES}
              </Text>
            </View>

            <ScrollView
              contentContainerStyle={styles.pickerList}
              showsVerticalScrollIndicator={false}
            >
              {canAddMore && availableHobbies.length > 0 ? (
                availableHobbies.map((hobby) => (
                  <Pressable
                    accessibilityLabel={`${hobby.nameJa}を追加`}
                    accessibilityRole="button"
                    key={hobby.id}
                    onPress={() => addHobby(hobby.id)}
                    style={({ pressed }) => [
                      styles.pickerOption,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View style={styles.pickerOptionCopy}>
                      <Text style={styles.pickerOptionTitle}>
                        {hobby.nameJa}
                      </Text>
                      <Text style={styles.pickerOptionMeta}>
                        {hobby.nameEn} · No. {hobby.number}
                      </Text>
                      <Text style={styles.pickerOptionIntro} numberOfLines={2}>
                        {hobby.intro}
                      </Text>
                    </View>
                    <Text style={styles.pickerOptionAdd}>追加</Text>
                  </Pressable>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateTitle}>
                    共有できる趣味は上限です
                  </Text>
                  <Text style={styles.emptyStateText}>
                    今は最大 {MAX_SHARED_HOBBIES}{" "}
                    枚までプロフィールに表示できます。
                  </Text>
                </View>
              )}
            </ScrollView>

            <PillButton
              label="あとで"
              onPress={() => setPickerVisible(false)}
              style={styles.closeButton}
            />
          </Pressable>
        </Pressable>
      </Modal>
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
  modalBackdrop: {
    alignItems: "center",
    backgroundColor: "rgba(46,38,32,0.24)",
    flex: 1,
    justifyContent: "flex-end",
    padding: IbukiSpacing.md,
  },
  pickerSheet: {
    backgroundColor: IbukiColors.background,
    borderColor: IbukiColors.line,
    borderRadius: IbukiRadius.lg,
    borderWidth: 1,
    gap: IbukiSpacing.md,
    maxHeight: "78%",
    padding: IbukiSpacing.lg,
    width: "100%",
  },
  pickerHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: IbukiSpacing.sm,
    justifyContent: "space-between",
  },
  pickerTitleCopy: {
    flex: 1,
    gap: 4,
  },
  pickerCount: {
    backgroundColor: IbukiColors.ink,
    borderRadius: IbukiRadius.pill,
    color: IbukiColors.background,
    fontFamily: IbukiFonts?.monoBold,
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  pickerList: {
    gap: IbukiSpacing.xs,
  },
  pickerOption: {
    alignItems: "center",
    backgroundColor: IbukiColors.surface,
    borderColor: IbukiColors.line,
    borderRadius: IbukiRadius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: IbukiSpacing.sm,
    minHeight: 92,
    padding: IbukiSpacing.sm,
  },
  pickerOptionCopy: {
    flex: 1,
    gap: 3,
  },
  pickerOptionTitle: {
    color: IbukiColors.ink,
    fontFamily: IbukiFonts?.sansBold,
    fontSize: 16,
    fontWeight: "700",
  },
  pickerOptionMeta: {
    color: IbukiColors.mid,
    fontFamily: IbukiFonts?.monoBold,
    fontSize: 10.5,
    fontWeight: "700",
  },
  pickerOptionIntro: {
    color: IbukiColors.inkSoft,
    fontFamily: IbukiFonts?.sans,
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 17,
  },
  pickerOptionAdd: {
    backgroundColor: IbukiColors.accentTint,
    borderRadius: IbukiRadius.pill,
    color: IbukiColors.accentDeep,
    fontFamily: IbukiFonts?.sansBold,
    fontSize: 12,
    fontWeight: "700",
    overflow: "hidden",
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  emptyState: {
    alignItems: "center",
    backgroundColor: IbukiColors.surfaceMuted,
    borderColor: IbukiColors.line,
    borderRadius: IbukiRadius.md,
    borderStyle: "dashed",
    borderWidth: 1,
    gap: IbukiSpacing.xs,
    padding: IbukiSpacing.lg,
  },
  emptyStateTitle: {
    color: IbukiColors.ink,
    fontFamily: IbukiFonts?.sansBold,
    fontSize: 15,
    fontWeight: "700",
  },
  emptyStateText: {
    color: IbukiColors.mid,
    fontFamily: IbukiFonts?.sans,
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 18,
    textAlign: "center",
  },
  closeButton: {
    alignSelf: "stretch",
  },
});
