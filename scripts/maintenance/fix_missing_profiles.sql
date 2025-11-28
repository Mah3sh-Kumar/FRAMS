-- ==============================================================================
-- FIX MISSING PROFILES SCRIPT
-- ==============================================================================
-- INSTRUCTIONS:
-- 1. Copy the content of this file.
-- 2. Go to Supabase Dashboard -> SQL Editor.
-- 3. Paste and Run.
-- ==============================================================================

DO $$
DECLARE
    r RECORD;
    count_fixed INTEGER := 0;
BEGIN
    -- Loop through all auth users who don't have a public.users profile
    FOR r IN 
        SELECT 
            au.id, 
            au.email, 
            au.raw_user_meta_data
        FROM auth.users au
        LEFT JOIN public.users pu ON au.id = pu.id
        WHERE pu.id IS NULL
    LOOP
        -- Insert missing profile
        INSERT INTO public.users (id, email, full_name, role)
        VALUES (
            r.id,
            r.email,
            COALESCE(r.raw_user_meta_data->>'full_name', 'Unknown User'),
            COALESCE((r.raw_user_meta_data->>'role')::user_role, 'student')
        );
        
        count_fixed := count_fixed + 1;
    END LOOP;

    RAISE NOTICE 'Fixed % missing profiles.', count_fixed;
END $$;
