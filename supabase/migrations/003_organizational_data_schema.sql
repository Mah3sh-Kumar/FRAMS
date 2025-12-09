-- ==============================================================================
-- ORGANIZATIONAL DATA SCHEMA
-- ==============================================================================
-- Version: 1.0
-- Created: 2025-12-03
-- Purpose: Create database tables for managing organizational data structures
--          (classes, branches, departments) with admin-only write access
-- Requirements: 5.2, 5.3, 5.4
-- ==============================================================================

-- ==============================================================================
-- PART 1: DROP EXISTING TABLES IF THEY EXIST (FOR CLEAN MIGRATION)
-- ==============================================================================

-- Note: We're creating new organizational tables separate from the existing
-- classes table to maintain backward compatibility during migration

DROP TABLE IF EXISTS public.org_branches CASCADE;
DROP TABLE IF EXISTS public.org_classes CASCADE;
DROP TABLE IF EXISTS public.org_departments CASCADE;

-- ==============================================================================
-- PART 2: CREATE ORGANIZATIONAL TABLES
-- ==============================================================================

-- ------------------------------
-- ORG_CLASSES TABLE
-- ------------------------------
-- Stores class levels (e.g., Class 9, Class 10, Graduation Year 1)
CREATE TABLE public.org_classes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL UNIQUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

COMMENT ON TABLE public.org_classes IS 'Organizational class levels managed by admins';
COMMENT ON COLUMN public.org_classes.name IS 'Display name of the class (e.g., "Class 9")';
COMMENT ON COLUMN public.org_classes.value IS 'Internal value identifier (e.g., "class_9")';
COMMENT ON COLUMN public.org_classes.display_order IS 'Order for displaying in dropdowns';
COMMENT ON COLUMN public.org_classes.is_active IS 'Whether the class is currently active';

-- ------------------------------
-- ORG_BRANCHES TABLE
-- ------------------------------
-- Stores branches/streams associated with classes
CREATE TABLE public.org_branches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  class_id UUID REFERENCES public.org_classes(id) ON DELETE CASCADE,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  UNIQUE(name, class_id)
);

COMMENT ON TABLE public.org_branches IS 'Organizational branches/streams associated with classes';
COMMENT ON COLUMN public.org_branches.name IS 'Branch name (e.g., "Computer Science")';
COMMENT ON COLUMN public.org_branches.class_id IS 'Associated class (NULL means available for all classes)';
COMMENT ON COLUMN public.org_branches.display_order IS 'Order for displaying in dropdowns';
COMMENT ON COLUMN public.org_branches.is_active IS 'Whether the branch is currently active';
COMMENT ON CONSTRAINT org_branches_name_class_id_key ON public.org_branches IS 'Unique branch name per class';

-- ------------------------------
-- ORG_DEPARTMENTS TABLE
-- ------------------------------
-- Stores departments for teachers
CREATE TABLE public.org_departments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

COMMENT ON TABLE public.org_departments IS 'Organizational departments managed by admins';
COMMENT ON COLUMN public.org_departments.name IS 'Department name (e.g., "Computer Science")';
COMMENT ON COLUMN public.org_departments.display_order IS 'Order for displaying in dropdowns';
COMMENT ON COLUMN public.org_departments.is_active IS 'Whether the department is currently active';

-- ==============================================================================
-- PART 3: CREATE INDEXES FOR PERFORMANCE
-- ==============================================================================

-- Indexes for org_classes
CREATE INDEX idx_org_classes_display_order ON public.org_classes(display_order);
CREATE INDEX idx_org_classes_is_active ON public.org_classes(is_active);
CREATE INDEX idx_org_classes_value ON public.org_classes(value);

-- Indexes for org_branches
CREATE INDEX idx_org_branches_class_id ON public.org_branches(class_id);
CREATE INDEX idx_org_branches_display_order ON public.org_branches(display_order);
CREATE INDEX idx_org_branches_is_active ON public.org_branches(is_active);
CREATE INDEX idx_org_branches_name ON public.org_branches(name);

-- Indexes for org_departments
CREATE INDEX idx_org_departments_display_order ON public.org_departments(display_order);
CREATE INDEX idx_org_departments_is_active ON public.org_departments(is_active);
CREATE INDEX idx_org_departments_name ON public.org_departments(name);

-- ==============================================================================
-- PART 4: CREATE UPDATED_AT TRIGGERS
-- ==============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
  NEW.updated_at = TIMEZONE('utc'::TEXT, NOW());
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Triggers for each table
CREATE TRIGGER update_org_classes_updated_at
  BEFORE UPDATE ON public.org_classes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_org_branches_updated_at
  BEFORE UPDATE ON public.org_branches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_org_departments_updated_at
  BEFORE UPDATE ON public.org_departments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ==============================================================================
