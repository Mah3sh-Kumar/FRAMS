-- verify_roles.sql
-- This script verifies all user roles and their corresponding profile tables

-- Check all users and their roles
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.role,
    u.created_at,
    CASE 
        WHEN u.role = 'student' THEN s.enrollment_number
        WHEN u.role = 'teacher' THEN t.department
        WHEN u.role = 'admin' THEN 'N/A'
    END as role_info,
    -- Verify profile table consistency
    CASE 
        WHEN u.role = 'student' AND s.id IS NULL THEN '❌ Missing student profile'
        WHEN u.role = 'teacher' AND t.id IS NULL THEN '❌ Missing teacher profile'
        WHEN u.role = 'student' AND s.id IS NOT NULL THEN '✅ Student profile exists'
        WHEN u.role = 'teacher' AND t.id IS NOT NULL THEN '✅ Teacher profile exists'
        WHEN u.role = 'admin' THEN '✅ Admin (no profile needed)'
        ELSE '⚠️ Unknown state'
    END as profile_status
FROM public.users u
LEFT JOIN public.students s ON u.id = s.id
LEFT JOIN public.teachers t ON u.id = t.id
ORDER BY u.role, u.email;

-- Check for orphaned student profiles (student profile without user)
SELECT 
    'Orphaned Student Profiles' as issue_type,
    s.id,
    s.enrollment_number
FROM public.students s
LEFT JOIN public.users u ON s.id = u.id
WHERE u.id IS NULL;

-- Check for orphaned teacher profiles (teacher profile without user)
SELECT 
    'Orphaned Teacher Profiles' as issue_type,
    t.id,
    t.department
FROM public.teachers t
LEFT JOIN public.users u ON t.id = u.id
WHERE u.id IS NULL;

-- Check for role mismatches (user has wrong role for their profile)
SELECT 
    'Role Mismatch - Student' as issue_type,
    u.id,
    u.email,
    u.role as current_role,
    'student' as expected_role
FROM public.users u
INNER JOIN public.students s ON u.id = s.id
WHERE u.role != 'student'

UNION ALL

SELECT 
    'Role Mismatch - Teacher' as issue_type,
    u.id,
    u.email,
    u.role as current_role,
    'teacher' as expected_role
FROM public.users u
INNER JOIN public.teachers t ON u.id = t.id
WHERE u.role != 'teacher';

-- Summary statistics
SELECT 
    'Total Users' as metric,
    COUNT(*) as count
FROM public.users

UNION ALL

SELECT 
    'Students' as metric,
    COUNT(*) as count
FROM public.users
WHERE role = 'student'

UNION ALL

SELECT 
    'Teachers' as metric,
    COUNT(*) as count
FROM public.users
WHERE role = 'teacher'

UNION ALL

SELECT 
    'Admins' as metric,
    COUNT(*) as count
FROM public.users
WHERE role = 'admin';
