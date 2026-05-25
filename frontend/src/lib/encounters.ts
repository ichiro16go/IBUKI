import type { ImageSourcePropType } from "react-native";

import type { Hobby, PhotoTone } from "@/data/ibuki";
import { supabase } from "@/lib/supabase";

type LikeCardRow = {
  id: string;
  title: string;
  category: string | null;
  detail: string | null;
  photo_url: string | null;
  created_at?: string | null;
};

type EncounterRelation = {
  encountered_at: string | null;
  detection_method?: string | null;
};

type EncounterCardRow = {
  id: string;
  encounter_id: string;
  created_at: string | null;
  like_card: LikeCardRow | LikeCardRow[] | null;
  encounter: EncounterRelation | EncounterRelation[] | null;
};

type SavedCardRow = {
  id: string;
  encounter_id: string;
  created_at: string | null;
  like_card: LikeCardRow | LikeCardRow[] | null;
};

export type EncounterFeedItem = {
  id: string;
  encounterId: string;
  likeCardId: string;
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

function normalizeLikeCard(
  relation: LikeCardRow | LikeCardRow[] | null,
): LikeCardRow | null {
  if (!relation) return null;
  return Array.isArray(relation) ? (relation[0] ?? null) : relation;
}

function normalizeEncounterRelation(
  relation: EncounterRelation | EncounterRelation[] | null,
): EncounterRelation | null {
  if (!relation) return null;
  return Array.isArray(relation) ? (relation[0] ?? null) : relation;
}

function getPhotoToneSeed(id: string) {
  return id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function pickPhotoTone(id: string): PhotoTone {
  return photoTones[getPhotoToneSeed(id) % photoTones.length];
}

function buildTag(category: string | null) {
  if (!category) return ["#suki"];
  return [`#${category}`];
}

function getFallbackText(title: string) {
  return `${title}に少しでも惹かれたら、まずはbookmarkしてあとでじっくり見返そう。`;
}

export function formatRelativeTime(timestamp: string | null | undefined) {
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

export async function fetchEncounterFeed(
  userId: string,
): Promise<EncounterFeedItem[]> {
  const { data, error } = await supabase
    .from("encounter_cards")
    .select(
      `
        id,
        encounter_id,
        created_at,
        like_card:like_cards!encounter_cards_like_card_id_fkey (
          id,
          title,
          category,
          detail,
          photo_url,
          created_at
        ),
        encounter:encounters!encounter_cards_encounter_id_fkey (
          encountered_at,
          detection_method
        )
      `,
    )
    .eq("to_user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return ((data ?? []) as EncounterCardRow[])
    .map((row, index) => {
      const likeCard = normalizeLikeCard(row.like_card);
      const encounter = normalizeEncounterRelation(row.encounter);

      if (!likeCard) return null;

      const hobby = mapLikeCardToHobby(likeCard);
      const encounteredAt = encounter?.encountered_at ?? row.created_at;

      return {
        id: row.id,
        encounterId: row.encounter_id,
        likeCardId: likeCard.id,
        hobby: {
          ...hobby,
          lastSeen: formatRelativeTime(encounteredAt),
        },
        time: formatRelativeTime(encounteredAt),
        context: likeCard.category ?? "new encounter",
        isNew: index < 3,
      };
    })
    .filter((item): item is EncounterFeedItem => item !== null);
}

export async function fetchSavedCards(
  userId: string,
): Promise<SavedFeedItem[]> {
  const { data, error } = await supabase
    .from("saved_cards")
    .select(
      `
        id,
        encounter_id,
        created_at,
        like_card:like_cards!saved_cards_like_card_id_fkey (
          id,
          title,
          category,
          detail,
          photo_url,
          created_at
        )
      `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return ((data ?? []) as SavedCardRow[])
    .map((row) => {
      const likeCard = normalizeLikeCard(row.like_card);
      if (!likeCard) return null;

      return {
        id: row.id,
        encounterId: row.encounter_id,
        likeCardId: likeCard.id,
        savedAt: formatRelativeTime(row.created_at),
        hobby: {
          ...mapLikeCardToHobby(likeCard),
          savedAt: formatRelativeTime(row.created_at),
        },
      };
    })
    .filter((item): item is SavedFeedItem => item !== null);
}

export async function fetchLikeCardById(cardId: string) {
  const { data, error } = await supabase
    .from("like_cards")
    .select("id, title, category, detail, photo_url, created_at")
    .eq("id", cardId)
    .maybeSingle<LikeCardRow>();

  if (error) throw error;
  if (!data) throw new Error("カードが見つかりませんでした");
  return data;
}

export async function saveEncounterBookmark({
  encounterId,
  likeCardId,
  userId,
}: {
  encounterId: string;
  likeCardId: string;
  userId: string;
}) {
  const { error } = await supabase.from("saved_cards").upsert(
    {
      user_id: userId,
      like_card_id: likeCardId,
      encounter_id: encounterId,
    },
    {
      onConflict: "user_id,like_card_id",
      ignoreDuplicates: true,
    },
  );

  if (error) throw error;
}
