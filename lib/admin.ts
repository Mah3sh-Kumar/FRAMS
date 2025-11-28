import { supabase } from './supabase';

/**
 * Admin-only function to reset a user's password
 * @param userId - The UUID of the user whose password should be reset
 * @param newPassword - The new password to set
 * @returns Success status and message or error
 */
export async function resetUserPassword(
  userId: string,
  newPassword: string
): Promise<{ data: any; error: string | null }> {
  try {
    const { data, error } = await supabase.rpc('reset_user_password', {
      target_user_id: userId,
      new_password: newPassword
    });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

/**
 * Get all users with verification status (admin only)
 * Used for user management in admin dashboard
 */
export async function getAllUsers(): Promise<{ data: any[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        full_name,
        role,
        is_verified,
        verified_at,
        created_at
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

/**
 * Verify a user account (admin only)
 * @param userId - The UUID of the user to verify
 * @returns Success status or error
 */
export async function verifyUser(userId: string): Promise<{ data: any; error: string | null }> {
  try {
    const { data, error } = await supabase.rpc('verify_user', {
      target_user_id: userId
    });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

/**
 * Unverify a user account (admin only)
 * @param userId - The UUID of the user to unverify
 * @returns Success status or error
 */
export async function unverifyUser(userId: string): Promise<{ data: any; error: string | null }> {
  try {
    const { data, error } = await supabase.rpc('unverify_user', {
      target_user_id: userId
    });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

/**
 * Update user role (admin only)
 * @param userId - The UUID of the user
 * @param newRole - The new role to assign
 * @returns Success status or error
 */
export async function updateUserRole(
  userId: string,
  newRole: 'admin' | 'teacher' | 'student'
): Promise<{ data: any; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

/**
 * Delete a user and all related data (admin only)
 * @param userId - The UUID of the user to delete
 * @returns Success status or error
 */
export async function deleteUser(userId: string): Promise<{ error: string | null }> {
  try {
    // First delete role-specific data
    await supabase.from('students').delete().eq('id', userId);
    await supabase.from('teachers').delete().eq('id', userId);
    
    // Then delete user profile
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (err: any) {
    return { error: err.message };
  }
}
