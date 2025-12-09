-- ==============================================================================
-- COMPLETE FIX MIGRATION
-- ==============================================================================
-- This script fixes all the reported issues:
-- 1. Missing is_active column in classes table
-- 2. Missing can_delete_class function
-- 3. Missing is_verified column in users table
-- 4. Missing verify_user and unverify_user functions
-- 
-- Run this entire script in your Supabase SQL Editor
-- ==============================================================================

-- ==============================================================================
-- PART 1: FIX CLASSES TABLE
-- ==============================================================================

-- Add is_active column to classes table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'classes' 
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE public.classes ADD COLUMN is_active BOOLEAN DEFAULT true NOT NULL;
        COMMENT ON COLUMN public.classes.is_active IS 'Whether the class is currently active';
        RAISE NOTICE 'Added is_active column to classes table';
    ELSE
        RAISE NOTICE 'is_active column already exists in classes table';
    END IF;
END $$;

-- Add value column to classes table (for internal identifiers)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'classes' 
        AND column_name = 'value'
    ) THEN
        ALTER TABLE public.classes ADD COLUMN value TEXT;
        COMMENT ON COLUMN public.classes.value IS 'Internal value identifier for the class';
        
        -- Generate values for existing classes
        UPDATE public.classes 
        SET value = LOWER(REPLACE(REPLACE(name, ' ', '_'), '-', '_'))
        WHERE value IS NULL;
        
        -- Make it NOT NULL after populating
        ALTER TABLE public.classes ALTER COLUMN value SET NOT NULL;
        
        -- Add unique constraint
        ALTER TABLE public.classes ADD CONSTRAINT classes_value_unique UNIQUE (value);
        RAISE NOTICE 'Added value column to classes table';
    ELSE
        RAISE NOTICE 'value column already exists in classes table';
    END IF;
END $$;

-- Add display_order column to classes table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'classes' 
        AND column_name = 'display_order'
    ) THEN
        ALTER TABLE public.classes ADD COLUMN display_order INTEGER DEFAULT 0 NOT NULL;
        COMMENT ON COLUMN public.classes.display_order IS 'Order in which classes should be displayed';
        
        -- Set display order for existing classes
        WITH numbered_classes AS (
            SELECT id, ROW_NUMBER() OVER (ORDER BY name) - 1 as row_num
            FROM public.classes
        )
        UPDATE public.classes c
        SET display_order = nc.row_num
        FROM numbered_classes nc
        WHERE c.id = nc.id;
        RAISE NOTICE 'Added display_order column to classes table';
    ELSE
        RAISE NOTICE 'display_order column already exists in classes table';
    END IF;
END $$;

-- Add updated_at column to classes table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'classes' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.classes ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL;
        COMMENT ON COLUMN public.classes.updated_at IS 'Last update timestamp';
        RAISE NOTICE 'Added updated_at column to classes table';
    ELSE
        RAISE NOTICE 'updated_at column already exists in classes table';
    END IF;
END $$;

-- ==============================================================================
-- PART 2: FIX USERS TABLE FOR VERIFICATION
-- ==============================================================================

-- Add is_verified column to users table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'is_verified'
    ) THEN
        ALTER TABLE public.users ADD COLUMN is_verified BOOLEAN DEFAULT false NOT NULL;
        COMMENT ON COLUMN public.users.is_verified IS 'Whether the user account has been verified by an admin';
        
        -- Auto-verify existing admin users
        UPDATE public.users SET is_verified = true WHERE role = 'admin';
        RAISE NOTICE 'Added is_verified column to users table and verified all admins';
    ELSE
        RAISE NOTICE 'is_verified column already exists in users table';
    END IF;
END $$;

-- Add verified_at column to users table
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
        
        -- Set verified_at for already verified users
        UPDATE public.users 
        SET verified_at = created_at 
        WHERE is_verified = true AND verified_at IS NULL;
        RAISE NOTICE 'Added verified_at column to users table';
    ELSE
        RAISE NOTICE 'verified_at column already exists in users table';
    END IF;
END $$;

-- ==============================================================================
-- PART 3: CREATE MISSING FUNCTIONS
-- ==============================================================================

