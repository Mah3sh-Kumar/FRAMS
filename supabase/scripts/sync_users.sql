-- ==============================================================================
-- SYNC AUTH USERS TO PUBLIC USERS TABLE
-- ==============================================================================
-- This script will:
-- 1. Insert any missing users from auth.users into public.users
-- 2. Ensure the trigger is correctly set up for future users
-- ==============================================================================

-- 1. Insert missing users
INSERT INTO public.users (id, email, full_name, role, created_at)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', 'Unknown User'),
    COALESCE((au.raw_user_meta_data->>'role')::user_role, 'student'),
    au.created_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- 2. Verify the trigger exists and is enabled
-- (Re-creating it just to be safe)

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'student')
  )
  ON CONFLICT (id) DO NOTHING; -- Prevent errors if user already exists
  RETURN new;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail the auth signup
  RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Output the results
SELECT count(*) as users_synced FROM public.users;
