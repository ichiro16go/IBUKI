import type { ImageSourcePropType } from "react-native";

import type { Hobby, PhotoTone } from "@/data/ibuki";

export type LikeCardRow = {
  id: string;
  title: string;
  category: string | null;
  detail: string | null;
  photo_url: string | null;
  created_at?: string | null;
};

export type EncounterRelation = {
  encountered_at: string | null;
  detection_method?: string | null;
};

export type FromUserRow = {
  age_range: string | null;
  gender_label: string | null;
  is_profile_public: boolean;
};

export type EncounterCardRow = {
  id: string;
  encounter_id: string;
  from_user_id: string;
  created_at: string | null;
  like_card: LikeCardRow | LikeCardRow[] | null;
  encounter: EncounterRelation | EncounterRelation[] | null;
  from_user: FromUserRow | FromUserRow[] | null;
};

export type SavedCardRow = {
  id: string;
  encounter_id: string;
  created_at: string | null;
  like_card: LikeCardRow | LikeCardRow[] | null;
};

export type FromUserProfile = {
  ageRange: string | null;
  genderLabel: string | null;
  isProfilePublic: boolean;
};

export type EncounterFeedItem = {
  id: string;
  encounterId: string;
  likeCardId: string;
  fromUserId: string;
  fromUserProfile: FromUserProfile | null;
  hobby: Hobby;
  time: string;
  context: string;
  isNew: boolean;
};

export type SavedFeedItem = {
  id: string;
  encounterId: string;
  likeCardId: string;
  savedAt: string;
  hobby: Hobby;
};

const photoTones: PhotoTone[] = [
  "warm",
  "dawn",
  "dusk",
  "night",
  "clay",
  "moss",
  "ink",
  "mint",
  "paper",
];

export function normalizeLikeCard(
  relation: LikeCardRow | LikeCardRow[] | null,
): LikeCardRow | null {
  if (!relation) return null;
  return Array.isArray(relation) ? (relation[0] ?? null) : relation;
}

export function normalizeEncounterRelation(
  relation: EncounterRelation | EncounterRelation[] | null,
): EncounterRelation | null {
  if (!relation) return null;
  return Array.isArray(relation) ? (relation[0] ?? null) : relation;
}

function getPhotoToneSeed(id: string): number {
  return id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

export function pickPhotoTone(id: string): PhotoTone {
  return photoTones[getPhotoToneSeed(id) % photoTones.length];
}

export function buildTag(category: string | null): string[] {
  if (!category) return ["#suki"];
  return [`#${category}`];
}

export function getFallbackText(title: string): string {
  return `${title}に少しでも惹かれたら、まずはbookmarkしてあとでじっくり見返そう。`;
}

export function formatRelativeTime(timestamp: string | null | undefined): string {
  if (!timestamp) return "今";

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "今";

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));

  if (diffMinutes < 60) return `${diffMinutes}分前`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}時間前`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}日前`;

  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export function mapLikeCardToHobby(card: LikeCardRow): Hobby {
  const note = card.detail?.trim() || getFallbackText(card.title);

  return {
    id: `remote-${card.id}`,
    number: card.id.slice(0, 4).toUpperCase(),
    nameJa: card.title,
    nameEn: card.category ?? "Unknown",
    slug: card.title.toLowerCase().replace(/\s+/g, "-"),
    tags: buildTag(card.category),
    quote: card.detail?.trim() || `${card.title}が気になっている。`,
    distance: "—",
    lastSeen: "今",
    savedAt: "今日",
    photoTone: pickPhotoTone(card.id),
    image: (card.photo_url
      ? { uri: card.photo_url }
      : undefined) as ImageSourcePropType,
    beginnerNote: note,
    intro: note,
    howToStart: [
      "bookmarkして、あとで落ち着いて見返す",
      "気になった理由をひとことメモする",
      "週末に試せる入口をひとつ探す",
    ],
  };
}
