# Creating the First Admin Account

## Overview

Admin accounts cannot be created through the sign-up screen. The first admin must be created directly via database, after which admins can create additional admin accounts through the User Management interface.

## Method 1: Direct Database Insert (Recommended for First Admin)

### Step 1: Create User in Supabase Auth

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Users**
3. Click **Add User** → **Create new user**
4. Fill in:
   - Email: <admin@example.com>
   - Password: (secure password)
   - Email Confirm: ✅ Auto Confirm User
5. Click **Create User**
6. **Copy the User ID** (UUID) - you'll need this

### Step 2: Update User Role in Database

Run this SQL in **SQL Editor**:

```sql
-- Replace {USER_ID_HERE} with the UUID from step 1
-- Replace 'Admin Name' with the actual name
-- Replace 'admin@example.com' with the actual email

UPDATE public.users
SET role = 'admin',
    full_name = 'Admin Name'
WHERE id = '{USER_ID_HERE}'::uuid;
```

### Step 3: Verify Admin Account

```sql
-- Check if the admin was created successfully
SELECT id, email, role, full_name
FROM public.users
WHERE role = 'admin';
```

You should see your admin account in the results.

---

## Method 2: Complete SQL Script (Alternative)

If you want to create admin + profile in one go:

```sql
-- This only works if the user doesn't exist in auth.users yet
-- You'll need to create the auth user first via Supabase Dashboard

-- After creating in Authentication section, run this:
DO $$
DECLARE
    admin_id UUID := '{PASTE_USER_ID_HERE}'::uuid;
BEGIN
    -- Update or insert user profile
    INSERT INTO public.users (id, email, role, full_name)
    VALUES (
        admin_id,
        'admin@example.com',
        'admin',
        'System Administrator'
    )
    ON CONFLICT (id) DO UPDATE
    SET role = 'admin',
        full_name = 'System Administrator';
    
    RAISE NOTICE 'Admin account created successfully!';
END $$;
```

---

## Method 3: Using Existing User (Promote to Admin)

If you already have a teacher or student account that you want to promote:

```sql
-- Find the user
SELECT id, email, role, full_name
FROM public.users
WHERE email = 'user@example.com';

-- Promote to admin
UPDATE public.users
SET role = 'admin'
WHERE email = 'user@example.com';

-- Verify
SELECT id, email, role, full_name
FROM public.users
WHERE email = 'user@example.com';
```

---

## Creating Additional Admins (Via App)

Once you have at least one admin account:

1. Sign in to the app with admin credentials
2. Navigate to **Admin Dashboard**
3. Go to **User Management**
4. Find the user you want to promote
5. Click **Edit** or **Change Role**
6. Select **Admin** role
7. Save changes

OR

1. In User Management screen
2. Click **Create New User** (if implemented)
3. Fill in details
4. Select **Admin** role
5. Create account

---

## Security Best Practices

### Strong Password Requirements

- Minimum 12 characters
- Mix of uppercase, lowercase, numbers, symbols
- Use a password manager
- Enable 2FA (if available)

### Limit Admin Accounts

- Create only necessary admin accounts
- Assign admin role only to trusted personnel
- Regular audit of admin users

### Monitor Admin Activity

```sql
-- Check all admin accounts
SELECT 
    id,
    email,
    full_name,
    created_at
FROM public.users
WHERE role = 'admin'
ORDER BY created_at DESC;

-- Check recent admin activity (if you have audit logging)
-- This would require an activity_log table
```

---

## Troubleshooting

### "User profile not found"

**Problem**: User exists in `auth.users` but not in `public.users`

**Solution**:

```sql
-- Find auth users without profiles
SELECT 
    au.id,
    au.email
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- Create missing profile
INSERT INTO public.users (id, email, role, full_name)
VALUES (
    '{USER_ID}'::uuid,
    'email@example.com',
    'admin',
    'Full Name'
);
```

### "Email already exists"

**Problem**: Trying to create duplicate email

**Solution**: Check if user already exists and update role instead:

```sql
-- Check existing user
SELECT * FROM public.users WHERE email = 'email@example.com';

-- Update existing user to admin
UPDATE public.users 
SET role = 'admin'
WHERE email = 'email@example.com';
```

### "Permission denied"

**Problem**: RLS policy blocking operation

**Solution**: Make sure you're running SQL as a Supabase admin (via SQL Editor), not as an authenticated user through the app.

---

## Verification Checklist

After creating an admin account, verify:

- [ ] User exists in Authentication → Users
- [ ] User profile exists in `public.users` table
- [ ] Role is set to 'admin'
- [ ] Can sign in to the app
- [ ] Redirected to Admin Dashboard
- [ ] Can access User Management
- [ ] Can access Reports
- [ ] All admin features work correctly

---

## Quick Reference

### Check All Admins

```sql
SELECT email, full_name, created_at 
FROM public.users 
WHERE role = 'admin';
```

### Count Users by Role

```sql
SELECT role, COUNT(*) as count
FROM public.users
GROUP BY role;
```

### Recent Users

```sql
SELECT email, role, full_name, created_at
FROM public.users
ORDER BY created_at DESC
LIMIT 10;
```

---

## Need Help?

If you encounter issues:

1. Check Supabase logs for errors
2. Verify RLS policies are correct
3. Ensure trigger `on_auth_user_created` is enabled
4. Check database migrations have run
5. Review authentication setup

---

**Important**: Keep admin credentials secure and never commit them to version control!
