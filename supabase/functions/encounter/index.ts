import { createClient } from "jsr:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// 許可するオリジンを環境変数から取得。"*" を設定すれば全許可（開発用）。
const ALLOWED_ORIGIN = Deno.env.get("ALLOWED_ORIGIN") ?? "";

function getCorsHeaders(requestOrigin: string | null): Record<string, string> {
  const allowed =
    ALLOWED_ORIGIN === "*" || requestOrigin === ALLOWED_ORIGIN
      ? (requestOrigin ?? "")
      : "";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get("origin"));

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { user_id, latitude, longitude } = await req.json();

    if (!user_id || !latitude || !longitude) {
      return new Response(
        JSON.stringify({ error: "user_id, latitude, longitude are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. 自分の位置情報をupsert
    await supabase
      .from("user_locations")
      .upsert({ user_id, latitude, longitude, updated_at: new Date().toISOString() });

    // 2. 5分以内に更新された他のユーザーの位置情報を取得
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: nearbyUsers } = await supabase
      .from("user_locations")
      .select("user_id, latitude, longitude")
      .neq("user_id", user_id)
      .gte("updated_at", fiveMinutesAgo);

    if (!nearbyUsers || nearbyUsers.length === 0) {
      return new Response(
        JSON.stringify({ encounters: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. 50m以内のユーザーを絞り込む
    const DISTANCE_THRESHOLD = 50;
    const closeUsers = nearbyUsers.filter((u: { user_id: string; latitude: number; longitude: number }) =>
      haversineDistance(latitude, longitude, u.latitude, u.longitude) <= DISTANCE_THRESHOLD
    );

    if (closeUsers.length === 0) {
      return new Response(
        JSON.stringify({ encounters: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const newEncounters = [];

    for (const closeUser of closeUsers) {
      // 4. 重複チェック（1時間以内に同じペアのencounterがないか）
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { data: existing } = await supabase
        .from("encounters")
        .select("id")
        .or(
          `and(user_a_id.eq.${user_id},user_b_id.eq.${closeUser.user_id}),` +
          `and(user_a_id.eq.${closeUser.user_id},user_b_id.eq.${user_id})`
        )
        .gte("encountered_at", oneHourAgo)
        .limit(1);

      if (existing && existing.length > 0) continue;

      // 5. encounterを生成
      const { data: encounter } = await supabase
        .from("encounters")
        .insert({
          user_a_id: user_id,
          user_b_id: closeUser.user_id,
          detection_method: "GPS",
          encountered_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (!encounter) continue;

      // 6. user_aにuser_bのカードを渡す
      const { data: likeCardsB } = await supabase
        .from("like_cards")
        .select("id")
        .eq("user_id", closeUser.user_id)
        .limit(100);

      if (likeCardsB && likeCardsB.length > 0) {
        const randomCardB = likeCardsB[Math.floor(Math.random() * likeCardsB.length)];
        await supabase.from("encounter_cards").insert({
          encounter_id: encounter.id,
          from_user_id: closeUser.user_id,
          to_user_id: user_id,
          like_card_id: randomCardB.id,
        });
      }

      // 7. user_bにuser_aのカードを渡す
      const { data: likeCardsA } = await supabase
        .from("like_cards")
        .select("id")
        .eq("user_id", user_id)
        .limit(100);

      if (likeCardsA && likeCardsA.length > 0) {
        const randomCardA = likeCardsA[Math.floor(Math.random() * likeCardsA.length)];
        await supabase.from("encounter_cards").insert({
          encounter_id: encounter.id,
          from_user_id: user_id,
          to_user_id: closeUser.user_id,
          like_card_id: randomCardA.id,
        });
      }

      newEncounters.push(encounter);
    }

    return new Response(
      JSON.stringify({ encounters: newEncounters }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: "内部エラーが発生しました。" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
