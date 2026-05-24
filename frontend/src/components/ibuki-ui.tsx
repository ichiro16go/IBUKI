import { Image } from "expo-image";
import { SymbolView } from "expo-symbols";
import { router, usePathname } from "expo-router";
import type { ReactNode } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  type TextStyle,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  IbukiColors,
  IbukiFonts,
  IbukiRadius,
  IbukiShadow,
  IbukiSpacing,
  PhoneMaxWidth,
  TabBarHeight,
} from "@/constants/ibuki-theme";
import type { EntryStep, Hobby, PhotoTone } from "@/data/ibuki";

type SymbolName = {
  ios: string;
  android?: string;
  web?: string;
};

function AppSymbol({
  name,
  size,
  tintColor,
}: {
  name: SymbolName;
  size: number;
  tintColor: string;
}) {
  if (Platform.OS === "web") {
    const fallback =
      symbolFallbacks[name.ios] ??
      symbolFallbacks[name.web ?? ""] ??
      symbolFallbacks[name.android ?? ""] ??
      "•";
    return (
      <Text
        style={{
          color: tintColor,
          fontSize: size,
          fontWeight: "700",
          lineHeight: size + 2,
        }}
      >
        {fallback}
      </Text>
    );
  }

  return <SymbolView name={name as never} size={size} tintColor={tintColor} />;
}

const symbolFallbacks: Record<string, string> = {
  "arrow.right": "→",
  "arrow.up.right": "↗",
  auto_awesome: "✦",
  bell: "◔",
  "bell.badge": "◔",
  bookmark: "□",
  bookmark_border: "□",
  chevron: "‹",
  "chevron.left": "‹",
  eco: "⌁",
  ellipsis: "…",
  favorite: "♥",
  favorite_border: "♡",
  gearshape: "⚙",
  heart: "♡",
  "heart.fill": "♥",
  leaf: "⌁",
  more_horiz: "…",
  notifications: "◔",
  "person.crop.circle": "○",
  place: "⌖",
  search: "⌕",
  settings: "⚙",
  share: "↗",
  "slider.horizontal.3": "≡",
  sparkles: "✦",
  square: "□",
  "square.and.arrow.up": "↗",
  tune: "≡",
};

const photoToneColors: Record<
  PhotoTone,
  { base: string; accent: string; ink: string }
> = {
  warm: { base: "#E8D9C5", accent: "#C7A07A", ink: "#8E6A4C" },
  dawn: { base: "#DCE4ED", accent: "#B7C3D0", ink: "#6F8398" },
  dusk: { base: "#E8C9B0", accent: "#B68B72", ink: "#5F4137" },
  night: { base: "#4A4E62", accent: "#2F2E3A", ink: "#F7F1E6" },
  clay: { base: "#DDC4A8", accent: "#BB8E6A", ink: "#7A5238" },
  moss: { base: "#D2D9C2", accent: "#95A77B", ink: "#5A6B4A" },
  ink: { base: "#D0CCC2", accent: "#807A6E", ink: "#F7F1E6" },
  mint: { base: "#DDE9DD", accent: "#A4C2B0", ink: "#5B7D72" },
  paper: { base: "#F2EEE2", accent: "#DDD6C2", ink: "#332F28" },
};

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

export function Kicker({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
}) {
  return <Text style={[styles.kicker, style]}>{children}</Text>;
}

