-- FIX_TEACHER_ROLE.sql
-- This script fixes Mahesh Kumar who was incorrectly registered as 'student' but should be 'teacher'

-- STEP 1: Update the role in users table
UPDATE public.users
SET role = 'teacher'
WHERE email = 'golu91024@gmail.com';

-- STEP 2: Delete the incorrect student profile for this user
DELETE FROM public.students
WHERE id = (
    SELECT id FROM public.users WHERE email = 'golu91024@gmail.com'
);

-- STEP 3: Create the correct teacher profile
INSERT INTO public.teachers (id, department)
SELECT 
    id,
    'Computer Science' as department
FROM public.users
WHERE email = 'golu91024@gmail.com';

-- STEP 4: Verify the fix
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.role,
    t.department
FROM public.users u
LEFT JOIN public.teachers t ON u.id = t.id
WHERE u.email = 'golu91024@gmail.com';

-- ✅ Expected result: You should see role='teacher' and department='Computer Science'

-- STEP 5: Verify both users are now correct
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.role,
    CASE 
        WHEN u.role = 'student' THEN s.enrollment_number
        WHEN u.role = 'teacher' THEN t.department
    END as role_info
FROM public.users u
LEFT JOIN public.students s ON u.id = s.id
LEFT JOIN public.teachers t ON u.id = t.id
WHERE u.email IN ('golu91024@gmail.com', 'kuchb0746@gmail.com')
ORDER BY u.email;
