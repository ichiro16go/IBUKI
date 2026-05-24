import { Slot } from "expo-router";
import { View } from "react-native";

import { BottomTabBar } from "@/components/ibuki-ui";

export default function TabsLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Slot />
      <BottomTabBar />
    </View>
  );
}
