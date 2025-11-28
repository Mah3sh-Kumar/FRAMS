-- CHECK_USER_PROFILES.sql
-- Run this in Supabase SQL Editor to check the current state of user profiles

-- 1. Check all users in the users table
SELECT 
    id,
    email,
    full_name,
    role,
    created_at
FROM public.users
ORDER BY created_at DESC;

-- 2. Check which users have student profiles
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.role,
    s.enrollment_number,
    s.class_id,
    s.class_level,
    s.branch
FROM public.users u
LEFT JOIN public.students s ON u.id = s.id
WHERE u.role = 'student'
ORDER BY u.created_at DESC;

-- 3. Check which users have teacher profiles
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.role,
    t.department
FROM public.users u
LEFT JOIN public.teachers t ON u.id = t.id
WHERE u.role = 'teacher'
ORDER BY u.created_at DESC;

-- 4. Find users with role='student' but NO student profile
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.role
FROM public.users u
LEFT JOIN public.students s ON u.id = s.id
WHERE u.role = 'student' AND s.id IS NULL;

-- 5. Find users with role='teacher' but NO teacher profile
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.role
FROM public.users u
LEFT JOIN public.teachers t ON u.id = t.id
WHERE u.role = 'teacher' AND t.id IS NULL;
