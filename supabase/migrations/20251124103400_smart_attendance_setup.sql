-- ============================================
-- SMART ATTENDANCE SYSTEM - DATABASE SETUP
-- Essential schema, functions, policies and seed data
-- ============================================

-- ============================================
-- TABLES
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CUSTOM TYPES (ENUMs)
CREATE TYPE user_role AS ENUM ('admin', 'teacher', 'student');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late');
CREATE TYPE assignment_status AS ENUM ('pending', 'submitted', 'graded');

-- CORE TABLES
-- USERS Table (Public Profiles linked to Auth)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

COMMENT ON TABLE public.users IS 'User profiles linked to Supabase auth.users';
COMMENT ON COLUMN public.users.id IS 'References auth.users.id';
COMMENT ON COLUMN public.users.role IS 'User role: admin, teacher, or student';

-- CLASSES Table
CREATE TABLE public.classes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

COMMENT ON TABLE public.classes IS 'Academic classes (e.g., Class 10-A)';

-- STUDENTS Table
CREATE TABLE public.students (
  id UUID REFERENCES public.users(id) PRIMARY KEY,
  enrollment_number TEXT UNIQUE NOT NULL,
  class_id UUID REFERENCES public.classes(id),
  face_encoding JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

COMMENT ON TABLE public.students IS 'Student-specific information';
COMMENT ON COLUMN public.students.face_encoding IS 'Stores facial recognition embedding data';

-- TEACHERS Table
CREATE TABLE public.teachers (
  id UUID REFERENCES public.users(id) PRIMARY KEY,
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

COMMENT ON TABLE public.teachers IS 'Teacher-specific information';

-- SUBJECTS Table
CREATE TABLE public.subjects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  teacher_id UUID REFERENCES public.teachers(id),
  class_id UUID REFERENCES public.classes(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

COMMENT ON TABLE public.subjects IS 'Academic subjects taught in classes';
COMMENT ON COLUMN public.subjects.class_id IS 'Optional: if subject is specific to a class';

-- OPERATIONAL TABLES
-- ATTENDANCE Table
CREATE TABLE public.attendance (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) NOT NULL,
  subject_id UUID REFERENCES public.subjects(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status attendance_status NOT NULL DEFAULT 'present',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  device_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

COMMENT ON TABLE public.attendance IS 'Student attendance records';
COMMENT ON COLUMN public.attendance.device_id IS 'ID of device used to mark attendance';

-- ASSIGNMENTS Table
CREATE TABLE public.assignments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  subject_id UUID REFERENCES public.subjects(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  max_score INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

COMMENT ON TABLE public.assignments IS 'Assignments created by teachers';

-- STUDENT ASSIGNMENTS Table (Submissions)
CREATE TABLE public.student_assignments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  assignment_id UUID REFERENCES public.assignments(id) NOT NULL,
  student_id UUID REFERENCES public.students(id) NOT NULL,
  score INTEGER,
  status assignment_status DEFAULT 'pending',
  submission_url TEXT,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  UNIQUE(assignment_id, student_id)
);

COMMENT ON TABLE public.student_assignments IS 'Student assignment submissions and grades';
COMMENT ON CONSTRAINT student_assignments_assignment_id_student_id_key ON public.student_assignments IS 'One submission per student per assignment';

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_assignments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PERMISSIONS AND GRANTS
-- ============================================

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to check if current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.is_admin() IS 'Returns true if the current authenticated user has admin role';

-- Function to check if current user is a teacher
CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'teacher'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.is_teacher() IS 'Returns true if the current authenticated user has teacher role';

-- Function to check if current user is a student
CREATE OR REPLACE FUNCTION public.is_student()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'student'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.is_student() IS 'Returns true if the current authenticated user has student role';

-- Function to get current user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role AS $$
BEGIN
  RETURN (
    SELECT role FROM public.users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_user_role() IS 'Returns the role of the current authenticated user';

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- USERS TABLE POLICIES
-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile on signup" ON public.users;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.users;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.users;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Users can insert their own profile during signup
CREATE POLICY "Users can insert own profile on signup" ON public.users
  FOR INSERT
  WITH CHECK (
    auth.uid() = id
  );

-- Admins can view all user profiles
CREATE POLICY "Admins can view all profiles" ON public.users
  FOR SELECT
  USING (is_admin());

-- Admins can update all user profiles
CREATE POLICY "Admins can update all profiles" ON public.users
  FOR UPDATE
  USING (is_admin());

-- Admins can delete user profiles
CREATE POLICY "Admins can delete profiles" ON public.users
  FOR DELETE
  USING (is_admin());

-- CLASSES TABLE POLICIES
-- All authenticated users can view classes
CREATE POLICY "Public view classes" ON public.classes
  FOR SELECT
  USING (true);

-- Admins can manage (insert, update, delete) classes
CREATE POLICY "Admins can manage classes" ON public.classes
  FOR ALL
  USING (is_admin());

-- STUDENTS TABLE POLICIES
-- Drop existing policies first
DROP POLICY IF EXISTS "Students can view own profile" ON public.students;
DROP POLICY IF EXISTS "Students can insert own profile" ON public.students;
DROP POLICY IF EXISTS "Teachers can view all students" ON public.students;
DROP POLICY IF EXISTS "Admins can manage students" ON public.students;

-- Students can view their own profile
CREATE POLICY "Students can view own profile" ON public.students
  FOR SELECT
  USING (auth.uid() = id);

-- Students can insert their own profile during signup
CREATE POLICY "Students can insert own profile" ON public.students
  FOR INSERT
  WITH CHECK (
    auth.uid() = id
  );

-- Teachers can view all student profiles
CREATE POLICY "Teachers can view all students" ON public.students
  FOR SELECT
  USING (is_teacher());

-- Admins can manage all student profiles
CREATE POLICY "Admins can manage students" ON public.students
  FOR ALL
  USING (is_admin());

-- TEACHERS TABLE POLICIES
-- Drop existing policies first
DROP POLICY IF EXISTS "Teachers can view own profile" ON public.teachers;
DROP POLICY IF EXISTS "Teachers can insert own profile" ON public.teachers;
DROP POLICY IF EXISTS "Admins can manage teachers" ON public.teachers;

-- Teachers can view their own profile
CREATE POLICY "Teachers can view own profile" ON public.teachers
  FOR SELECT
  USING (auth.uid() = id);

-- Teachers can insert their own profile during signup
CREATE POLICY "Teachers can insert own profile" ON public.teachers
  FOR INSERT
  WITH CHECK (
    auth.uid() = id
  );

-- Admins can manage all teacher profiles
CREATE POLICY "Admins can manage teachers" ON public.teachers
  FOR ALL
  USING (is_admin());

-- SUBJECTS TABLE POLICIES
-- All authenticated users can view subjects
CREATE POLICY "Authenticated users can view subjects" ON public.subjects
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Teachers can create subjects
CREATE POLICY "Teachers can create subjects" ON public.subjects
  FOR INSERT
  WITH CHECK (is_teacher());

-- Teachers can update their own subjects
CREATE POLICY "Teachers can update own subjects" ON public.subjects
  FOR UPDATE
  USING (teacher_id = auth.uid());

-- Admins can manage all subjects
CREATE POLICY "Admins can manage subjects" ON public.subjects
  FOR ALL
  USING (is_admin());

-- ATTENDANCE TABLE POLICIES
-- Students can view their own attendance
CREATE POLICY "Students view own attendance" ON public.attendance
  FOR SELECT
  USING (auth.uid() = student_id);

-- Teachers can view attendance for their subjects
CREATE POLICY "Teachers view subject attendance" ON public.attendance
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.subjects
      WHERE id = attendance.subject_id
      AND teacher_id = auth.uid()
    )
  );

-- Teachers can mark attendance for their subjects
CREATE POLICY "Teachers can mark attendance" ON public.attendance
  FOR INSERT
  WITH CHECK (is_teacher());

-- Teachers can update attendance for their subjects
CREATE POLICY "Teachers can update attendance" ON public.attendance
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.subjects
      WHERE id = attendance.subject_id
      AND teacher_id = auth.uid()
    )
  );

-- Admins can manage all attendance records
CREATE POLICY "Admins can manage attendance" ON public.attendance
  FOR ALL
  USING (is_admin());

-- ASSIGNMENTS TABLE POLICIES
-- All authenticated users can view assignments
CREATE POLICY "Students view assignments" ON public.assignments
  FOR SELECT
  USING (true);

-- Teachers can create assignments for their subjects
CREATE POLICY "Teachers create assignments" ON public.assignments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.subjects
      WHERE id = assignments.subject_id
      AND teacher_id = auth.uid()
    )
  );

