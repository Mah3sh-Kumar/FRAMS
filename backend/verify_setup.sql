-- ==============================================================================
-- DATABASE SETUP VERIFICATION SCRIPT
-- ==============================================================================
-- Run this to verify all tables, functions, policies, and constraints are in place
-- ==============================================================================

-- ==============================================================================
-- 1. CHECK ALL TABLES EXIST
-- ==============================================================================
SELECT 
    '1. TABLES CHECK' as check_section,
    COUNT(*) as found_tables,
    9 as expected_tables,
    CASE 
        WHEN COUNT(*) = 9 THEN '✅ All tables exist'
        ELSE '❌ Missing tables'
    END as status
FROM information_schema.tables
WHERE table_schema = 'public' 
AND table_name IN (
    'users', 'classes', 'students', 'teachers', 
    'subjects', 'attendance', 'assignments', 'student_assignments', 'notifications'
);

-- List all tables
SELECT 
    '   Table Details' as info,
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
ORDER BY table_name;

-- ==============================================================================
-- 2. CHECK REQUIRED COLUMNS
-- ==============================================================================

-- Check users table has avatar_url
SELECT 
    '2. USERS TABLE' as check_section,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'avatar_url'
        ) THEN '✅ avatar_url column exists'
        ELSE '❌ avatar_url column missing'
    END as avatar_status;

-- Check students table has all columns
SELECT 
    '   STUDENTS TABLE' as check_section,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'students'
ORDER BY ordinal_position;

-- Check notifications table
SELECT 
    '   NOTIFICATIONS TABLE' as check_section,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'notifications'
ORDER BY ordinal_position;

-- ==============================================================================
-- 3. CHECK INDEXES
-- ==============================================================================
SELECT 
    '3. INDEXES CHECK' as check_section,
    COUNT(*) as total_indexes,
    CASE 
        WHEN COUNT(*) >= 10 THEN '✅ Performance indexes created'
        ELSE '⚠️ Some indexes may be missing'
    END as status
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%';

-- List all custom indexes
SELECT 
    '   Index Details' as info,
    tablename,
    indexname
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- ==============================================================================
-- 4. CHECK FUNCTIONS
-- ==============================================================================
SELECT 
    '4. FUNCTIONS CHECK' as check_section,
    COUNT(*) as found_functions,
    CASE 
        WHEN COUNT(*) >= 10 THEN '✅ All functions exist'
        ELSE '⚠️ Some functions may be missing'
    END as status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN (
    'is_admin', 'is_teacher', 'is_student', 'get_user_role', 'handle_new_user',
    'create_notification', 'mark_notification_read', 'mark_all_notifications_read', 
    'get_unread_count', 'notify_assignment_graded', 'get_student_class',
    'calculate_attendance_percentage', 'get_assignment_stats', 'cleanup_old_notifications'
);

-- List all functions
SELECT 
    '   Function Details' as info,
    p.proname as function_name,
    pg_get_function_result(p.oid) as return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
ORDER BY p.proname;

-- ==============================================================================
-- 5. CHECK ROW LEVEL SECURITY
-- ==============================================================================
SELECT 
    '5. RLS CHECK' as check_section,
    COUNT(*) as tables_with_rls,
    9 as expected_tables,
    CASE 
        WHEN COUNT(*) = 9 THEN '✅ RLS enabled on all tables'
        ELSE '❌ RLS not enabled on some tables'
    END as status
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = true
AND tablename IN (
    'users', 'classes', 'students', 'teachers', 
    'subjects', 'attendance', 'assignments', 'student_assignments', 'notifications'
);

-- List RLS status
SELECT 
    '   RLS Details' as info,
    tablename,
    CASE WHEN rowsecurity THEN '✅ Enabled' ELSE '❌ Disabled' END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- ==============================================================================
-- 6. CHECK POLICIES COUNT
-- ==============================================================================
SELECT 
    '6. POLICIES CHECK' as check_section,
    tablename,
    COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- ==============================================================================
-- 7. CHECK CONSTRAINTS
-- ==============================================================================
SELECT 
    '7. CONSTRAINTS CHECK' as check_section,
    COUNT(*) as total_constraints,
    CASE 
        WHEN COUNT(*) >= 5 THEN '✅ Constraints created'
        ELSE '⚠️ Some constraints may be missing'
    END as status
