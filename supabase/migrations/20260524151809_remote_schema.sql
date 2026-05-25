


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."check_like_card_limit"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF (
    SELECT COUNT(*) FROM like_cards WHERE user_id = NEW.user_id
  ) >= 5 THEN
    RAISE EXCEPTION 'like_card is limited to 5 per user';
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."check_like_card_limit"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.users (id, username)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'name'  -- GoogleアカウントのDisplayName
  );
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."encounter_cards" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "encounter_id" "uuid" NOT NULL,
    "from_user_id" "uuid" NOT NULL,
    "to_user_id" "uuid" NOT NULL,
    "like_card_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."encounter_cards" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."encounters" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_a_id" "uuid" NOT NULL,
    "user_b_id" "uuid" NOT NULL,
    "detection_method" character varying(10) NOT NULL,
    "rssi" smallint,
    "encountered_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "check_different_users" CHECK (("user_a_id" <> "user_b_id")),
    CONSTRAINT "encounters_detection_method_check" CHECK ((("detection_method")::"text" = ANY ((ARRAY['BLE'::character varying, 'GPS'::character varying])::"text"[])))
);


ALTER TABLE "public"."encounters" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."like_cards" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "category" character varying(100) NOT NULL,
    "title" character varying(100) NOT NULL,
    "detail" "text",
    "photo_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."like_cards" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."saved_cards" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "like_card_id" "uuid" NOT NULL,
    "encounter_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."saved_cards" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "username" character varying(50) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."encounter_cards"
    ADD CONSTRAINT "encounter_cards_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."encounters"
    ADD CONSTRAINT "encounters_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."like_cards"
    ADD CONSTRAINT "like_cards_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."saved_cards"
    ADD CONSTRAINT "saved_cards_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."encounter_cards"
    ADD CONSTRAINT "unique_encounter_card" UNIQUE ("encounter_id", "like_card_id", "to_user_id");



ALTER TABLE ONLY "public"."saved_cards"
    ADD CONSTRAINT "unique_saved_card" UNIQUE ("user_id", "like_card_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_username_key" UNIQUE ("username");



CREATE INDEX "idx_encounter_cards_encounter" ON "public"."encounter_cards" USING "btree" ("encounter_id", "to_user_id");



CREATE INDEX "idx_encounters_users" ON "public"."encounters" USING "btree" ("user_a_id", "user_b_id", "encountered_at");



CREATE INDEX "idx_saved_cards_user" ON "public"."saved_cards" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "enforce_like_card_limit" BEFORE INSERT ON "public"."like_cards" FOR EACH ROW EXECUTE FUNCTION "public"."check_like_card_limit"();



CREATE OR REPLACE TRIGGER "trigger_like_cards_updated_at" BEFORE UPDATE ON "public"."like_cards" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



ALTER TABLE ONLY "public"."encounter_cards"
    ADD CONSTRAINT "encounter_cards_encounter_id_fkey" FOREIGN KEY ("encounter_id") REFERENCES "public"."encounters"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."encounter_cards"
    ADD CONSTRAINT "encounter_cards_from_user_id_fkey" FOREIGN KEY ("from_user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."encounter_cards"
    ADD CONSTRAINT "encounter_cards_like_card_id_fkey" FOREIGN KEY ("like_card_id") REFERENCES "public"."like_cards"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."encounter_cards"
    ADD CONSTRAINT "encounter_cards_to_user_id_fkey" FOREIGN KEY ("to_user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."encounters"
    ADD CONSTRAINT "encounters_user_a_id_fkey" FOREIGN KEY ("user_a_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."encounters"
    ADD CONSTRAINT "encounters_user_b_id_fkey" FOREIGN KEY ("user_b_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."like_cards"
    ADD CONSTRAINT "like_cards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."saved_cards"
    ADD CONSTRAINT "saved_cards_encounter_id_fkey" FOREIGN KEY ("encounter_id") REFERENCES "public"."encounters"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."saved_cards"
    ADD CONSTRAINT "saved_cards_like_card_id_fkey" FOREIGN KEY ("like_card_id") REFERENCES "public"."like_cards"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."saved_cards"
    ADD CONSTRAINT "saved_cards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE "public"."encounter_cards" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."encounters" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."like_cards" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "public like_cards are readable" ON "public"."like_cards" FOR SELECT USING (true);



ALTER TABLE "public"."saved_cards" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "users can delete own saved_cards" ON "public"."saved_cards" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "users can insert encounter_cards" ON "public"."encounter_cards" FOR INSERT WITH CHECK (("auth"."uid"() = "from_user_id"));



CREATE POLICY "users can insert encounters" ON "public"."encounters" FOR INSERT WITH CHECK (("auth"."uid"() = "user_a_id"));



CREATE POLICY "users can insert saved_cards" ON "public"."saved_cards" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "users can manage own like_cards" ON "public"."like_cards" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "users can read own data" ON "public"."users" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "users can read own encounter_cards" ON "public"."encounter_cards" FOR SELECT USING (("auth"."uid"() = "to_user_id"));



CREATE POLICY "users can read own encounters" ON "public"."encounters" FOR SELECT USING ((("auth"."uid"() = "user_a_id") OR ("auth"."uid"() = "user_b_id")));



CREATE POLICY "users can read own saved_cards" ON "public"."saved_cards" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "users can update own data" ON "public"."users" FOR UPDATE USING (("auth"."uid"() = "id"));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































GRANT ALL ON FUNCTION "public"."check_like_card_limit"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_like_card_limit"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_like_card_limit"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "service_role";


















GRANT ALL ON TABLE "public"."encounter_cards" TO "anon";
GRANT ALL ON TABLE "public"."encounter_cards" TO "authenticated";
GRANT ALL ON TABLE "public"."encounter_cards" TO "service_role";



GRANT ALL ON TABLE "public"."encounters" TO "anon";
GRANT ALL ON TABLE "public"."encounters" TO "authenticated";
GRANT ALL ON TABLE "public"."encounters" TO "service_role";



GRANT ALL ON TABLE "public"."like_cards" TO "anon";
GRANT ALL ON TABLE "public"."like_cards" TO "authenticated";
GRANT ALL ON TABLE "public"."like_cards" TO "service_role";



GRANT ALL ON TABLE "public"."saved_cards" TO "anon";
GRANT ALL ON TABLE "public"."saved_cards" TO "authenticated";
GRANT ALL ON TABLE "public"."saved_cards" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































drop extension if exists "pg_net";

alter table "public"."encounters" drop constraint "encounters_detection_method_check";

alter table "public"."encounters" add constraint "encounters_detection_method_check" CHECK (((detection_method)::text = ANY ((ARRAY['BLE'::character varying, 'GPS'::character varying])::text[]))) not valid;

alter table "public"."encounters" validate constraint "encounters_detection_method_check";

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


