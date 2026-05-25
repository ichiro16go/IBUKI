import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
  JetBrainsMono_700Bold,
} from "@expo-google-fonts/jetbrains-mono";
import {
  ShipporiMinchoB1_400Regular,
  ShipporiMinchoB1_500Medium,
  ShipporiMinchoB1_700Bold,
} from "@expo-google-fonts/shippori-mincho-b1";
import {
  ZenKakuGothicNew_400Regular,
  ZenKakuGothicNew_500Medium,
  ZenKakuGothicNew_700Bold,
} from "@expo-google-fonts/zen-kaku-gothic-new";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useColorScheme } from "react-native";

import { IbukiFonts } from "@/constants/ibuki-theme";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded, fontLoadError] = useFonts({
    [IbukiFonts.sansRegular]: ZenMaruGothic_400Regular,
    [IbukiFonts.sans]: ZenMaruGothic_500Medium,
    [IbukiFonts.sansBold]: ZenMaruGothic_700Bold,
    [IbukiFonts.monoRegular]: SpaceMono_400Regular,
    [IbukiFonts.mono]: SpaceMono_400Regular,
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
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="hobby/[id]" />
      </Stack>
    </ThemeProvider>
  );
}