export function Heading({
  children,
  size = "large",
  style,
}: {
  children: ReactNode;
  size?: "large" | "medium" | "small";
  style?: StyleProp<TextStyle>;
}) {
  return (
    <Text
      style={[
        styles.heading,
        size === "medium" && styles.headingMedium,
        size === "small" && styles.headingSmall,
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function BodyText({
  children,
  muted = false,
}: {
  children: ReactNode;
  muted?: boolean;
}) {
  return (
    <Text style={[styles.bodyText, muted && styles.mutedText]}>{children}</Text>
  );
}

export function Chip({
  label,
  selected = false,
  count,
  onPress,
}: {
  label: string;
  selected?: boolean;
  count?: number;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <View style={[styles.chip, selected && styles.chipSelected]}>
        <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
          {label}
        </Text>
        {typeof count === "number" && (
          <Text style={[styles.chipCount, selected && styles.chipTextSelected]}>
            {count}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

export function PillButton({
  label,
  variant = "light",
  icon,
  onPress,
  style,
}: {
  label: string;
  variant?: "dark" | "light" | "accent";
  icon?: SymbolName;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const isDark = variant === "dark";
  const isAccent = variant === "accent";
  const tintColor =
    isDark || isAccent ? IbukiColors.background : IbukiColors.ink;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [pressed && styles.pressed, style]}
    >
      <View
        style={[
          styles.pillButton,
          isDark && styles.pillButtonDark,
          isAccent && styles.pillButtonAccent,
        ]}
      >
        <Text
          style={[
            styles.pillButtonText,
            (isDark || isAccent) && styles.pillButtonTextLight,
          ]}
        >
          {label}
        </Text>
        {icon && <AppSymbol name={icon} size={18} tintColor={tintColor} />}
      </View>
    </Pressable>
  );
}

export function IconButton({
  icon,
  onPress,
  label,
}: {
  icon: SymbolName;
  onPress?: () => void;
  label?: string;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <View style={styles.iconButton}>
        <AppSymbol name={icon} size={20} tintColor={IbukiColors.ink} />
      </View>
    </Pressable>
  );
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

export function PhotoBlock({
  hobby,
  height = 170,
  label,
}: {
  hobby: Hobby;
  height?: number;
  label?: string;
}) {
  const tone = photoToneColors[hobby.photoTone];

  return (
    <View style={[styles.photoBlock, { height, backgroundColor: tone.base }]}>
      {hobby.image ? (
        <>
          <Image
            source={hobby.image}
            style={styles.photoImage}
            contentFit="cover"
            transition={160}
          />
          <View style={styles.photoScrim} />
        </>
      ) : (
        <>
          <View
            style={[styles.photoCircleLarge, { backgroundColor: tone.accent }]}
          />
          <View style={[styles.photoCircleSmall, { borderColor: tone.ink }]} />
        </>
      )}
      <Text style={[styles.photoSlug, { color: tone.ink }]}>{hobby.slug}</Text>
      {label && (
        <View style={styles.photoLabel}>
          <Text style={styles.photoLabelText}>{label}</Text>
        </View>
      )}
    </View>
  );
}

export function HobbyCard({
  hobby,
  compact = false,
  onPress,
}: {
  hobby: Hobby;
  compact?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <View style={[styles.hobbyCard, compact && styles.hobbyCardCompact]}>
        <PhotoBlock
          hobby={hobby}
          height={compact ? 92 : 138}
          label={`NO. ${hobby.number}`}
        />
        <View style={styles.hobbyCardBody}>
          <View style={styles.rowBetween}>
            <Kicker>NO. {hobby.number}</Kicker>
            <AppSymbol
              name={{ ios: "heart", android: "favorite_border", web: "heart" }}
              size={14}
              tintColor={IbukiColors.hot}
            />
          </View>
          <Text style={styles.cardTitle}>{hobby.nameJa}</Text>
          <Text style={styles.cardSubtitle}>{hobby.nameEn}</Text>
          {!compact && (
            <View style={styles.tagRow}>
              {hobby.tags.slice(0, 2).map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

export function EncounterCard({
  hobby,
  time,
  distance,
  context,
  isNew,
  onPress,
}: {
  hobby: Hobby;
  time: string;
  distance: string;
  context: string;
  isNew: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <View style={styles.encounterCard}>
        <View style={styles.encounterMeta}>
          <View style={styles.liveDot} />
          <Kicker>
            {isNew ? "NEW" : "PASS"} · {time}
          </Kicker>
          <Text style={styles.distanceText}>{distance}</Text>
        </View>
        <View style={styles.encounterContent}>
          <PhotoBlock hobby={hobby} height={116} label={context} />
          <View style={styles.encounterCopy}>
            <Heading size="small">{hobby.nameJa}</Heading>
            <Text style={styles.cardSubtitle}>
              {hobby.nameEn} · No. {hobby.number}
            </Text>
            <Text style={styles.quoteText}>“{hobby.quote}”</Text>
            <View style={styles.tagRow}>
              {hobby.tags.slice(0, 3).map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export function StatsRow() {
  return (
    <View style={styles.statsRow}>
      <Stat value="7" label="件 · TODAY" />
      <Stat value="2.4km" label="歩いた距離" />
      <Stat value="1" label="新しい趣味" />
      <Text style={styles.dateText}>5/24</Text>
    </View>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Kicker>{label}</Kicker>
    </View>
  );
}

export function SegmentedControl({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (nextValue: string) => void;
}) {
  return (
    <View style={styles.segmented}>
      {options.map((option) => {
        const selected = option === value;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            style={styles.segmentButton}
          >
            <View
              style={[
                styles.segmentPill,
                selected && styles.segmentPillSelected,
              ]}
            >
              <Text
                style={[
                  styles.segmentText,
                  selected && styles.segmentTextSelected,
                ]}
              >
                {option}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

export function RadarView({ hobbies }: { hobbies: Hobby[] }) {
  return (
    <View style={styles.radarCard}>
      <View style={styles.radarGrid}>
        <View style={styles.radarRingOuter} />
        <View style={styles.radarRingMiddle} />
        <View style={styles.radarRingInner} />
        <Text style={[styles.radarAxis, styles.radarNorth]}>N</Text>
        <Text style={[styles.radarAxis, styles.radarEast]}>E</Text>
        <Text style={[styles.radarAxis, styles.radarSouth]}>S</Text>
        <Text style={[styles.radarAxis, styles.radarWest]}>W</Text>
        <View style={styles.youPin}>
          <Text style={styles.youPinText}>YOU</Text>
        </View>
        {hobbies.slice(0, 5).map((hobby, index) => (
          <View
            key={hobby.id}
            style={[styles.radarBubble, radarBubblePositions[index]]}
          >
            <Text style={styles.radarBubbleTitle}>{hobby.nameJa}</Text>
            <Text style={styles.radarBubbleMeta}>{hobby.distance}</Text>
          </View>
        ))}
      </View>
      <View style={styles.radarFooter}>
        <AppSymbol
          name={{ ios: "sparkles", android: "auto_awesome", web: "sparkles" }}
          size={16}
          tintColor={IbukiColors.accentDeep}
        />
        <View>
          <Text style={styles.radarFooterTitle}>5件の新しい趣味</Text>
          <Text style={styles.cardSubtitle}>近くで揺れている趣味を表示中</Text>
        </View>
      </View>
    </View>
  );
}

export function EntryStepCard({
  step,
  active,
  onPress,
}: {
  step: EntryStep;
  active: boolean;
  onPress: () => void;
}) {
  const done = step.status === "done";
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <View style={[styles.entryStep, active && styles.entryStepActive]}>
        <View
          style={[
            styles.stepMark,
            done && styles.stepMarkDone,
            active && styles.stepMarkActive,
          ]}
        >
          <Text
            style={[
              styles.stepMarkText,
              (done || active) && styles.stepMarkTextLight,
            ]}
          >
            {done ? "✓" : active ? "•" : "○"}
          </Text>
        </View>
        <View style={styles.stepCopy}>
          <Text style={styles.stepTitle}>{step.title}</Text>
          <Text style={styles.cardSubtitle}>{step.description}</Text>
        </View>
      </View>
    </Pressable>
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
      path: "/saved",
      label: "保存",
      icon: { ios: "heart", android: "favorite_border", web: "heart" },
    },
    {
      path: "/entry",
      label: "入口",
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

export function NotificationModal({
  visible,
  hobby,
  onClose,
  onOpen,
}: {
  visible: boolean;
  hobby: Hobby;
  onClose: () => void;
  onOpen: () => void;
}) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.notificationMap}>
          <MapLines />
          <View style={styles.toast}>
            <AppSymbol
              name={{
                ios: "sparkles",
                android: "auto_awesome",
                web: "sparkles",
              }}
              size={16}
              tintColor={IbukiColors.accentDeep}
            />
            <View style={styles.toastCopy}>
              <Kicker>IBUKI · NOW</Kicker>
              <Text style={styles.toastTitle}>すれ違いで 1枚 届きました</Text>
            </View>
            <Text style={styles.cardSubtitle}>3秒前</Text>
          </View>
          <View style={styles.notificationCard}>
            <Kicker>NEW · NO. {hobby.number}</Kicker>
            <PhotoBlock hobby={hobby} height={150} label="dusk walk" />
            <Heading size="medium">{hobby.nameJa}</Heading>
            <Text style={styles.cardSubtitle}>
              {hobby.nameEn} · {hobby.distance}
            </Text>
            <Text style={styles.quoteText}>“{hobby.quote}”</Text>
            <View style={styles.modalActions}>
              <PillButton
                label="あとで"
                onPress={onClose}
                style={styles.modalButton}
              />
              <PillButton
                label="カードを開く"
                variant="dark"
                icon={{
                  ios: "arrow.right",
                  android: "arrow_forward",
                  web: "arrow.right",
                }}
                onPress={onOpen}
                style={styles.modalButtonWide}
              />
            </View>
            <Text style={styles.privacyText}>
              相手のプロフィールや本名は表示されません
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function MapLines() {
  return (
    <View style={styles.mapLines}>
      <View style={[styles.mapRoad, styles.mapRoadOne]} />
      <View style={[styles.mapRoad, styles.mapRoadTwo]} />
      <View style={[styles.mapRoad, styles.mapRoadThree]} />
      <View style={styles.mapWater} />
      <View style={styles.mapPark} />
      <Text style={[styles.mapLabel, { top: 72, left: 28 }]}>代々木公園</Text>
      <Text style={[styles.mapLabel, { bottom: 120, right: 34 }]}>恵比寿</Text>
    </View>
  );
}

const radarBubblePositions: ViewStyle[] = [
  { top: 74, left: 64 },
  { top: 58, right: 52 },
  { top: 190, left: 36 },
  { top: 222, right: 42 },
  { bottom: 78, left: 142 },
];

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
  kicker: {
    color: IbukiColors.mid,
    fontFamily: IbukiFonts?.mono,
    fontSize: 10.5,
    fontWeight: "500",
    letterSpacing: 0.6,
  },
  heading: {
    color: IbukiColors.ink,
    fontFamily: IbukiFonts?.sansBold,
    fontSize: 34,
    fontWeight: "700",
    lineHeight: 42,
    letterSpacing: 0,
  },
  headingMedium: {
    fontSize: 26,
    lineHeight: 32,
  },
  headingSmall: {
    fontSize: 22,
    lineHeight: 28,
  },
  bodyText: {
    color: IbukiColors.inkSoft,
    fontFamily: IbukiFonts?.sansRegular,
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 23,
  },
  mutedText: {
    color: IbukiColors.mid,
  },
  pressed: {
    opacity: 0.72,
  },
  rowBetween: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
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
  chip: {
    alignItems: "center",
    backgroundColor: IbukiColors.surface,
    borderColor: IbukiColors.line,
    borderRadius: IbukiRadius.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    minHeight: 31,
    paddingHorizontal: 12,
  },
  chipSelected: {
    backgroundColor: IbukiColors.accent,
    borderColor: IbukiColors.accent,
  },
  chipText: {
    color: IbukiColors.inkSoft,
    fontFamily: IbukiFonts?.sansBold,
    fontSize: 12,
    fontWeight: "600",
  },
  chipTextSelected: {
    color: IbukiColors.background,
  },
  chipCount: {
    color: IbukiColors.mid,
    fontFamily: IbukiFonts?.monoBold,
    fontSize: 10,
    fontWeight: "600",
  },
  pillButton: {
    alignItems: "center",
    backgroundColor: IbukiColors.surface,
    borderColor: IbukiColors.line,
    borderRadius: IbukiRadius.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: IbukiSpacing.xs,
    justifyContent: "center",
    minHeight: 50,
    paddingHorizontal: 18,
  },
  pillButtonDark: {
    backgroundColor: IbukiColors.accentDeep,
    borderColor: IbukiColors.accentDeep,
  },
  pillButtonAccent: {
    backgroundColor: IbukiColors.good,
    borderColor: IbukiColors.good,
  },
  pillButtonText: {
    color: IbukiColors.ink,
    fontFamily: IbukiFonts?.sansBold,
    fontSize: 14.5,
    fontWeight: "700",
  },
  pillButtonTextLight: {
    color: IbukiColors.background,
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: IbukiColors.surface,
    borderColor: IbukiColors.line,
    borderRadius: 19,
    borderWidth: 1,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  photoBlock: {
    borderRadius: IbukiRadius.md,
    overflow: "hidden",
    position: "relative",
  },
  photoImage: {
    height: "100%",
    width: "100%",
  },
  photoScrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(20,19,15,0.06)",
  },
  photoCircleLarge: {
    borderRadius: 140,
    height: 230,
    opacity: 0.42,
    position: "absolute",
    right: -86,
    top: -62,
    width: 230,
  },
  photoCircleSmall: {
    borderRadius: 90,
    borderWidth: 1,
    height: 118,
    opacity: 0.22,
    position: "absolute",
    left: -34,
    top: 36,
    width: 118,
  },
  photoSlug: {
    bottom: 16,
    fontFamily: IbukiFonts?.mono,
    fontSize: 13,
    fontWeight: "600",
    left: 16,
    letterSpacing: 0.6,
    position: "absolute",
  },
  photoLabel: {
    backgroundColor: "rgba(255,255,255,0.78)",
    borderRadius: 4,
    left: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
    position: "absolute",
    top: 10,
  },
  photoLabelText: {
    color: IbukiColors.ink,
    fontFamily: IbukiFonts?.monoBold,
    fontSize: 9.5,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  hobbyCard: {
    backgroundColor: IbukiColors.surface,
    borderColor: IbukiColors.line,
    borderRadius: IbukiRadius.md,
    borderWidth: 1,
    overflow: "hidden",
    ...IbukiShadow.soft,
  },
  hobbyCardCompact: {
    minHeight: 210,
  },
  hobbyCardBody: {
    gap: IbukiSpacing.xs,
    padding: IbukiSpacing.sm,
  },
  cardTitle: {
    color: IbukiColors.ink,
    fontFamily: IbukiFonts?.serif,
    fontSize: 20,
    fontWeight: "500",
    lineHeight: 25,
  },
  cardSubtitle: {
    color: IbukiColors.mid,
    fontFamily: IbukiFonts?.sans,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 17,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tag: {
    backgroundColor: IbukiColors.accentTint,
    borderColor: IbukiColors.line,
    borderRadius: IbukiRadius.pill,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    color: IbukiColors.inkSoft,
    fontFamily: IbukiFonts?.sansBold,
    fontSize: 11,
    fontWeight: "600",
  },
  encounterCard: {
    backgroundColor: IbukiColors.surface,
    borderColor: IbukiColors.line,
    borderRadius: IbukiRadius.lg,
    borderWidth: 1,
    gap: IbukiSpacing.sm,
    padding: IbukiSpacing.md,
    ...IbukiShadow.card,
  },
  encounterMeta: {
    alignItems: "center",
    flexDirection: "row",
    gap: IbukiSpacing.xs,
  },
  liveDot: {
    backgroundColor: IbukiColors.hot,
    borderRadius: 5,
    height: 9,
    width: 9,
  },
  distanceText: {
    color: IbukiColors.mid,
    fontFamily: IbukiFonts?.mono,
    fontSize: 11,
    fontWeight: "600",
    marginLeft: "auto",
  },
  encounterContent: {
    gap: IbukiSpacing.md,
  },
  encounterCopy: {
    gap: IbukiSpacing.xs,
  },
  quoteText: {
    color: IbukiColors.inkSoft,
    fontFamily: IbukiFonts?.serif,
    fontSize: 15,
    lineHeight: 23,
  },
  statsRow: {
    alignItems: "center",
    backgroundColor: IbukiColors.surface,
    borderColor: IbukiColors.line,
    borderRadius: IbukiRadius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: IbukiSpacing.md,
    padding: IbukiSpacing.md,
  },
  statItem: {
    flex: 1,
    gap: 3,
  },
  statValue: {
    color: IbukiColors.ink,
    fontFamily: IbukiFonts?.serif,
    fontSize: 24,
    fontWeight: "500",
  },
  dateText: {
    color: IbukiColors.mid,
    fontFamily: IbukiFonts?.monoBold,
    fontSize: 11,
    fontWeight: "700",
  },
  segmented: {
    alignSelf: "flex-start",
    backgroundColor: IbukiColors.surfaceMuted,
    borderColor: IbukiColors.line,
    borderRadius: IbukiRadius.pill,
    borderWidth: 1,
    flexDirection: "row",
    padding: 4,
  },
  segmentButton: {
    borderRadius: IbukiRadius.pill,
  },
  segmentPill: {
    borderRadius: IbukiRadius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  segmentPillSelected: {
    backgroundColor: IbukiColors.accentDeep,
  },
  segmentText: {
    color: IbukiColors.mid,
    fontFamily: IbukiFonts?.monoBold,
    fontSize: 10.5,
    fontWeight: "700",
    letterSpacing: 0.7,
  },
  segmentTextSelected: {
    color: IbukiColors.background,
  },
  radarCard: {
    backgroundColor: IbukiColors.surface,
    borderColor: IbukiColors.line,
    borderRadius: IbukiRadius.lg,
    borderWidth: 1,
    gap: IbukiSpacing.md,
    padding: IbukiSpacing.sm,
    ...IbukiShadow.card,
  },
  radarGrid: {
    backgroundColor: IbukiColors.mapLand,
    borderRadius: IbukiRadius.md,
    height: 430,
    overflow: "hidden",
    position: "relative",
  },
  radarRingOuter: {
    borderColor: IbukiColors.line,
    borderRadius: 180,
    borderWidth: 1,
    height: 330,
    left: 30,
    position: "absolute",
    top: 50,
    width: 330,
  },
  radarRingMiddle: {
    borderColor: IbukiColors.line,
    borderRadius: 124,
    borderWidth: 1,
    height: 235,
    left: 78,
    position: "absolute",
    top: 98,
    width: 235,
  },
  radarRingInner: {
    borderColor: IbukiColors.line,
    borderRadius: 72,
    borderWidth: 1,
    height: 140,
    left: 126,
    position: "absolute",
    top: 146,
    width: 140,
  },
  radarAxis: {
    color: IbukiColors.mid,
    fontFamily: IbukiFonts?.mono,
    fontSize: 10,
    fontWeight: "700",
    position: "absolute",
  },
  radarNorth: { left: "50%", top: 14 },
  radarEast: { right: 15, top: "50%" },
  radarSouth: { bottom: 14, left: "50%" },
  radarWest: { left: 15, top: "50%" },
  youPin: {
    alignItems: "center",
    backgroundColor: IbukiColors.accentDeep,
    borderRadius: IbukiRadius.pill,
    left: "44%",
    paddingHorizontal: 10,
    paddingVertical: 5,
    position: "absolute",
    top: "48%",
  },
  youPinText: {
    color: IbukiColors.background,
    fontFamily: IbukiFonts?.monoBold,
    fontSize: 10,
    fontWeight: "700",
  },
  radarBubble: {
    backgroundColor: "rgba(247,243,234,0.92)",
    borderColor: IbukiColors.line,
    borderRadius: IbukiRadius.md,
    borderWidth: 1,
    padding: IbukiSpacing.xs,
    position: "absolute",
  },
  radarBubbleTitle: {
    color: IbukiColors.ink,
    fontFamily: IbukiFonts?.sansBold,
    fontSize: 12,
    fontWeight: "700",
  },
  radarBubbleMeta: {
    color: IbukiColors.mid,
    fontFamily: IbukiFonts?.mono,
    fontSize: 10,
    marginTop: 2,
  },
  radarFooter: {
    alignItems: "center",
    backgroundColor: IbukiColors.accentTint,
    borderRadius: IbukiRadius.md,
    flexDirection: "row",
    gap: IbukiSpacing.md,
    padding: IbukiSpacing.md,
  },
  radarFooterTitle: {
    color: IbukiColors.ink,
    fontFamily: IbukiFonts?.sansBold,
    fontSize: 14,
    fontWeight: "700",
  },
  entryStep: {
    alignItems: "center",
    backgroundColor: IbukiColors.surface,
    borderColor: IbukiColors.line,
    borderRadius: IbukiRadius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: IbukiSpacing.md,
    minHeight: 58,
    padding: IbukiSpacing.sm,
  },
  entryStepActive: {
    borderColor: IbukiColors.good,
    backgroundColor: IbukiColors.accentTint,
  },
  stepMark: {
    alignItems: "center",
    borderColor: IbukiColors.line,
    borderRadius: 17,
    borderWidth: 1,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  stepMarkDone: {
    backgroundColor: IbukiColors.good,
    borderColor: IbukiColors.good,
  },
  stepMarkActive: {
    backgroundColor: IbukiColors.accent,
    borderColor: IbukiColors.accent,
  },
  stepMarkText: {
    color: IbukiColors.mid,
    fontSize: 16,
    fontWeight: "700",
  },
  stepMarkTextLight: {
    color: IbukiColors.surface,
  },
  stepCopy: {
    flex: 1,
    gap: 3,
  },
  stepTitle: {
    color: IbukiColors.ink,
    fontFamily: IbukiFonts?.sansBold,
    fontSize: 14,
    fontWeight: "700",
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
  modalBackdrop: {
    alignItems: "center",
    backgroundColor: "rgba(46,38,32,0.22)",
    flex: 1,
    justifyContent: "center",
  },
  notificationMap: {
    backgroundColor: IbukiColors.mapLand,
    borderRadius: IbukiRadius.xl,
    height: "88%",
    maxHeight: 760,
    maxWidth: PhoneMaxWidth,
    overflow: "hidden",
    padding: IbukiSpacing.lg,
    position: "relative",
    width: "92%",
  },
  mapLines: {
    ...StyleSheet.absoluteFill,
    backgroundColor: IbukiColors.mapLand,
  },
  mapRoad: {
    backgroundColor: IbukiColors.mapRoad,
    borderRadius: IbukiRadius.pill,
    height: 34,
    opacity: 0.82,
    position: "absolute",
    width: 500,
  },
  mapRoadOne: {
    left: -70,
    top: 180,
    transform: [{ rotate: "-24deg" }],
  },
  mapRoadTwo: {
    left: -40,
    top: 420,
    transform: [{ rotate: "18deg" }],
  },
  mapRoadThree: {
    left: -120,
    top: 310,
    transform: [{ rotate: "72deg" }],
  },
  mapWater: {
    backgroundColor: IbukiColors.mapWater,
    borderRadius: 80,
    height: 180,
    position: "absolute",
    right: -30,
    top: 70,
    width: 130,
  },
  mapPark: {
    backgroundColor: IbukiColors.mapPark,
    borderRadius: 80,
    bottom: 130,
    height: 170,
    left: -50,
    position: "absolute",
    width: 150,
  },
  mapLabel: {
    color: IbukiColors.mid,
    fontFamily: IbukiFonts?.sansBold,
    fontSize: 12,
    fontWeight: "700",
    position: "absolute",
  },
  toast: {
    alignItems: "center",
    backgroundColor: "rgba(247,243,234,0.93)",
    borderColor: IbukiColors.line,
    borderRadius: IbukiRadius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: IbukiSpacing.md,
    padding: IbukiSpacing.sm,
  },
  toastCopy: {
    flex: 1,
  },
  toastTitle: {
    color: IbukiColors.ink,
    fontFamily: IbukiFonts?.sansBold,
    fontSize: 13,
    fontWeight: "700",
  },
  notificationCard: {
    backgroundColor: IbukiColors.surface,
    borderColor: IbukiColors.line,
    borderRadius: IbukiRadius.lg,
    borderWidth: 1,
    gap: IbukiSpacing.sm,
    marginTop: "auto",
    padding: IbukiSpacing.lg,
    ...IbukiShadow.card,
  },
  modalActions: {
    flexDirection: "row",
    gap: IbukiSpacing.xs,
    marginTop: IbukiSpacing.xs,
  },
  modalButton: {
    flex: 0.82,
  },
  modalButtonWide: {
    flex: 1.18,
  },
  privacyText: {
    color: IbukiColors.mid,
    fontFamily: IbukiFonts?.sans,
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
});
