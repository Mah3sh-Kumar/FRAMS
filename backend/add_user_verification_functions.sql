-- ==============================================================================
-- ADD USER VERIFICATION FUNCTIONS
-- ==============================================================================
-- This script adds functions for admin user verification management
-- Run this in your Supabase SQL Editor
-- ==============================================================================

-- Add verified_at column to users table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'verified_at'
    ) THEN
        ALTER TABLE public.users ADD COLUMN verified_at TIMESTAMP WITH TIME ZONE;
        COMMENT ON COLUMN public.users.verified_at IS 'Timestamp when the user was verified by an admin';
    END IF;
END $$;

-- Function to verify a user (admin only)
CREATE OR REPLACE FUNCTION public.verify_user(target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if caller is admin
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Only admins can verify users';
    END IF;

    -- Update user verification status
    UPDATE public.users
    SET 
        is_verified = true,
        verified_at = TIMEZONE('utc'::TEXT, NOW())
    WHERE id = target_user_id;

    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.verify_user(UUID) IS 'Verifies a user account (admin only)';

-- Function to unverify a user (admin only)
CREATE OR REPLACE FUNCTION public.unverify_user(target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if caller is admin
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Only admins can unverify users';
    END IF;

    -- Prevent unverifying admin users
    IF EXISTS (SELECT 1 FROM public.users WHERE id = target_user_id AND role = 'admin') THEN
        RAISE EXCEPTION 'Cannot unverify admin users';
    END IF;

    -- Update user verification status
    UPDATE public.users
    SET 
        is_verified = false,
        verified_at = NULL
    WHERE id = target_user_id;

    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.unverify_user(UUID) IS 'Unverifies a user account (admin only)';

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.verify_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.unverify_user(UUID) TO authenticated;

-- ==============================================================================
-- END OF SCRIPT
-- ==============================================================================
