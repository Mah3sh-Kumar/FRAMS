-- ==============================================================================
-- POPULATE ORGANIZATIONAL DATA FROM CONSTANTS
-- ==============================================================================
-- Version: 1.0
-- Created: 2025-12-03
-- Purpose: Migrate hardcoded data from lib/constants.ts to database tables
-- Requirements: 5.2, 5.3, 5.4
-- ==============================================================================

-- This script populates the organizational tables with data from the existing
-- constants in lib/constants.ts. It uses ON CONFLICT to safely handle
-- re-running the migration without creating duplicates.

-- ==============================================================================
-- PART 1: POPULATE ORG_CLASSES TABLE
-- ==============================================================================

-- Migrate CLASS_LEVELS constant to org_classes table
-- Source: lib/constants.ts - CLASS_LEVELS array
INSERT INTO public.org_classes (name, value, display_order, is_active) VALUES
  ('Class 9', 'class_9', 1, true),
  ('Class 10', 'class_10', 2, true),
  ('Class 11', 'class_11', 3, true),
  ('Class 12', 'class_12', 4, true),
  ('Graduation Year 1', 'grad_year_1', 5, true),
  ('Graduation Year 2', 'grad_year_2', 6, true),
  ('Graduation Year 3', 'grad_year_3', 7, true),
  ('Graduation Year 4', 'grad_year_4', 8, true)
ON CONFLICT (name) DO UPDATE SET
  value = EXCLUDED.value,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = TIMEZONE('utc'::TEXT, NOW());

-- ==============================================================================
-- PART 2: POPULATE ORG_BRANCHES TABLE
-- ==============================================================================

-- Migrate BRANCHES constant to org_branches table
-- Source: lib/constants.ts - BRANCHES array
-- Note: class_id is NULL initially, meaning branches are available for all classes
-- Admins can later associate branches with specific classes through the UI
INSERT INTO public.org_branches (name, class_id, display_order, is_active) VALUES
  ('Computer Science', NULL, 1, true),
  ('Information Technology', NULL, 2, true),
  ('Electronics & Communication', NULL, 3, true),
  ('Mechanical Engineering', NULL, 4, true),
  ('Civil Engineering', NULL, 5, true),
  ('Electrical Engineering', NULL, 6, true),
  ('BBA', NULL, 7, true),
  ('BCA', NULL, 8, true),
  ('B.Com', NULL, 9, true),
  ('B.Sc', NULL, 10, true),
  ('Other', NULL, 11, true)
ON CONFLICT (name, class_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = TIMEZONE('utc'::TEXT, NOW());

-- ==============================================================================
-- PART 3: POPULATE ORG_DEPARTMENTS TABLE
-- ==============================================================================

-- Migrate DEPARTMENTS constant to org_departments table
-- Source: lib/constants.ts - DEPARTMENTS array
INSERT INTO public.org_departments (name, display_order, is_active) VALUES
  ('Computer Science', 1, true),
  ('Information Technology', 2, true),
  ('Electronics', 3, true),
  ('Electrical Engineering', 4, true),
  ('Mechanical Engineering', 5, true),
  ('Civil Engineering', 6, true),
  ('Mathematics', 7, true),
  ('Physics', 8, true),
  ('Chemistry', 9, true),
  ('Biology', 10, true),
  ('English', 11, true),
  ('History', 12, true),
  ('Commerce', 13, true),
  ('Economics', 14, true),
  ('Other', 15, true)
ON CONFLICT (name) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = TIMEZONE('utc'::TEXT, NOW());

-- ==============================================================================
-- PART 4: VERIFY DATA MIGRATION
-- ==============================================================================

-- Display counts to verify migration
DO $
DECLARE
  class_count INTEGER;
  branch_count INTEGER;
  department_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO class_count FROM public.org_classes;
  SELECT COUNT(*) INTO branch_count FROM public.org_branches;
  SELECT COUNT(*) INTO department_count FROM public.org_departments;
  
  RAISE NOTICE '=== Data Migration Summary ===';
  RAISE NOTICE 'Classes migrated: % (expected: 8)', class_count;
  RAISE NOTICE 'Branches migrated: % (expected: 11)', branch_count;
  RAISE NOTICE 'Departments migrated: % (expected: 15)', department_count;
  
  -- Verify expected counts
  IF class_count < 8 THEN
    RAISE WARNING 'Expected 8 classes but found %', class_count;
  END IF;
  
  IF branch_count < 11 THEN
    RAISE WARNING 'Expected 11 branches but found %', branch_count;
  END IF;
  
  IF department_count < 15 THEN
    RAISE WARNING 'Expected 15 departments but found %', department_count;
  END IF;
  
  IF class_count >= 8 AND branch_count >= 11 AND department_count >= 15 THEN
    RAISE NOTICE '✅ All data migrated successfully!';
  END IF;
END $;

-- ==============================================================================
-- END OF MIGRATION
-- ==============================================================================

-- Migration completed!
-- 
-- Summary:
-- ✅ Migrated 8 class levels from CLASS_LEVELS constant
-- ✅ Migrated 11 branches from BRANCHES constant
-- ✅ Migrated 15 departments from DEPARTMENTS constant
-- ✅ Used ON CONFLICT to handle re-runs safely
-- ✅ Verified data counts match expected values
--
-- Next steps:
-- 1. Run verification script to check data integrity
-- 2. Update application code to use database-driven dropdowns
-- 3. Test forms with new database data
