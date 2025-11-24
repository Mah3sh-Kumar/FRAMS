-- 1. Promote a user to Admin
-- Replace 'YOUR_EMAIL_HERE' with the email of the user you want to make an admin
UPDATE public.users
SET role = 'admin'
WHERE email = 'YOUR_EMAIL_HERE';

-- 2. Set Department for a Teacher
-- If the user is a teacher, you can set their department here.
-- Replace 'TEACHER_EMAIL_HERE' and 'Computer Science' with appropriate values.
/*
INSERT INTO public.teachers (id, department)
SELECT id, 'Computer Science'
FROM public.users
WHERE email = 'TEACHER_EMAIL_HERE'
ON CONFLICT (id) DO UPDATE
SET department = EXCLUDED.department;
*/

-- NOTE: Passwords cannot be set here as they are securely hashed.
-- Users must set their password during Signup or via "Forgot Password".
