import { supabase } from "@/lib/supabase";

export type LikeCard = {
  id: string;
  user_id: string;
  category: string;
  title: string;
  detail: string;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateLikeCardInput = {
  category: string;
  title: string;
  detail: string;
  photo_url?: string;
};

export type UpdateLikeCardInput = Partial<CreateLikeCardInput>;

/** 自分の like_cards を全件取得 */
export async function getMyLikeCards(): Promise<LikeCard[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("like_cards")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

/** ID で like_card を1件取得 */
export async function getLikeCardById(id: string): Promise<LikeCard | null> {
  const { data, error } = await supabase
    .from("like_cards")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data;
}

/** like_card を作成（上限5枚はDB側トリガーで制御） */
export async function createLikeCard(
  input: CreateLikeCardInput,
): Promise<LikeCard> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("ログインが必要です");

  const { data, error } = await supabase
    .from("like_cards")
    .insert({ ...input, user_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** like_card を更新 */
export async function updateLikeCard(
  id: string,
  input: UpdateLikeCardInput,
): Promise<LikeCard> {
  const { data, error } = await supabase
    .from("like_cards")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** like_card を削除 */
export async function deleteLikeCard(id: string): Promise<void> {
  const { error } = await supabase.from("like_cards").delete().eq("id", id);
  if (error) throw error;
}

/** 指定の like_card_id ごとに何人が植えているかカウント */
export async function getPlantedCountByCardIds(
  cardIds: string[],
): Promise<Record<string, number>> {
  if (cardIds.length === 0) return {};
  const { data, error } = await supabase
    .from("planter_items")
    .select("like_card_id")
    .in("like_card_id", cardIds);
  if (error) throw error;
  const counts: Record<string, number> = {};
  for (const row of data) {
    counts[row.like_card_id] = (counts[row.like_card_id] ?? 0) + 1;
  }
  return counts;
}
