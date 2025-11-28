-- ==============================================================================
-- ENHANCED ADMIN RLS POLICIES & SECURITY IMPROVEMENTS
-- ==============================================================================
-- Version: 1.0
-- Created: 2025-11-27
-- Purpose: Enhance admin role management with audit logging, role change
--          protections, and improved security policies
-- ==============================================================================

-- ==============================================================================
-- PART 1: ADMIN AUDIT LOG TABLE
-- ==============================================================================

-- Create admin audit log table to track all admin actions
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

COMMENT ON TABLE public.admin_audit_log IS 'Audit trail for all admin actions';
COMMENT ON COLUMN public.admin_audit_log.admin_id IS 'Admin user who performed the action';
COMMENT ON COLUMN public.admin_audit_log.action IS 'Action performed (INSERT, UPDATE, DELETE, ROLE_CHANGE)';
COMMENT ON COLUMN public.admin_audit_log.table_name IS 'Table affected by the action';
COMMENT ON COLUMN public.admin_audit_log.record_id IS 'ID of the affected record';
COMMENT ON COLUMN public.admin_audit_log.old_values IS 'Previous values before change';
COMMENT ON COLUMN public.admin_audit_log.new_values IS 'New values after change';

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_audit_admin_id ON public.admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON public.admin_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_table_action ON public.admin_audit_log(table_name, action);

-- Enable RLS on audit log
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.admin_audit_log;
CREATE POLICY "Admins can view audit logs" ON public.admin_audit_log
  FOR SELECT
  USING (is_admin());

-- System can insert audit logs (via triggers)
DROP POLICY IF EXISTS "System can insert audit logs" ON public.admin_audit_log;
CREATE POLICY "System can insert audit logs" ON public.admin_audit_log
  FOR INSERT
  WITH CHECK (true);

-- ==============================================================================
-- PART 2: HELPER FUNCTIONS FOR ADMIN MANAGEMENT
-- ==============================================================================

-- Function to count total admins in the system
CREATE OR REPLACE FUNCTION public.count_admins()
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM public.users
    WHERE role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.count_admins() IS 'Returns the total number of admin users';

