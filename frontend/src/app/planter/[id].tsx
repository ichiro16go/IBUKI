import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Modal,
  TextInput,
} from "react-native";

import {
  Heading,
  IbukiScreen,
  Kicker,
  BodyText,
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
  getHobbyById,
  getGrowthStatus,
  getSukiActionLogsForSuki,
  getSukiActionById,
  sukiActions,
} from "@/data/ibuki";

export default function PlanterDetailScreen() {
  const params = useLocalSearchParams() as { id?: string };
  const sukiId = params.id ?? "togei";

  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  const hobby = getHobbyById(sukiId);
  const growth = getGrowthStatus(sukiId);
  const actionLogs = getSukiActionLogsForSuki(sukiId);

  function handleAddAction() {
    if (!selectedActionId) return;

    const action = getSukiActionById(selectedActionId);
    if (action) {
      console.log(`Added action: ${selectedActionId}, notes: ${notes}`);
      setShowActionModal(false);
      setSelectedActionId(null);
      setNotes("");
    }
  }

  const nextLevelThreshold = (growth.level + 1) * 4;
  const actionCountToNextLevel = nextLevelThreshold - growth.actionCount;

  return (
    <IbukiScreen withTabBar>
      <TopBar
        left={<Kicker>{hobby.nameJa}</Kicker>}
        right={<Kicker>L{growth.level}</Kicker>}
      />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Growth Visualization Section */}
        <View style={styles.growthSection}>
          <View style={styles.plantViz}>
            <Text style={styles.plantEmoji}>🌱</Text>
          </View>

          <View style={styles.levelInfo}>
            <Text style={styles.levelLabel}>現在のレベル</Text>
            <Text style={styles.levelValue}>L{growth.level}</Text>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressLabel}>
              <Text style={styles.progressText}>次のレベルまで</Text>
              <Text style={styles.progressCount}>
                {actionCountToNextLevel}アクション
              </Text>
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
            <Text style={styles.progressPercent}>
              {growth.nextLevelProgressPercent}%
            </Text>
          </View>
        </View>

        {/* Suki Info */}
        <View style={styles.infoSection}>
          <Heading size="medium">{hobby.nameJa}</Heading>
          <BodyText style={styles.description}>{hobby.intro}</BodyText>

          <PillButton
            label="アクションを追加"
            onPress={() => setShowActionModal(true)}
            variant="primary"
            fullWidth
          />
        </View>

        {/* Action Logs */}
        <View style={styles.logsSection}>
          <Kicker>アクション履歴</Kicker>
          <Text style={styles.logsCount}>{actionLogs.length}件</Text>

          {actionLogs.length === 0 ? (
            <Text style={styles.emptyText}>まだアクションがありません。</Text>
          ) : (
            <View style={styles.logsList}>
              {actionLogs.map((log) => {
                const action = getSukiActionById(log.actionId);
                const date = new Date(log.timestamp);
                const month = date.getMonth() + 1;
                const day = date.getDate();

                return (
                  <View key={log.id} style={styles.logItem}>
                    <View style={styles.logDate}>
                      <Text style={styles.logMonth}>{month}</Text>
                      <Text style={styles.logDay}>{day}</Text>
                    </View>
                    <View style={styles.logContent}>
                      <Text style={styles.logAction}>
                        {action?.title ?? "Unknown Action"}
                      </Text>
                      {log.notes && (
                        <Text style={styles.logNotes}>{log.notes}</Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Action Modal */}
      <Modal
        visible={showActionModal}
        animationType="slide"
        onRequestClose={() => setShowActionModal(false)}
      >
        <IbukiScreen>
          <TopBar
            left={<Kicker>アクション追加</Kicker>}
            right={
              <Pressable onPress={() => setShowActionModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </Pressable>
            }
          />

          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.modalSection}>
              <Heading size="small">アクションを選択</Heading>
              {sukiActions.map((action) => (
                <Pressable
                  key={action.id}
                  onPress={() => setSelectedActionId(action.id)}
                  style={[
                    styles.actionOption,
                    selectedActionId === action.id &&
                      styles.actionOptionSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.actionOptionTitle,
                      selectedActionId === action.id &&
                        styles.actionOptionTitleSelected,
                    ]}
                  >
                    {action.title}
                  </Text>
                  <Text style={styles.actionOptionDesc}>
                    {action.description}
                  </Text>
                </Pressable>
              ))}
            </View>

            {selectedActionId && (
              <View style={styles.modalSection}>
                <Heading size="small">メモ（任意）</Heading>
                <TextInput
                  style={styles.notesInput}
                  placeholder="この時のメモを追加..."
                  multiline
                  numberOfLines={4}
                  value={notes}
                  onChangeText={setNotes}
                  placeholderTextColor={IbukiColors.muted}
                />
              </View>
            )}

            <View style={styles.modalActions}>
              <PillButton
                label="キャンセル"
                onPress={() => setShowActionModal(false)}
                variant="secondary"
                fullWidth
              />
              <PillButton
                label="追加"
                onPress={handleAddAction}
                variant="primary"
                fullWidth
                disabled={!selectedActionId}
              />
            </View>
          </ScrollView>
        </IbukiScreen>
      </Modal>
    </IbukiScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: IbukiSpacing.md,
    paddingBottom: IbukiSpacing.xl,
  },
  growthSection: {
    alignItems: "center",
    paddingVertical: IbukiSpacing.lg,
    marginBottom: IbukiSpacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: IbukiColors.border,
  },
  plantViz: {
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: IbukiSpacing.md,
  },
  plantEmoji: {
    fontSize: 60,
  },
  levelInfo: {
    alignItems: "center",
    marginBottom: IbukiSpacing.md,
  },
  levelLabel: {
    fontSize: 12,
    color: IbukiColors.muted,
    fontFamily: IbukiFonts.sans,
    marginBottom: IbukiSpacing.xs,
  },
  levelValue: {
    fontSize: 32,
    fontFamily: IbukiFonts.sansBold,
    color: IbukiColors.text,
  },
  progressSection: {
    width: "100%",
  },
  progressLabel: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: IbukiSpacing.sm,
  },
  progressText: {
    fontSize: 12,
    color: IbukiColors.muted,
    fontFamily: IbukiFonts.sans,
  },
  progressCount: {
    fontSize: 12,
    fontFamily: IbukiFonts.sansBold,
    color: IbukiColors.text,
  },
  progressBar: {
    height: 8,
    backgroundColor: IbukiColors.border,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: IbukiSpacing.sm,
  },
  progressFill: {
    height: "100%",
    backgroundColor: IbukiColors.success,
    borderRadius: 4,
  },
  progressPercent: {
    fontSize: 12,
    color: IbukiColors.muted,
    fontFamily: IbukiFonts.sans,
    textAlign: "right",
  },
  infoSection: {
    marginBottom: IbukiSpacing.lg,
  },
  description: {
    marginVertical: IbukiSpacing.md,
  },
  logsSection: {
    paddingTop: IbukiSpacing.lg,
    borderTopWidth: 1,
    borderTopColor: IbukiColors.border,
  },
  logsCount: {
    fontSize: 12,
    color: IbukiColors.muted,
    fontFamily: IbukiFonts.sans,
    marginBottom: IbukiSpacing.md,
  },
  logsList: {
    gap: IbukiSpacing.md,
    marginTop: IbukiSpacing.md,
  },
  logItem: {
    flexDirection: "row",
    gap: IbukiSpacing.md,
    paddingBottom: IbukiSpacing.md,
    borderBottomWidth: 1,
    borderBottomColor: IbukiColors.border,
  },
  logDate: {
    width: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  logMonth: {
    fontSize: 10,
    color: IbukiColors.muted,
    fontFamily: IbukiFonts.sans,
  },
  logDay: {
    fontSize: 18,
    fontFamily: IbukiFonts.sansBold,
    color: IbukiColors.text,
  },
  logContent: {
    flex: 1,
  },
  logAction: {
    fontSize: 14,
    fontFamily: IbukiFonts.sans,
    color: IbukiColors.text,
    marginBottom: IbukiSpacing.xs,
  },
  logNotes: {
    fontSize: 12,
    color: IbukiColors.muted,
    fontFamily: IbukiFonts.sans,
    lineHeight: 16,
  },
  emptyText: {
    fontSize: 12,
    color: IbukiColors.muted,
    fontFamily: IbukiFonts.sans,
    marginTop: IbukiSpacing.md,
  },
  modalContent: {
    paddingHorizontal: IbukiSpacing.md,
    paddingBottom: IbukiSpacing.xl,
  },
  modalSection: {
    marginBottom: IbukiSpacing.lg,
  },
  actionOption: {
    paddingVertical: IbukiSpacing.md,
    paddingHorizontal: IbukiSpacing.md,
    borderRadius: IbukiRadius.md,
    borderWidth: 1,
    borderColor: IbukiColors.border,
    marginTop: IbukiSpacing.sm,
  },
  actionOptionSelected: {
    backgroundColor: IbukiColors.accent,
    borderColor: IbukiColors.primary,
  },
  actionOptionTitle: {
    fontSize: 14,
    fontFamily: IbukiFonts.sans,
    color: IbukiColors.text,
    marginBottom: IbukiSpacing.xs,
  },
  actionOptionTitleSelected: {
    fontFamily: IbukiFonts.sansBold,
    color: IbukiColors.primary,
  },
  actionOptionDesc: {
    fontSize: 12,
    color: IbukiColors.muted,
    fontFamily: IbukiFonts.sans,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: IbukiColors.border,
    borderRadius: IbukiRadius.md,
    paddingHorizontal: IbukiSpacing.md,
    paddingVertical: IbukiSpacing.sm,
    fontFamily: IbukiFonts.sans,
    color: IbukiColors.text,
    minHeight: 100,
    textAlignVertical: "top",
  },
  modalActions: {
    gap: IbukiSpacing.md,
    marginTop: IbukiSpacing.lg,
  },
  closeButton: {
    fontSize: 20,
    color: IbukiColors.text,
    fontWeight: "bold",
  },
});
