import { useEffect, useMemo, useRef, useState } from "react";
import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
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
  const { session, completeAuthSessionFromUrl } = useAuth();
  const url = Linking.useURL();
  const params = useLocalSearchParams<{
    code?: string;
    error?: string;
    error_description?: string;
  }>();
  const [error, setError] = useState<string | null>(null);
  const lastProcessedUrlRef = useRef<string | null>(null);

  const callbackUrl = useMemo(() => {
    if (url) {
      return url;
    }

    const queryParams = new URLSearchParams();

    if (typeof params.code === "string") {
      queryParams.set("code", params.code);
    }

    if (typeof params.error === "string") {
      queryParams.set("error", params.error);
    }

    if (typeof params.error_description === "string") {
      queryParams.set("error_description", params.error_description);
    }

    const query = queryParams.toString();
    if (!query) {
      return null;
    }

    return `${Linking.createURL("/auth-callback")}?${query}`;
  }, [params.code, params.error, params.error_description, url]);

  useEffect(() => {
    if (session) {
      router.replace("/(tabs)/encounters" as never);
    }
  }, [router, session]);

  useEffect(() => {
    if (!callbackUrl || lastProcessedUrlRef.current === callbackUrl) {
      return;
    }

    lastProcessedUrlRef.current = callbackUrl;
    let cancelled = false;

    const completeSignIn = async () => {
      try {
        const handled = await completeAuthSessionFromUrl(callbackUrl);

        if (!handled && !cancelled) {
          setError("認証結果を確認できませんでした。もう一度お試しください。");
        }
      } catch (authError) {
        if (!cancelled) {
          setError(
            authError instanceof Error
              ? authError.message
              : "認証に失敗しました。もう一度お試しください。",
          );
        }
      }
    };

    void completeSignIn();

    return () => {
      cancelled = true;
    };
  }, [callbackUrl, completeAuthSessionFromUrl]);

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
