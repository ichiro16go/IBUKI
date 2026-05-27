import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  IbukiColors,
  IbukiFonts,
  IbukiRadius,
  IbukiSpacing,
} from "@/constants/ibuki-theme";

import { Kicker } from "../ibuki-ui";
import type { ManualSukiInput } from "./types";

export function ManualSukiForm({
  onAddManual,
}: {
  onAddManual?: (input: ManualSukiInput) => void | Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [detail, setDetail] = useState("");
  const [validationMessage, setValidationMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trimmedTitle = title.trim();
  const trimmedCategory = category.trim();
  const trimmedDetail = detail.trim();

  async function handleSubmit() {
    if (!onAddManual || isSubmitting) return;

    if (!trimmedTitle) {
      setValidationMessage("sukiの名前を入力してください。");
      return;
    }

    setValidationMessage("");
    setIsSubmitting(true);

    try {
      await onAddManual({
        title: trimmedTitle,
        category: trimmedCategory || "suki",
        detail: trimmedDetail,
      });
      setTitle("");
      setCategory("");
      setDetail("");
    } catch {
      setValidationMessage("追加できませんでした。もう一度試してください。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.manualCard}>
      <View style={styles.manualHeader}>
        <View>
          <Kicker>MY SUKI</Kicker>
          <Text style={styles.manualTitle}>自分でsukiを追加</Text>
        </View>
        <Text style={styles.requiredMark}>必須</Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>名前</Text>
        <TextInput
          value={title}
          onChangeText={(value) => {
            setTitle(value);
            if (validationMessage) setValidationMessage("");
          }}
          placeholder="例：喫茶店めぐり"
          placeholderTextColor={IbukiColors.soft}
          style={styles.input}
          maxLength={100}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>カテゴリ</Text>
        <TextInput
          value={category}
          onChangeText={setCategory}
          placeholder="例：街歩き"
          placeholderTextColor={IbukiColors.soft}
          style={styles.input}
          maxLength={100}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>メモ</Text>
        <TextInput
          value={detail}
          onChangeText={setDetail}
          placeholder="どんなところが好き？"
          placeholderTextColor={IbukiColors.soft}
          style={[styles.input, styles.inputMultiline]}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      {validationMessage ? (
        <Text style={styles.validationText}>{validationMessage}</Text>
      ) : null}

      <Pressable
        accessibilityRole="button"
        disabled={!onAddManual || isSubmitting}
        onPress={handleSubmit}
        style={({ pressed }) => [
          styles.manualSubmit,
          (!onAddManual || isSubmitting) && styles.manualSubmitDisabled,
          pressed && styles.pressed,
        ]}
      >
        {isSubmitting ? (
          <ActivityIndicator color={IbukiColors.background} size="small" />
        ) : (
          <Text style={styles.manualSubmitText}>このsukiを追加</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  manualCard: {
    backgroundColor: IbukiColors.surface,
    borderColor: IbukiColors.line,
    borderRadius: IbukiRadius.md,
    borderWidth: 1,
    gap: IbukiSpacing.md,
    padding: IbukiSpacing.md,
  },
  manualHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  manualTitle: {
    color: IbukiColors.ink,
    fontFamily: IbukiFonts.sansBold,
    fontSize: 18,
    fontWeight: "700",
    marginTop: 2,
  },
  requiredMark: {
    backgroundColor: IbukiColors.accentTint,
    borderRadius: IbukiRadius.pill,
    color: IbukiColors.accentDeep,
    fontFamily: IbukiFonts.sansBold,
    fontSize: 11,
    fontWeight: "700",
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  field: {
    gap: IbukiSpacing.xs,
  },
  fieldLabel: {
    color: IbukiColors.mid,
    fontFamily: IbukiFonts.sansBold,
    fontSize: 12,
    fontWeight: "700",
  },
  input: {
    backgroundColor: IbukiColors.background,
    borderColor: IbukiColors.line,
    borderRadius: IbukiRadius.sm,
    borderWidth: 1,
    color: IbukiColors.ink,
    fontFamily: IbukiFonts.sans,
    fontSize: 15,
    minHeight: 44,
    paddingHorizontal: IbukiSpacing.md,
    paddingVertical: 10,
  },
  inputMultiline: {
    minHeight: 82,
  },
  validationText: {
    color: IbukiColors.hot,
    fontFamily: IbukiFonts.sans,
    fontSize: 12,
  },
  manualSubmit: {
    alignItems: "center",
    backgroundColor: IbukiColors.ink,
    borderRadius: IbukiRadius.pill,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: IbukiSpacing.lg,
  },
  manualSubmitDisabled: {
    opacity: 0.5,
  },
  manualSubmitText: {
    color: IbukiColors.background,
    fontFamily: IbukiFonts.sansBold,
    fontSize: 14,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.72,
  },
});