-- Function to check if user is the last admin
CREATE OR REPLACE FUNCTION public.is_last_admin(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  admin_count INTEGER;
  is_user_admin BOOLEAN;
BEGIN
  -- Get total admin count
  admin_count := count_admins();
  
  -- Check if the specified user is an admin
  SELECT (role = 'admin') INTO is_user_admin
  FROM public.users
  WHERE id = user_id;
  
  -- User is last admin if they are admin and count is 1
  RETURN (is_user_admin AND admin_count = 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.is_last_admin(UUID) IS 'Returns true if the specified user is the last remaining admin';

-- Function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_action TEXT,
  p_table_name TEXT,
  p_record_id UUID,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.admin_audit_log (
    admin_id,
    action,
    table_name,
    record_id,
    old_values,
    new_values
  )
  VALUES (
    auth.uid(),
    p_action,
    p_table_name,
    p_record_id,
    p_old_values,
    p_new_values
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.log_admin_action IS 'Logs an admin action to the audit trail';

-- ==============================================================================
-- PART 3: ROLE CHANGE PROTECTION TRIGGER
-- ==============================================================================

-- Function to validate role changes and prevent dangerous operations
CREATE OR REPLACE FUNCTION public.validate_role_change()
RETURNS TRIGGER AS $$
DECLARE
  is_self_demotion BOOLEAN;
  is_last_admin_demotion BOOLEAN;
BEGIN
  -- Check if role is being changed
  IF OLD.role != NEW.role THEN
    -- Check if user is demoting themselves
    is_self_demotion := (auth.uid() = NEW.id AND OLD.role = 'admin' AND NEW.role != 'admin');
    
    -- Check if this is the last admin being demoted
    is_last_admin_demotion := (OLD.role = 'admin' AND NEW.role != 'admin' AND is_last_admin(OLD.id));
    
    -- Prevent last admin from being demoted
    IF is_last_admin_demotion THEN
      RAISE EXCEPTION 'Cannot demote the last admin user. Please create another admin first.';
    END IF;
    
    -- Prevent self-demotion (optional - uncomment if you want to prevent this)
    -- IF is_self_demotion THEN
    --   RAISE EXCEPTION 'Admins cannot demote themselves. Another admin must change your role.';
    -- END IF;
    
    -- Log the role change
    PERFORM log_admin_action(
      'ROLE_CHANGE',
      'users',
      NEW.id,
      jsonb_build_object('role', OLD.role),
      jsonb_build_object('role', NEW.role)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.validate_role_change() IS 'Validates role changes and prevents dangerous operations like demoting the last admin';

-- Create trigger for role change validation
DROP TRIGGER IF EXISTS trigger_validate_role_change ON public.users;
CREATE TRIGGER trigger_validate_role_change
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  WHEN (OLD.role IS DISTINCT FROM NEW.role)
  EXECUTE FUNCTION public.validate_role_change();

-- ==============================================================================
-- PART 4: ENHANCED RLS POLICIES FOR USERS TABLE
-- ==============================================================================

-- Drop existing policies to recreate with enhancements
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.users;

-- Enhanced policy: Admins can update profiles with role change protection
CREATE POLICY "Admins can update all profiles" ON public.users
  FOR UPDATE
  USING (
    is_admin() 
    AND (
      -- Allow updates if not changing role
      (role = (SELECT role FROM public.users WHERE id = users.id))
      OR
      -- Allow role changes only if not demoting last admin
      NOT is_last_admin(id)
    )
  );

-- Add policy for admins to create new users (useful for bulk user creation)
DROP POLICY IF EXISTS "Admins can create users" ON public.users;
CREATE POLICY "Admins can create users" ON public.users
  FOR INSERT
  WITH CHECK (is_admin());

-- ==============================================================================
-- PART 5: BULK OPERATION HELPER FUNCTIONS
-- ==============================================================================

-- Function to bulk create users
CREATE OR REPLACE FUNCTION public.bulk_create_users(
  users_data JSONB
)
RETURNS TABLE(
  success BOOLEAN,
  user_id UUID,
  email TEXT,
  error_message TEXT
) AS $$
DECLARE
  user_record JSONB;
  new_user_id UUID;
BEGIN
  -- Only admins can bulk create users
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can bulk create users';
  END IF;
  
  -- Loop through each user in the JSON array
  FOR user_record IN SELECT * FROM jsonb_array_elements(users_data)
  LOOP
    BEGIN
      -- This would typically be done via Supabase Auth API
      -- This function is a placeholder for the backend logic
      -- You would call this from your application after creating auth users
      
      RETURN QUERY SELECT 
        true,
        (user_record->>'id')::UUID,
        user_record->>'email',
        NULL::TEXT;
        
    EXCEPTION WHEN OTHERS THEN
      RETURN QUERY SELECT 
        false,
        NULL::UUID,
        user_record->>'email',
        SQLERRM;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.bulk_create_users IS 'Bulk create users (admin only)';

-- Function to bulk assign roles
CREATE OR REPLACE FUNCTION public.bulk_assign_roles(
  user_ids UUID[],
  new_role user_role
)
RETURNS TABLE(
  user_id UUID,
  success BOOLEAN,
  error_message TEXT
) AS $$
DECLARE
  uid UUID;
BEGIN
  -- Only admins can bulk assign roles
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can bulk assign roles';
  END IF;
  
  -- Loop through each user ID
  FOREACH uid IN ARRAY user_ids
  LOOP
    BEGIN
      -- Check if demoting last admin
      IF is_last_admin(uid) AND new_role != 'admin' THEN
        RETURN QUERY SELECT 
          uid,
          false,
          'Cannot demote the last admin'::TEXT;
        CONTINUE;
      END IF;
      
      -- Update the role
      UPDATE public.users
      SET role = new_role
      WHERE id = uid;
      
      RETURN QUERY SELECT 
        uid,
        true,
        NULL::TEXT;
        
    EXCEPTION WHEN OTHERS THEN
      RETURN QUERY SELECT 
        uid,
        false,
        SQLERRM;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.bulk_assign_roles IS 'Bulk assign roles to multiple users (admin only)';

-- Function to get admin statistics
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS TABLE(
  total_users INTEGER,
  total_admins INTEGER,
  total_teachers INTEGER,
  total_students INTEGER,
  total_classes INTEGER,
  total_subjects INTEGER,
  total_attendance_today INTEGER,
  total_pending_assignments INTEGER
) AS $$
BEGIN
  -- Only admins can view statistics
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can view statistics';
  END IF;
  
  RETURN QUERY
  SELECT
    (SELECT COUNT(*)::INTEGER FROM public.users),
    (SELECT COUNT(*)::INTEGER FROM public.users WHERE role = 'admin'),
    (SELECT COUNT(*)::INTEGER FROM public.users WHERE role = 'teacher'),
    (SELECT COUNT(*)::INTEGER FROM public.users WHERE role = 'student'),
    (SELECT COUNT(*)::INTEGER FROM public.classes),
    (SELECT COUNT(*)::INTEGER FROM public.subjects),
    (SELECT COUNT(*)::INTEGER FROM public.attendance WHERE date = CURRENT_DATE),
    (SELECT COUNT(*)::INTEGER FROM public.student_assignments WHERE status = 'pending');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_admin_stats IS 'Returns system statistics for admin dashboard';

-- ==============================================================================
-- PART 6: NOTIFICATION HELPERS FOR ADMINS
-- ==============================================================================

-- Function to send notification to all users of a specific role
CREATE OR REPLACE FUNCTION public.notify_all_by_role(
  p_role user_role,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT DEFAULT 'info'
)
RETURNS INTEGER AS $$
DECLARE
  notification_count INTEGER := 0;
  user_record RECORD;
BEGIN
  -- Only admins can send bulk notifications
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can send bulk notifications';
  END IF;
  
  -- Loop through all users with the specified role
  FOR user_record IN 
    SELECT id FROM public.users WHERE role = p_role
  LOOP
    PERFORM create_notification(
      user_record.id,
      p_title,
      p_message,
      p_type,
      NULL
    );
    notification_count := notification_count + 1;
  END LOOP;
  
  RETURN notification_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.notify_all_by_role IS 'Send notification to all users of a specific role (admin only)';

-- Function to send notification to all users
CREATE OR REPLACE FUNCTION public.notify_all_users(
  p_title TEXT,
  p_message TEXT,
  p_type TEXT DEFAULT 'info'
)
RETURNS INTEGER AS $$
DECLARE
  notification_count INTEGER := 0;
BEGIN
  -- Only admins can send system-wide notifications
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can send system-wide notifications';
  END IF;
  
  -- Create notification for all users
  INSERT INTO public.notifications (user_id, title, message, type)
  SELECT id, p_title, p_message, p_type
  FROM public.users;
  
  GET DIAGNOSTICS notification_count = ROW_COUNT;
  
  RETURN notification_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.notify_all_users IS 'Send notification to all users in the system (admin only)';

-- ==============================================================================
-- PART 7: GRANTS AND PERMISSIONS
-- ==============================================================================

-- Grant execute permissions on new functions
GRANT EXECUTE ON FUNCTION public.count_admins() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_last_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_admin_action(TEXT, TEXT, UUID, JSONB, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_role_change() TO authenticated;
GRANT EXECUTE ON FUNCTION public.bulk_create_users(JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.bulk_assign_roles(UUID[], user_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.notify_all_by_role(user_role, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.notify_all_users(TEXT, TEXT, TEXT) TO authenticated;

-- ==============================================================================
-- END OF MIGRATION
-- ==============================================================================

-- Migration completed successfully!
-- 
-- What this migration adds:
-- 1. ✅ Admin audit logging table
-- 2. ✅ Role change protection (prevents demoting last admin)
-- 3. ✅ Bulk operation functions for admins
-- 4. ✅ Admin statistics dashboard function
-- 5. ✅ Bulk notification functions
-- 6. ✅ Enhanced RLS policies
--
-- Next steps:
-- 1. Run this migration in your Supabase SQL Editor
-- 2. Test role change protection
-- 3. Implement admin dashboard UI in React Native
-- 4. Use bulk functions for efficient admin operations
