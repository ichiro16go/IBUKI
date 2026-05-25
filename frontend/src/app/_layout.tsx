import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import {
  ZenMaruGothic_400Regular,
  ZenMaruGothic_500Medium,
  ZenMaruGothic_700Bold,
} from "@expo-google-fonts/zen-maru-gothic";
import {
  SpaceMono_400Regular,
  SpaceMono_700Bold,
} from "@expo-google-fonts/space-mono";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { IbukiFonts } from "@/constants/ibuki-theme";
import { AuthProvider, useAuth } from "@/contexts/auth";
import { EncounterPreferencesProvider } from "@/state/encounter-preferences";

void SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { session, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const seg = segments[0] as string | undefined;
    const inTabs = seg === "(tabs)";
    const onPublicScreen = seg === "sign-in" || seg === "auth-callback" || !seg;

    if (!session && inTabs) {
      router.replace("/sign-in");
    } else if (session && onPublicScreen) {
      router.replace("/(tabs)/encounters" as never);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, isLoading]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="hobby/[id]" />
      <Stack.Screen name="suki/[id]" />
      <Stack.Screen name="planter/[id]" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="auth-callback" />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded, fontLoadError] = useFonts({
    [IbukiFonts.sansRegular]: ZenMaruGothic_400Regular,
    [IbukiFonts.sans]: ZenMaruGothic_500Medium,
    [IbukiFonts.sansBold]: ZenMaruGothic_700Bold,
    [IbukiFonts.monoRegular]: SpaceMono_400Regular,
    [IbukiFonts.monoBold]: SpaceMono_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontLoadError) {
      void SplashScreen.hideAsync();
    }
  }, [fontLoadError, fontsLoaded]);

  if (!fontsLoaded && !fontLoadError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <AuthProvider>
          <EncounterPreferencesProvider>
            <RootNavigator />
          </EncounterPreferencesProvider>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
