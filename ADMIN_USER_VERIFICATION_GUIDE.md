# Admin User Verification System - Setup Guide

## Overview

The FRAMS app now includes a user verification system where admins must verify new users before they can access the system. This adds an extra layer of security and control.

## Setup Instructions

### 1. Run the Database Migration

1. Open your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Open the file `backend/add_user_verification.sql`
4. Copy and paste the entire contents into the SQL Editor
5. Click **Run** to execute the migration

This will:
- Add `is_verified`, `verified_at`, and `verified_by` columns to the users table
- Create `verify_user()` and `unverify_user()` functions
- Update RLS policies to require verification for most operations
- Set all existing users (especially admins) as verified

### 2. How It Works

#### For New Users:
1. When a user signs up or is created by an admin, they are **NOT verified** by default
2. They can log in but will have limited access to features
3. An admin must verify them before they can fully use the app

#### For Admins:
1. Admins can see all users in the **User Management** screen
2. Unverified users are marked with an orange "Pending" badge and a warning icon (!)
3. Admins can click the green checkmark icon to verify a user
4. Admins can also unverify users (except other admins) if needed

### 3. User Management Features

The updated User Management screen now includes:

#### Verification Controls:
- **Verify User**: Click the green checkmark icon to verify a pending user
- **Unverify User**: Click the orange X icon to revoke verification (for non-admins)
- **Verification Filter**: Filter users by verification status (All/Verified/Unverified)

#### User Editing (Fixed):
- Edit user's full name
- **Change user role** (Student/Teacher/Admin)
- Update role-specific information:
  - **Teachers**: Department
  - **Students**: Enrollment number, class level, branch
- Role changes now properly handle data migration

#### User Creation:
- Create new users with email and password
- Assign role (Student/Teacher)
- Set role-specific information
- New users are created as **unverified** by default

#### User Deletion:
- Delete users (except admins)
- Automatically cleans up role-specific data
- Cannot be undone

#### Statistics Dashboard:
- Total users count
- Count by role (Admins/Teachers/Students)
- **Unverified users count** (new)

#### Export:
- Export all users to CSV
- Includes verification status

### 4. Verification Workflow

```
New User Signs Up
       ↓
User Created (is_verified = false)
       ↓
User Can Log In
       ↓
Limited Access (Cannot view most features)
       ↓
Admin Reviews User in User Management
       ↓
Admin Clicks "Verify" Button
       ↓
User is Verified (is_verified = true)
       ↓
User Has Full Access to Features
```

### 5. What Users Can/Cannot Do When Unverified

#### Unverified Users CAN:
- Log in to the app
- View their own profile
- See the dashboard (but with limited data)

#### Unverified Users CANNOT:
- View attendance records
- View or submit assignments
- Access role-specific features (teacher/student screens)
- Mark attendance (teachers)
- Create assignments (teachers)

### 6. Admin Best Practices

1. **Review New Users Promptly**: Check the User Management screen regularly for unverified users
2. **Verify Legitimate Users**: Verify users after confirming their identity and role
3. **Use Unverify for Suspension**: If you need to temporarily suspend a user, unverify them
4. **Check User Details**: Before verifying, ensure the user has correct role and information
5. **Monitor Unverified Count**: Keep an eye on the "Unverified" stat card

### 7. Troubleshooting

#### Issue: Existing users cannot access features after migration
**Solution**: Run this SQL command to verify all existing users:
```sql
UPDATE public.users SET is_verified = true WHERE created_at < NOW();
```

#### Issue: Admin cannot verify users
**Solution**: Ensure the admin user has `is_verified = true` and `role = 'admin'`

#### Issue: Verification button doesn't work
**Solution**: Check browser console for errors. Ensure the SQL functions were created successfully.

#### Issue: New users don't appear in the list
**Solution**: Refresh the User Management screen. Check if the user was created in Supabase Auth.

### 8. Database Functions Reference

#### `verify_user(target_user_id UUID)`
- Marks a user as verified
- Records who verified them and when
- Only callable by admins

#### `unverify_user(target_user_id UUID)`
- Marks a user as unverified
- Cannot unverify admin users
- Only callable by admins

### 9. Security Notes

- Admins are automatically verified and cannot be unverified
- Verification status is enforced at the database level via RLS policies
- Even if someone bypasses the UI, unverified users cannot access protected data
- All verification actions are logged (verified_by and verified_at fields)

### 10. Future Enhancements

Consider adding:
- Email notifications when users are verified
- Bulk verification for multiple users
- Verification request notifications for admins
- Automatic verification based on email domain
- Verification expiry (re-verification after X days)

## Summary

The user verification system adds an important security layer to FRAMS. Admins now have full control over who can access the system, and can easily manage user verification status through the improved User Management interface.

All existing bugs in user editing have been fixed, including:
- ✅ Role changes now work correctly
- ✅ Role-specific data is properly migrated
- ✅ Validation prevents incomplete data
- ✅ Better error handling and user feedback
- ✅ Verification status tracking
- ✅ Improved UI with badges and filters

