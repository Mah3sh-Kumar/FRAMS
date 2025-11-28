-- Function to reset user password (admin only)
-- This allows admins to reset passwords without email verification
CREATE OR REPLACE FUNCTION reset_user_password(
  target_user_id UUID,
  new_password TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_role TEXT;
BEGIN
  -- Check if current user is admin
  SELECT role INTO current_user_role
  FROM public.users
  WHERE id = auth.uid();
  
  IF current_user_role != 'admin' THEN
    RAISE EXCEPTION 'Only admins can reset passwords';
  END IF;
  
  -- Update password in auth.users
  UPDATE auth.users
  SET 
    encrypted_password = crypt(new_password, gen_salt('bf')),
    updated_at = NOW()
  WHERE id = target_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Password reset successfully'
  );
END;
$$;

-- Grant execute permission to authenticated users (function will check role internally)
GRANT EXECUTE ON FUNCTION reset_user_password(UUID, TEXT) TO authenticated;
