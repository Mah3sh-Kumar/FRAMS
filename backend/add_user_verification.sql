-- ==============================================================================
-- ADD USER VERIFICATION SYSTEM
-- ==============================================================================
-- This script adds user verification functionality where admins must verify
-- users before they can access the system
-- ==============================================================================

-- Add is_verified column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- Add verified_at and verified_by columns for audit trail
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES public.users(id);

COMMENT ON COLUMN public.users.is_verified IS 'Whether the user has been verified by an admin';
COMMENT ON COLUMN public.users.verified_at IS 'Timestamp when user was verified';
COMMENT ON COLUMN public.users.verified_by IS 'Admin who verified the user';

-- Update existing users to be verified (for backward compatibility)
UPDATE public.users SET is_verified = true WHERE role = 'admin';

-- Function to verify a user (admin only)
CREATE OR REPLACE FUNCTION public.verify_user(target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if current user is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can verify users';
  END IF;

  -- Update the user
  UPDATE public.users
  SET 
    is_verified = true,
    verified_at = NOW(),
    verified_by = auth.uid()
  WHERE id = target_user_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.verify_user(UUID) IS 'Allows admins to verify a user account';

-- Function to unverify a user (admin only)
CREATE OR REPLACE FUNCTION public.unverify_user(target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if current user is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can unverify users';
  END IF;

  -- Prevent unverifying admins
  IF (SELECT role FROM public.users WHERE id = target_user_id) = 'admin' THEN
    RAISE EXCEPTION 'Cannot unverify admin users';
  END IF;

  -- Update the user
  UPDATE public.users
  SET 
    is_verified = false,
    verified_at = NULL,
    verified_by = NULL
  WHERE id = target_user_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.unverify_user(UUID) IS 'Allows admins to unverify a user account';

-- Update RLS policies to check verification status
-- Users must be verified to access most features

-- Update students table policy to require verification
DROP POLICY IF EXISTS "Students can view own profile" ON public.students;
CREATE POLICY "Students can view own profile" ON public.students
  FOR SELECT
  USING (
    auth.uid() = id 
    AND (SELECT is_verified FROM public.users WHERE id = auth.uid())
  );

-- Update teachers table policy to require verification
DROP POLICY IF EXISTS "Teachers can view own profile" ON public.teachers;
CREATE POLICY "Teachers can view own profile" ON public.teachers
  FOR SELECT
  USING (
    auth.uid() = id 
    AND (SELECT is_verified FROM public.users WHERE id = auth.uid())
  );

-- Update attendance policies to require verification
DROP POLICY IF EXISTS "Students view own attendance" ON public.attendance;
CREATE POLICY "Students view own attendance" ON public.attendance
  FOR SELECT
  USING (
    auth.uid() = student_id 
    AND (SELECT is_verified FROM public.users WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Teachers can mark attendance" ON public.attendance;
CREATE POLICY "Teachers can mark attendance" ON public.attendance
  FOR INSERT
  WITH CHECK (
    is_teacher() 
    AND (SELECT is_verified FROM public.users WHERE id = auth.uid())
  );

-- Update assignments policies to require verification
DROP POLICY IF EXISTS "Students view assignments" ON public.assignments;
CREATE POLICY "Students view assignments" ON public.assignments
  FOR SELECT
  USING ((SELECT is_verified FROM public.users WHERE id = auth.uid()) = true);

DROP POLICY IF EXISTS "Teachers create assignments" ON public.assignments;
CREATE POLICY "Teachers create assignments" ON public.assignments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.subjects
      WHERE id = assignments.subject_id
      AND teacher_id = auth.uid()
    )
    AND (SELECT is_verified FROM public.users WHERE id = auth.uid())
  );

-- Update student_assignments policies to require verification
DROP POLICY IF EXISTS "Students can submit assignments" ON public.student_assignments;
CREATE POLICY "Students can submit assignments" ON public.student_assignments
  FOR INSERT
  WITH CHECK (
    auth.uid() = student_id 
    AND (SELECT is_verified FROM public.users WHERE id = auth.uid())
  );

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.verify_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.unverify_user(UUID) TO authenticated;

-- ==============================================================================
-- END OF SCRIPT
-- ==============================================================================
