-- ==============================================================================
-- VERIFICATION SCRIPT FOR ORGANIZATIONAL DATA SCHEMA
-- ==============================================================================
-- Purpose: Verify that the organizational data migration was applied correctly
-- Run this script after applying 003_organizational_data_schema.sql
-- ==============================================================================

-- ==============================================================================
-- PART 1: VERIFY TABLES EXIST
-- ==============================================================================

SELECT 
  'Tables Verification' AS check_type,
  CASE 
    WHEN COUNT(*) = 3 THEN '✅ PASS: All 3 organizational tables exist'
    ELSE '❌ FAIL: Expected 3 tables, found ' || COUNT(*)::TEXT
  END AS result
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('org_classes', 'org_branches', 'org_departments');

-- ==============================================================================
-- PART 2: VERIFY TABLE STRUCTURES
-- ==============================================================================

-- Check org_classes columns
SELECT 
  'org_classes Structure' AS check_type,
  CASE 
    WHEN COUNT(*) = 7 THEN '✅ PASS: org_classes has all required columns'
    ELSE '❌ FAIL: org_classes missing columns'
  END AS result
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'org_classes'
AND column_name IN ('id', 'name', 'value', 'display_order', 'is_active', 'created_at', 'updated_at');

-- Check org_branches columns
SELECT 
  'org_branches Structure' AS check_type,
  CASE 
    WHEN COUNT(*) = 7 THEN '✅ PASS: org_branches has all required columns'
    ELSE '❌ FAIL: org_branches missing columns'
  END AS result
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'org_branches'
AND column_name IN ('id', 'name', 'class_id', 'display_order', 'is_active', 'created_at', 'updated_at');

-- Check org_departments columns
SELECT 
  'org_departments Structure' AS check_type,
  CASE 
    WHEN COUNT(*) = 6 THEN '✅ PASS: org_departments has all required columns'
    ELSE '❌ FAIL: org_departments missing columns'
  END AS result
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'org_departments'
AND column_name IN ('id', 'name', 'display_order', 'is_active', 'created_at', 'updated_at');

-- ==============================================================================
-- PART 3: VERIFY INDEXES
-- ==============================================================================

SELECT 
  'Indexes Verification' AS check_type,
  CASE 
    WHEN COUNT(*) >= 9 THEN '✅ PASS: All required indexes exist'
    ELSE '❌ FAIL: Missing indexes (found ' || COUNT(*)::TEXT || ', expected at least 9)'
  END AS result
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('org_classes', 'org_branches', 'org_departments')
AND indexname LIKE 'idx_org_%';

-- List all indexes
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('org_classes', 'org_branches', 'org_departments')
ORDER BY tablename, indexname;

-- ==============================================================================
-- PART 4: VERIFY RLS IS ENABLED
-- ==============================================================================

SELECT 
  'RLS Verification' AS check_type,
  CASE 
    WHEN COUNT(*) = 3 THEN '✅ PASS: RLS enabled on all organizational tables'
    ELSE '❌ FAIL: RLS not enabled on all tables'
  END AS result
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('org_classes', 'org_branches', 'org_departments')
AND rowsecurity = true;

-- ==============================================================================
-- PART 5: VERIFY RLS POLICIES
-- ==============================================================================

-- Count policies per table
SELECT 
  tablename,
  COUNT(*) AS policy_count,
  CASE 
    WHEN COUNT(*) >= 5 THEN '✅ PASS'
    ELSE '❌ FAIL: Expected at least 5 policies'
  END AS status
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('org_classes', 'org_branches', 'org_departments')
GROUP BY tablename
ORDER BY tablename;

-- List all policies
SELECT 
  tablename,
  policyname,
  cmd AS command,
  qual AS using_expression
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('org_classes', 'org_branches', 'org_departments')
ORDER BY tablename, policyname;

-- ==============================================================================
-- PART 6: VERIFY FOREIGN KEY CONSTRAINTS
-- ==============================================================================

SELECT 
  'Foreign Key Verification' AS check_type,
  CASE 
    WHEN COUNT(*) >= 1 THEN '✅ PASS: Foreign key constraint exists on org_branches'
    ELSE '❌ FAIL: Missing foreign key constraint'
  END AS result
FROM information_schema.table_constraints
WHERE constraint_schema = 'public'
AND table_name = 'org_branches'
AND constraint_type = 'FOREIGN KEY';

