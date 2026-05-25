import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import {
  IbukiColors,
  IbukiFonts,
  IbukiRadius,
  IbukiSpacing,
} from "@/constants/ibuki-theme";
import type { RecommendedHobby } from "@/hooks/use-hobby-recommendations";

import { Kicker, PillButton } from "./ibuki-ui";

type Props = {
  visible: boolean;
  status: "loading" | "success" | "error" | "idle";
  recommendations?: RecommendedHobby[];
  errorMessage?: string;
  onClose: () => void;
  onAdd?: (hobby: RecommendedHobby) => void;
  onRetry?: () => void;
};

export function HobbyRecommendationModal({
  visible,
  status,
  recommendations = [],
  errorMessage,
  onClose,
  onAdd,
  onRetry,
}: Props) {
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
            onAdd={onAdd}
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
  onAdd?: (hobby: RecommendedHobby) => void;
}) {
  if (recommendations.length === 0) {
    return (
      <View style={styles.bodyCenter}>
        <Text style={styles.emptyText}>
          おすすめが見つかりませんでした。{"\n"}しばらくしてから再度お試しください。
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.successScroll}
      contentContainerStyle={styles.successBody}
      showsVerticalScrollIndicator={false}
    >
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
    </ScrollView>
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
  successScroll: {
    flex: 1,
  },
  successBody: {
    gap: IbukiSpacing.md,
    paddingBottom: IbukiSpacing.lg,
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
});