-- Teachers can update their own assignments
CREATE POLICY "Teachers update own assignments" ON public.assignments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.subjects
      WHERE id = assignments.subject_id
      AND teacher_id = auth.uid()
    )
  );

-- Teachers can delete their own assignments
CREATE POLICY "Teachers delete own assignments" ON public.assignments
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.subjects
      WHERE id = assignments.subject_id
      AND teacher_id = auth.uid()
    )
  );

-- Admins can manage all assignments
CREATE POLICY "Admins can manage assignments" ON public.assignments
  FOR ALL
  USING (is_admin());

-- STUDENT ASSIGNMENTS TABLE POLICIES
-- Students can view their own submissions
CREATE POLICY "Students view own submissions" ON public.student_assignments
  FOR SELECT
  USING (auth.uid() = student_id);

-- Students can submit assignments
CREATE POLICY "Students can submit assignments" ON public.student_assignments
  FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Students can update their own pending submissions
CREATE POLICY "Students can update own pending submissions" ON public.student_assignments
  FOR UPDATE
  USING (auth.uid() = student_id AND status = 'pending');

-- Teachers can view submissions for their subjects
CREATE POLICY "Teachers view submissions for their subjects" ON public.student_assignments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.subjects
      WHERE id = (
        SELECT subject_id FROM public.assignments
        WHERE id = student_assignments.assignment_id
      )
      AND teacher_id = auth.uid()
    )
  );

-- Teachers can grade submissions for their subjects
CREATE POLICY "Teachers can grade submissions" ON public.student_assignments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.subjects
      WHERE id = (
        SELECT subject_id FROM public.assignments
        WHERE id = student_assignments.assignment_id
      )
      AND teacher_id = auth.uid()
    )
  );

-- Admins can manage all submissions
CREATE POLICY "Admins can manage submissions" ON public.student_assignments
  FOR ALL
  USING (is_admin());

-- ============================================
-- SEED DATA
-- ============================================

-- Insert sample classes
INSERT INTO public.classes (name, academic_year) VALUES 
  ('Class 10-A', '2024-2025'),
  ('Class 10-B', '2024-2025'),
  ('Class 11-A', '2024-2025'),
  ('Class 11-B', '2024-2025'),
  ('Class 12-A', '2024-2025'),
  ('Class 12-B', '2024-2025')
ON CONFLICT DO NOTHING;