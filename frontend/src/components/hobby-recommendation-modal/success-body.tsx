import { StyleSheet, Text, View } from "react-native";

import {
  IbukiColors,
  IbukiFonts,
  IbukiRadius,
  IbukiSpacing,
} from "@/constants/ibuki-theme";
import type { RecommendedHobby } from "@/hooks/use-hobby-recommendations";

import { PillButton } from "../ibuki-ui";

export function SuccessBody({
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

const styles = StyleSheet.create({
  bodyCenter: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: IbukiSpacing.xl,
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
