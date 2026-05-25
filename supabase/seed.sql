-- Seed data for IBUKI app
-- Run this after creating test users via Google OAuth

-- First, get existing user IDs
-- You need to replace these UUIDs with actual user IDs from your auth.users table
-- Run: SELECT id FROM auth.users LIMIT 5; to get actual IDs

-- For now, we'll create the seed assuming you have at least 2-3 test users
-- Replace 'USER_A_ID', 'USER_B_ID', 'USER_C_ID' with actual UUIDs

DO $$
DECLARE
    user_a_id uuid;
    user_b_id uuid;
    user_c_id uuid;
    user_ids uuid[];
    i int;

    -- Like card IDs
    lc_ids uuid[] := ARRAY[]::uuid[];
    lc_id uuid;

    -- Encounter IDs
    enc_ids uuid[] := ARRAY[]::uuid[];
    enc_id uuid;
    planter_id uuid;
    saved_rec record;
    planted_count int := 0;

    -- Categories and hobbies
    categories text[] := ARRAY['music', 'sports', 'art', 'food', 'tech', 'nature', 'reading', 'games', 'travel', 'craft'];

    hobbies text[][] := ARRAY[
        ARRAY['ギター', 'ギターを弾くのが好きです。アコギでJ-POPをよく弾きます。'],
        ARRAY['ランニング', '朝ランが日課。週末は10km走ります。'],
        ARRAY['水彩画', '風景画を描くのが趣味。旅先でよくスケッチします。'],
        ARRAY['カフェ巡り', '隠れ家カフェを探すのが好き。ラテアートにハマってます。'],
        ARRAY['プログラミング', 'Webアプリ開発が趣味。最近はReactにハマってます。'],
        ARRAY['登山', '月1で山に登ります。最近は丹沢がお気に入り。'],
        ARRAY['読書', 'ミステリー小説が好き。月5冊は読みます。'],
        ARRAY['ボードゲーム', 'カタンやドミニオンが好き。週末は友達と遊びます。'],
        ARRAY['キャンプ', 'ソロキャンプにハマってます。焚き火が最高。'],
        ARRAY['陶芸', '週末は陶芸教室に通ってます。自作の器で料理を楽しみます。'],
        ARRAY['ヨガ', '毎朝ヨガをしています。心と体のバランスを大切にしてます。'],
        ARRAY['写真', 'フィルムカメラで街歩きスナップを撮ってます。'],
        ARRAY['料理', '週末は凝った料理を作ります。最近はタイ料理にハマり中。'],
        ARRAY['サイクリング', 'ロードバイクで100kmライドとか。荒川CRが好き。'],
        ARRAY['ピアノ', 'クラシックピアノを弾きます。ショパンが好き。'],
        ARRAY['映画鑑賞', 'ミニシアター系の映画が好き。年間100本は観ます。'],
        ARRAY['ガーデニング', 'ベランダで野菜を育ててます。トマトが上手にできました。'],
        ARRAY['編み物', '冬はセーターを編みます。今年は3着編みました。'],
        ARRAY['ダーツ', '週2でダーツバーに通ってます。Aフライト目指し中。'],
        ARRAY['スケボー', '週末は駒沢公園で滑ってます。オーリーの練習中。']
    ];

    hobby_idx int;
