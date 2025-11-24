-- ==============================================================================
-- DATABASE SCHEMA VERIFICATION SCRIPT
-- ==============================================================================
-- This script checks for all required tables, functions, policies, and triggers
-- Run this in Supabase SQL Editor to verify your database setup is complete
-- ==============================================================================

-- CHECK 1: VERIFY ALL TABLES EXIST
-- ==============================================================================
SELECT 
    'Tables Check' as check_type,
    COUNT(*) as found_count,
    8 as expected_count,
    CASE 
        WHEN COUNT(*) = 8 THEN '✅ All tables exist'
        ELSE '❌ Missing tables'
    END as status
FROM information_schema.tables
WHERE table_schema = 'public' 
AND table_name IN (
    'users', 'classes', 'students', 'teachers', 
    'subjects', 'attendance', 'assignments', 'student_assignments'
);

-- List all existing tables
SELECT 
    'Existing Tables' as info,
    table_name,
    CASE 
        WHEN table_name IN ('users', 'classes', 'students', 'teachers', 'subjects', 'attendance', 'assignments', 'student_assignments') 
        THEN '✅ Required'
        ELSE '⚠️ Extra'
    END as status
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- CHECK 2: VERIFY REQUIRED COLUMNS IN 'students' TABLE
-- ==============================================================================
SELECT 
    'Student Columns Check' as check_type,
    column_name,
    data_type,
    is_nullable,
    CASE 
        WHEN column_name IN ('id', 'enrollment_number', 'class_id', 'face_encoding', 'created_at', 'branch', 'class_level') 
        THEN '✅ Expected'
        ELSE '⚠️ Extra'
    END as status
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'students'
ORDER BY ordinal_position;

-- CHECK 3: VERIFY ALL REQUIRED FUNCTIONS EXIST
-- ==============================================================================
SELECT 
    'Functions Check' as check_type,
    COUNT(*) as found_count,
    5 as expected_count,
    CASE 
        WHEN COUNT(*) >= 5 THEN '✅ All helper functions exist'
        ELSE '❌ Missing functions'
    END as status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN (
    'is_admin', 'is_teacher', 'is_student', 
    'get_user_role', 'handle_new_user'
);

-- List all existing functions
SELECT 
    'Existing Functions' as info,
    p.proname as function_name,
    pg_get_function_result(p.oid) as return_type,
    CASE 
        WHEN p.proname IN ('is_admin', 'is_teacher', 'is_student', 'get_user_role', 'handle_new_user') 
        THEN '✅ Required'
        ELSE '⚠️ Extra'
    END as status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
ORDER BY p.proname;

-- CHECK 4: VERIFY ROW LEVEL SECURITY IS ENABLED
-- ==============================================================================
SELECT 
    'RLS Check' as check_type,
    tablename as table_name,
    CASE 
        WHEN rowsecurity THEN '✅ RLS Enabled'
        ELSE '❌ RLS Disabled'
    END as status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
    'users', 'classes', 'students', 'teachers', 
    'subjects', 'attendance', 'assignments', 'student_assignments'
)
ORDER BY tablename;

