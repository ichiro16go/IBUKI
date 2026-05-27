import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { IbukiColors, IbukiFonts, IbukiSpacing } from "@/constants/ibuki-theme";

export function LoadingBody() {
  return (
    <View style={styles.bodyCenter}>
      <ActivityIndicator size="large" color={IbukiColors.accent} />
      <Text style={styles.loadingText}>
        YouTubeをもとに{"\n"}興味を読み取っています…
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
