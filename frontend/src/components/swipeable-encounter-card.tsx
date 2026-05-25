import { Dimensions, StyleSheet, Text } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { IbukiColors, IbukiFonts, IbukiRadius, IbukiSpacing } from "@/constants/ibuki-theme";

const SWIPE_THRESHOLD = 88;
const OFFSCREEN_X = Dimensions.get("window").width;

export function SwipeableEncounterCard({
  children,
  onSwipeLeft,
  onSwipeRight,
}: {
  children: React.ReactNode;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}) {
  const translateX = useSharedValue(0);

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { rotate: `${translateX.value / 22}deg` },
    ],
  }));

  const rightBadgeStyle = useAnimatedStyle(() => ({
    opacity: translateX.value > 0 ? Math.min(translateX.value / SWIPE_THRESHOLD, 1) : 0,
    transform: [{ scale: 0.92 + Math.min(Math.abs(translateX.value) / 260, 0.08) }],
  }));

  const leftBadgeStyle = useAnimatedStyle(() => ({
    opacity: translateX.value < 0 ? Math.min(Math.abs(translateX.value) / SWIPE_THRESHOLD, 1) : 0,
    transform: [{ scale: 0.92 + Math.min(Math.abs(translateX.value) / 260, 0.08) }],
  }));

  const panGesture = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd(() => {
      if (translateX.value >= SWIPE_THRESHOLD) {
        translateX.value = withTiming(OFFSCREEN_X, { duration: 180 }, (finished) => {
          if (finished) {
            runOnJS(onSwipeRight)();
          }
        });
        return;
      }

      if (translateX.value <= -SWIPE_THRESHOLD) {
        translateX.value = withTiming(-OFFSCREEN_X, { duration: 180 }, (finished) => {
          if (finished) {
            runOnJS(onSwipeLeft)();
          }
        });
        return;
      }

      translateX.value = withSpring(0, { damping: 16, stiffness: 180 });
    });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.wrap, animatedCardStyle]}>
        <Animated.View style={[styles.badge, styles.badgeLeft, leftBadgeStyle]}>
          <Text style={styles.badgeText}>BYE</Text>
        </Animated.View>
        <Animated.View style={[styles.badge, styles.badgeRight, rightBadgeStyle]}>
          <Text style={styles.badgeText}>BOOKMARK</Text>
        </Animated.View>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: IbukiSpacing.lg,
    zIndex: 10,
    borderRadius: IbukiRadius.pill,
    borderWidth: 1,
    paddingHorizontal: IbukiSpacing.md,
    paddingVertical: IbukiSpacing.xs,
    backgroundColor: IbukiColors.surface,
  },
  badgeLeft: {
    left: IbukiSpacing.md,
    borderColor: IbukiColors.hot,
  },
  badgeRight: {
    right: IbukiSpacing.md,
    borderColor: IbukiColors.good,
  },
  badgeText: {
    color: IbukiColors.ink,
    fontFamily: IbukiFonts.sansBold,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
});
