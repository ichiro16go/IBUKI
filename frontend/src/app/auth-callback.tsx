import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAuth } from "@/contexts/auth";
import {
  IbukiColors,
  IbukiFonts,
  IbukiRadius,
  IbukiSpacing,
} from "@/constants/ibuki-theme";

export default function AuthCallbackScreen() {
  const router = useRouter();
  const { authError, clearAuthError, isLoading, session } = useAuth();
  const [didTimeout, setDidTimeout] = useState(false);

  useEffect(() => {
    if (session) {
      router.replace("/(tabs)/encounters" as never);
    }
  }, [router, session]);

  useEffect(() => {
    if (authError || session) {
      setDidTimeout(false);
      return;
    }

    const timeout = setTimeout(() => {
      setDidTimeout(true);
    }, 10000);

    return () => clearTimeout(timeout);
  }, [authError, session]);

  useEffect(() => {
    return () => {
      clearAuthError();
    };
  }, [clearAuthError]);

  const error =
    authError ||
    (didTimeout && !isLoading && !session
      ? "認証結果を確認できませんでした。もう一度お試しください。"
      : null);

  return (
    <View style={styles.container}>
      {error ? (
        <>
          <Text style={styles.title}>サインインを完了できませんでした</Text>
          <Text style={styles.description}>{error}</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.replace("/sign-in" as never)}
          >
            <Text style={styles.buttonText}>サインインに戻る</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <ActivityIndicator color={IbukiColors.ink} size="large" />
          <Text style={styles.title}>サインインを完了しています</Text>
          <Text style={styles.description}>
            認証情報を確認でき次第、そのままアプリに戻ります。
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: IbukiSpacing.xl,
    backgroundColor: IbukiColors.background,
  },
  title: {
    marginTop: IbukiSpacing.lg,
    color: IbukiColors.ink,
    fontFamily: IbukiFonts.sansBold,
    fontSize: 24,
    textAlign: "center",
  },
  description: {
    marginTop: IbukiSpacing.sm,
    color: IbukiColors.mid,
    fontFamily: IbukiFonts.sans,
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
  },
  button: {
    marginTop: IbukiSpacing.xl,
    minWidth: 220,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: IbukiRadius.pill,
    backgroundColor: IbukiColors.ink,
    paddingHorizontal: IbukiSpacing.xl,
    paddingVertical: IbukiSpacing.md,
  },
  buttonText: {
    color: IbukiColors.background,
    fontFamily: IbukiFonts.sansBold,
    fontSize: 16,
  },
});
