import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import {
  IbukiColors,
  IbukiFonts,
  IbukiRadius,
  IbukiSpacing,
} from "@/constants/ibuki-theme";
import type { RecommendedHobby } from "@/hooks/use-hobby-recommendations";

import { Kicker, PillButton } from "./ibuki-ui";

const SHEET_CLOSE_DISTANCE = 120;
const SHEET_CLOSE_VELOCITY = 900;
const SHEET_HIDDEN_BUFFER = 48;
const SHEET_OPEN_DURATION_MS = 220;
const SHEET_CLOSE_DURATION_MS = 180;
const BACKDROP_DURATION_MS = 160;

type Props = {
  visible: boolean;
  status: "loading" | "success" | "error" | "idle";
  recommendations?: RecommendedHobby[];
  errorMessage?: string;
  onClose: () => void;
  onAdd?: (hobby: RecommendedHobby) => void;
  onAddManual?: (input: ManualSukiInput) => void | Promise<void>;
  onRetry?: () => void;
};

export type ManualSukiInput = {
  title: string;
  category: string;
  detail: string;
};

export function HobbyRecommendationModal({
  visible,
  status,
  recommendations = [],
  errorMessage,
  onClose,
  onAdd,
  onAddManual,
  onRetry,
}: Props) {
  const { height } = useWindowDimensions();
  const [isRendered, setIsRendered] = useState(visible);
  const hiddenTranslateY = useSharedValue(height + SHEET_HIDDEN_BUFFER);
  const sheetTranslateY = useSharedValue(height + SHEET_HIDDEN_BUFFER);
  const backdropOpacity = useSharedValue(0);

  const finishDismiss = useCallback(() => {
    setIsRendered(false);
    onClose();
  }, [onClose]);

  const dismissWithAnimation = useCallback(() => {
    backdropOpacity.value = withTiming(0, { duration: BACKDROP_DURATION_MS });
    sheetTranslateY.value = withTiming(
      hiddenTranslateY.value,
      { duration: SHEET_CLOSE_DURATION_MS },
      (finished) => {
        if (finished) {
          runOnJS(finishDismiss)();
        }
      },
    );
  }, [backdropOpacity, finishDismiss, hiddenTranslateY, sheetTranslateY]);

  useEffect(() => {
    hiddenTranslateY.value = height + SHEET_HIDDEN_BUFFER;
    if (!visible && !isRendered) {
      sheetTranslateY.value = hiddenTranslateY.value;
    }
  }, [height, hiddenTranslateY, isRendered, sheetTranslateY, visible]);

  useEffect(() => {
    if (visible) {
      setIsRendered(true);
    }
  }, [visible]);

  useEffect(() => {
    if (!isRendered) return;

    if (visible) {
      backdropOpacity.value = 0;
      sheetTranslateY.value = hiddenTranslateY.value;
      backdropOpacity.value = withTiming(1, { duration: BACKDROP_DURATION_MS });
      sheetTranslateY.value = withTiming(0, {
        duration: SHEET_OPEN_DURATION_MS,
      });
      return;
    }

    backdropOpacity.value = withTiming(0, { duration: BACKDROP_DURATION_MS });
    sheetTranslateY.value = withTiming(
      hiddenTranslateY.value,
      { duration: SHEET_CLOSE_DURATION_MS },
      (finished) => {
        if (finished) {
          runOnJS(setIsRendered)(false);
        }
      },
    );
  }, [backdropOpacity, hiddenTranslateY, isRendered, sheetTranslateY, visible]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetTranslateY.value }],
  }));

  const panGesture = Gesture.Pan()
    .activeOffsetY(8)
    .onUpdate((event) => {
      sheetTranslateY.value = Math.max(event.translationY, 0);
    })
    .onEnd((event) => {
      const shouldClose =
        event.translationY > SHEET_CLOSE_DISTANCE ||
        event.velocityY > SHEET_CLOSE_VELOCITY;

      if (shouldClose) {
        backdropOpacity.value = withTiming(0, {
          duration: BACKDROP_DURATION_MS,
        });
        sheetTranslateY.value = withTiming(
          hiddenTranslateY.value,
          { duration: SHEET_CLOSE_DURATION_MS },
          (finished) => {
            if (finished) {
              runOnJS(finishDismiss)();
            }
          },
        );
        return;
      }

      sheetTranslateY.value = withSpring(0, { damping: 18, stiffness: 180 });
    });

  if (!isRendered) {
    return null;
  }

  return (
    <Modal
      visible={isRendered}
      transparent
      animationType="none"
      onRequestClose={dismissWithAnimation}
    >
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={dismissWithAnimation}
        />
      </Animated.View>

      <Animated.View style={[styles.sheet, sheetStyle]}>
        <GestureDetector gesture={panGesture}>
          <View style={styles.dragArea}>
            {/* Handle bar */}
            <View style={styles.handle} />

            {/* Header */}
            <View style={styles.header}>
              <View>
                <Kicker>AI · YouTube分析</Kicker>
                <Text style={styles.title}>あなたへのsuki候補</Text>
              </View>
              <Pressable
                onPress={dismissWithAnimation}
                style={styles.closeButton}
              >
                <Text style={styles.closeText}>✕</Text>
              </Pressable>
            </View>
          </View>
        </GestureDetector>

        <ScrollView
          style={styles.bodyScroll}
          contentContainerStyle={styles.bodyContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ManualSukiForm onAddManual={onAddManual} />

          <View style={styles.aiSection}>
            <Kicker>AI SUGGESTIONS</Kicker>
            {status === "loading" && <LoadingBody />}
            {status === "error" && (
              <ErrorBody message={errorMessage ?? ""} onRetry={onRetry} />
            )}
            {status === "success" && (
              <SuccessBody recommendations={recommendations} onAdd={onAdd} />
            )}
            {status === "idle" && (
              <Text style={styles.emptyText}>
                YouTube分析の候補はここに表示されます。
              </Text>
            )}
          </View>
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Manual input state
// ---------------------------------------------------------------------------

function ManualSukiForm({
  onAddManual,
}: {
  onAddManual?: (input: ManualSukiInput) => void | Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [detail, setDetail] = useState("");
  const [validationMessage, setValidationMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trimmedTitle = title.trim();
  const trimmedCategory = category.trim();
  const trimmedDetail = detail.trim();

  async function handleSubmit() {
    if (!onAddManual || isSubmitting) return;

    if (!trimmedTitle) {
      setValidationMessage("sukiの名前を入力してください。");
      return;
    }

    setValidationMessage("");
    setIsSubmitting(true);

    try {
      await onAddManual({
        title: trimmedTitle,
        category: trimmedCategory || "suki",
        detail: trimmedDetail,
      });
      setTitle("");
      setCategory("");
      setDetail("");
    } catch {
      setValidationMessage("追加できませんでした。もう一度試してください。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.manualCard}>
      <View style={styles.manualHeader}>
        <View>
          <Kicker>MY SUKI</Kicker>
          <Text style={styles.manualTitle}>自分でsukiを追加</Text>
        </View>
        <Text style={styles.requiredMark}>必須</Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>名前</Text>
        <TextInput
          value={title}
          onChangeText={(value) => {
            setTitle(value);
            if (validationMessage) setValidationMessage("");
          }}
          placeholder="例：喫茶店めぐり"
          placeholderTextColor={IbukiColors.soft}
          style={styles.input}
          maxLength={100}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>カテゴリ</Text>
        <TextInput
          value={category}
          onChangeText={setCategory}
          placeholder="例：街歩き"
          placeholderTextColor={IbukiColors.soft}
          style={styles.input}
          maxLength={100}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>メモ</Text>
        <TextInput
          value={detail}
          onChangeText={setDetail}
          placeholder="どんなところが好き？"
          placeholderTextColor={IbukiColors.soft}
          style={[styles.input, styles.inputMultiline]}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      {validationMessage ? (
        <Text style={styles.validationText}>{validationMessage}</Text>
      ) : null}

      <Pressable
        accessibilityRole="button"
        disabled={!onAddManual || isSubmitting}
        onPress={handleSubmit}
        style={({ pressed }) => [
          styles.manualSubmit,
          (!onAddManual || isSubmitting) && styles.manualSubmitDisabled,
          pressed && styles.pressed,
        ]}
      >
        {isSubmitting ? (
          <ActivityIndicator color={IbukiColors.background} size="small" />
        ) : (
          <Text style={styles.manualSubmitText}>このsukiを追加</Text>
        )}
      </Pressable>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Loading state
// ---------------------------------------------------------------------------

function LoadingBody() {
  return (
    <View style={styles.bodyCenter}>
      <ActivityIndicator size="large" color={IbukiColors.accent} />
      <Text style={styles.loadingText}>
        YouTubeをもとに{"\n"}興味を読み取っています…
      </Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Error state
// ---------------------------------------------------------------------------

function ErrorBody({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <View style={styles.bodyCenter}>
      <Text style={styles.errorIcon}>！</Text>
      <Text style={styles.errorText}>{message}</Text>
      {onRetry && (
        <PillButton
          label="もう一度試す"
          variant="dark"
          onPress={onRetry}
          style={styles.retryButton}
        />
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Success state
// ---------------------------------------------------------------------------

function SuccessBody({
  recommendations,
  onAdd,
}: {
  recommendations: RecommendedHobby[];
  onAdd?: (hobby: RecommendedHobby) => void;
}) {
  if (recommendations.length === 0) {
    return (
      <View style={styles.bodyCenter}>
        <Text style={styles.emptyText}>
          おすすめが見つかりませんでした。{"\n"}
          しばらくしてから再度お試しください。
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.successBody}>
      <Text style={styles.subtitle}>
        YouTubeの視聴傾向から{recommendations.length}つのsukiを見つけました
      </Text>

      {recommendations.map((hobby) => (
        <View key={hobby.nameJa} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardNameJa}>{hobby.nameJa}</Text>
            <Text style={styles.cardNameEn}>{hobby.nameEn}</Text>
          </View>

          <View style={styles.tagRow}>
            {hobby.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.reasonText}>{hobby.reason}</Text>

          {onAdd && (
            <PillButton
              label="sukiに追加"
              variant="accent"
              onPress={() => onAdd(hobby)}
              style={styles.addButton}
            />
          )}
        </View>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: "rgba(20,18,14,0.45)",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  sheet: {
    backgroundColor: IbukiColors.background,
    borderTopLeftRadius: IbukiRadius.xl,
    borderTopRightRadius: IbukiRadius.xl,
    bottom: 0,
    left: 0,
    maxHeight: "88%",
    minHeight: 340,
    paddingBottom: IbukiSpacing.xxxl,
    paddingHorizontal: IbukiSpacing.lg,
    paddingTop: IbukiSpacing.sm,
    position: "absolute",
    right: 0,
  },
  dragArea: {
    marginHorizontal: -IbukiSpacing.lg,
    paddingHorizontal: IbukiSpacing.lg,
  },
  handle: {
    alignSelf: "center",
    backgroundColor: IbukiColors.line,
    borderRadius: IbukiRadius.pill,
    height: 4,
    marginBottom: IbukiSpacing.md,
    width: 40,
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: IbukiSpacing.lg,
  },
  title: {
    color: IbukiColors.ink,
    fontFamily: IbukiFonts.sansBold,
    fontSize: 20,
    fontWeight: "700",
    marginTop: 4,
  },
  closeButton: {
    alignItems: "center",
    backgroundColor: IbukiColors.surface,
    borderColor: IbukiColors.line,
    borderRadius: IbukiRadius.pill,
    borderWidth: 1,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  closeText: {
    color: IbukiColors.mid,
    fontFamily: IbukiFonts.sansBold,
    fontSize: 13,
  },
  bodyCenter: {
    alignItems: "center",
    gap: IbukiSpacing.lg,
    justifyContent: "center",
    paddingVertical: IbukiSpacing.xl,
  },
  loadingText: {
    color: IbukiColors.mid,
    fontFamily: IbukiFonts.sans,
    fontSize: 14,
    textAlign: "center",
  },
  errorIcon: {
    color: IbukiColors.hot,
    fontSize: 32,
  },
  errorText: {
    color: IbukiColors.inkSoft,
    fontFamily: IbukiFonts.sans,
    fontSize: 14,
    textAlign: "center",
  },
  retryButton: {
    marginTop: IbukiSpacing.xs,
    paddingHorizontal: IbukiSpacing.xl,
  },
  emptyText: {
    color: IbukiColors.mid,
    fontFamily: IbukiFonts.sans,
    fontSize: 14,
    textAlign: "center",
  },
  bodyScroll: {
    flex: 1,
  },
  bodyContent: {
    gap: IbukiSpacing.lg,
    paddingBottom: IbukiSpacing.lg,
  },
  manualCard: {
    backgroundColor: IbukiColors.surface,
    borderColor: IbukiColors.line,
    borderRadius: IbukiRadius.md,
    borderWidth: 1,
    gap: IbukiSpacing.md,
    padding: IbukiSpacing.md,
  },
  manualHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  manualTitle: {
    color: IbukiColors.ink,
    fontFamily: IbukiFonts.sansBold,
    fontSize: 18,
    fontWeight: "700",
    marginTop: 2,
  },
  requiredMark: {
    backgroundColor: IbukiColors.accentTint,
    borderRadius: IbukiRadius.pill,
    color: IbukiColors.accentDeep,
    fontFamily: IbukiFonts.sansBold,
    fontSize: 11,
    fontWeight: "700",
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  field: {
    gap: IbukiSpacing.xs,
  },
  fieldLabel: {
    color: IbukiColors.mid,
    fontFamily: IbukiFonts.sansBold,
    fontSize: 12,
    fontWeight: "700",
  },
  input: {
    backgroundColor: IbukiColors.background,
    borderColor: IbukiColors.line,
    borderRadius: IbukiRadius.sm,
    borderWidth: 1,
    color: IbukiColors.ink,
    fontFamily: IbukiFonts.sans,
    fontSize: 15,
    minHeight: 44,
    paddingHorizontal: IbukiSpacing.md,
    paddingVertical: 10,
  },
  inputMultiline: {
    minHeight: 82,
  },
  validationText: {
    color: IbukiColors.hot,
    fontFamily: IbukiFonts.sans,
    fontSize: 12,
  },
  manualSubmit: {
    alignItems: "center",
    backgroundColor: IbukiColors.ink,
    borderRadius: IbukiRadius.pill,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: IbukiSpacing.lg,
  },
  manualSubmitDisabled: {
    opacity: 0.5,
  },
  manualSubmitText: {
    color: IbukiColors.background,
    fontFamily: IbukiFonts.sansBold,
    fontSize: 14,
    fontWeight: "700",
  },
  aiSection: {
    gap: IbukiSpacing.md,
  },
  successBody: {
    gap: IbukiSpacing.md,
  },
  subtitle: {
    color: IbukiColors.mid,
    fontFamily: IbukiFonts.sans,
    fontSize: 12,
  },
  card: {
    backgroundColor: IbukiColors.surface,
    borderColor: IbukiColors.line,
    borderRadius: IbukiRadius.md,
    borderWidth: 1,
    gap: IbukiSpacing.sm,
    padding: IbukiSpacing.md,
  },
  cardHeader: {
    gap: 2,
  },
  cardNameJa: {
    color: IbukiColors.ink,
    fontFamily: IbukiFonts.sansBold,
    fontSize: 18,
    fontWeight: "700",
  },
  cardNameEn: {
    color: IbukiColors.mid,
    fontFamily: IbukiFonts.sans,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: IbukiSpacing.xs,
  },
  tag: {
    backgroundColor: IbukiColors.accentTint,
    borderRadius: IbukiRadius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    color: IbukiColors.accentDeep,
    fontFamily: IbukiFonts.sansBold,
    fontSize: 11,
    fontWeight: "700",
  },
  reasonText: {
    color: IbukiColors.inkSoft,
    fontFamily: IbukiFonts.sans,
    fontSize: 13,
    lineHeight: 20,
  },
  addButton: {
    alignSelf: "flex-start",
    marginTop: IbukiSpacing.xs,
  },
  pressed: {
    opacity: 0.72,
  },
});
