import { StyleSheet, Text, View } from "react-native";

import {
  IbukiColors,
  IbukiFonts,
  IbukiRadius,
  IbukiSpacing,
} from "@/constants/ibuki-theme";

import { PillButton } from "../ibuki-ui";

export function AiOptInBody({
  onRequestAiRecommendations,
}: {
  onRequestAiRecommendations?: () => void;
}) {
  return (
    <View style={styles.aiOptInCard}>
      <Text style={styles.aiOptInTitle}>AIレコメンドを使いますか？</Text>
      <Text style={styles.aiOptInText}>
        YouTubeの登録チャンネル・高評価・プレイリストをもとに、あなたのsuki候補を提案します。
      </Text>
      {onRequestAiRecommendations && (
        <PillButton
          label="AIに提案してもらう"
          variant="accent"
          onPress={onRequestAiRecommendations}
          style={styles.aiOptInButton}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  aiOptInCard: {
    backgroundColor: IbukiColors.surface,
    borderColor: IbukiColors.line,
    borderRadius: IbukiRadius.md,
    borderWidth: 1,
    gap: IbukiSpacing.sm,
    padding: IbukiSpacing.md,
  },
  aiOptInTitle: {
    color: IbukiColors.ink,
    fontFamily: IbukiFonts.sansBold,
    fontSize: 17,
    fontWeight: "700",
  },
  aiOptInText: {
    color: IbukiColors.inkSoft,
    fontFamily: IbukiFonts.sans,
    fontSize: 13,
    lineHeight: 20,
  },
  aiOptInButton: {
    alignSelf: "flex-start",
    marginTop: IbukiSpacing.xs,
  },
});