BEGIN
    -- Get actual user IDs from the users table
    SELECT ARRAY_AGG(id) INTO user_ids FROM (
        SELECT id FROM public.users ORDER BY created_at LIMIT 5
    ) sub;

    -- If no users exist, raise notice and exit
    IF user_ids IS NULL OR array_length(user_ids, 1) < 2 THEN
        RAISE NOTICE 'Need at least 2 users in the database. Please sign in with Google OAuth first.';
        RETURN;
    END IF;

    user_a_id := user_ids[1];
    user_b_id := user_ids[2];
    user_c_id := COALESCE(user_ids[3], user_ids[1]);

    RAISE NOTICE 'Using users: %, %, %', user_a_id, user_b_id, user_c_id;

    -- Clear existing data (optional - comment out if you want to keep existing data)
    DELETE FROM suki_action_logs;
    DELETE FROM planter_items;
    DELETE FROM saved_cards;
    DELETE FROM encounter_cards;
    DELETE FROM encounters;
    DELETE FROM like_cards;

    -- Insert like_cards for each user (max 5 per user due to trigger)
    -- User A's like cards
    FOR i IN 1..5 LOOP
        hobby_idx := i;
        INSERT INTO like_cards (user_id, category, title, detail, photo_url)
        VALUES (
            user_a_id,
            categories[((i - 1) % 10) + 1],
            hobbies[hobby_idx][1],
            hobbies[hobby_idx][2],
            'https://picsum.photos/seed/' || hobby_idx || '/400/300'
        )
        RETURNING id INTO lc_id;
        lc_ids := array_append(lc_ids, lc_id);
    END LOOP;

    -- User B's like cards
    FOR i IN 1..5 LOOP
        hobby_idx := i + 5;
        INSERT INTO like_cards (user_id, category, title, detail, photo_url)
        VALUES (
            user_b_id,
            categories[((i + 4) % 10) + 1],
            hobbies[hobby_idx][1],
            hobbies[hobby_idx][2],
            'https://picsum.photos/seed/' || (hobby_idx + 10) || '/400/300'
        )
        RETURNING id INTO lc_id;
        lc_ids := array_append(lc_ids, lc_id);
    END LOOP;

    -- User C's like cards (if exists)
    IF user_c_id != user_a_id THEN
        FOR i IN 1..5 LOOP
            hobby_idx := i + 10;
            IF hobby_idx <= 20 THEN
                INSERT INTO like_cards (user_id, category, title, detail, photo_url)
                VALUES (
                    user_c_id,
                    categories[((i + 9) % 10) + 1],
                    hobbies[hobby_idx][1],
                    hobbies[hobby_idx][2],
                    'https://picsum.photos/seed/' || (hobby_idx + 20) || '/400/300'
                )
                RETURNING id INTO lc_id;
                lc_ids := array_append(lc_ids, lc_id);
            END IF;
        END LOOP;
    END IF;

    RAISE NOTICE 'Created % like_cards', array_length(lc_ids, 1);

    -- Insert encounters (15 encounters)
    FOR i IN 1..15 LOOP
        INSERT INTO encounters (user_a_id, user_b_id, detection_method, rssi, encountered_at)
        VALUES (
            CASE WHEN i % 2 = 0 THEN user_a_id ELSE user_b_id END,
            CASE WHEN i % 2 = 0 THEN user_b_id ELSE user_a_id END,
            CASE WHEN i % 3 = 0 THEN 'GPS' ELSE 'BLE' END,
            -40 - (i * 3),
            NOW() - (i || ' hours')::interval
        )
        RETURNING id INTO enc_id;
        enc_ids := array_append(enc_ids, enc_id);
    END LOOP;

    -- If we have user C, add encounters with them too
    IF user_c_id != user_a_id THEN
        FOR i IN 1..5 LOOP
            INSERT INTO encounters (user_a_id, user_b_id, detection_method, rssi, encountered_at)
            VALUES (
                user_a_id,
                user_c_id,
                CASE WHEN i % 2 = 0 THEN 'GPS' ELSE 'BLE' END,
                -50 - (i * 2),
                NOW() - ((i + 15) || ' hours')::interval
            )
            RETURNING id INTO enc_id;
            enc_ids := array_append(enc_ids, enc_id);
        END LOOP;
    END IF;

    RAISE NOTICE 'Created % encounters', array_length(enc_ids, 1);

    -- Insert encounter_cards (cards exchanged during encounters)
    FOR i IN 1..LEAST(array_length(enc_ids, 1), 15) LOOP
        -- For each encounter, exchange 1-2 cards
        INSERT INTO encounter_cards (encounter_id, from_user_id, to_user_id, like_card_id)
        VALUES (
            enc_ids[i],
            CASE WHEN i % 2 = 0 THEN user_a_id ELSE user_b_id END,
            CASE WHEN i % 2 = 0 THEN user_b_id ELSE user_a_id END,
            lc_ids[((i - 1) % LEAST(array_length(lc_ids, 1), 10)) + 1]
        )
        ON CONFLICT (encounter_id, like_card_id, to_user_id) DO NOTHING;
    END LOOP;

    RAISE NOTICE 'Created encounter_cards';

    -- Insert saved_cards (some cards that users saved)
    FOR i IN 1..5 LOOP
        INSERT INTO saved_cards (user_id, like_card_id, encounter_id)
        VALUES (
            user_a_id,
            lc_ids[5 + ((i - 1) % 5) + 1],  -- User A saves User B's cards
            enc_ids[i]
        )
        ON CONFLICT (user_id, like_card_id) DO NOTHING;
    END LOOP;

    FOR i IN 1..3 LOOP
        INSERT INTO saved_cards (user_id, like_card_id, encounter_id)
        VALUES (
            user_b_id,
            lc_ids[((i - 1) % 5) + 1],  -- User B saves User A's cards
            enc_ids[i]
        )
        ON CONFLICT (user_id, like_card_id) DO NOTHING;
    END LOOP;

    RAISE NOTICE 'Created saved_cards';

    -- Insert planter_items and suki_action_logs from a subset of saved cards
    FOR saved_rec IN
        SELECT id, user_id, like_card_id, encounter_id
        FROM saved_cards
        ORDER BY created_at, id
        LIMIT 4
    LOOP
        INSERT INTO planter_items (
            user_id,
            like_card_id,
            source_saved_card_id,
            source_encounter_id,
            planted_at
        )
        VALUES (
            saved_rec.user_id,
            saved_rec.like_card_id,
            saved_rec.id,
            saved_rec.encounter_id,
            NOW() - ((planted_count + 2) || ' days')::interval
        )
        ON CONFLICT (user_id, like_card_id) DO UPDATE
        SET
            source_saved_card_id = EXCLUDED.source_saved_card_id,
            source_encounter_id = EXCLUDED.source_encounter_id
        RETURNING id INTO planter_id;

        INSERT INTO suki_action_logs (
            planter_item_id,
            user_id,
            action_type,
            title,
            notes,
            acted_at
        )
        VALUES
            (
                planter_id,
                saved_rec.user_id,
                'research',
                'まずは調べてみる',
                '気になった入口を検索して、最初の一歩を探した。',
                NOW() - ((planted_count + 1) || ' days')::interval
            ),
            (
                planter_id,
                saved_rec.user_id,
                CASE WHEN planted_count % 2 = 0 THEN 'experience' ELSE 'purchase' END,
                CASE WHEN planted_count % 2 = 0 THEN '実際に試してみる' ELSE '道具をそろえてみる' END,
                CASE
                    WHEN planted_count % 2 = 0 THEN '週末に体験できる場所を見つけて実際に触ってみた。'
                    ELSE '続けるための最低限の道具をひとつ用意した。'
                END,
                NOW() - (planted_count || ' hours')::interval
            );

        planted_count := planted_count + 1;
    END LOOP;

    RAISE NOTICE 'Created planter_items and suki_action_logs';
    RAISE NOTICE 'Seed data inserted successfully!';
END $$;

-- Verify the data
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'like_cards', COUNT(*) FROM like_cards
UNION ALL
SELECT 'encounters', COUNT(*) FROM encounters
UNION ALL
SELECT 'encounter_cards', COUNT(*) FROM encounter_cards
UNION ALL
SELECT 'saved_cards', COUNT(*) FROM saved_cards
UNION ALL
SELECT 'planter_items', COUNT(*) FROM planter_items
UNION ALL
SELECT 'suki_action_logs', COUNT(*) FROM suki_action_logs;
