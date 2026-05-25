import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  BodyText,
  Heading,
  IbukiScreen,
  IconButton,
  Kicker,
  PillButton,
  TopBar,
} from "@/components/ibuki-ui";
import {
  IbukiColors,
  IbukiFonts,
  IbukiRadius,
  IbukiSpacing,
} from "@/constants/ibuki-theme";
import {
  AGE_RANGES,
  GENDER_LABELS,
  getMyProfile,
  updateMyProfile,
} from "@/lib/user-profile";

export default function ProfileEditScreen() {
  const [nickname, setNickname] = useState("");
  const [ageRange, setAgeRange] = useState<string | null>(null);
  const [genderLabel, setGenderLabel] = useState<string | null>(null);
  const [isProfilePublic, setIsProfilePublic] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getMyProfile()
      .then((profile) => {
        if (profile) {
          setNickname(profile.nickname ?? "");
          setAgeRange(profile.age_range);
          setGenderLabel(profile.gender_label);
          setIsProfilePublic(profile.is_profile_public);
        }
      })
      .catch(() => Alert.alert("エラー", "プロフィールの取得に失敗しました"))
      .finally(() => setIsLoading(false));
  }, []);

  async function handleSave() {
    if (isSaving) return;
    try {
      setIsSaving(true);
      await updateMyProfile({
        nickname: nickname.trim() || null,
        age_range: ageRange,
        gender_label: genderLabel,
        is_profile_public: isProfilePublic,
      });
      router.back();
    } catch {
      Alert.alert("エラー", "保存に失敗しました");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <IbukiScreen>
        <View style={styles.center}>
          <ActivityIndicator color={IbukiColors.ink} />
        </View>
      </IbukiScreen>
    );
  }

  return (
    <IbukiScreen scroll>
      <TopBar
        left={
          <IconButton
            icon="chevron-left"
            onPress={() => router.back()}
            label="戻る"
          />
        }
        right={<Kicker>プロフィール編集</Kicker>}
      />

      <View style={styles.section}>
        <Heading size="small">ニックネーム（任意）</Heading>
        <BodyText>アプリ内での表示名です。設定しなくても使えます</BodyText>
        <TextInput
          value={nickname}
          onChangeText={setNickname}
          placeholder="例：コーヒー好き"
          placeholderTextColor={IbukiColors.mid}
          maxLength={20}
          style={styles.textInput}
        />
      </View>

      <View style={styles.section}>
        <Heading size="small">年代</Heading>
        <BodyText>すれ違った人のカードに匿名で表示されます</BodyText>
        <View style={styles.optionRow}>
          {AGE_RANGES.map((range) => (
            <Pressable
              key={range}
              onPress={() => setAgeRange(ageRange === range ? null : range)}
              style={[
                styles.optionChip,
                ageRange === range && styles.optionChipSelected,
              ]}
            >
              <Text
                style={[
                  styles.optionChipText,
                  ageRange === range && styles.optionChipTextSelected,
                ]}
              >
                {range}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Heading size="small">性別ラベル（任意）</Heading>
        <BodyText>設定しない場合は表示されません</BodyText>
        <View style={styles.optionRow}>
          {GENDER_LABELS.map((label) => (
            <Pressable
              key={label}
              onPress={() =>
                setGenderLabel(genderLabel === label ? null : label)
              }
              style={[
                styles.optionChip,
                genderLabel === label && styles.optionChipSelected,
              ]}
            >
              <Text
                style={[
                  styles.optionChipText,
                  genderLabel === label && styles.optionChipTextSelected,
                ]}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.toggleRow}>
          <View style={styles.toggleLabel}>
            <Heading size="small">プロフィールを公開する</Heading>
            <BodyText>
              すれ違いカードに年代・性別ラベルを表示します
            </BodyText>
          </View>
          <Switch
            value={isProfilePublic}
            onValueChange={setIsProfilePublic}
            trackColor={{
              false: IbukiColors.line,
              true: IbukiColors.accent,
            }}
            thumbColor={IbukiColors.background}
          />
        </View>
      </View>

      <View style={styles.previewSection}>
        <Kicker>プレビュー</Kicker>
        <View style={styles.previewCard}>
          <Text style={styles.previewLabel}>すれ違いカードに表示される情報</Text>
          {isProfilePublic && (ageRange ?? genderLabel) ? (
            <Text style={styles.previewValue}>
              {[ageRange, genderLabel].filter(Boolean).join(" · ")}
            </Text>
          ) : (
            <Text style={styles.previewEmpty}>非公開</Text>
          )}
        </View>
      </View>

      <PillButton
        label={isSaving ? "保存中..." : "保存する"}
        onPress={isSaving ? undefined : () => void handleSave()}
        style={styles.saveButton}
        variant="dark"
      />
    </IbukiScreen>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  section: {
    borderBottomColor: IbukiColors.line,
    borderBottomWidth: 1,
    gap: IbukiSpacing.sm,
    paddingBottom: IbukiSpacing.lg,
    paddingTop: IbukiSpacing.lg,
  },
  textInput: {
    borderColor: IbukiColors.line,
    borderRadius: IbukiRadius.md,
    borderWidth: 1,
    color: IbukiColors.ink,
    fontFamily: IbukiFonts.sans,
    fontSize: 15,
    marginTop: IbukiSpacing.xs,
    paddingHorizontal: IbukiSpacing.md,
    paddingVertical: IbukiSpacing.sm,
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: IbukiSpacing.sm,
    marginTop: IbukiSpacing.xs,
  },
  optionChip: {
    borderColor: IbukiColors.line,
    borderRadius: IbukiRadius.pill,
    borderWidth: 1,
    paddingHorizontal: IbukiSpacing.md,
    paddingVertical: IbukiSpacing.sm,
  },
  optionChipSelected: {
    backgroundColor: IbukiColors.ink,
    borderColor: IbukiColors.ink,
  },
  optionChipText: {
    color: IbukiColors.ink,
    fontFamily: IbukiFonts.sans,
    fontSize: 14,
  },
  optionChipTextSelected: {
    color: IbukiColors.background,
    fontFamily: IbukiFonts.sansBold,
  },
  toggleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: IbukiSpacing.md,
    justifyContent: "space-between",
  },
  toggleLabel: {
    flex: 1,
    gap: IbukiSpacing.xs,
  },
  previewSection: {
    gap: IbukiSpacing.sm,
    paddingTop: IbukiSpacing.lg,
  },
  previewCard: {
    backgroundColor: IbukiColors.surfaceMuted,
    borderColor: IbukiColors.line,
    borderRadius: IbukiRadius.md,
    borderWidth: 1,
    gap: IbukiSpacing.xs,
    padding: IbukiSpacing.md,
  },
  previewLabel: {
    color: IbukiColors.mid,
    fontFamily: IbukiFonts.sans,
    fontSize: 11,
  },
  previewValue: {
    color: IbukiColors.ink,
    fontFamily: IbukiFonts.sansBold,
    fontSize: 16,
  },
  previewEmpty: {
    color: IbukiColors.mid,
    fontFamily: IbukiFonts.sans,
    fontSize: 14,
  },
  saveButton: {
    marginTop: IbukiSpacing.xl,
    width: "100%",
  },
});
