-- ==============================================================================
-- VERIFY ORGANIZATIONAL DATA MIGRATION
-- ==============================================================================
-- Version: 1.0
-- Created: 2025-12-03
-- Purpose: Verify data integrity after migrating organizational data
-- Requirements: 5.2, 5.3, 5.4
-- ==============================================================================

-- This script verifies that all data from lib/constants.ts has been properly
-- migrated to the database tables and checks for data integrity issues.

\echo '=== Starting Organizational Data Verification ==='
\echo ''

-- ==============================================================================
-- PART 1: VERIFY TABLE EXISTENCE
-- ==============================================================================

\echo '--- Checking Table Existence ---'

DO $
DECLARE
  tables_exist BOOLEAN;
BEGIN
  SELECT 
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'org_classes') AND
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'org_branches') AND
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'org_departments')
  INTO tables_exist;
  
  IF tables_exist THEN
    RAISE NOTICE '✅ All organizational tables exist';
  ELSE
    RAISE EXCEPTION '❌ One or more organizational tables are missing. Run migration 003 first.';
  END IF;
END $;

\echo ''

-- ==============================================================================
-- PART 2: VERIFY DATA COUNTS
-- ==============================================================================

\echo '--- Verifying Data Counts ---'

DO $
DECLARE
  class_count INTEGER;
  branch_count INTEGER;
  department_count INTEGER;
  all_counts_valid BOOLEAN := true;
BEGIN
  -- Count records in each table
  SELECT COUNT(*) INTO class_count FROM public.org_classes;
  SELECT COUNT(*) INTO branch_count FROM public.org_branches;
  SELECT COUNT(*) INTO department_count FROM public.org_departments;
  
  RAISE NOTICE 'Classes: % (expected: 8)', class_count;
  RAISE NOTICE 'Branches: % (expected: 11)', branch_count;
  RAISE NOTICE 'Departments: % (expected: 15)', department_count;
  
  -- Verify counts
  IF class_count < 8 THEN
    RAISE WARNING '❌ Expected at least 8 classes but found %', class_count;
    all_counts_valid := false;
  END IF;
  
  IF branch_count < 11 THEN
    RAISE WARNING '❌ Expected at least 11 branches but found %', branch_count;
    all_counts_valid := false;
  END IF;
  
  IF department_count < 15 THEN
    RAISE WARNING '❌ Expected at least 15 departments but found %', department_count;
    all_counts_valid := false;
  END IF;
  
  IF all_counts_valid THEN
    RAISE NOTICE '✅ All data counts are valid';
  END IF;
END $;

\echo ''

-- ==============================================================================
-- PART 3: VERIFY SPECIFIC CLASS LEVELS
-- ==============================================================================

\echo '--- Verifying Class Levels ---'

DO $
DECLARE
  missing_classes TEXT[];
  expected_classes TEXT[] := ARRAY[
    'Class 9', 'Class 10', 'Class 11', 'Class 12',
    'Graduation Year 1', 'Graduation Year 2', 'Graduation Year 3', 'Graduation Year 4'
  ];
  class_name TEXT;
  class_exists BOOLEAN;
BEGIN
  FOREACH class_name IN ARRAY expected_classes
  LOOP
    SELECT EXISTS(SELECT 1 FROM public.org_classes WHERE name = class_name) INTO class_exists;
    IF NOT class_exists THEN
      missing_classes := array_append(missing_classes, class_name);
    END IF;
  END LOOP;
  
  IF array_length(missing_classes, 1) IS NULL THEN
    RAISE NOTICE '✅ All expected class levels exist';
  ELSE
    RAISE WARNING '❌ Missing class levels: %', array_to_string(missing_classes, ', ');
  END IF;
END $;

\echo ''

-- ==============================================================================
-- PART 4: VERIFY SPECIFIC BRANCHES
-- ==============================================================================

\echo '--- Verifying Branches ---'

DO $
DECLARE
  missing_branches TEXT[];
  expected_branches TEXT[] := ARRAY[
    'Computer Science', 'Information Technology', 'Electronics & Communication',
    'Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering',
    'BBA', 'BCA', 'B.Com', 'B.Sc', 'Other'
  ];
  branch_name TEXT;
  branch_exists BOOLEAN;
BEGIN
  FOREACH branch_name IN ARRAY expected_branches
  LOOP
    SELECT EXISTS(SELECT 1 FROM public.org_branches WHERE name = branch_name) INTO branch_exists;
    IF NOT branch_exists THEN
      missing_branches := array_append(missing_branches, branch_name);
    END IF;
  END LOOP;
  
  IF array_length(missing_branches, 1) IS NULL THEN
    RAISE NOTICE '✅ All expected branches exist';
  ELSE
    RAISE WARNING '❌ Missing branches: %', array_to_string(missing_branches, ', ');
  END IF;
END $;

\echo ''

-- ==============================================================================
-- PART 5: VERIFY SPECIFIC DEPARTMENTS
-- ==============================================================================

\echo '--- Verifying Departments ---'

DO $
DECLARE
  missing_departments TEXT[];
  expected_departments TEXT[] := ARRAY[
    'Computer Science', 'Information Technology', 'Electronics',
    'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering',
    'Mathematics', 'Physics', 'Chemistry', 'Biology',
    'English', 'History', 'Commerce', 'Economics', 'Other'
  ];
  dept_name TEXT;
  dept_exists BOOLEAN;
