-- ==============================================================================
-- FIX MISSING COLUMNS AND FUNCTIONS
-- ==============================================================================
-- This script adds missing columns and functions to the database
-- Run this in your Supabase SQL Editor
-- ==============================================================================

-- ==============================================================================
-- PART 1: ADD MISSING COLUMNS
-- ==============================================================================

-- Add is_active column to classes table if it doesn't exist
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
    END IF;
END $$;

-- Add value column to classes table if it doesn't exist (for internal identifiers)
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
    END IF;
END $$;

-- Add display_order column to classes table if it doesn't exist
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
    END IF;
END $$;

-- Add updated_at column to classes table if it doesn't exist
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
    END IF;
END $$;

-- Add is_verified column to users table if it doesn't exist
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
    END IF;
END $$;

-- ==============================================================================
-- PART 2: CREATE MISSING FUNCTIONS
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

-- ==============================================================================
-- PART 3: CREATE TRIGGER FOR UPDATED_AT
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
-- PART 4: GRANT PERMISSIONS
-- ==============================================================================

-- Grant execute permissions on new functions
GRANT EXECUTE ON FUNCTION public.can_delete_class(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_student_class(UUID) TO authenticated;

-- ==============================================================================
-- VERIFICATION QUERIES
-- ==============================================================================

-- Uncomment these to verify the changes:
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_schema = 'public' AND table_name = 'classes'
-- ORDER BY ordinal_position;

-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_schema = 'public' AND table_name = 'users'
-- ORDER BY ordinal_position;

-- SELECT routine_name, routine_type 
-- FROM information_schema.routines 
-- WHERE routine_schema = 'public' 
-- AND routine_name IN ('can_delete_class', 'get_student_class');

-- ==============================================================================
-- END OF SCRIPT
-- ==============================================================================
