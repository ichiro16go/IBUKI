import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  BodyText,
  Heading,
  IconButton,
  IbukiScreen,
  Kicker,
  PillButton,
  TopBar,
} from "@/components/ibuki-ui";
import PlantVisual, { type PlantStage } from "@/components/plant-visual";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  IbukiColors,
  IbukiFonts,
  IbukiRadius,
  IbukiSpacing,
} from "@/constants/ibuki-theme";
import { sukiActions } from "@/data/ibuki";
import { useAuth } from "@/contexts/auth";
import {
  createPlanterActionLog,
  fetchPlanterDetail,
  type PlanterDetail,
} from "@/lib/planter";
import { useActionRecommendations } from "@/hooks/use-action-recommendations";

type SelectedActionInfo = {
  id: string;
  title: string;
  description: string;
  actionType: string;
};

function hashCode(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return h;
}

export default function PlanterDetailScreen() {
  const params = useLocalSearchParams() as { id?: string };
  const planterItemId = params.id ?? "";
  const { user } = useAuth();

  const [detail, setDetail] = useState<PlanterDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState<SelectedActionInfo | null>(null);
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [initialStage, setInitialStage] = useState<PlantStage | null>(null);
  const [showInitialStageModal, setShowInitialStageModal] = useState(false);

  useEffect(() => {
    if (!detail) return;
    const item = detail.item;
    const key = `planter_initial_maturity_${item.id}`;
    void AsyncStorage.getItem(key).then((v) => {
      if (v === "seed" || v === "sprout" || v === "leafy") setInitialStage(v);
    });
  }, [detail]);

  const { state: aiState, fetchRecommendations, reset: resetAi } = useActionRecommendations();

  const loadDetail = useCallback(async () => {
    if (!user?.id || !planterItemId) {
      setDetail(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const nextDetail = await fetchPlanterDetail(planterItemId, user.id);
      setDetail(nextDetail);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "planter詳細の取得に失敗しました",
      );
    } finally {
      setIsLoading(false);
    }
  }, [planterItemId, user?.id]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  function openActionModal() {
    setShowActionModal(true);
    if (detail) {
      void fetchRecommendations(
        detail.item.hobby.nameJa,
        detail.item.hobby.nameEn,
        detail.item.hobby.intro,
      );
    }
  }

  function closeActionModal() {
    setShowActionModal(false);
    setSelectedAction(null);
    setNotes("");
    resetAi();
  }

  async function handleAddAction() {
    if (!detail || !selectedAction || !user?.id || isSaving) {
      return;
    }

    try {
      setIsSaving(true);
      await createPlanterActionLog({
        actionType: selectedAction.actionType,
        notes,
        planterItemId: detail.item.id,
        title: selectedAction.title,
        userId: user.id,
      });
      closeActionModal();
      await loadDetail();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "アクションの追加に失敗しました",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <IbukiScreen>
        <View style={styles.stateBlock}>
          <ActivityIndicator color={IbukiColors.ink} />
          <Text style={styles.stateText}>planter詳細を読み込み中です</Text>
        </View>
      </IbukiScreen>
    );
  }

  if (!detail || error) {
    return (
      <IbukiScreen>
        <View style={styles.stateBlock}>
          <Text style={styles.stateText}>
            {error ?? "planter詳細を表示できませんでした"}
          </Text>
        </View>
      </IbukiScreen>
    );
  }

  const { item, logs } = detail;

  async function saveInitialStage(stage: PlantStage | null) {
    if (!item) return;
    const key = `planter_initial_maturity_${item.id}`;
    if (stage) {
      await AsyncStorage.setItem(key, stage);
      setInitialStage(stage);
    } else {
      await AsyncStorage.removeItem(key);
      setInitialStage(null);
    }
    setShowInitialStageModal(false);
  }

  return (
    <IbukiScreen withTabBar scroll>
      <TopBar
        left={
          <IconButton
            icon="chevron-left"
            onPress={() => router.back()}
            label="戻る"
          />
        }
        right={item.isOwnSuki ? <Kicker>MY SUKI</Kicker> : <Kicker>もらったsuki</Kicker>}
      />

      <View style={styles.visualSection}>
        <PlantVisual
          actionCount={item.actionCount}
          stage={initialStage ?? (item.actionCount === 0 ? "seed" : "leafy")}
          flowerVariant={Math.abs(hashCode(item.id)) % 3}
          size={260}
        />

        {item.isOwnSuki && item.actionCount === 0 ? (
          <PillButton
            label={initialStage ? `成熟度: ${initialStage}` : "初期成熟度を設定"}
            onPress={() => setShowInitialStageModal(true)}
            style={{ marginTop: 12, width: 220 }}
            variant="accent"
          />
        ) : null}
      </View>

      <View style={styles.infoSection}>
        <Heading size="medium">{item.hobby.nameJa}</Heading>
        <BodyText>{item.hobby.intro}</BodyText>

        <PillButton
          label={isSaving ? "追加中..." : "アクションを追加"}
          onPress={isSaving ? undefined : openActionModal}
          style={styles.fullWidthButton}
          variant="accent"
        />
      </View>

      <View style={styles.logsSection}>
        <Kicker>アクション履歴</Kicker>
        <Text style={styles.logsCount}>{logs.length}件</Text>

        {logs.length === 0 ? (
          <Text style={styles.emptyText}>まだアクションがありません。</Text>
        ) : (
          <View style={styles.logsList}>
            {logs.map((log) => {
              const date = new Date(log.actedAt);
              const month = date.getMonth() + 1;
              const day = date.getDate();

              return (
                <View key={log.id} style={styles.logItem}>
                  <View style={styles.logDate}>
                    <Text style={styles.logMonth}>{month}</Text>
                    <Text style={styles.logDay}>{day}</Text>
                  </View>
                  <View style={styles.logContent}>
                    <Text style={styles.logAction}>{log.title}</Text>
                    <Text style={styles.logMeta}>{log.actedAtLabel}</Text>
                    {log.notes ? (
                      <Text style={styles.logNotes}>{log.notes}</Text>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>

      <Modal
        visible={showActionModal}
        animationType="slide"
        onRequestClose={closeActionModal}
      >
        <IbukiScreen>
          <TopBar
            left={<Kicker>アクション追加</Kicker>}
            right={
              <Pressable onPress={closeActionModal}>
                <Text style={styles.closeButton}>✕</Text>
              </Pressable>
            }
          />

          <View style={styles.modalSection}>
            <Heading size="small">アクションを選択</Heading>
            {sukiActions.map((action) => (
              <Pressable
                key={action.id}
                onPress={() =>
                  setSelectedAction({
                    id: action.id,
                    title: action.title,
                    description: action.description,
                    actionType: action.id,
                  })
                }
                style={[
                  styles.actionOption,
                  selectedAction?.id === action.id && styles.actionOptionSelected,
                ]}
              >
                <Text
                  style={[
                    styles.actionOptionTitle,
                    selectedAction?.id === action.id &&
                    styles.actionOptionTitleSelected,
                  ]}
                >
                  {action.title}
                </Text>
                <Text style={styles.actionOptionDesc}>{action.description}</Text>
              </Pressable>
            ))}

            {/* AI recommendations section */}
            {aiState.status === "loading" ? (
              <View style={styles.aiSection}>
                <Kicker>AIのおすすめ ✦</Kicker>
                <View style={styles.aiLoadingContainer}>
                  <ActivityIndicator size="small" color={IbukiColors.mid} />
                  <Text style={styles.aiLoadingText}>AIがおすすめを考え中...</Text>
                </View>
              </View>
            ) : aiState.status === "success" && aiState.recommendations.length > 0 ? (
              <View style={styles.aiSection}>
                <Kicker>AIのおすすめ ✦</Kicker>
                {aiState.recommendations.map((rec, index) => (
                  <Pressable
                    key={`ai-rec-${index}`}
                    onPress={() =>
                      setSelectedAction({
                        id: `ai-rec-${index}`,
                        title: rec.title,
                        description: rec.description,
                        actionType: rec.actionType,
                      })
                    }
                    style={[
                      styles.actionOption,
                      styles.actionOptionAi,
                      selectedAction?.id === `ai-rec-${index}` &&
                      styles.actionOptionAiSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.actionOptionTitle,
                        selectedAction?.id === `ai-rec-${index}` &&
                        styles.actionOptionTitleAiSelected,
                      ]}
                    >
                      {rec.title}
                    </Text>
                    {rec.description ? (
                      <Text style={styles.actionOptionDesc}>{rec.description}</Text>
                    ) : null}
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>

          {selectedAction ? (
            <View style={styles.modalSection}>
              <Heading size="small">メモ（任意）</Heading>
              <TextInput
                style={styles.notesInput}
                placeholder="この時のメモを追加..."
                multiline
                numberOfLines={4}
                value={notes}
                onChangeText={setNotes}
                placeholderTextColor={IbukiColors.mid}
              />
            </View>
          ) : null}

          <View style={styles.modalActions}>
            <PillButton
              label="キャンセル"
              onPress={closeActionModal}
              style={styles.fullWidthButton}
              variant="light"
            />
            <PillButton
              label={isSaving ? "追加中..." : "追加"}
              onPress={selectedAction ? handleAddAction : undefined}
              style={[
                styles.fullWidthButton,
                !selectedAction && styles.disabledButton,
              ]}
              variant="dark"
            />
          </View>
        </IbukiScreen>
      </Modal>

      <Modal
        visible={showInitialStageModal}
        animationType="slide"
        onRequestClose={() => setShowInitialStageModal(false)}
      >
        <IbukiScreen>
          <TopBar
            left={<Kicker>初期成熟度を選択</Kicker>}
            right={
              <Pressable onPress={() => setShowInitialStageModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </Pressable>
            }
          />

          <View style={{ padding: 20 }}>
            <Heading size="small">どの段階から始めますか？</Heading>
            <Pressable onPress={() => void saveInitialStage("seed")} style={[styles.actionOption, { marginTop: 16 }]}>
              <Text style={styles.actionOptionTitle}>種（Seed）</Text>
              <Text style={styles.actionOptionDesc}>最初の状態。AIの提案を1〜3回実行すると芽が出ます。</Text>
            </Pressable>
            <Pressable onPress={() => void saveInitialStage("sprout")} style={[styles.actionOption, { marginTop: 12 }]}>
              <Text style={styles.actionOptionTitle}>芽（Sprout）</Text>
              <Text style={styles.actionOptionDesc}>芽が出ている状態。葉が少しあります。</Text>
            </Pressable>
            <Pressable onPress={() => void saveInitialStage("leafy")} style={[styles.actionOption, { marginTop: 12 }]}>
              <Text style={styles.actionOptionTitle}>ある程度成長（Leafy）</Text>
              <Text style={styles.actionOptionDesc}>葉があり、すぐに花が咲く可能性があります。</Text>
            </Pressable>

            <View style={{ marginTop: 20 }}>
              <PillButton label="クリア" onPress={() => void saveInitialStage(null)} variant="light" />
            </View>
          </View>
        </IbukiScreen>
      </Modal>
    </IbukiScreen>
  );
}

const styles = StyleSheet.create({
  actionOption: {
    borderColor: IbukiColors.line,
    borderRadius: IbukiRadius.md,
    borderWidth: 1,
    marginTop: IbukiSpacing.sm,
    paddingHorizontal: IbukiSpacing.md,
    paddingVertical: IbukiSpacing.md,
  },
  actionOptionAi: {
    borderColor: IbukiColors.good,
    backgroundColor: "rgba(165,182,141,0.08)",
  },
  actionOptionAiSelected: {
    backgroundColor: "rgba(165,182,141,0.22)",
    borderColor: IbukiColors.good,
  },
  actionOptionDesc: {
    color: IbukiColors.mid,
    fontFamily: IbukiFonts.sans,
    fontSize: 12,
  },
  actionOptionSelected: {
    backgroundColor: IbukiColors.accentTint,
    borderColor: IbukiColors.accent,
  },
  actionOptionTitle: {
    color: IbukiColors.ink,
    fontFamily: IbukiFonts.sans,
    fontSize: 14,
    marginBottom: IbukiSpacing.xs,
  },
  actionOptionTitleAiSelected: {
    color: IbukiColors.good,
    fontFamily: IbukiFonts.sansBold,
  },
  actionOptionTitleSelected: {
    color: IbukiColors.accentDeep,
    fontFamily: IbukiFonts.sansBold,
  },
  aiLoadingContainer: {
    alignItems: "center",
    flexDirection: "row",
    gap: IbukiSpacing.xs,
    paddingVertical: IbukiSpacing.md,
  },
  aiLoadingText: {
    color: IbukiColors.mid,
    fontFamily: IbukiFonts.sans,
    fontSize: 12,
  },
  aiSection: {
    borderTopColor: IbukiColors.line,
    borderTopWidth: 1,
    marginTop: IbukiSpacing.md,
    paddingTop: IbukiSpacing.md,
  },
  closeButton: {
    color: IbukiColors.ink,
    fontSize: 20,
    fontWeight: "bold",
  },
  disabledButton: {
    opacity: 0.5,
  },
  emptyText: {
    color: IbukiColors.mid,
    fontFamily: IbukiFonts.sans,
    fontSize: 12,
    marginTop: IbukiSpacing.md,
  },
  fullWidthButton: {
    marginTop: IbukiSpacing.sm,
    width: "100%",
  },
  infoSection: {
    gap: IbukiSpacing.sm,
    paddingHorizontal: IbukiSpacing.md,
    paddingVertical: IbukiSpacing.lg,
  },
  logAction: {
    color: IbukiColors.ink,
    fontFamily: IbukiFonts.sans,
    fontSize: 14,
    marginBottom: IbukiSpacing.xs,
  },
  logContent: {
    flex: 1,
  },
  logDate: {
    alignItems: "center",
    justifyContent: "center",
    width: 50,
  },
  logDay: {
    color: IbukiColors.ink,
    fontFamily: IbukiFonts.sansBold,
    fontSize: 18,
  },
  logItem: {
    borderBottomColor: IbukiColors.line,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: IbukiSpacing.md,
    paddingBottom: IbukiSpacing.md,
  },
  logMeta: {
    color: IbukiColors.mid,
    fontFamily: IbukiFonts.sans,
    fontSize: 12,
    marginBottom: IbukiSpacing.xs,
  },
  logMonth: {
    color: IbukiColors.mid,
    fontFamily: IbukiFonts.sans,
    fontSize: 10,
  },
  logNotes: {
    color: IbukiColors.mid,
    fontFamily: IbukiFonts.sans,
    fontSize: 12,
    lineHeight: 16,
  },
  logsCount: {
    color: IbukiColors.mid,
    fontFamily: IbukiFonts.sans,
    fontSize: 12,
    marginBottom: IbukiSpacing.md,
  },
  logsList: {
    gap: IbukiSpacing.md,
    marginTop: IbukiSpacing.md,
  },
  logsSection: {
    borderTopColor: IbukiColors.line,
    borderTopWidth: 1,
    paddingHorizontal: IbukiSpacing.md,
    paddingTop: IbukiSpacing.lg,
  },
  modalActions: {
    gap: IbukiSpacing.md,
    marginTop: IbukiSpacing.lg,
  },
  modalSection: {
    marginBottom: IbukiSpacing.lg,
  },
  notesInput: {
    borderColor: IbukiColors.line,
    borderRadius: IbukiRadius.md,
    borderWidth: 1,
    color: IbukiColors.ink,
    fontFamily: IbukiFonts.sans,
    minHeight: 100,
    paddingHorizontal: IbukiSpacing.md,
    paddingVertical: IbukiSpacing.sm,
    textAlignVertical: "top",
  },
  visualSection: {
    alignItems: "center",
    marginBottom: IbukiSpacing.md,
    paddingTop: IbukiSpacing.lg,
  },
  stateBlock: {
    alignItems: "center",
    gap: IbukiSpacing.sm,
    justifyContent: "center",
    paddingVertical: IbukiSpacing.xxl,
  },
  stateText: {
    color: IbukiColors.ink,
    textAlign: "center",
  },
});