-- PART 5: ENABLE ROW LEVEL SECURITY
-- ==============================================================================

ALTER TABLE public.org_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_departments ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- PART 6: CREATE RLS POLICIES
-- ==============================================================================

-- ------------------------------
-- ORG_CLASSES POLICIES
-- ------------------------------

-- All authenticated users can view active classes
DROP POLICY IF EXISTS "Authenticated users can view active classes" ON public.org_classes;
CREATE POLICY "Authenticated users can view active classes" ON public.org_classes
  FOR SELECT
  USING (auth.role() = 'authenticated' AND is_active = true);

-- Admins can view all classes (including inactive)
DROP POLICY IF EXISTS "Admins can view all classes" ON public.org_classes;
CREATE POLICY "Admins can view all classes" ON public.org_classes
  FOR SELECT
  USING (is_admin());

-- Admins can insert classes
DROP POLICY IF EXISTS "Admins can insert classes" ON public.org_classes;
CREATE POLICY "Admins can insert classes" ON public.org_classes
  FOR INSERT
  WITH CHECK (is_admin());

-- Admins can update classes
DROP POLICY IF EXISTS "Admins can update classes" ON public.org_classes;
CREATE POLICY "Admins can update classes" ON public.org_classes
  FOR UPDATE
  USING (is_admin());

-- Admins can delete classes
DROP POLICY IF EXISTS "Admins can delete classes" ON public.org_classes;
CREATE POLICY "Admins can delete classes" ON public.org_classes
  FOR DELETE
  USING (is_admin());

-- ------------------------------
-- ORG_BRANCHES POLICIES
-- ------------------------------

-- All authenticated users can view active branches
DROP POLICY IF EXISTS "Authenticated users can view active branches" ON public.org_branches;
CREATE POLICY "Authenticated users can view active branches" ON public.org_branches
  FOR SELECT
  USING (auth.role() = 'authenticated' AND is_active = true);

-- Admins can view all branches (including inactive)
DROP POLICY IF EXISTS "Admins can view all branches" ON public.org_branches;
CREATE POLICY "Admins can view all branches" ON public.org_branches
  FOR SELECT
  USING (is_admin());

-- Admins can insert branches
DROP POLICY IF EXISTS "Admins can insert branches" ON public.org_branches;
CREATE POLICY "Admins can insert branches" ON public.org_branches
  FOR INSERT
  WITH CHECK (is_admin());

-- Admins can update branches
DROP POLICY IF EXISTS "Admins can update branches" ON public.org_branches;
CREATE POLICY "Admins can update branches" ON public.org_branches
  FOR UPDATE
  USING (is_admin());

-- Admins can delete branches
DROP POLICY IF EXISTS "Admins can delete branches" ON public.org_branches;
CREATE POLICY "Admins can delete branches" ON public.org_branches
  FOR DELETE
  USING (is_admin());

-- ------------------------------
-- ORG_DEPARTMENTS POLICIES
-- ------------------------------

-- All authenticated users can view active departments
DROP POLICY IF EXISTS "Authenticated users can view active departments" ON public.org_departments;
CREATE POLICY "Authenticated users can view active departments" ON public.org_departments
  FOR SELECT
  USING (auth.role() = 'authenticated' AND is_active = true);

-- Admins can view all departments (including inactive)
DROP POLICY IF EXISTS "Admins can view all departments" ON public.org_departments;
CREATE POLICY "Admins can view all departments" ON public.org_departments
  FOR SELECT
  USING (is_admin());

-- Admins can insert departments
DROP POLICY IF EXISTS "Admins can insert departments" ON public.org_departments;
CREATE POLICY "Admins can insert departments" ON public.org_departments
  FOR INSERT
  WITH CHECK (is_admin());

-- Admins can update departments
DROP POLICY IF EXISTS "Admins can update departments" ON public.org_departments;
CREATE POLICY "Admins can update departments" ON public.org_departments
  FOR UPDATE
  USING (is_admin());

-- Admins can delete departments
DROP POLICY IF EXISTS "Admins can delete departments" ON public.org_departments;
CREATE POLICY "Admins can delete departments" ON public.org_departments
  FOR DELETE
  USING (is_admin());

-- ==============================================================================
-- PART 7: HELPER FUNCTIONS FOR DEPENDENCY CHECKING
-- ==============================================================================

-- Function to check if a class can be deleted (not referenced by students)
CREATE OR REPLACE FUNCTION public.can_delete_class(class_value TEXT)
RETURNS BOOLEAN AS $
DECLARE
  student_count INTEGER;
