export const SUKI_CARD_PHOTO_BUCKET = "suki-card-photos";
export const SUKI_CARD_PHOTO_MAX_BYTES = 5 * 1024 * 1024;

export const SUKI_CARD_PHOTO_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

type AllowedMimeType = (typeof SUKI_CARD_PHOTO_ALLOWED_MIME_TYPES)[number];

const MIME_EXTENSION_BY_TYPE: Record<AllowedMimeType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export type SukiCardPhotoAsset = {
  uri?: string;
  fileName?: string | null;
  fileSize?: number | null;
  mimeType?: string | null;
  type?: string | null;
};

export type SukiCardPhotoValidationResult =
  | { ok: true; mimeType: AllowedMimeType }
  | { ok: false; message: string; reason: "missing" | "type" | "size" };

export function buildSukiCardPhotoPath({
  userId,
  likeCardId,
  mimeType,
  timestamp,
}: {
  userId: string;
  likeCardId: string;
  mimeType: AllowedMimeType;
  timestamp: number;
}) {
  if (!userId || !likeCardId) {
    throw new Error("userId and likeCardId are required");
  }

  return `${userId}/${likeCardId}/${timestamp}.${MIME_EXTENSION_BY_TYPE[mimeType]}`;
}

export function buildPhotoUrlUpdate(publicUrl: string) {
  return { photo_url: publicUrl };
}

export function validateSukiCardPhotoAsset(
  asset: SukiCardPhotoAsset | null | undefined,
): SukiCardPhotoValidationResult {
  if (!asset?.uri) {
    return {
      ok: false,
      reason: "missing",
      message: "写真を選択できませんでした。",
    };
  }

  if (asset.type && asset.type !== "image") {
    return {
      ok: false,
      reason: "type",
      message: "画像ファイルを選択してください。",
    };
  }

  const mimeType = getAllowedMimeType(asset);
  if (!mimeType) {
    return {
      ok: false,
      reason: "type",
      message: "JPEG、PNG、WebPの画像を選択してください。",
    };
  }

  if (
    typeof asset.fileSize === "number" &&
    asset.fileSize > SUKI_CARD_PHOTO_MAX_BYTES
  ) {
    return {
      ok: false,
      reason: "size",
      message: "写真は5MB以下の画像を選択してください。",
    };
  }

  return { ok: true, mimeType };
}

function getAllowedMimeType(asset: SukiCardPhotoAsset): AllowedMimeType | null {
  const normalizedMimeType = normalizeMimeType(asset.mimeType);
  if (normalizedMimeType) return normalizedMimeType;

  return inferMimeTypeFromName(asset.fileName ?? asset.uri);
}

function normalizeMimeType(mimeType?: string | null): AllowedMimeType | null {
  if (!mimeType) return null;
  const normalized =
    mimeType.toLowerCase() === "image/jpg"
      ? "image/jpeg"
      : mimeType.toLowerCase();

  return isAllowedMimeType(normalized) ? normalized : null;
}

function inferMimeTypeFromName(name?: string | null): AllowedMimeType | null {
  if (!name) return null;
  const cleanName = name.split("?")[0]?.toLowerCase() ?? "";
  if (cleanName.endsWith(".jpg") || cleanName.endsWith(".jpeg")) {
    return "image/jpeg";
  }
  if (cleanName.endsWith(".png")) return "image/png";
  if (cleanName.endsWith(".webp")) return "image/webp";
  return null;
}

function isAllowedMimeType(value: string): value is AllowedMimeType {
  return SUKI_CARD_PHOTO_ALLOWED_MIME_TYPES.includes(value as AllowedMimeType);
}
