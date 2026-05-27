import { supabase } from "@/lib/supabase";

import {
  type EncounterCardRow,
  type EncounterFeedItem,
  type FromUserProfile,
  type LikeCardRow,
  type SavedCardRow,
  type SavedFeedItem,
  formatRelativeTime,
  mapLikeCardToHobby,
  normalizeEncounterRelation,
  normalizeLikeCard,
} from "./encounter-mappers";

export async function fetchEncounterFeed(
  userId: string,
): Promise<EncounterFeedItem[]> {
  const { data, error } = await supabase
    .from("encounter_cards")
    .select(
      `
        id,
        encounter_id,
        from_user_id,
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
        ),
        from_user:users!encounter_cards_from_user_id_fkey (
          age_range,
          gender_label,
          is_profile_public
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
      const rawFromUser = Array.isArray(row.from_user)
        ? (row.from_user[0] ?? null)
        : row.from_user;

      if (!likeCard) return null;

      const hobby = mapLikeCardToHobby(likeCard);
      const encounteredAt = encounter?.encountered_at ?? row.created_at;
      const fromUserProfile: FromUserProfile | null = rawFromUser
        ? {
            ageRange: rawFromUser.age_range,
            genderLabel: rawFromUser.gender_label,
            isProfilePublic: rawFromUser.is_profile_public,
          }
        : null;

      return {
        id: row.id,
        encounterId: row.encounter_id,
        likeCardId: likeCard.id,
        fromUserId: row.from_user_id,
        fromUserProfile,
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

/** encounter_id → from_user_id のマップを返す（bookmark画面でのプロフィール表示に使用） */
export async function fetchFromUserIdsByEncounterIds(
  encounterIds: string[],
  toUserId: string,
): Promise<Record<string, string>> {
  if (encounterIds.length === 0) return {};
  const { data, error } = await supabase
    .from("encounter_cards")
    .select("encounter_id, from_user_id")
    .in("encounter_id", encounterIds)
    .eq("to_user_id", toUserId);
  if (error) return {};
  const result: Record<string, string> = {};
  for (const row of data) {
    result[row.encounter_id] = row.from_user_id;
  }
  return result;
}

/** 複数ユーザーの like_cards をまとめて取得し userId → titles[] に変換 */
export async function fetchOtherSukisByUserIds(
  userIds: string[],
): Promise<Record<string, string[]>> {
  if (userIds.length === 0) return {};
  const { data, error } = await supabase
    .from("like_cards")
    .select("user_id, title")
    .in("user_id", userIds);
  if (error) throw error;
  const result: Record<string, string[]> = {};
  for (const row of data) {
    if (!result[row.user_id]) result[row.user_id] = [];
    result[row.user_id].push(row.title);
  }
  return result;
}

export async function fetchLikeCardById(cardId: string): Promise<LikeCardRow> {
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
}): Promise<void> {
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

export async function deleteSavedBookmark({
  savedCardId,
  userId,
}: {
  savedCardId: string;
  userId: string;
}): Promise<void> {
  const { error } = await supabase
    .from("saved_cards")
    .delete()
    .eq("id", savedCardId)
    .eq("user_id", userId);

  if (error) throw error;
}
