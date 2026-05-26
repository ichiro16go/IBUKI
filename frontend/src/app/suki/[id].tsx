import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  IbukiScreen,
  IconButton,
  Kicker,
  PillButton,
} from "@/components/ibuki-ui";
import {
  IbukiColors,
  IbukiFonts,
  IbukiRadius,
  IbukiSpacing,
} from "@/constants/ibuki-theme";
import { useAuth } from "@/contexts/auth";
import {
  deleteLikeCard,
  getLikeCardById,
  updateLikeCard,
  type LikeCard,
} from "@/lib/like-cards";
import { createPlanterItem } from "@/lib/planter";
import { buildPhotoUrlUpdate } from "@/lib/suki-card-photo-upload-core";
import {
  pickAndUploadSukiCardPhoto,
  SukiCardPhotoValidationError,
} from "@/lib/suki-card-photo-upload";

export default function SukiDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const [card, setCard] = useState<LikeCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [navigating, setNavigating] = useState(false);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [detail, setDetail] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  useEffect(() => {
    getLikeCardById(id)
      .then((data) => {
        if (data) {
          setCard(data);
          setTitle(data.title);
          setCategory(data.category);
          setDetail(data.detail);
          setPhotoUrl(data.photo_url ?? "");
        }
      })
      .catch(() => Alert.alert("エラー", "カードの取得に失敗しました"))
      .finally(() => setLoading(false));
  }, [id]);

  function handleDelete() {
    Alert.alert("カードを削除", "このすきカードを削除しますか？", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteLikeCard(id);
            router.back();
          } catch {
            Alert.alert("エラー", "削除に失敗しました");
          }
        },
      },
    ]);
  }

  async function handleNavigateToActionLog() {
    if (!user?.id) return;
    setNavigating(true);
    try {
      const planterItem = await createPlanterItem({
        likeCardId: id,
        userId: user.id,
      });
      router.push({
        pathname: "/planter/[id]",
        params: { id: planterItem.id },
      } as never);
    } catch {
      Alert.alert("エラー", "アクションログの取得に失敗しました");
    } finally {
      setNavigating(false);
    }
  }

  async function handlePickPhoto() {
    if (!user?.id || uploadingPhoto) return;

    setUploadingPhoto(true);
    try {
      const result = await pickAndUploadSukiCardPhoto({
        likeCardId: id,
        userId: user.id,
      });

      if (result.status === "cancelled") return;

      const updated = await updateLikeCard(
        id,
        buildPhotoUrlUpdate(result.publicUrl),
      );
      setCard(updated);
      setPhotoUrl(updated.photo_url ?? result.publicUrl);
    } catch (error) {
      if (error instanceof SukiCardPhotoValidationError) {
        Alert.alert("エラー", error.message);
        return;
      }

      Alert.alert("エラー", "写真のアップロードに失敗しました");
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await updateLikeCard(id, {
        title,
        category,
        detail,
      });
      setCard(updated);
      Alert.alert("保存しました");
    } catch {
      Alert.alert("エラー", "保存に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <IbukiScreen>
        <ActivityIndicator color={IbukiColors.ink} style={{ marginTop: 80 }} />
      </IbukiScreen>
    );
  }

  if (!card) {
    return (
      <IbukiScreen>
        <View style={styles.topBar}>
          <IconButton
            label="Back"
            icon={{
              ios: "chevron.left",
              android: "arrow_back",
              web: "chevron.left",
            }}
            onPress={() => router.back()}
          />
        </View>
        <Text style={styles.errorText}>カードが見つかりません</Text>
      </IbukiScreen>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <IbukiScreen>
        <View style={styles.topBar}>
          <IconButton
            label="Back"
            icon={{
              ios: "chevron.left",
              android: "arrow_back",
              web: "chevron.left",
            }}
            onPress={() => router.back()}
          />
          <Kicker>MY SUKI CARD</Kicker>
          <View style={styles.topBarActions}>
            <TouchableOpacity
              onPress={handleDelete}
              style={[styles.saveButton, styles.deleteButton]}
            >
              <Text style={styles.deleteButtonText}>削除</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              style={styles.saveButton}
            >
              {saving ? (
                <ActivityIndicator
                  color={IbukiColors.background}
                  size="small"
                />
              ) : (
                <Text style={styles.saveButtonText}>保存</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* 写真 */}
        <View style={styles.photoSection}>
          <Pressable
            accessibilityLabel="sukiカードの写真を選択"
            accessibilityRole="button"
            disabled={uploadingPhoto}
            onPress={() => void handlePickPhoto()}
            style={({ pressed }) => [
              styles.photoPicker,
              pressed && styles.photoPickerPressed,
            ]}
          >
            {photoUrl ? (
              <Image source={{ uri: photoUrl }} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoPlaceholderText}>写真なし</Text>
                <Text style={styles.photoPlaceholderHint}>
                  タップして写真を追加
                </Text>
              </View>
            )}
            {uploadingPhoto ? (
              <View style={styles.photoUploadingOverlay}>
                <ActivityIndicator color={IbukiColors.background} />
              </View>
            ) : null}
          </Pressable>
        </View>

        {/* タイトル */}
        <View style={styles.field}>
          <Kicker>タイトル</Kicker>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="例：サウナ"
            placeholderTextColor={IbukiColors.soft}
            style={styles.input}
          />
        </View>

        {/* カテゴリ */}
        <View style={styles.field}>
          <Kicker>カテゴリ</Kicker>
          <TextInput
            value={category}
            onChangeText={setCategory}
            placeholder="例：アウトドア"
            placeholderTextColor={IbukiColors.soft}
            style={styles.input}
          />
        </View>

        {/* 詳細 */}
        <View style={styles.field}>
          <Kicker>詳細</Kicker>
          <TextInput
            value={detail}
            onChangeText={setDetail}
            placeholder="このすきについて書いてみよう"
            placeholderTextColor={IbukiColors.soft}
            style={[styles.input, styles.inputMultiline]}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* SUKI ACTION LOG */}
        <PillButton
          label={navigating ? "移動中..." : "SUKI ACTION LOG →"}
          variant="dark"
          onPress={navigating ? undefined : handleNavigateToActionLog}
        />
      </IbukiScreen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: IbukiSpacing.md,
  },
  topBarActions: {
    flexDirection: "row",
    gap: IbukiSpacing.xs,
  },
  deleteButton: {
    backgroundColor: IbukiColors.surface,
    borderColor: IbukiColors.line,
    borderWidth: 1,
  },
  deleteButtonText: {
    color: IbukiColors.ink,
    fontFamily: IbukiFonts.sansBold,
    fontSize: 13,
    fontWeight: "700",
  },
  saveButton: {
    backgroundColor: IbukiColors.ink,
    borderRadius: IbukiRadius.pill,
    paddingHorizontal: IbukiSpacing.md,
    paddingVertical: IbukiSpacing.xs,
    minWidth: 52,
    alignItems: "center",
  },
  saveButtonText: {
    color: IbukiColors.background,
    fontFamily: IbukiFonts.sansBold,
    fontSize: 13,
    fontWeight: "700",
  },
  photoSection: {
    gap: IbukiSpacing.sm,
    marginBottom: IbukiSpacing.md,
  },
  photoPicker: {
    borderRadius: IbukiRadius.lg,
    height: 200,
    overflow: "hidden",
    width: "100%",
  },
  photoPickerPressed: {
    opacity: 0.78,
  },
  photo: {
    borderRadius: IbukiRadius.lg,
    height: 200,
    width: "100%",
  },
  photoPlaceholder: {
    alignItems: "center",
    backgroundColor: IbukiColors.surfaceMuted,
    borderColor: IbukiColors.line,
    borderRadius: IbukiRadius.lg,
    borderStyle: "dashed",
    borderWidth: 1,
    height: 200,
    justifyContent: "center",
  },
  photoPlaceholderText: {
    color: IbukiColors.soft,
    fontFamily: IbukiFonts.sans,
    fontSize: 14,
  },
  photoPlaceholderHint: {
    color: IbukiColors.mid,
    fontFamily: IbukiFonts.sans,
    fontSize: 12,
    marginTop: 4,
  },
  photoUploadingOverlay: {
    alignItems: "center",
    backgroundColor: "rgba(34, 34, 34, 0.48)",
    bottom: 0,
    justifyContent: "center",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  field: {
    gap: IbukiSpacing.xs,
    marginBottom: IbukiSpacing.md,
  },
  input: {
    backgroundColor: IbukiColors.surface,
    borderColor: IbukiColors.line,
    borderRadius: IbukiRadius.md,
    borderWidth: 1,
    color: IbukiColors.ink,
    fontFamily: IbukiFonts.sans,
    fontSize: 15,
    paddingHorizontal: IbukiSpacing.md,
    paddingVertical: IbukiSpacing.sm,
  },
  inputMultiline: {
    minHeight: 100,
    paddingTop: IbukiSpacing.sm,
  },
  errorText: {
    color: IbukiColors.mid,
    fontFamily: IbukiFonts.sans,
    fontSize: 15,
    textAlign: "center",
    marginTop: 80,
  },
});
