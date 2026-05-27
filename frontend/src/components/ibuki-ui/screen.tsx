import { router, usePathname } from "expo-router";
import type { ReactNode } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  IbukiColors,
  IbukiFonts,
  IbukiRadius,
  IbukiSpacing,
  PhoneMaxWidth,
  TabBarHeight,
} from "@/constants/ibuki-theme";

import { AppSymbol } from "./_internal";
import { Heading, Kicker } from "./typography";

export function IbukiScreen({
  children,
  withTabBar = false,
  scroll = true,
  style,
}: {
  children: ReactNode;
  withTabBar?: boolean;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const content = (
    <SafeAreaView
      style={[styles.phone, style]}
      edges={["top", "left", "right"]}
    >
      {scroll ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            withTabBar && styles.scrollContentWithTabs,
          ]}
        >
          {children}
        </ScrollView>
      ) : (
        <View
          style={[
            styles.staticContent,
            withTabBar && styles.staticContentWithTabs,
          ]}
        >
          {children}
        </View>
      )}
    </SafeAreaView>
  );

  return <View style={styles.appBackdrop}>{content}</View>;
}

export function TopBar({
  title,
  kicker,
  left,
  right,
}: {
  title?: string;
  kicker?: string;
  left?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <View style={styles.topBar}>
      {left ?? (
        <View>
          {kicker && <Kicker>{kicker}</Kicker>}
          {title && <Heading size="small">{title}</Heading>}
        </View>
      )}
      <View style={styles.topBarRight}>{right}</View>
    </View>
  );
}

export function BottomTabBar() {
  const pathname = usePathname();
  const tabs = [
    {
      path: "/encounters",
      label: "すれ違い",
      icon: {
        ios: "dot.radiowaves.left.and.right",
        android: "near_me",
        web: "dot.radiowaves.left.and.right",
      },
    },
    {
      path: "/bookmark",
      label: "ブックマーク",
      icon: { ios: "bookmark", android: "bookmark_border", web: "bookmark" },
    },
    {
      path: "/planter",
      label: "育てる",
      icon: { ios: "leaf", android: "eco", web: "leaf" },
    },
    {
      path: "/profile",
      label: "プロフ",
      icon: {
        ios: "person.crop.circle",
        android: "person",
        web: "person.crop.circle",
      },
    },
  ];

  return (
    <View pointerEvents="box-none" style={styles.tabBarWrap}>
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const active =
            pathname === tab.path || pathname.startsWith(`${tab.path}/`);
          return (
            <Pressable
              key={tab.path}
              onPress={() => router.replace(tab.path as never)}
              style={styles.tabItem}
            >
              <AppSymbol
                name={tab.icon}
                size={24}
                tintColor={active ? IbukiColors.ink : IbukiColors.soft}
              />
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  appBackdrop: {
    flex: 1,
    alignItems: "center",
    backgroundColor:
      Platform.OS === "web" ? IbukiColors.appBackdrop : IbukiColors.background,
  },
  phone: {
    width: "100%",
    maxWidth: PhoneMaxWidth,
    flex: 1,
    backgroundColor: IbukiColors.background,
  },
  scrollContent: {
    paddingHorizontal: IbukiSpacing.lg,
    paddingTop: IbukiSpacing.md,
    paddingBottom: IbukiSpacing.xxl,
    gap: IbukiSpacing.lg,
  },
  scrollContentWithTabs: {
    paddingBottom: TabBarHeight + IbukiSpacing.xl,
  },
  staticContent: {
    flex: 1,
    paddingHorizontal: IbukiSpacing.lg,
    paddingTop: IbukiSpacing.md,
    paddingBottom: IbukiSpacing.xxl,
  },
  staticContentWithTabs: {
    paddingBottom: TabBarHeight + IbukiSpacing.xl,
  },
  topBar: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 46,
  },
  topBarRight: {
    alignItems: "center",
    flexDirection: "row",
    gap: IbukiSpacing.xs,
  },
  tabBarWrap: {
    alignItems: "center",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
  },
  tabBar: {
    backgroundColor: "rgba(237,232,220,0.95)",
    borderColor: IbukiColors.line,
    borderTopWidth: 1,
    flexDirection: "row",
    height: TabBarHeight,
    maxWidth: PhoneMaxWidth,
    paddingBottom: 28,
    paddingHorizontal: 18,
    paddingTop: 9,
    width: "100%",
  },
  tabItem: {
    alignItems: "center",
    flex: 1,
    gap: 4,
  },
  tabLabel: {
    color: IbukiColors.soft,
    fontFamily: IbukiFonts?.monoBold,
    fontSize: 9.5,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  tabLabelActive: {
    color: IbukiColors.ink,
  },
});
