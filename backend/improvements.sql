-- ==============================================================================
-- BACKEND IMPROVEMENTS & OPTIMIZATIONS
-- ==============================================================================
-- This file contains performance optimizations and missing constraints
-- identified in the backend analysis.
--
-- Run this after the initial database setup to add:
-- 1. Performance indexes
-- 2. Unique constraints for upsert operations
-- 3. CASCADE delete rules
-- 4. CHECK constraints for data validation
-- ==============================================================================

-- ==============================================================================
-- PERFORMANCE INDEXES
-- ==============================================================================
-- These indexes significantly improve query performance for common operations

-- Attendance queries (most frequently accessed)
CREATE INDEX IF NOT EXISTS idx_attendance_student_date 
ON attendance(student_id, date);

CREATE INDEX IF NOT EXISTS idx_attendance_subject 
ON attendance(subject_id);

-- Assignment queries
CREATE INDEX IF NOT EXISTS idx_assignments_subject 
ON assignments(subject_id);

CREATE INDEX IF NOT EXISTS idx_assignments_due_date 
ON assignments(due_date);

-- Student assignment queries
CREATE INDEX IF NOT EXISTS idx_student_assignments_student 
ON student_assignments(student_id);

CREATE INDEX IF NOT EXISTS idx_student_assignments_assignment 
ON student_assignments(assignment_id);

-- Student class lookups
CREATE INDEX IF NOT EXISTS idx_students_class 
ON students(class_id);

-- Note: teachers table doesn't have subject_id column
-- Subjects have teacher_id instead, so we index that
CREATE INDEX IF NOT EXISTS idx_subjects_teacher 
ON subjects(teacher_id);

-- Notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_read 
ON notifications(user_id, read);

CREATE INDEX IF NOT EXISTS idx_notifications_created 
ON notifications(created_at DESC);

-- ==============================================================================
-- UNIQUE CONSTRAINTS
-- ==============================================================================
-- Required for upsert operations (ON CONFLICT ... DO UPDATE)

-- Prevent duplicate attendance records for same student/subject/date
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'unique_attendance_record'
  ) THEN
    ALTER TABLE attendance ADD CONSTRAINT unique_attendance_record 
    UNIQUE (student_id, subject_id, date);
  END IF;
END $$;

-- Prevent duplicate student assignment submissions
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'unique_student_assignment'
  ) THEN
    ALTER TABLE student_assignments ADD CONSTRAINT unique_student_assignment 
    UNIQUE (student_id, assignment_id);
  END IF;
END $$;

-- ==============================================================================
-- CASCADE DELETE RULES
-- ==============================================================================
-- Ensure referential integrity when parent records are deleted

-- Drop existing foreign keys and recreate with CASCADE
-- Students table
ALTER TABLE students DROP CONSTRAINT IF EXISTS students_user_id_fkey;
ALTER TABLE students ADD CONSTRAINT students_user_id_fkey 
  FOREIGN KEY (id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE students DROP CONSTRAINT IF EXISTS students_class_id_fkey;
ALTER TABLE students ADD CONSTRAINT students_class_id_fkey 
  FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;

-- Teachers table
ALTER TABLE teachers DROP CONSTRAINT IF EXISTS teachers_user_id_fkey;
ALTER TABLE teachers ADD CONSTRAINT teachers_user_id_fkey 
  FOREIGN KEY (id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Note: teachers table doesn't have subject_id column, removing that constraint

-- Attendance table
ALTER TABLE attendance DROP CONSTRAINT IF EXISTS attendance_student_id_fkey;
ALTER TABLE attendance ADD CONSTRAINT attendance_student_id_fkey 
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;

ALTER TABLE attendance DROP CONSTRAINT IF EXISTS attendance_subject_id_fkey;
ALTER TABLE attendance ADD CONSTRAINT attendance_subject_id_fkey 
  FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE CASCADE;

-- Assignments table
ALTER TABLE assignments DROP CONSTRAINT IF EXISTS assignments_subject_id_fkey;
ALTER TABLE assignments ADD CONSTRAINT assignments_subject_id_fkey 
  FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE CASCADE;

-- Student assignments table
ALTER TABLE student_assignments DROP CONSTRAINT IF EXISTS student_assignments_student_id_fkey;
ALTER TABLE student_assignments ADD CONSTRAINT student_assignments_student_id_fkey 
  FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;

ALTER TABLE student_assignments DROP CONSTRAINT IF EXISTS student_assignments_assignment_id_fkey;
ALTER TABLE student_assignments ADD CONSTRAINT student_assignments_assignment_id_fkey 
  FOREIGN KEY (assignment_id) REFERENCES public.assignments(id) ON DELETE CASCADE;

-- ==============================================================================
-- CHECK CONSTRAINTS
-- ==============================================================================
-- Data validation at the database level

-- Attendance: status must be valid (add 'excused' to existing enum)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'valid_attendance_status'
  ) THEN
    ALTER TABLE attendance ADD CONSTRAINT valid_attendance_status 
    CHECK (status::text IN ('present', 'absent', 'late', 'excused'));
  END IF;
END $$;

-- Assignments: score validation
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'valid_score_range'
  ) THEN
    ALTER TABLE student_assignments ADD CONSTRAINT valid_score_range 
    CHECK (score IS NULL OR (score >= 0 AND score <= 100));
  END IF;