-- ==============================================================================
-- PART 7: VERIFY UNIQUE CONSTRAINTS
-- ==============================================================================

SELECT 
  table_name,
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE constraint_schema = 'public'
AND table_name IN ('org_classes', 'org_branches', 'org_departments')
AND constraint_type = 'UNIQUE'
ORDER BY table_name;

-- ==============================================================================
-- PART 8: VERIFY HELPER FUNCTIONS EXIST
-- ==============================================================================

SELECT 
  'Helper Functions' AS check_type,
  CASE 
    WHEN COUNT(*) = 3 THEN '✅ PASS: All helper functions exist'
    ELSE '❌ FAIL: Missing helper functions (found ' || COUNT(*)::TEXT || ', expected 3)'
  END AS result
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN ('can_delete_class', 'can_delete_branch', 'can_delete_department');

-- ==============================================================================
-- PART 9: VERIFY SEED DATA
-- ==============================================================================

-- Check org_classes seed data
SELECT 
  'org_classes Seed Data' AS check_type,
  COUNT(*) AS record_count,
  CASE 
    WHEN COUNT(*) = 8 THEN '✅ PASS: All 8 class levels seeded'
    ELSE '⚠️ WARNING: Expected 8 classes, found ' || COUNT(*)::TEXT
  END AS result
FROM public.org_classes;

-- Check org_branches seed data
SELECT 
  'org_branches Seed Data' AS check_type,
  COUNT(*) AS record_count,
  CASE 
    WHEN COUNT(*) = 11 THEN '✅ PASS: All 11 branches seeded'
    ELSE '⚠️ WARNING: Expected 11 branches, found ' || COUNT(*)::TEXT
  END AS result
FROM public.org_branches;

-- Check org_departments seed data
SELECT 
  'org_departments Seed Data' AS check_type,
  COUNT(*) AS record_count,
  CASE 
    WHEN COUNT(*) = 15 THEN '✅ PASS: All 15 departments seeded'
    ELSE '⚠️ WARNING: Expected 15 departments, found ' || COUNT(*)::TEXT
  END AS result
FROM public.org_departments;

-- ==============================================================================
-- PART 10: VERIFY TRIGGERS
-- ==============================================================================

SELECT 
  'Triggers Verification' AS check_type,
  CASE 
    WHEN COUNT(*) = 3 THEN '✅ PASS: All update triggers exist'
    ELSE '❌ FAIL: Missing triggers (found ' || COUNT(*)::TEXT || ', expected 3)'
  END AS result
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
AND c.relname IN ('org_classes', 'org_branches', 'org_departments')
AND t.tgname LIKE 'update_%_updated_at';

-- ==============================================================================
-- PART 11: SAMPLE DATA QUERIES
-- ==============================================================================

-- Display sample classes
SELECT 
  'Sample Classes' AS data_type,
  name,
  value,
  display_order,
  is_active
FROM public.org_classes
ORDER BY display_order
LIMIT 5;

-- Display sample branches
SELECT 
  'Sample Branches' AS data_type,
  name,
  class_id,
  display_order,
  is_active
FROM public.org_branches
ORDER BY display_order
LIMIT 5;

-- Display sample departments
SELECT 
  'Sample Departments' AS data_type,
  name,
  display_order,
  is_active
FROM public.org_departments
ORDER BY display_order
LIMIT 5;

-- ==============================================================================
-- PART 12: SUMMARY
-- ==============================================================================

SELECT 
  '=== VERIFICATION SUMMARY ===' AS summary,
  (SELECT COUNT(*) FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('org_classes', 'org_branches', 'org_departments')) AS tables_created,
  (SELECT COUNT(*) FROM pg_indexes
   WHERE schemaname = 'public'
   AND tablename IN ('org_classes', 'org_branches', 'org_departments')
   AND indexname LIKE 'idx_org_%') AS indexes_created,
  (SELECT COUNT(*) FROM pg_policies
   WHERE schemaname = 'public'
   AND tablename IN ('org_classes', 'org_branches', 'org_departments')) AS policies_created,
  (SELECT COUNT(*) FROM public.org_classes) AS classes_seeded,
  (SELECT COUNT(*) FROM public.org_branches) AS branches_seeded,
  (SELECT COUNT(*) FROM public.org_departments) AS departments_seeded;

-- ==============================================================================
-- END OF VERIFICATION SCRIPT
-- ==============================================================================
