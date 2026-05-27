import { StyleSheet, Text, View } from "react-native";

import { IbukiColors, IbukiFonts, IbukiSpacing } from "@/constants/ibuki-theme";

import { PillButton } from "../ibuki-ui";

export function ErrorBody({
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

const styles = StyleSheet.create({
  bodyCenter: {
    alignItems: "center",
    gap: IbukiSpacing.lg,
    justifyContent: "center",
    paddingVertical: IbukiSpacing.xl,
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
});