END $$;

-- Assignments: due date should be reasonable
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'reasonable_due_date'
  ) THEN
    ALTER TABLE assignments ADD CONSTRAINT reasonable_due_date 
    CHECK (due_date IS NULL OR due_date >= created_at);
  END IF;
END $$;

-- ==============================================================================
-- STORAGE BUCKET SETUP
-- ==============================================================================
-- Note: Storage buckets must be created via Supabase Dashboard first
-- Then run these policies to secure them

-- Create avatars bucket (run this via Dashboard or API):
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('avatars', 'avatars', true);

-- Storage policies for avatars bucket
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ==============================================================================
-- ADDITIONAL HELPER FUNCTIONS
-- ==============================================================================

-- Function to get student's class information
CREATE OR REPLACE FUNCTION get_student_class(student_user_id UUID)
RETURNS TABLE (
  class_id UUID,
  class_name TEXT,
  academic_year TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.name, c.academic_year
  FROM students s
  JOIN classes c ON s.class_id = c.id
  WHERE s.id = student_user_id;
END;
$$;

-- Function to calculate student's attendance percentage
CREATE OR REPLACE FUNCTION calculate_attendance_percentage(
  student_user_id UUID,
  start_date DATE DEFAULT NULL,
  end_date DATE DEFAULT NULL
)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_days INTEGER;
  present_days INTEGER;
BEGIN
  -- Get student ID
  SELECT COUNT(*) INTO total_days
  FROM attendance a
  JOIN students s ON a.student_id = s.id
  WHERE s.user_id = student_user_id
    AND (start_date IS NULL OR a.date >= start_date)
    AND (end_date IS NULL OR a.date <= end_date);
  
  IF total_days = 0 THEN
    RETURN 0;
  END IF;
  
  SELECT COUNT(*) INTO present_days
  FROM attendance a
  JOIN students s ON a.student_id = s.id
  WHERE s.user_id = student_user_id
    AND a.status = 'present'
    AND (start_date IS NULL OR a.date >= start_date)
    AND (end_date IS NULL OR a.date <= end_date);
  
  RETURN ROUND((present_days::NUMERIC / total_days::NUMERIC) * 100, 2);
END;
$$;

-- Function to get assignment statistics for a subject
CREATE OR REPLACE FUNCTION get_assignment_stats(subject_uuid UUID)
RETURNS TABLE (
  total_assignments BIGINT,
  avg_score NUMERIC,
  submission_rate NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT a.id) as total_assignments,
    ROUND(AVG(sa.score), 2) as avg_score,
    ROUND(
      (COUNT(sa.id)::NUMERIC / NULLIF(COUNT(DISTINCT a.id), 0)::NUMERIC) * 100, 
      2
    ) as submission_rate
  FROM assignments a
  LEFT JOIN student_assignments sa ON a.id = sa.assignment_id
  WHERE a.subject_id = subject_uuid;
END;
$$;

-- ==============================================================================
-- MAINTENANCE FUNCTIONS
-- ==============================================================================

-- Function to clean up old notifications (run periodically)
CREATE OR REPLACE FUNCTION cleanup_old_notifications(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM notifications
  WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL
    AND read = true;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- ==============================================================================
-- VERIFICATION QUERIES
-- ==============================================================================
-- Run these to verify improvements were applied successfully

-- Check indexes
-- SELECT schemaname, tablename, indexname 
-- FROM pg_indexes 
-- WHERE schemaname = 'public' 
-- ORDER BY tablename, indexname;

-- Check constraints
-- SELECT conname, contype, conrelid::regclass 
-- FROM pg_constraint 
-- WHERE connamespace = 'public'::regnamespace 
-- ORDER BY conrelid::regclass::text;

-- Check foreign key actions
-- SELECT 
--   tc.table_name, 
--   kcu.column_name,
--   ccu.table_name AS foreign_table_name,
--   ccu.column_name AS foreign_column_name,
--   rc.delete_rule
-- FROM information_schema.table_constraints AS tc 
-- JOIN information_schema.key_column_usage AS kcu
--   ON tc.constraint_name = kcu.constraint_name
-- JOIN information_schema.constraint_column_usage AS ccu
--   ON ccu.constraint_name = tc.constraint_name
-- JOIN information_schema.referential_constraints AS rc
--   ON rc.constraint_name = tc.constraint_name
-- WHERE tc.constraint_type = 'FOREIGN KEY'
-- ORDER BY tc.table_name;

-- ==============================================================================
-- NOTES
-- ==============================================================================
-- 1. Run this file AFTER database_setup_final.sql
-- 2. Some constraints may fail if data already exists that violates them
-- 3. Storage bucket must be created via Dashboard before applying policies
-- 4. Consider running cleanup_old_notifications() monthly via a cron job
-- ==============================================================================