-- Function to check if a class can be deleted (not in use by students)
CREATE OR REPLACE FUNCTION public.can_delete_class(class_value TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    student_count INTEGER;
BEGIN
    -- Check if any students are using this class
    SELECT COUNT(*) INTO student_count
    FROM public.students
    WHERE class_level = class_value;
    
    -- Return true if no students are using this class
    RETURN student_count = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.can_delete_class(TEXT) IS 'Checks if a class can be safely deleted (returns true if no students are using it)';

-- Drop existing get_student_class function if it exists (to handle return type changes)
DROP FUNCTION IF EXISTS public.get_student_class(UUID);

-- Function to get student's class information
CREATE OR REPLACE FUNCTION public.get_student_class(student_id UUID)
RETURNS TABLE (
    class_id UUID,
    class_name TEXT,
    class_value TEXT,
    academic_year TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.name,
        c.value,
        c.academic_year
    FROM public.students s
    LEFT JOIN public.classes c ON s.class_id = c.id
    WHERE s.id = student_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_student_class(UUID) IS 'Returns class information for a given student';

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

-- ==============================================================================
-- PART 4: CREATE TRIGGERS
-- ==============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::TEXT, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for classes table
DROP TRIGGER IF EXISTS update_classes_updated_at ON public.classes;
CREATE TRIGGER update_classes_updated_at
    BEFORE UPDATE ON public.classes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ==============================================================================
-- PART 5: GRANT PERMISSIONS
-- ==============================================================================

-- Grant execute permissions on new functions
GRANT EXECUTE ON FUNCTION public.can_delete_class(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_student_class(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.unverify_user(UUID) TO authenticated;

-- ==============================================================================
-- PART 6: UPDATE RLS POLICIES FOR VERIFICATION
-- ==============================================================================

-- Update the handle_new_user function to set is_verified based on role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role user_role;
BEGIN
    -- Get the role from metadata, default to 'student'
    user_role := COALESCE((new.raw_user_meta_data->>'role')::user_role, 'student');
    
    INSERT INTO public.users (id, email, full_name, role, is_verified)
    VALUES (
        new.id,
        new.email,
        new.raw_user_meta_data->>'full_name',
        user_role,
        -- Auto-verify admins, others need manual verification
        CASE WHEN user_role = 'admin' THEN true ELSE false END
    );
    RETURN new;
EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail the auth signup
    RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- VERIFICATION QUERIES
-- ==============================================================================

-- Check classes table structure
DO $$
DECLARE
    rec RECORD;
BEGIN
    RAISE NOTICE '=== CLASSES TABLE COLUMNS ===';
    FOR rec IN 
        SELECT column_name, data_type, is_nullable, column_default 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'classes'
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE 'Column: %, Type: %, Nullable: %, Default: %', 
            rec.column_name, rec.data_type, rec.is_nullable, rec.column_default;
    END LOOP;
END $$;

-- Check users table structure
DO $$
DECLARE
    rec RECORD;
BEGIN
    RAISE NOTICE '=== USERS TABLE COLUMNS ===';
    FOR rec IN 
        SELECT column_name, data_type, is_nullable, column_default 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'users'
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE 'Column: %, Type: %, Nullable: %, Default: %', 
            rec.column_name, rec.data_type, rec.is_nullable, rec.column_default;
    END LOOP;
END $$;

-- Check functions
DO $$
DECLARE
    rec RECORD;
BEGIN
    RAISE NOTICE '=== CREATED FUNCTIONS ===';
    FOR rec IN 
        SELECT routine_name, routine_type 
        FROM information_schema.routines 
        WHERE routine_schema = 'public' 
        AND routine_name IN ('can_delete_class', 'get_student_class', 'verify_user', 'unverify_user')
    LOOP
        RAISE NOTICE 'Function: %, Type: %', rec.routine_name, rec.routine_type;
    END LOOP;
END $$;

-- ==============================================================================
-- END OF SCRIPT
-- ==============================================================================

-- Summary of changes:
-- ✓ Added is_active, value, display_order, updated_at columns to classes table
-- ✓ Added is_verified, verified_at columns to users table
-- ✓ Created can_delete_class function
-- ✓ Created get_student_class function
-- ✓ Created verify_user function
-- ✓ Created unverify_user function
-- ✓ Created trigger for updated_at on classes table
-- ✓ Updated handle_new_user to handle verification
-- ✓ Granted necessary permissions

DO $$
BEGIN
    RAISE NOTICE '=== MIGRATION COMPLETED SUCCESSFULLY ===';
END $$;
