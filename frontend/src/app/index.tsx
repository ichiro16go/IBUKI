import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import {
  BodyText,
  Heading,
  IbukiScreen,
  Kicker,
  PillButton,
  PhotoBlock,
} from "@/components/ibuki-ui";
import {
  IbukiColors,
  IbukiFonts,
  IbukiRadius,
  IbukiSpacing,
} from "@/constants/ibuki-theme";
import { hobbies } from "@/data/ibuki";

export default function HomeScreen() {
  const stackedHobbies = [hobbies[3], hobbies[1], hobbies[0]];

  return (
    <IbukiScreen scroll={false}>
      <View style={styles.brandRow}>
        <View style={styles.brandMark}>
          <Text style={styles.brandMarkText}>i</Text>
        </View>
        <Text style={styles.brandText}>IBUKI</Text>
        <Text
          style={styles.skipText}
          onPress={() => router.replace("/encounters" as never)}
        >
          SKIP
        </Text>
      </View>

      <View style={styles.stack}>
        {stackedHobbies.map((hobby, index) => (
          <View key={hobby.id} style={[styles.stackCard, cardOffsets[index]]}>
            <View style={styles.stackCardHeader}>
              <Kicker>NO. {hobby.number}</Kicker>
              {index === 2 && <Text style={styles.heartIcon}>♥</Text>}
            </View>
            <PhotoBlock hobby={hobby} height={132} />
            <Text style={styles.stackTitle}>{hobby.nameJa}</Text>
            <Text style={styles.stackSub}>{hobby.nameEn}</Text>
          </View>
        ))}
        <View style={styles.stackBadge}>
          <Kicker>3分前にすれ違い</Kicker>
        </View>
      </View>

      <View style={styles.heroCopy}>
        <Heading>まだ知らない趣味と、{"\n"}街ですれ違う。</Heading>
        <BodyText>
          Ibukiは、街中ですれ違った誰かの趣味カードを受け取れるアプリです。
          人ではなく、趣味との偶然の出会いを楽しもう。
        </BodyText>
      </View>

      <View style={styles.actions}>
        <PillButton
          label="はじめる"
          variant="dark"
          icon={{
            ios: "arrow.right",
            android: "arrow_forward",
            web: "arrow.right",
          }}
          onPress={() => router.replace("/encounters" as never)}
        />
        <PillButton
          label="仕組みを見る"
          onPress={() => router.replace("/entry" as never)}
        />
      </View>
    </IbukiScreen>
  );
}

const cardOffsets = [
  {
    left: 0,
    top: 28,
    transform: [{ rotate: "-9deg" }],
  },
  {
    right: 2,
    top: 16,
    transform: [{ rotate: "8deg" }],
  },
  {
    left: 86,
    top: 70,
    transform: [{ rotate: "-1deg" }],
    zIndex: 3,
  },
] as const;

const styles = StyleSheet.create({
  brandRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: IbukiSpacing.xs,
    paddingTop: IbukiSpacing.xs,
  },
  brandMark: {
    alignItems: "center",
    backgroundColor: IbukiColors.ink,
    borderRadius: 11,
    height: 22,
    justifyContent: "center",
    width: 22,
  },
  brandMarkText: {
    color: IbukiColors.background,
    fontFamily: IbukiFonts?.serifBold,
    fontSize: 15,
    fontWeight: "700",
  },
  brandText: {
    color: IbukiColors.ink,
    fontFamily: IbukiFonts?.monoBold,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  skipText: {
    color: IbukiColors.mid,
    fontFamily: IbukiFonts?.monoBold,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.1,
    marginLeft: "auto",
  },
  stack: {
    height: 328,
    marginTop: IbukiSpacing.md,
    position: "relative",
  },
  stackCard: {
    backgroundColor: IbukiColors.surface,
    borderColor: IbukiColors.line,
    borderRadius: IbukiRadius.lg,
    borderWidth: 1,
    padding: IbukiSpacing.sm,
    position: "absolute",
    width: 206,
  },
  stackCardHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: IbukiSpacing.xs,
  },
  stackTitle: {
    color: IbukiColors.ink,
    fontFamily: IbukiFonts?.serif,
    fontSize: 22,
    fontWeight: "500",
    marginTop: IbukiSpacing.sm,
    textAlign: "center",
  },
  stackSub: {
    color: IbukiColors.mid,
    fontFamily: IbukiFonts?.sansBold,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
    textAlign: "center",
  },
  heartIcon: {
    color: IbukiColors.hot,
    fontSize: 17,
    fontWeight: "700",
    lineHeight: 19,
  },
  stackBadge: {
    backgroundColor: IbukiColors.surface,
    borderColor: IbukiColors.line,
    borderRadius: IbukiRadius.pill,
    borderWidth: 1,
    bottom: 20,
    left: 18,
    paddingHorizontal: IbukiSpacing.sm,
    paddingVertical: 7,
    position: "absolute",
  },
  heroCopy: {
    gap: IbukiSpacing.md,
    flex: 1,
  },
  actions: {
    gap: IbukiSpacing.xs,
  },
});