-- CHECK 5: COUNT POLICIES PER TABLE
-- ==============================================================================
SELECT 
    'Policies Check' as check_type,
    tablename as table_name,
    COUNT(*) as policy_count,
    CASE 
        WHEN tablename = 'users' AND COUNT(*) >= 5 THEN '✅ Has policies'
        WHEN tablename = 'classes' AND COUNT(*) >= 2 THEN '✅ Has policies'
        WHEN tablename = 'students' AND COUNT(*) >= 4 THEN '✅ Has policies'
        WHEN tablename = 'teachers' AND COUNT(*) >= 3 THEN '✅ Has policies'
        WHEN tablename = 'subjects' AND COUNT(*) >= 4 THEN '✅ Has policies'
        WHEN tablename = 'attendance' AND COUNT(*) >= 5 THEN '✅ Has policies'
        WHEN tablename = 'assignments' AND COUNT(*) >= 5 THEN '✅ Has policies'
        WHEN tablename = 'student_assignments' AND COUNT(*) >= 6 THEN '✅ Has policies'
        ELSE '⚠️ May need more policies'
    END as status
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- List all policies
SELECT 
    'All Policies' as info,
    schemaname,
    tablename,
    policyname,
    cmd as operation,
    qual as using_expression
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- CHECK 6: VERIFY TRIGGERS EXIST
-- ==============================================================================
SELECT 
    'Triggers Check' as check_type,
    COUNT(*) as found_count,
    1 as expected_count,
    CASE 
        WHEN COUNT(*) >= 1 THEN '✅ User creation trigger exists'
        ELSE '❌ Missing trigger'
    END as status
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'auth'
AND c.relname = 'users'
AND t.tgname = 'on_auth_user_created';

-- List all triggers
SELECT 
    'Existing Triggers' as info,
    n.nspname as schema_name,
    c.relname as table_name,
    t.tgname as trigger_name,
    p.proname as function_name,
    CASE 
        WHEN t.tgname = 'on_auth_user_created' THEN '✅ Required'
        ELSE '⚠️ Extra'
    END as status
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE n.nspname IN ('public', 'auth')
AND NOT t.tgisinternal
ORDER BY n.nspname, c.relname, t.tgname;

-- CHECK 7: VERIFY CUSTOM TYPES (ENUMs)
-- ==============================================================================
SELECT 
    'Enum Types Check' as check_type,
    typname as type_name,
    array_agg(enumlabel ORDER BY enumsortorder) as possible_values,
    CASE 
        WHEN typname IN ('user_role', 'attendance_status', 'assignment_status') 
        THEN '✅ Required'
        ELSE '⚠️ Extra'
    END as status
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
GROUP BY typname
ORDER BY typname;

-- CHECK 8: VERIFY FOREIGN KEY CONSTRAINTS
-- ==============================================================================
SELECT 
    'Foreign Keys Check' as check_type,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    '✅ Constraint exists' as status
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- CHECK 9: VERIFY SEED DATA (Classes)
-- ==============================================================================
SELECT 
    'Seed Data Check' as check_type,
    COUNT(*) as class_count,
    CASE 
        WHEN COUNT(*) >= 1 THEN '✅ Has class data'
        ELSE '⚠️ No classes defined'
    END as status
FROM public.classes;

-- List all classes
SELECT 
    'Available Classes' as info,
    id,
    name,
    academic_year,
    created_at
FROM public.classes
ORDER BY name;

-- CHECK 10: VERIFY EXTENSIONS
-- ==============================================================================
SELECT 
    'Extensions Check' as check_type,
    extname as extension_name,
    CASE 
        WHEN extname = 'uuid-ossp' THEN '✅ Required for UUID generation'
        ELSE '✅ Installed'
    END as status
FROM pg_extension
WHERE extname IN ('uuid-ossp', 'pgcrypto')
ORDER BY extname;

-- ==============================================================================
-- SUMMARY REPORT
-- ==============================================================================
SELECT 
    '=== SUMMARY ===' as section,
    'Run the checks above to see:' as instruction;

SELECT 
    'Expected Components:' as component,
    '8 Tables, 5 Functions, 1 Trigger, 3 Enum Types, RLS on all tables' as details;

SELECT 
    'If any checks show ❌:' as action,
    'Run COMPLETE_SETUP.sql from the project root' as solution;

-- ==============================================================================
-- QUICK FIX COMMANDS (if something is missing)
-- ==============================================================================

/*
-- If tables are missing, run:
\i COMPLETE_SETUP.sql

-- If trigger is missing:
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'student')
  );
  RETURN new;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- If RLS is not enabled on a table:
ALTER TABLE public.table_name ENABLE ROW LEVEL SECURITY;

-- If policies are missing, run the policy section from COMPLETE_SETUP.sql
*/
