# Fixing User Profiles Issue

## Problem
Users who signed up are in the `users` table, but their role-specific profiles (in `students` or `teachers` tables) were not created. This causes everyone to go to the Student dashboard regardless of their actual role.

## Root Cause
The signup flow in `AuthContext.tsx` creates:
1. ✅ Auth user (via `supabase.auth.signUp`)
2. ✅ User profile in `users` table (via database trigger)
3. ❌ Role-specific profile in `students`/`teachers` table (this step may have failed)

## Quick Fix Steps

### Step 1: Check Current State
Run `CHECK_USER_PROFILES.sql` in Supabase SQL Editor to see which users are missing profiles:

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Open `CHECK_USER_PROFILES.sql` from your project
4. Run each query to see:
   - All users in the system
   - Users with role='student' but no student profile
   - Users with role='teacher' but no teacher profile

### Step 2: Fix Missing Profiles
Run `FIX_USER_PROFILES.sql` in Supabase SQL Editor:

1. Open `FIX_USER_PROFILES.sql` in SQL Editor
2. Run the script
3. This will create missing profiles with placeholder data:
   - Students: `enrollment_number` = `TEMP-{user_id}`
   - Teachers: `department` = `Not Specified`

### Step 3: Update Placeholder Data (Optional)
After running the fix script, you may want to update the placeholder data:

```sql
-- Update student enrollment number
UPDATE public.students
SET enrollment_number = '2024001'  -- Replace with actual enrollment number
WHERE id = 'user-id-here';

-- Update teacher department
UPDATE public.teachers
SET department = 'Computer Science'  -- Replace with actual department
WHERE id = 'user-id-here';
```

### Step 4: Test
1. Log out from the app
2. Log in with your teacher account
3. Verify you see the **Teacher Dashboard**
4. Log out and log in with a student account
5. Verify you see the **Student Dashboard**

## Long-term Fix
The signup flow should work correctly for new users. The issue you experienced was with existing users who signed up before the role-specific profile creation was properly implemented.

## Files Created
- `CHECK_USER_PROFILES.sql` - Diagnose which profiles are missing
- `FIX_USER_PROFILES.sql` - Create missing profiles with placeholders

## Need Help?
If issues persist:
1. Check Supabase logs for errors during profile creation
2. Verify RLS policies allow profile creation
3. Check that the triggers are active in your database
