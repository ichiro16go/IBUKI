import { createClient } from "jsr:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

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
  try {
    const { user_id, latitude, longitude } = await req.json();

    if (!user_id || !latitude || !longitude) {
      return new Response(
        JSON.stringify({ error: "user_id, latitude, longitude are required" }),
        { status: 400 }
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
      return new Response(JSON.stringify({ encounters: [] }), { status: 200 });
    }

    // 3. 50m以内のユーザーを絞り込む
    const DISTANCE_THRESHOLD = 50;
    const closeUsers = nearbyUsers.filter((u: { user_id: string; latitude: number; longitude: number }) =>
      haversineDistance(latitude, longitude, u.latitude, u.longitude) <= DISTANCE_THRESHOLD
    );

    if (closeUsers.length === 0) {
      return new Response(JSON.stringify({ encounters: [] }), { status: 200 });
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

      // 6. 相手のlike_cardsからランダム1枚取得
      const { data: likeCards } = await supabase
        .from("like_cards")
        .select("id")
        .eq("user_id", closeUser.user_id)
        .limit(100);

      if (!likeCards || likeCards.length === 0) continue;

      const randomCard = likeCards[Math.floor(Math.random() * likeCards.length)];

      console.log("likeCards:", likeCards); // 追加
      console.log("closeUser:", closeUser); // 追加

      // 7. encounter_cardsを生成
      await supabase.from("encounter_cards").insert({
        encounter_id: encounter.id,
        from_user_id: closeUser.user_id,
        to_user_id: user_id,
        like_card_id: randomCard.id,
      });

      newEncounters.push(encounter);
    }

    return new Response(
      JSON.stringify({ encounters: newEncounters }),
      { status: 200 }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500 }
    );
  }
});