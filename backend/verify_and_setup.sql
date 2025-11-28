-- ==============================================================================
-- BACKEND VERIFICATION & SETUP SCRIPT
-- ==============================================================================
-- This script ensures the entire backend schema is correctly set up.
-- It is idempotent: it can be run multiple times without breaking existing data.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- Required for gen_salt

-- 2. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'teacher', 'student');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE assignment_status AS ENUM ('pending', 'submitted', 'graded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. TABLES (Create if not exists)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.classes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.students (
  id UUID REFERENCES public.users(id) PRIMARY KEY,
  enrollment_number TEXT UNIQUE NOT NULL,
  class_id UUID REFERENCES public.classes(id),
  branch TEXT,
  class_level TEXT,
  face_encoding JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.teachers (
  id UUID REFERENCES public.users(id) PRIMARY KEY,
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  teacher_id UUID REFERENCES public.teachers(id),
  class_id UUID REFERENCES public.classes(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) NOT NULL,
  subject_id UUID REFERENCES public.subjects(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status attendance_status NOT NULL DEFAULT 'present',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  device_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  subject_id UUID REFERENCES public.subjects(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  max_score INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.student_assignments (
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

-- 4. FUNCTIONS

-- Helper functions
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'teacher'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_student()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'student'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role AS $$
BEGIN
  RETURN (
    SELECT role FROM public.users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'student')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin password reset function
CREATE OR REPLACE FUNCTION public.reset_user_password(
  target_user_id UUID,
  new_password TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_role TEXT;
BEGIN
  -- Check if current user is admin
  SELECT role INTO current_user_role
  FROM public.users
  WHERE id = auth.uid();
  
  IF current_user_role != 'admin' THEN
    RAISE EXCEPTION 'Only admins can reset passwords';
  END IF;
  
  -- Update password in auth.users
  UPDATE auth.users
  SET 
    encrypted_password = crypt(new_password, gen_salt('bf')),
    updated_at = NOW()
  WHERE id = target_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Password reset successfully'
  );
END;
$$;

-- Grant execute permission on reset_user_password
GRANT EXECUTE ON FUNCTION public.reset_user_password(UUID, TEXT) TO authenticated;

-- 5. TRIGGERS

-- Re-create the auth trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. RLS POLICIES (Enable and Refresh)

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_assignments ENABLE ROW LEVEL SECURITY;

-- Refresh Policies (Drop and Recreate to ensure correctness)

-- Users
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile on signup" ON public.users;
CREATE POLICY "Users can insert own profile on signup" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.users;
CREATE POLICY "Admins can view all profiles" ON public.users FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.users;
CREATE POLICY "Admins can update all profiles" ON public.users FOR UPDATE USING (is_admin());

DROP POLICY IF EXISTS "Admins can delete profiles" ON public.users;
CREATE POLICY "Admins can delete profiles" ON public.users FOR DELETE USING (is_admin());

-- Classes
DROP POLICY IF EXISTS "Public view classes" ON public.classes;
CREATE POLICY "Public view classes" ON public.classes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage classes" ON public.classes;
CREATE POLICY "Admins can manage classes" ON public.classes FOR ALL USING (is_admin());

-- Students
DROP POLICY IF EXISTS "Students can view own profile" ON public.students;
CREATE POLICY "Students can view own profile" ON public.students FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Teachers can view all students" ON public.students;
CREATE POLICY "Teachers can view all students" ON public.students FOR SELECT USING (is_teacher());

DROP POLICY IF EXISTS "Admins can manage students" ON public.students;
CREATE POLICY "Admins can manage students" ON public.students FOR ALL USING (is_admin());

-- Teachers
DROP POLICY IF EXISTS "Teachers can view own profile" ON public.teachers;
CREATE POLICY "Teachers can view own profile" ON public.teachers FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can manage teachers" ON public.teachers;
CREATE POLICY "Admins can manage teachers" ON public.teachers FOR ALL USING (is_admin());

-- Subjects
DROP POLICY IF EXISTS "Authenticated users can view subjects" ON public.subjects;
CREATE POLICY "Authenticated users can view subjects" ON public.subjects FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Teachers can create subjects" ON public.subjects;
CREATE POLICY "Teachers can create subjects" ON public.subjects FOR INSERT WITH CHECK (is_teacher());

DROP POLICY IF EXISTS "Teachers can update own subjects" ON public.subjects;
CREATE POLICY "Teachers can update own subjects" ON public.subjects FOR UPDATE USING (teacher_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage subjects" ON public.subjects;
CREATE POLICY "Admins can manage subjects" ON public.subjects FOR ALL USING (is_admin());

-- Attendance
DROP POLICY IF EXISTS "Students view own attendance" ON public.attendance;
CREATE POLICY "Students view own attendance" ON public.attendance FOR SELECT USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Teachers view subject attendance" ON public.attendance;
CREATE POLICY "Teachers view subject attendance" ON public.attendance FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.subjects WHERE id = attendance.subject_id AND teacher_id = auth.uid())
);

DROP POLICY IF EXISTS "Teachers can mark attendance" ON public.attendance;
CREATE POLICY "Teachers can mark attendance" ON public.attendance FOR INSERT WITH CHECK (is_teacher());

DROP POLICY IF EXISTS "Teachers can update attendance" ON public.attendance;
CREATE POLICY "Teachers can update attendance" ON public.attendance FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.subjects WHERE id = attendance.subject_id AND teacher_id = auth.uid())
);

DROP POLICY IF EXISTS "Admins can manage attendance" ON public.attendance;
CREATE POLICY "Admins can manage attendance" ON public.attendance FOR ALL USING (is_admin());

-- Assignments
DROP POLICY IF EXISTS "Students view assignments" ON public.assignments;
CREATE POLICY "Students view assignments" ON public.assignments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Teachers create assignments" ON public.assignments;
CREATE POLICY "Teachers create assignments" ON public.assignments FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.subjects WHERE id = assignments.subject_id AND teacher_id = auth.uid())
);

