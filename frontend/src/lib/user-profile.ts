import { supabase } from "@/lib/supabase";

export type UserProfile = {
  id: string;
  username: string;
  nickname: string | null;
  age_range: string | null;
  gender_label: string | null;
  is_profile_public: boolean;
};

export const AGE_RANGES = ["10代", "20代", "30代", "40代以上"] as const;
export const GENDER_LABELS = ["男性", "女性", "その他"] as const;

export async function getMyProfile(): Promise<UserProfile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("users")
    .select("id, username, nickname, age_range, gender_label, is_profile_public")
    .eq("id", user.id)
    .single();

  if (error) throw error;
  return data;
}

export async function getUserPublicProfile(
  userId: string,
): Promise<Pick<UserProfile, "age_range" | "gender_label" | "is_profile_public"> | null> {
  const { data, error } = await supabase
    .from("users")
    .select("age_range, gender_label, is_profile_public")
    .eq("id", userId)
    .maybeSingle();
  if (error) return null;
  return data;
}

export async function updateMyProfile(input: {
  nickname?: string | null;
  age_range?: string | null;
  gender_label?: string | null;
  is_profile_public?: boolean;
}): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("ログインが必要です");

  const { error } = await supabase
    .from("users")
    .update(input)
    .eq("id", user.id);

  if (error) throw error;
}
