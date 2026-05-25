import { router } from "expo-router";
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from "react-native";

import {
  IbukiColors,
  IbukiFonts,
  IbukiRadius,
  IbukiSpacing,
} from "@/constants/ibuki-theme";
import { hobbies } from "@/data/ibuki";
import type { RecommendedHobby } from "@/hooks/use-hobby-recommendations";

import { HobbyCard, Kicker, PillButton } from "./ibuki-ui";

type Props = {
  visible: boolean;
  status: "loading" | "success" | "error" | "idle";
  recommendations?: RecommendedHobby[];
  errorMessage?: string;
  onClose: () => void;
  onRetry?: () => void;
};

export function HobbyRecommendationModal({
  visible,
  status,
  recommendations = [],
  errorMessage,
  onClose,
  onRetry,
}: Props) {
  function handleAddHobby(hobbyId: string) {
    onClose();
    router.push({
      pathname: "/hobby/[id]",
      params: { id: hobbyId },
    } as never);
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={styles.sheet}>
        {/* Handle bar */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Kicker>AI · YouTube分析</Kicker>
            <Text style={styles.title}>あなたへのsuki候補</Text>
          </View>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
        </View>

        {/* Body */}
        {status === "loading" && <LoadingBody />}
        {status === "error" && (
          <ErrorBody message={errorMessage ?? ""} onRetry={onRetry} />
        )}
        {status === "success" && (
          <SuccessBody
            recommendations={recommendations}
            onAdd={handleAddHobby}
          />
        )}
      </View>
    </Modal>
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
        YouTubeをもとに{"\n"}趣味を探しています…
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
  onAdd: (hobbyId: string) => void;
}) {
  if (recommendations.length === 0) {
    return (
      <View style={styles.bodyCenter}>
        <Text style={styles.emptyText}>
          おすすめが見つかりませんでした。{"\n"}すでにすべての趣味を追加済みかもしれません。
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.successBody}>
      <Text style={styles.subtitle}>
        YouTubeの視聴傾向から3つのsukiを見つけました
      </Text>

      <View style={styles.cardList}>
        {recommendations.map(({ hobbyId, reason }) => {
          const hobby = hobbies.find((h) => h.id === hobbyId);
          if (!hobby) return null;

          return (
            <View key={hobbyId} style={styles.cardRow}>
              <View style={styles.cardWrapper}>
                <HobbyCard hobby={hobby} compact />
              </View>
              <View style={styles.cardMeta}>
                <Text style={styles.reasonText}>{reason}</Text>
                <PillButton
                  label="趣味を追加"
                  variant="accent"
                  onPress={() => onAdd(hobbyId)}
                  style={styles.addButton}
                />
              </View>
            </View>
          );
        })}
      </View>
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
    paddingVertical: IbukiSpacing.xxxl,
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
  successBody: {
    gap: IbukiSpacing.md,
  },
  subtitle: {
    color: IbukiColors.mid,
    fontFamily: IbukiFonts.sans,
    fontSize: 12,
  },
  cardList: {
    gap: IbukiSpacing.md,
  },
  cardRow: {
    backgroundColor: IbukiColors.surface,
    borderColor: IbukiColors.line,
    borderRadius: IbukiRadius.md,
    borderWidth: 1,
    flexDirection: "row",
    overflow: "hidden",
  },
  cardWrapper: {
    width: "46%",
  },
  cardMeta: {
    flex: 1,
    gap: IbukiSpacing.sm,
    justifyContent: "center",
    padding: IbukiSpacing.md,
  },
  reasonText: {
    color: IbukiColors.inkSoft,
    fontFamily: IbukiFonts.sans,
    fontSize: 12,
    lineHeight: 18,
  },
  addButton: {
    alignSelf: "flex-start",
  },
});