DROP POLICY IF EXISTS "Teachers update own assignments" ON public.assignments;
CREATE POLICY "Teachers update own assignments" ON public.assignments FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.subjects WHERE id = assignments.subject_id AND teacher_id = auth.uid())
);

DROP POLICY IF EXISTS "Teachers delete own assignments" ON public.assignments;
CREATE POLICY "Teachers delete own assignments" ON public.assignments FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.subjects WHERE id = assignments.subject_id AND teacher_id = auth.uid())
);

DROP POLICY IF EXISTS "Admins can manage assignments" ON public.assignments;
CREATE POLICY "Admins can manage assignments" ON public.assignments FOR ALL USING (is_admin());

-- Student Assignments
DROP POLICY IF EXISTS "Students view own submissions" ON public.student_assignments;
CREATE POLICY "Students view own submissions" ON public.student_assignments FOR SELECT USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can submit assignments" ON public.student_assignments;
CREATE POLICY "Students can submit assignments" ON public.student_assignments FOR INSERT WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can update own pending submissions" ON public.student_assignments;
CREATE POLICY "Students can update own pending submissions" ON public.student_assignments FOR UPDATE USING (auth.uid() = student_id AND status = 'pending');

DROP POLICY IF EXISTS "Teachers view submissions for their subjects" ON public.student_assignments;
CREATE POLICY "Teachers view submissions for their subjects" ON public.student_assignments FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.subjects WHERE id = (SELECT subject_id FROM public.assignments WHERE id = student_assignments.assignment_id) AND teacher_id = auth.uid())
);

DROP POLICY IF EXISTS "Teachers can grade submissions" ON public.student_assignments;
CREATE POLICY "Teachers can grade submissions" ON public.student_assignments FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.subjects WHERE id = (SELECT subject_id FROM public.assignments WHERE id = student_assignments.assignment_id) AND teacher_id = auth.uid())
);

DROP POLICY IF EXISTS "Admins can manage submissions" ON public.student_assignments;
CREATE POLICY "Admins can manage submissions" ON public.student_assignments FOR ALL USING (is_admin());

-- 7. PERMISSIONS
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated;

-- 8. OUTPUT
SELECT 'Backend verification and setup completed successfully.' as status;