BEGIN
  FOREACH dept_name IN ARRAY expected_departments
  LOOP
    SELECT EXISTS(SELECT 1 FROM public.org_departments WHERE name = dept_name) INTO dept_exists;
    IF NOT dept_exists THEN
      missing_departments := array_append(missing_departments, dept_name);
    END IF;
  END LOOP;
  
  IF array_length(missing_departments, 1) IS NULL THEN
    RAISE NOTICE '✅ All expected departments exist';
  ELSE
    RAISE WARNING '❌ Missing departments: %', array_to_string(missing_departments, ', ');
  END IF;
END $;

\echo ''

-- ==============================================================================
-- PART 6: VERIFY DATA INTEGRITY
-- ==============================================================================

\echo '--- Verifying Data Integrity ---'

DO $
DECLARE
  duplicate_classes INTEGER;
  duplicate_departments INTEGER;
  inactive_count INTEGER;
  null_values INTEGER;
BEGIN
  -- Check for duplicate class names
  SELECT COUNT(*) INTO duplicate_classes
  FROM (
    SELECT name, COUNT(*) as cnt
    FROM public.org_classes
    GROUP BY name
    HAVING COUNT(*) > 1
  ) duplicates;
  
  IF duplicate_classes > 0 THEN
    RAISE WARNING '❌ Found % duplicate class names', duplicate_classes;
  ELSE
    RAISE NOTICE '✅ No duplicate class names';
  END IF;
  
  -- Check for duplicate department names
  SELECT COUNT(*) INTO duplicate_departments
  FROM (
    SELECT name, COUNT(*) as cnt
    FROM public.org_departments
    GROUP BY name
    HAVING COUNT(*) > 1
  ) duplicates;
  
  IF duplicate_departments > 0 THEN
    RAISE WARNING '❌ Found % duplicate department names', duplicate_departments;
  ELSE
    RAISE NOTICE '✅ No duplicate department names';
  END IF;
  
  -- Check for inactive records (should all be active after migration)
  SELECT 
    (SELECT COUNT(*) FROM public.org_classes WHERE is_active = false) +
    (SELECT COUNT(*) FROM public.org_branches WHERE is_active = false) +
    (SELECT COUNT(*) FROM public.org_departments WHERE is_active = false)
  INTO inactive_count;
  
  IF inactive_count > 0 THEN
    RAISE NOTICE 'ℹ️  Found % inactive records (this may be intentional)', inactive_count;
  ELSE
    RAISE NOTICE '✅ All records are active';
  END IF;
  
  -- Check for NULL names
  SELECT 
    (SELECT COUNT(*) FROM public.org_classes WHERE name IS NULL) +
    (SELECT COUNT(*) FROM public.org_branches WHERE name IS NULL) +
    (SELECT COUNT(*) FROM public.org_departments WHERE name IS NULL)
  INTO null_values;
  
  IF null_values > 0 THEN
    RAISE WARNING '❌ Found % records with NULL names', null_values;
  ELSE
    RAISE NOTICE '✅ No NULL names found';
  END IF;
END $;

\echo ''

-- ==============================================================================
-- PART 7: VERIFY INDEXES
-- ==============================================================================

\echo '--- Verifying Indexes ---'

DO $
DECLARE
  index_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes
  WHERE schemaname = 'public'
  AND tablename IN ('org_classes', 'org_branches', 'org_departments');
  
  IF index_count >= 9 THEN
    RAISE NOTICE '✅ Found % indexes on organizational tables', index_count;
  ELSE
    RAISE WARNING '❌ Expected at least 9 indexes but found %', index_count;
  END IF;
END $;

\echo ''

-- ==============================================================================
-- PART 8: VERIFY RLS POLICIES
-- ==============================================================================

\echo '--- Verifying RLS Policies ---'

DO $
DECLARE
  policy_count INTEGER;
  rls_enabled_count INTEGER;
BEGIN
  -- Check if RLS is enabled
  SELECT COUNT(*) INTO rls_enabled_count
  FROM pg_tables
  WHERE schemaname = 'public'
  AND tablename IN ('org_classes', 'org_branches', 'org_departments')
  AND rowsecurity = true;
  
  IF rls_enabled_count = 3 THEN
    RAISE NOTICE '✅ RLS is enabled on all organizational tables';
  ELSE
    RAISE WARNING '❌ RLS is not enabled on all tables (enabled on % of 3)', rls_enabled_count;
  END IF;
  
  -- Check policy count
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
  AND tablename IN ('org_classes', 'org_branches', 'org_departments');
  
  IF policy_count >= 15 THEN
    RAISE NOTICE '✅ Found % RLS policies on organizational tables', policy_count;
  ELSE
    RAISE WARNING '❌ Expected at least 15 policies but found %', policy_count;
  END IF;
END $;

\echo ''

-- ==============================================================================
-- PART 9: DISPLAY SAMPLE DATA
-- ==============================================================================

\echo '--- Sample Data from Each Table ---'
\echo ''
\echo 'Classes (first 3):'
SELECT name, value, display_order, is_active
FROM public.org_classes
ORDER BY display_order
LIMIT 3;

\echo ''
\echo 'Branches (first 3):'
SELECT name, class_id, display_order, is_active
FROM public.org_branches
ORDER BY display_order
LIMIT 3;

\echo ''
\echo 'Departments (first 3):'
SELECT name, display_order, is_active
FROM public.org_departments
ORDER BY display_order
LIMIT 3;

\echo ''

-- ==============================================================================
-- PART 10: FINAL SUMMARY
-- ==============================================================================

\echo '=== Verification Complete ==='
\echo ''
\echo 'Review the output above for any warnings or errors.'
\echo 'If all checks passed, the migration was successful!'
\echo ''

-- ==============================================================================
-- END OF VERIFICATION
-- ==============================================================================
