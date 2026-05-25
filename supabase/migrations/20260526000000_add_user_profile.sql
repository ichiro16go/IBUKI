-- Add profile attributes to users table
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS age_range text,
  ADD COLUMN IF NOT EXISTS gender_label text,
  ADD COLUMN IF NOT EXISTS is_profile_public boolean DEFAULT false NOT NULL;

-- RLS: allow all authenticated users to read any public profile
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read user profiles" ON public.users;
CREATE POLICY "Anyone can read user profiles"
  ON public.users
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