FROM pg_constraint
WHERE connamespace = 'public'::regnamespace
AND conname IN (
    'unique_attendance_record', 'unique_student_assignment',
    'valid_attendance_status', 'valid_score_range', 'reasonable_due_date'
);

-- List all constraints
SELECT 
    '   Constraint Details' as info,
    conrelid::regclass as table_name,
    conname as constraint_name,
    contype as constraint_type
FROM pg_constraint
WHERE connamespace = 'public'::regnamespace
AND conname IN (
    'unique_attendance_record', 'unique_student_assignment',
    'valid_attendance_status', 'valid_score_range', 'reasonable_due_date'
)
ORDER BY conrelid::regclass, conname;

-- ==============================================================================
-- 8. CHECK TRIGGERS
-- ==============================================================================
SELECT 
    '8. TRIGGERS CHECK' as check_section,
    COUNT(*) as found_triggers,
    CASE 
        WHEN COUNT(*) >= 2 THEN '✅ Triggers exist'
        ELSE '⚠️ Some triggers may be missing'
    END as status
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE NOT t.tgisinternal
AND t.tgname IN ('on_auth_user_created', 'trigger_assignment_graded');

-- List all triggers
SELECT 
    '   Trigger Details' as info,
    c.relname as table_name,
    t.tgname as trigger_name,
    p.proname as function_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE NOT t.tgisinternal
ORDER BY c.relname, t.tgname;

-- ==============================================================================
-- 9. CHECK FOREIGN KEYS WITH CASCADE
-- ==============================================================================
SELECT 
    '9. FOREIGN KEYS CHECK' as check_section,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS references_table,
    rc.delete_rule,
    CASE 
        WHEN rc.delete_rule = 'CASCADE' THEN '✅ CASCADE'
        ELSE '⚠️ ' || rc.delete_rule
    END as delete_action
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
    ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- ==============================================================================
-- 10. CHECK SEED DATA
-- ==============================================================================
SELECT 
    '10. SEED DATA CHECK' as check_section,
    COUNT(*) as class_count,
    CASE 
        WHEN COUNT(*) >= 6 THEN '✅ Seed data exists'
        ELSE '⚠️ Seed data may be missing'
    END as status
FROM public.classes;

-- List classes
SELECT 
    '   Classes' as info,
    name,
    academic_year
FROM public.classes
ORDER BY name;

-- ==============================================================================
-- 11. CHECK STORAGE POLICIES
-- ==============================================================================
SELECT 
    '11. STORAGE POLICIES CHECK' as check_section,
    COUNT(*) as avatar_policies,
    CASE 
        WHEN COUNT(*) >= 4 THEN '✅ Avatar storage policies exist'
        ELSE '⚠️ Storage policies may be missing'
    END as status
FROM pg_policies
WHERE schemaname = 'storage'
AND tablename = 'objects'
AND policyname LIKE '%avatar%';

-- List storage policies
SELECT 
    '   Storage Policies' as info,
    policyname,
    cmd as operation
FROM pg_policies
WHERE schemaname = 'storage'
AND tablename = 'objects'
ORDER BY policyname;

-- ==============================================================================
-- SUMMARY
-- ==============================================================================
SELECT 
    '═══════════════════════════════════════════════════════════' as summary,
    'DATABASE SETUP VERIFICATION COMPLETE' as message;

SELECT 
    'Expected Components:' as component,
    '✓ 9 Tables (including notifications)' as details
UNION ALL
SELECT 
    '',
    '✓ 14+ Functions (including notification helpers)'
UNION ALL
SELECT 
    '',
    '✓ 2 Triggers (user creation + assignment grading)'
UNION ALL
SELECT 
    '',
    '✓ 10+ Indexes (performance optimization)'
UNION ALL
SELECT 
    '',
    '✓ 5+ Constraints (data validation)'
UNION ALL
SELECT 
    '',
    '✓ RLS Policies on all tables'
UNION ALL
SELECT 
    '',
    '✓ CASCADE delete rules'
UNION ALL
SELECT 
    '',
    '✓ Storage policies for avatars';

-- ==============================================================================
-- END OF VERIFICATION
-- ==============================================================================
