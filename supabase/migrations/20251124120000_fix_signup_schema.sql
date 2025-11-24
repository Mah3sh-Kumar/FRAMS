-- Migration to fix signup schema and add missing columns

-- 1. Add new columns to public.students
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS branch TEXT,
ADD COLUMN IF NOT EXISTS class_level TEXT;

-- 2. Make class_id nullable since we might use class_level for some students
ALTER TABLE public.students 
ALTER COLUMN class_id DROP NOT NULL;

-- 3. Update the handle_new_user function to be more robust
-- We'll actually disable the trigger-based insertion for now since we are doing it manually in the app
-- But we'll keep the function definition correct just in case we want to enable it later
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'student')
  );
  RETURN new;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail the auth signup
  RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists (or recreate it)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
