-- Harden encounter auth and restore profile visibility rules

-- Public profile visibility should follow the explicit flag.
DROP POLICY IF EXISTS "Anyone can read user profiles" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can read profiles" ON public.users;
DROP POLICY IF EXISTS "Public profiles are readable" ON public.users;

CREATE POLICY "Users can read own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Public profiles are readable"
  ON public.users
  FOR SELECT
  USING (is_profile_public = true);
