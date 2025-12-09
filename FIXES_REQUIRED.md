# Database Fixes Required

## Issues Identified

Based on the errors you reported, the following issues were found:

### 1. Missing Database Columns
- **classes.is_active** - Column does not exist (causing "column classes.is_active does not exist" error)
- **classes.value** - Missing internal identifier column
- **classes.display_order** - Missing ordering column
- **classes.updated_at** - Missing timestamp column
- **users.is_verified** - Missing verification status column
- **users.verified_at** - Missing verification timestamp column

### 2. Missing Database Functions
- **can_delete_class()** - Function to check if a class can be safely deleted
- **get_student_class()** - Function to retrieve student's class information
- **verify_user()** - Function for admins to verify user accounts
- **unverify_user()** - Function for admins to unverify user accounts

### 3. Dashboard Display Issues
- Dashboard shows "Total Users" but doesn't break down by role
- Unverified teacher accounts not visible in admin dashboard
- Stats not properly synced with database

## Solution

I've created a comprehensive migration script that fixes all these issues:

### File: `backend/complete_fix_migration.sql`

This script will:
1. ✅ Add all missing columns to the `classes` table
2. ✅ Add all missing columns to the `users` table
3. ✅ Create all missing database functions
4. ✅ Set up proper triggers for automatic timestamp updates
5. ✅ Grant necessary permissions
6. ✅ Auto-verify existing admin users
7. ✅ Update the user signup trigger to handle verification

## How to Apply the Fix

### Step 1: Run the Migration Script

1. Open your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Open the file `backend/complete_fix_migration.sql`
4. Copy the entire contents
5. Paste into the SQL Editor
6. Click **Run** to execute

The script includes verification queries that will show you the results in the output.

### Step 2: Verify the Changes

After running the script, you should see output showing:
- All columns added to the classes table
- All columns added to the users table
- All functions created successfully

### Step 3: Test the Application

1. **Test Organization Manager:**
   - Navigate to Admin Dashboard → Organization Manager
   - Try viewing classes (should no longer show "is_active" error)
   - Try creating a new class
   - Try deleting a class (should check if it's in use)

2. **Test User Management:**
   - Navigate to Admin Dashboard → User Management
   - You should now see unverified users
   - Try verifying a teacher account
   - Check that the verified status updates correctly

3. **Test Dashboard Stats:**
   - Go to Admin Dashboard
   - Verify that stats show:
     - Total Users
     - Students count
     - Teachers count
     - Pending Verification count

## What Each Fix Does

### Classes Table Fixes
```sql
-- is_active: Allows soft-deletion of classes
-- value: Internal identifier (e.g., "class_10_a")
-- display_order: Controls sort order in UI
-- updated_at: Tracks last modification time
```

### Users Table Fixes
```sql
-- is_verified: Boolean flag for admin verification
-- verified_at: Timestamp when admin verified the account
```

### Function Fixes
```sql
-- can_delete_class(class_value): Returns true if no students use the class
-- get_student_class(student_id): Returns class info for a student
-- verify_user(user_id): Admin function to verify accounts
-- unverify_user(user_id): Admin function to unverify accounts
```

## Expected Behavior After Fix

### Organization Manager
- ✅ Classes load without errors
- ✅ Can create, edit, and delete classes
- ✅ Deletion checks if class is in use
- ✅ Active/inactive status works

### User Management
- ✅ All users visible (including unverified)
- ✅ Can verify/unverify teacher and student accounts
- ✅ Admin accounts auto-verified
- ✅ Verification status displayed correctly

### Admin Dashboard
- ✅ Shows total users count
- ✅ Shows students count separately
- ✅ Shows teachers count separately
- ✅ Shows pending verification count
- ✅ All stats sync with database

## Troubleshooting

If you still see errors after running the migration:

1. **Check if the script ran completely:**
   - Look for "MIGRATION COMPLETED SUCCESSFULLY" in the output
   - Check for any error messages in red

2. **Verify columns exist:**
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'classes' AND table_schema = 'public';
   ```

3. **Verify functions exist:**
   ```sql
   SELECT routine_name FROM information_schema.routines 
   WHERE routine_schema = 'public' 
   AND routine_name IN ('can_delete_class', 'verify_user');
   ```

4. **Check for permission issues:**
   - Make sure you're running the script as a database admin
   - Check that RLS policies allow the operations

## Additional Notes

- The migration is **idempotent** - you can run it multiple times safely
- Existing data will be preserved
- Admin users are automatically verified
- New users will require admin verification (except admins)
- The script includes detailed logging to help debug any issues

## Need Help?

If you encounter any issues:
1. Check the Supabase logs for detailed error messages
2. Verify your database permissions
3. Make sure you're using the latest version of the schema
4. Check that no other migrations are conflicting
