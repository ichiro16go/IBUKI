import * as ImagePicker from "expo-image-picker";

import { supabase } from "@/lib/supabase";
import {
  buildSukiCardPhotoPath,
  SUKI_CARD_PHOTO_BUCKET,
  validateSukiCardPhotoAsset,
} from "@/lib/suki-card-photo-upload-core";

export class SukiCardPhotoValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SukiCardPhotoValidationError";
  }
}

type UploadResult =
  | { status: "cancelled" }
  | { publicUrl: string; status: "uploaded" };

export async function pickAndUploadSukiCardPhoto({
  likeCardId,
  userId,
}: {
  likeCardId: string;
  userId: string;
}): Promise<UploadResult> {
  const result = await ImagePicker.launchImageLibraryAsync({
    allowsEditing: true,
    aspect: [4, 3],
    mediaTypes: ["images"],
    quality: 0.85,
  });

  if (result.canceled) return { status: "cancelled" };

  const asset = result.assets?.[0];
  const validation = validateSukiCardPhotoAsset(asset);
  if (!validation.ok) {
    throw new SukiCardPhotoValidationError(validation.message);
  }

  const response = await fetch(asset.uri);
  const fileData = await response.arrayBuffer();

  if (fileData.byteLength === 0) {
    throw new Error("Selected suki card photo is empty");
  }

  const path = buildSukiCardPhotoPath({
    likeCardId,
    mimeType: validation.mimeType,
    timestamp: Date.now(),
    userId,
  });

  const { error } = await supabase.storage
    .from(SUKI_CARD_PHOTO_BUCKET)
    .upload(path, fileData, {
      contentType: validation.mimeType,
      upsert: true,
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from(SUKI_CARD_PHOTO_BUCKET)
    .getPublicUrl(path);

  if (!data.publicUrl) {
    throw new Error("Failed to create public URL for uploaded suki card photo");
  }

  return { publicUrl: data.publicUrl, status: "uploaded" };
}