BEGIN
  -- Check if any students reference this class
  SELECT COUNT(*)::INTEGER INTO student_count
  FROM public.students
  WHERE class_level = class_value;
  
  RETURN (student_count = 0);
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.can_delete_class IS 'Returns true if the class can be safely deleted (no students reference it)';

-- Function to check if a branch can be deleted (not referenced by students)
CREATE OR REPLACE FUNCTION public.can_delete_branch(branch_name TEXT)
RETURNS BOOLEAN AS $
DECLARE
  student_count INTEGER;
BEGIN
  -- Check if any students reference this branch
  SELECT COUNT(*)::INTEGER INTO student_count
  FROM public.students
  WHERE branch = branch_name;
  
  RETURN (student_count = 0);
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.can_delete_branch IS 'Returns true if the branch can be safely deleted (no students reference it)';

-- Function to check if a department can be deleted (not referenced by teachers)
CREATE OR REPLACE FUNCTION public.can_delete_department(department_name TEXT)
RETURNS BOOLEAN AS $
DECLARE
  teacher_count INTEGER;
BEGIN
  -- Check if any teachers reference this department
  SELECT COUNT(*)::INTEGER INTO teacher_count
  FROM public.teachers
  WHERE department = department_name;
  
  RETURN (teacher_count = 0);
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.can_delete_department IS 'Returns true if the department can be safely deleted (no teachers reference it)';

-- ==============================================================================
-- PART 8: SEED DATA FROM EXISTING CONSTANTS
-- ==============================================================================

-- Insert class levels from constants
INSERT INTO public.org_classes (name, value, display_order) VALUES
  ('Class 9', 'class_9', 1),
  ('Class 10', 'class_10', 2),
  ('Class 11', 'class_11', 3),
  ('Class 12', 'class_12', 4),
  ('Graduation Year 1', 'grad_year_1', 5),
  ('Graduation Year 2', 'grad_year_2', 6),
  ('Graduation Year 3', 'grad_year_3', 7),
  ('Graduation Year 4', 'grad_year_4', 8)
ON CONFLICT (name) DO NOTHING;

-- Insert branches (not associated with specific classes initially)
INSERT INTO public.org_branches (name, class_id, display_order) VALUES
  ('Computer Science', NULL, 1),
  ('Information Technology', NULL, 2),
  ('Electronics & Communication', NULL, 3),
  ('Mechanical Engineering', NULL, 4),
  ('Civil Engineering', NULL, 5),
  ('Electrical Engineering', NULL, 6),
  ('BBA', NULL, 7),
  ('BCA', NULL, 8),
  ('B.Com', NULL, 9),
  ('B.Sc', NULL, 10),
  ('Other', NULL, 11)
ON CONFLICT (name, class_id) DO NOTHING;

-- Insert departments
INSERT INTO public.org_departments (name, display_order) VALUES
  ('Computer Science', 1),
  ('Information Technology', 2),
  ('Electronics', 3),
  ('Electrical Engineering', 4),
  ('Mechanical Engineering', 5),
  ('Civil Engineering', 6),
  ('Mathematics', 7),
  ('Physics', 8),
  ('Chemistry', 9),
  ('Biology', 10),
  ('English', 11),
  ('History', 12),
  ('Commerce', 13),
  ('Economics', 14),
  ('Other', 15)
ON CONFLICT (name) DO NOTHING;

-- ==============================================================================
-- PART 9: GRANTS AND PERMISSIONS
-- ==============================================================================

-- Grant permissions on tables
GRANT SELECT ON public.org_classes TO authenticated;
GRANT SELECT ON public.org_branches TO authenticated;
GRANT SELECT ON public.org_departments TO authenticated;

-- Grant execute permissions on helper functions
GRANT EXECUTE ON FUNCTION public.can_delete_class(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_delete_branch(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_delete_department(TEXT) TO authenticated;

-- ==============================================================================
-- END OF MIGRATION
-- ==============================================================================

-- Migration completed successfully!
-- 
-- What this migration adds:
-- 1. ✅ org_classes table with proper constraints and indexes
-- 2. ✅ org_branches table with class_id foreign key
-- 3. ✅ org_departments table with proper constraints
-- 4. ✅ RLS policies for admin-only write access
-- 5. ✅ Indexes for performance optimization
-- 6. ✅ Helper functions for dependency checking
-- 7. ✅ Seed data from existing constants
-- 8. ✅ Updated_at triggers for automatic timestamp management
--
-- Next steps:
-- 1. Run this migration in your Supabase SQL Editor
-- 2. Implement OrganizationService in the application
-- 3. Create admin UI for managing organizational data
-- 4. Update forms to use database-driven dropdowns
