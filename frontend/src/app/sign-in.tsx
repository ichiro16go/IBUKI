import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/auth";
import {
  IbukiColors,
  IbukiFonts,
  IbukiRadius,
  IbukiSpacing,
} from "@/constants/ibuki-theme";

export default function SignInScreen() {
  const { signInWithGoogle, session } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Automatically navigate to encounters when session is available
  useEffect(() => {
    if (session) {
      router.replace("/(tabs)/encounters" as never);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const didSignIn = await signInWithGoogle();
      if (!didSignIn) {
        setLoading(false);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "サインインに失敗しました");
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.brandMark}>
          <Text style={styles.brandMarkText}>i</Text>
        </View>
        <Text style={styles.brandText}>IBUKI</Text>
      </View>

      <Text style={styles.subtitle}>まだ知らない趣味と、{"\n"}街ですれ違う。</Text>

      {error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.button, styles.googleButton]}
          onPress={handleSignIn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={IbukiColors.ink} />
          ) : (
            <Text style={[styles.buttonText, styles.googleText]}>
              Googleでサインイン
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: IbukiSpacing.xl,
    backgroundColor: IbukiColors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: IbukiSpacing.xs,
    marginBottom: IbukiSpacing.xxl,
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
    fontFamily: IbukiFonts.sansBold,
    fontSize: 15,
    fontWeight: "700",
  },
  brandText: {
    color: IbukiColors.ink,
    fontFamily: IbukiFonts.monoBold,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: 26,
    fontFamily: IbukiFonts.sans,
    fontWeight: "500",
    textAlign: "center",
    color: IbukiColors.ink,
    marginBottom: IbukiSpacing.xxxl,
    lineHeight: 38,
  },
  error: {
    color: IbukiColors.hot,
    marginBottom: IbukiSpacing.md,
    textAlign: "center",
    fontFamily: IbukiFonts.sans,
    fontSize: 13,
  },
  buttons: {
    width: "100%",
    gap: IbukiSpacing.sm,
  },
  button: {
    paddingVertical: IbukiSpacing.md,
    paddingHorizontal: IbukiSpacing.xl,
    borderRadius: IbukiRadius.pill,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
  },
  googleButton: {
    backgroundColor: IbukiColors.surface,
    borderWidth: 1,
    borderColor: IbukiColors.line,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: IbukiFonts.sans,
  },
  googleText: {
    color: IbukiColors.ink,
  },
});
