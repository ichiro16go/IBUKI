import { useCallback, useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import {
  IbukiColors,
  IbukiFonts,
  IbukiRadius,
  IbukiSpacing,
} from "@/constants/ibuki-theme";

import { Kicker } from "../ibuki-ui";
import { AiOptInBody } from "./ai-opt-in-body";
import { ErrorBody } from "./error-body";
import { LoadingBody } from "./loading-body";
import { ManualSukiForm } from "./manual-suki-form";
import { SuccessBody } from "./success-body";
import type { Props } from "./types";

export type { ManualSukiInput } from "./types";

const SHEET_CLOSE_DISTANCE = 120;
const SHEET_CLOSE_VELOCITY = 900;
const SHEET_HIDDEN_BUFFER = 48;
const SHEET_OPEN_DURATION_MS = 220;
const SHEET_CLOSE_DURATION_MS = 180;
const BACKDROP_DURATION_MS = 160;

export function HobbyRecommendationModal({
  visible,
  status,
  recommendations = [],
  errorMessage,
  onClose,
  onAdd,
  onAddManual,
  onRequestAiRecommendations,
  onRetry,
}: Props) {
  const { height } = useWindowDimensions();
  const [isRendered, setIsRendered] = useState(visible);
  const hiddenTranslateY = useSharedValue(height + SHEET_HIDDEN_BUFFER);
  const sheetTranslateY = useSharedValue(height + SHEET_HIDDEN_BUFFER);
  const backdropOpacity = useSharedValue(0);

  const finishDismiss = useCallback(() => {
    setIsRendered(false);
    onClose();
  }, [onClose]);

  const dismissWithAnimation = useCallback(() => {
    backdropOpacity.value = withTiming(0, { duration: BACKDROP_DURATION_MS });
    sheetTranslateY.value = withTiming(
      hiddenTranslateY.value,
      { duration: SHEET_CLOSE_DURATION_MS },
      (finished) => {
        if (finished) {
          runOnJS(finishDismiss)();
        }
      },
    );
  }, [backdropOpacity, finishDismiss, hiddenTranslateY, sheetTranslateY]);

  useEffect(() => {
    hiddenTranslateY.value = height + SHEET_HIDDEN_BUFFER;
    if (!visible && !isRendered) {
      sheetTranslateY.value = hiddenTranslateY.value;
    }
  }, [height, hiddenTranslateY, isRendered, sheetTranslateY, visible]);

  useEffect(() => {
    if (visible) {
      setIsRendered(true);
    }
  }, [visible]);

  useEffect(() => {
    if (!isRendered) return;

    if (visible) {
      backdropOpacity.value = 0;
      sheetTranslateY.value = hiddenTranslateY.value;
      backdropOpacity.value = withTiming(1, { duration: BACKDROP_DURATION_MS });
      sheetTranslateY.value = withTiming(0, {
        duration: SHEET_OPEN_DURATION_MS,
      });
      return;
    }

    backdropOpacity.value = withTiming(0, { duration: BACKDROP_DURATION_MS });
    sheetTranslateY.value = withTiming(
      hiddenTranslateY.value,
      { duration: SHEET_CLOSE_DURATION_MS },
      (finished) => {
        if (finished) {
          runOnJS(setIsRendered)(false);
        }
      },
    );
  }, [backdropOpacity, hiddenTranslateY, isRendered, sheetTranslateY, visible]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetTranslateY.value }],
  }));

  const panGesture = Gesture.Pan()
    .activeOffsetY(8)
    .onUpdate((event) => {
      sheetTranslateY.value = Math.max(event.translationY, 0);
    })
    .onEnd((event) => {
      const shouldClose =
        event.translationY > SHEET_CLOSE_DISTANCE ||
        event.velocityY > SHEET_CLOSE_VELOCITY;

      if (shouldClose) {
        backdropOpacity.value = withTiming(0, {
          duration: BACKDROP_DURATION_MS,
        });
        sheetTranslateY.value = withTiming(
          hiddenTranslateY.value,
          { duration: SHEET_CLOSE_DURATION_MS },
          (finished) => {
            if (finished) {
              runOnJS(finishDismiss)();
            }
          },
        );
        return;
      }

      sheetTranslateY.value = withSpring(0, { damping: 18, stiffness: 180 });
    });

  if (!isRendered) {
    return null;
  }

  return (
    <Modal
      visible={isRendered}
      transparent
      animationType="none"
      onRequestClose={dismissWithAnimation}
    >
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={dismissWithAnimation}
        />
      </Animated.View>

      <Animated.View style={[styles.sheet, sheetStyle]}>
        <GestureDetector gesture={panGesture}>
          <View style={styles.dragArea}>
            <View style={styles.handle} />

            <View style={styles.header}>
              <View>
                <Kicker>AI · YouTube分析</Kicker>
                <Text style={styles.title}>あなたへのsuki候補</Text>
              </View>
              <Pressable
                onPress={dismissWithAnimation}
                style={styles.closeButton}
              >
                <Text style={styles.closeText}>✕</Text>
              </Pressable>
            </View>
          </View>
        </GestureDetector>

        <ScrollView
          style={styles.bodyScroll}
          contentContainerStyle={styles.bodyContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ManualSukiForm onAddManual={onAddManual} />

          <View style={styles.aiSection}>
            <Kicker>AI SUGGESTIONS</Kicker>
            {status === "loading" && <LoadingBody />}
            {status === "error" && (
              <ErrorBody message={errorMessage ?? ""} onRetry={onRetry} />
            )}
            {status === "success" && (
              <SuccessBody recommendations={recommendations} onAdd={onAdd} />
            )}
            {status === "idle" && (
              <AiOptInBody
                onRequestAiRecommendations={onRequestAiRecommendations}
              />
            )}
          </View>
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: "rgba(20,18,14,0.45)",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  sheet: {
    backgroundColor: IbukiColors.background,
    borderTopLeftRadius: IbukiRadius.xl,
    borderTopRightRadius: IbukiRadius.xl,
    bottom: 0,
    left: 0,
    maxHeight: "88%",
    minHeight: 340,
    paddingBottom: IbukiSpacing.xxxl,
    paddingHorizontal: IbukiSpacing.lg,
    paddingTop: IbukiSpacing.sm,
    position: "absolute",
    right: 0,
  },
  dragArea: {
    marginHorizontal: -IbukiSpacing.lg,
    paddingHorizontal: IbukiSpacing.lg,
  },
  handle: {
    alignSelf: "center",
    backgroundColor: IbukiColors.line,
    borderRadius: IbukiRadius.pill,
    height: 4,
    marginBottom: IbukiSpacing.md,
    width: 40,
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: IbukiSpacing.lg,
  },
  title: {
    color: IbukiColors.ink,
    fontFamily: IbukiFonts.sansBold,
    fontSize: 20,
    fontWeight: "700",
    marginTop: 4,
  },
  closeButton: {
    alignItems: "center",
    backgroundColor: IbukiColors.surface,
    borderColor: IbukiColors.line,
    borderRadius: IbukiRadius.pill,
    borderWidth: 1,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  closeText: {
    color: IbukiColors.mid,
    fontFamily: IbukiFonts.sansBold,
    fontSize: 13,
  },
  bodyScroll: {
    flex: 1,
  },
  bodyContent: {
    gap: IbukiSpacing.lg,
    paddingBottom: IbukiSpacing.lg,
  },
  aiSection: {
    gap: IbukiSpacing.md,
  },
});
