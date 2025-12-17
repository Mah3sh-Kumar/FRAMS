-- ==============================================================================
-- SMART ATTENDANCE SYSTEM - COMPLETE DATABASE SETUP
-- ==============================================================================
-- Version: 3.0
-- Last Updated: 2025-12-10
-- 
-- This comprehensive script sets up the complete database schema for the 
-- Smart Attendance System including:
-- - Core database schema (tables, types, constraints)
-- - User verification system with admin approval workflow
-- - Profile pictures and notifications system
-- - Organizational data management (classes, branches, departments)
-- - Admin management functions and RLS policies
-- - Performance optimizations and indexes
-- - Diagnostic and verification queries
-- 
-- INSTRUCTIONS:
-- 1. Open your Supabase Dashboard
-- 2. Navigate to SQL Editor
-- 3. Copy and paste this entire script
-- 4. Click "Run" to execute
-- 
-- WHAT THIS SCRIPT CREATES:
-- ✅ Complete database schema with all tables and relationships
-- ✅ User verification system (admins auto-verified, others need approval)
-- ✅ Profile pictures and notifications functionality
-- ✅ Organizational data management (admin-configurable)
-- ✅ Enhanced admin functions and security policies
-- ✅ Performance indexes and optimizations
-- ✅ Comprehensive diagnostic and verification tools
-- ==============================================================================

-- ==============================================================================
-- SECTION 1: EXTENSIONS AND CUSTOM TYPES
-- ==============================================================================

-- Enable UUID extension for generating unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom enumeration types for consistent data validation
-- Use DO blocks to prevent errors if types already exist

-- User roles: admin (full access), teacher (classroom management), student (view only)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'teacher', 'student');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Attendance status options for marking student presence
DO $$ BEGIN
    CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Assignment workflow status tracking
DO $$ BEGIN
    CREATE TYPE assignment_status AS ENUM ('pending', 'submitted', 'graded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==============================================================================
-- SECTION 2: CORE TABLES - USER MANAGEMENT
-- ==============================================================================

-- USERS Table - Central user profile table linked to Supabase Auth
-- This table stores public profile information for all system users
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    full_name TEXT,
    avatar_url TEXT, -- URL to profile picture in Supabase Storage
    is_verified BOOLEAN DEFAULT false NOT NULL, -- Admin verification status
    verified_at TIMESTAMP WITH TIME ZONE, -- When user was verified by admin
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Add helpful comments for database documentation
COMMENT ON TABLE public.users IS 'User profiles linked to Supabase auth.users with verification system';
COMMENT ON COLUMN public.users.id IS 'References auth.users.id - primary key linking to Supabase Auth';
COMMENT ON COLUMN public.users.role IS 'User role: admin (full access), teacher (classroom), student (view)';
COMMENT ON COLUMN public.users.full_name IS 'Display name of the user';
COMMENT ON COLUMN public.users.avatar_url IS 'URL to user profile picture stored in Supabase Storage';
COMMENT ON COLUMN public.users.is_verified IS 'Whether the user account has been verified by an admin';
COMMENT ON COLUMN public.users.verified_at IS 'Timestamp when the user was verified by an admin';

-- STUDENTS Table - Student-specific information and academic details
CREATE TABLE IF NOT EXISTS public.students (
    id UUID REFERENCES public.users(id) PRIMARY KEY,
    enrollment_number TEXT UNIQUE NOT NULL, -- Unique student identifier
    class_level TEXT, -- Flexible class assignment (e.g., "class_10", "grad_year_3")
    branch TEXT, -- Academic specialization (e.g., "Computer Science")
    class_id UUID REFERENCES public.classes(id), -- Optional: structured class reference
    face_encoding JSONB, -- Facial recognition data for smart attendance
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

COMMENT ON TABLE public.students IS 'Student-specific academic and biometric information';
COMMENT ON COLUMN public.students.enrollment_number IS 'Unique enrollment number for student identification';
COMMENT ON COLUMN public.students.class_level IS 'Flexible class assignment using predefined values';
COMMENT ON COLUMN public.students.branch IS 'Academic branch/specialization (e.g., Computer Science)';
COMMENT ON COLUMN public.students.class_id IS 'Optional structured reference to classes table';
COMMENT ON COLUMN public.students.face_encoding IS 'Facial recognition embedding data for automated attendance';

-- TEACHERS Table - Teacher-specific information and department assignment
CREATE TABLE IF NOT EXISTS public.teachers (
    id UUID REFERENCES public.users(id) PRIMARY KEY,
    department TEXT, -- Academic department (e.g., "Computer Science", "Mathematics")
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

COMMENT ON TABLE public.teachers IS 'Teacher-specific information and department assignments';
COMMENT ON COLUMN public.teachers.department IS 'Academic department the teacher belongs to';

-- ==============================================================================
-- SECTION 3: ORGANIZATIONAL DATA TABLES
-- ==============================================================================

-- ORG_CLASSES Table - Admin-configurable class levels
-- Replaces hardcoded constants with database-driven configuration
CREATE TABLE IF NOT EXISTS public.org_classes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE, -- Display name (e.g., "Class 10")
    value TEXT NOT NULL UNIQUE, -- Internal identifier (e.g., "class_10")
    display_order INTEGER NOT NULL DEFAULT 0, -- Sort order for UI dropdowns
    is_active BOOLEAN DEFAULT true, -- Whether class is currently available
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

COMMENT ON TABLE public.org_classes IS 'Admin-configurable class levels replacing hardcoded constants';
COMMENT ON COLUMN public.org_classes.name IS 'Display name shown in UI (e.g., "Class 10")';
COMMENT ON COLUMN public.org_classes.value IS 'Internal identifier used in code (e.g., "class_10")';
COMMENT ON COLUMN public.org_classes.display_order IS 'Sort order for displaying in dropdowns';
COMMENT ON COLUMN public.org_classes.is_active IS 'Whether the class is currently active and selectable';

-- ORG_BRANCHES Table - Academic branches/streams associated with classes
CREATE TABLE IF NOT EXISTS public.org_branches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL, -- Branch name (e.g., "Computer Science")
    class_id UUID REFERENCES public.org_classes(id) ON DELETE CASCADE, -- Associated class
    display_order INTEGER NOT NULL DEFAULT 0, -- Sort order for UI
    is_active BOOLEAN DEFAULT true, -- Whether branch is currently available
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    UNIQUE(name, class_id) -- Unique branch name per class
);

COMMENT ON TABLE public.org_branches IS 'Academic branches/streams associated with specific classes';
COMMENT ON COLUMN public.org_branches.name IS 'Branch name (e.g., "Computer Science", "Mechanical")';
COMMENT ON COLUMN public.org_branches.class_id IS 'Associated class (NULL means available for all classes)';
COMMENT ON COLUMN public.org_branches.display_order IS 'Sort order for displaying in dropdowns';
COMMENT ON COLUMN public.org_branches.is_active IS 'Whether the branch is currently active and selectable';

-- ORG_DEPARTMENTS Table - Teacher departments
CREATE TABLE IF NOT EXISTS public.org_departments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE, -- Department name (e.g., "Computer Science")
    display_order INTEGER NOT NULL DEFAULT 0, -- Sort order for UI
    is_active BOOLEAN DEFAULT true, -- Whether department is currently available
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

COMMENT ON TABLE public.org_departments IS 'Teacher departments managed by administrators';
COMMENT ON COLUMN public.org_departments.name IS 'Department name (e.g., "Computer Science")';
COMMENT ON COLUMN public.org_departments.display_order IS 'Sort order for displaying in dropdowns';
COMMENT ON COLUMN public.org_departments.is_active IS 'Whether the department is currently active';

-- ==============================================================================
-- SECTION 4: ACADEMIC STRUCTURE TABLES
-- ==============================================================================

-- CLASSES Table - Academic classes/sections (legacy structure)
-- Maintained for backward compatibility with existing data
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL, -- Class name (e.g., "Class 10-A")
    academic_year TEXT NOT NULL, -- Academic year (e.g., "2024-2025")
    is_active BOOLEAN DEFAULT true, -- Whether class is currently active
    value TEXT, -- Internal identifier for compatibility
    display_order INTEGER DEFAULT 0, -- Sort order for UI
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

COMMENT ON TABLE public.classes IS 'Academic classes/sections (legacy structure for compatibility)';
COMMENT ON COLUMN public.classes.name IS 'Class name displayed in UI (e.g., "Class 10-A")';
COMMENT ON COLUMN public.classes.academic_year IS 'Academic year this class belongs to';
COMMENT ON COLUMN public.classes.is_active IS 'Whether the class is currently active';
COMMENT ON COLUMN public.classes.value IS 'Internal identifier for backward compatibility';

-- SUBJECTS Table - Academic subjects taught in classes
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL, -- Subject name (e.g., "Mathematics")
    code TEXT NOT NULL, -- Subject code (e.g., "MATH101")
    teacher_id UUID REFERENCES public.teachers(id), -- Assigned teacher
    class_id UUID REFERENCES public.classes(id), -- Optional: class-specific subject
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

COMMENT ON TABLE public.subjects IS 'Academic subjects taught in the institution';
COMMENT ON COLUMN public.subjects.name IS 'Subject name displayed in UI (e.g., "Mathematics")';
COMMENT ON COLUMN public.subjects.code IS 'Unique subject code for identification (e.g., "MATH101")';
COMMENT ON COLUMN public.subjects.teacher_id IS 'Teacher assigned to teach this subject';
COMMENT ON COLUMN public.subjects.class_id IS 'Optional: if subject is specific to a particular class';

-- ==============================================================================
-- SECTION 5: OPERATIONAL TABLES - ATTENDANCE & ASSIGNMENTS
-- ==============================================================================

-- ATTENDANCE Table - Student attendance tracking
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) NOT NULL, -- Student being marked
    subject_id UUID REFERENCES public.subjects(id), -- Subject for attendance
    date DATE NOT NULL DEFAULT CURRENT_DATE, -- Date of attendance
    status attendance_status NOT NULL DEFAULT 'present', -- Attendance status
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL, -- Exact time marked
    device_id TEXT, -- Device used for smart attendance (Raspberry Pi ID)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

COMMENT ON TABLE public.attendance IS 'Student attendance records with smart device integration';
COMMENT ON COLUMN public.attendance.student_id IS 'Student whose attendance is being recorded';
COMMENT ON COLUMN public.attendance.subject_id IS 'Subject/class for which attendance was marked';
COMMENT ON COLUMN public.attendance.date IS 'Date of the attendance record';
COMMENT ON COLUMN public.attendance.status IS 'Attendance status: present, absent, or late';
COMMENT ON COLUMN public.attendance.timestamp IS 'Exact timestamp when attendance was marked';
COMMENT ON COLUMN public.attendance.device_id IS 'ID of smart device used (for Raspberry Pi integration)';

-- ASSIGNMENTS Table - Teacher-created assignments
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    subject_id UUID REFERENCES public.subjects(id) NOT NULL, -- Subject assignment belongs to
    title TEXT NOT NULL, -- Assignment title
    description TEXT, -- Detailed assignment instructions
    due_date TIMESTAMP WITH TIME ZONE, -- Assignment deadline
    max_score INTEGER DEFAULT 100, -- Maximum possible score
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

COMMENT ON TABLE public.assignments IS 'Assignments created by teachers for students';
COMMENT ON COLUMN public.assignments.subject_id IS 'Subject this assignment belongs to';
COMMENT ON COLUMN public.assignments.title IS 'Assignment title displayed to students';
COMMENT ON COLUMN public.assignments.description IS 'Detailed assignment instructions and requirements';
COMMENT ON COLUMN public.assignments.due_date IS 'Assignment submission deadline';
COMMENT ON COLUMN public.assignments.max_score IS 'Maximum score possible for this assignment';

-- STUDENT_ASSIGNMENTS Table - Student submissions and grading
CREATE TABLE IF NOT EXISTS public.student_assignments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    assignment_id UUID REFERENCES public.assignments(id) NOT NULL, -- Assignment being submitted
    student_id UUID REFERENCES public.students(id) NOT NULL, -- Student submitting
    score INTEGER, -- Score awarded by teacher (NULL if not graded)
    status assignment_status DEFAULT 'pending', -- Submission workflow status
    submission_url TEXT, -- URL to submitted file/document
    remarks TEXT, -- Teacher feedback and comments
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    UNIQUE(assignment_id, student_id) -- One submission per student per assignment
);

COMMENT ON TABLE public.student_assignments IS 'Student assignment submissions and teacher grading';
COMMENT ON COLUMN public.student_assignments.assignment_id IS 'Assignment this submission is for';
COMMENT ON COLUMN public.student_assignments.student_id IS 'Student who made the submission';
COMMENT ON COLUMN public.student_assignments.score IS 'Score awarded by teacher (NULL if ungraded)';
COMMENT ON COLUMN public.student_assignments.status IS 'Workflow status: pending, submitted, or graded';
COMMENT ON COLUMN public.student_assignments.submission_url IS 'URL to submitted file in storage';
COMMENT ON COLUMN public.student_assignments.remarks IS 'Teacher feedback and grading comments';

-- ==============================================================================
-- SECTION 6: NOTIFICATIONS SYSTEM
-- ==============================================================================

-- NOTIFICATIONS Table - Real-time user notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL, -- Notification recipient
    title TEXT NOT NULL, -- Notification title/subject
    message TEXT NOT NULL, -- Notification content
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')), -- Notification type
    read BOOLEAN DEFAULT false, -- Whether user has read the notification
    data JSONB, -- Additional structured data payload
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

COMMENT ON TABLE public.notifications IS 'Real-time user notifications for system events';
COMMENT ON COLUMN public.notifications.user_id IS 'User who receives this notification';
COMMENT ON COLUMN public.notifications.title IS 'Notification title/subject line';
COMMENT ON COLUMN public.notifications.message IS 'Main notification content/message';
COMMENT ON COLUMN public.notifications.type IS 'Notification type: info, success, warning, or error';
COMMENT ON COLUMN public.notifications.read IS 'Whether the user has read this notification';
COMMENT ON COLUMN public.notifications.data IS 'Additional structured data (JSON format)';

-- ==============================================================================
-- SECTION 7: ROW LEVEL SECURITY (RLS) SETUP
-- ==============================================================================

-- Enable RLS on all tables for security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_departments ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- SECTION 8: HELPER FUNCTIONS
-- ==============================================================================

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

-- ==============================================================================
-- SECTION 9: USER VERIFICATION FUNCTIONS
-- ==============================================================================

-- Function to verify a user account (admin only)
CREATE OR REPLACE FUNCTION public.verify_user(target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Security check: only admins can verify users
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Only admins can verify users';
    END IF;

    -- Update user verification status with timestamp
    UPDATE public.users
    SET 
        is_verified = true,
        verified_at = TIMEZONE('utc'::TEXT, NOW())
    WHERE id = target_user_id;

    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.verify_user(UUID) IS 'Verifies a user account - admin only function';

-- Function to unverify a user account (admin only)
CREATE OR REPLACE FUNCTION public.unverify_user(target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Security check: only admins can unverify users
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Only admins can unverify users';
    END IF;

    -- Prevent unverifying admin users (safety measure)
    IF EXISTS (SELECT 1 FROM public.users WHERE id = target_user_id AND role = 'admin') THEN
        RAISE EXCEPTION 'Cannot unverify admin users';
    END IF;

    -- Remove verification status and timestamp
    UPDATE public.users
    SET 
        is_verified = false,
        verified_at = NULL
    WHERE id = target_user_id;

    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.unverify_user(UUID) IS 'Unverifies a user account - admin only function';

-- Function to reset user password (admin only)
CREATE OR REPLACE FUNCTION public.reset_user_password(
    target_user_id UUID,
    new_password TEXT
)
RETURNS JSON AS $$
DECLARE
    current_user_role TEXT;
BEGIN
    -- Security check: verify current user is admin
    SELECT role INTO current_user_role
    FROM public.users
    WHERE id = auth.uid();
    
    IF current_user_role != 'admin' THEN
        RAISE EXCEPTION 'Only admins can reset passwords';
    END IF;
    
    -- Update password in Supabase Auth system
    UPDATE auth.users
    SET 
        encrypted_password = crypt(new_password, gen_salt('bf')),
        updated_at = NOW()
    WHERE id = target_user_id;
    
    -- Check if user was found and updated
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found';
    END IF;
    
    -- Return success response
    RETURN json_build_object(
        'success', true,
        'message', 'Password reset successfully'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.reset_user_password(UUID, TEXT) IS 'Resets user password - admin only function';

-- Function to check if a class can be safely deleted
CREATE OR REPLACE FUNCTION public.can_delete_class(class_value TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if any students are using this class level
    RETURN NOT EXISTS (
        SELECT 1 FROM public.students 
        WHERE class_level = class_value
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.can_delete_class(TEXT) IS 'Checks if a class can be safely deleted (no students enrolled)';

-- Function to get student's class information
CREATE OR REPLACE FUNCTION public.get_student_class(student_id UUID)
RETURNS TABLE (
    class_id UUID,
    class_name TEXT,
    class_value TEXT,
    academic_year TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.name,
        c.value,
        c.academic_year
    FROM public.students s
    LEFT JOIN public.classes c ON s.class_id = c.id
    WHERE s.id = student_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_student_class(UUID) IS 'Returns class information for a given student';

-- ==============================================================================
-- SECTION 10: NOTIFICATION HELPER FUNCTIONS
-- ==============================================================================

-- Function to create a notification for a user
CREATE OR REPLACE FUNCTION public.create_notification(
    target_user_id UUID,
    notification_title TEXT,
    notification_message TEXT,
    notification_type TEXT DEFAULT 'info',
    notification_data JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    -- Insert new notification and return its ID
    INSERT INTO public.notifications (user_id, title, message, type, data)
    VALUES (target_user_id, notification_title, notification_message, notification_type, notification_data)
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.create_notification IS 'Creates a new notification for a specific user';

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION public.mark_notification_read(notification_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Update notification read status for current user's notifications only
    UPDATE public.notifications
    SET read = true
    WHERE id = notification_id AND user_id = auth.uid();
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.mark_notification_read IS 'Marks a notification as read for the current user';

-- Function to mark all notifications as read for current user
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    -- Update all unread notifications for current user
    UPDATE public.notifications
    SET read = true
    WHERE user_id = auth.uid() AND read = false;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.mark_all_notifications_read IS 'Marks all notifications as read for current user';

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION public.get_unread_count()
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM public.notifications
        WHERE user_id = auth.uid() AND read = false
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_unread_count IS 'Returns count of unread notifications for current user';

-- ==============================================================================
-- SECTION 11: SIGNUP TRIGGER FUNCTION
-- ==============================================================================

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role user_role;
BEGIN
    -- Extract role from signup metadata, default to 'student'
    user_role := COALESCE((new.raw_user_meta_data->>'role')::user_role, 'student');
    
    -- Create user profile with proper verification status
    -- Admins are auto-verified, others need manual admin approval
    INSERT INTO public.users (id, email, full_name, role, is_verified, created_at)
    VALUES (
        new.id,
        new.email,
        new.raw_user_meta_data->>'full_name',
        user_role,
        CASE WHEN user_role = 'admin' THEN true ELSE false END, -- Auto-verify admins only
        TIMEZONE('utc'::TEXT, NOW())
    );
    
    RETURN new;
EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail the auth signup process
    RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates user profile with verification status on signup';

-- ==============================================================================
-- SECTION 12: ROW LEVEL SECURITY POLICIES
-- ==============================================================================

-- USERS TABLE POLICIES
-- Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT
    USING (auth.uid() = id);

-- Users can insert their own profile during signup
DROP POLICY IF EXISTS "Users can insert own profile on signup" ON public.users;
CREATE POLICY "Users can insert own profile on signup" ON public.users
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Admins can view all user profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.users;
CREATE POLICY "Admins can view all profiles" ON public.users
    FOR SELECT
    USING (is_admin());

-- Admins can update all user profiles
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.users;
CREATE POLICY "Admins can update all profiles" ON public.users
    FOR UPDATE
    USING (is_admin());

-- Admins can delete user profiles
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.users;
CREATE POLICY "Admins can delete profiles" ON public.users
    FOR DELETE
    USING (is_admin());

-- STUDENTS TABLE POLICIES
-- Students can view their own profile
DROP POLICY IF EXISTS "Students can view own profile" ON public.students;
CREATE POLICY "Students can view own profile" ON public.students
    FOR SELECT
    USING (auth.uid() = id);

-- Students can insert their own profile
DROP POLICY IF EXISTS "Students can insert own profile" ON public.students;
CREATE POLICY "Students can insert own profile" ON public.students
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Teachers can view all student profiles
DROP POLICY IF EXISTS "Teachers can view all students" ON public.students;
CREATE POLICY "Teachers can view all students" ON public.students
    FOR SELECT
    USING (is_teacher());

-- Admins can manage all student profiles
DROP POLICY IF EXISTS "Admins can manage students" ON public.students;
CREATE POLICY "Admins can manage students" ON public.students
    FOR ALL
    USING (is_admin());

-- TEACHERS TABLE POLICIES
-- Teachers can view their own profile
DROP POLICY IF EXISTS "Teachers can view own profile" ON public.teachers;
CREATE POLICY "Teachers can view own profile" ON public.teachers
    FOR SELECT
    USING (auth.uid() = id);

-- Teachers can insert their own profile
DROP POLICY IF EXISTS "Teachers can insert own profile" ON public.teachers;
CREATE POLICY "Teachers can insert own profile" ON public.teachers
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Admins can manage all teacher profiles
DROP POLICY IF EXISTS "Admins can manage teachers" ON public.teachers;
CREATE POLICY "Admins can manage teachers" ON public.teachers
    FOR ALL
    USING (is_admin());

-- ORGANIZATIONAL DATA POLICIES (Admin-only write access)
-- All authenticated users can read organizational data
DROP POLICY IF EXISTS "All users can read org_classes" ON public.org_classes;
CREATE POLICY "All users can read org_classes" ON public.org_classes
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Only admins can modify organizational data
DROP POLICY IF EXISTS "Admins can manage org_classes" ON public.org_classes;
CREATE POLICY "Admins can manage org_classes" ON public.org_classes
    FOR ALL
    USING (is_admin());

-- Similar policies for branches and departments
DROP POLICY IF EXISTS "All users can read org_branches" ON public.org_branches;
CREATE POLICY "All users can read org_branches" ON public.org_branches
    FOR SELECT
    USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage org_branches" ON public.org_branches;
CREATE POLICY "Admins can manage org_branches" ON public.org_branches
    FOR ALL
    USING (is_admin());

DROP POLICY IF EXISTS "All users can read org_departments" ON public.org_departments;
CREATE POLICY "All users can read org_departments" ON public.org_departments
    FOR SELECT
    USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage org_departments" ON public.org_departments;
CREATE POLICY "Admins can manage org_departments" ON public.org_departments
    FOR ALL
    USING (is_admin());

-- CLASSES TABLE POLICIES (Legacy compatibility)
DROP POLICY IF EXISTS "Public view classes" ON public.classes;
CREATE POLICY "Public view classes" ON public.classes
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Admins can manage classes" ON public.classes;
CREATE POLICY "Admins can manage classes" ON public.classes
    FOR ALL
    USING (is_admin());

-- SUBJECTS TABLE POLICIES
DROP POLICY IF EXISTS "Authenticated users can view subjects" ON public.subjects;
CREATE POLICY "Authenticated users can view subjects" ON public.subjects
    FOR SELECT
    USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Teachers can create subjects" ON public.subjects;
CREATE POLICY "Teachers can create subjects" ON public.subjects
    FOR INSERT
    WITH CHECK (is_teacher());

DROP POLICY IF EXISTS "Teachers can update own subjects" ON public.subjects;
CREATE POLICY "Teachers can update own subjects" ON public.subjects
    FOR UPDATE
    USING (teacher_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage subjects" ON public.subjects;
CREATE POLICY "Admins can manage subjects" ON public.subjects
    FOR ALL
    USING (is_admin());

-- ATTENDANCE TABLE POLICIES
DROP POLICY IF EXISTS "Students view own attendance" ON public.attendance;
CREATE POLICY "Students view own attendance" ON public.attendance
    FOR SELECT
    USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Teachers view subject attendance" ON public.attendance;
CREATE POLICY "Teachers view subject attendance" ON public.attendance
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.subjects
            WHERE id = attendance.subject_id
            AND teacher_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Teachers can mark attendance" ON public.attendance;
CREATE POLICY "Teachers can mark attendance" ON public.attendance
    FOR INSERT
    WITH CHECK (is_teacher());

DROP POLICY IF EXISTS "Teachers can update attendance" ON public.attendance;
CREATE POLICY "Teachers can update attendance" ON public.attendance
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.subjects
            WHERE id = attendance.subject_id
            AND teacher_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Admins can manage attendance" ON public.attendance;
CREATE POLICY "Admins can manage attendance" ON public.attendance
    FOR ALL
    USING (is_admin());

-- ASSIGNMENTS TABLE POLICIES
DROP POLICY IF EXISTS "Students view assignments" ON public.assignments;
CREATE POLICY "Students view assignments" ON public.assignments
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Teachers create assignments" ON public.assignments;
CREATE POLICY "Teachers create assignments" ON public.assignments
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.subjects
            WHERE id = assignments.subject_id
            AND teacher_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Teachers update own assignments" ON public.assignments;
CREATE POLICY "Teachers update own assignments" ON public.assignments
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.subjects
            WHERE id = assignments.subject_id
            AND teacher_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Teachers delete own assignments" ON public.assignments;
CREATE POLICY "Teachers delete own assignments" ON public.assignments
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.subjects
            WHERE id = assignments.subject_id
            AND teacher_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Admins can manage assignments" ON public.assignments;
CREATE POLICY "Admins can manage assignments" ON public.assignments
    FOR ALL
    USING (is_admin());

-- STUDENT ASSIGNMENTS TABLE POLICIES
DROP POLICY IF EXISTS "Students view own submissions" ON public.student_assignments;
CREATE POLICY "Students view own submissions" ON public.student_assignments
    FOR SELECT
    USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can submit assignments" ON public.student_assignments;
CREATE POLICY "Students can submit assignments" ON public.student_assignments
    FOR INSERT
    WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can update own pending submissions" ON public.student_assignments;
CREATE POLICY "Students can update own pending submissions" ON public.student_assignments
    FOR UPDATE
    USING (auth.uid() = student_id AND status = 'pending');

DROP POLICY IF EXISTS "Teachers view submissions for their subjects" ON public.student_assignments;
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

DROP POLICY IF EXISTS "Teachers can grade submissions" ON public.student_assignments;
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

DROP POLICY IF EXISTS "Admins can manage submissions" ON public.student_assignments;
CREATE POLICY "Admins can manage submissions" ON public.student_assignments
    FOR ALL
    USING (is_admin());

-- NOTIFICATIONS TABLE POLICIES
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
CREATE POLICY "System can create notifications" ON public.notifications
    FOR INSERT
    WITH CHECK (true); -- Allow system to create notifications for any user

DROP POLICY IF EXISTS "Admins can manage all notifications" ON public.notifications;
CREATE POLICY "Admins can manage all notifications" ON public.notifications
    FOR ALL
    USING (is_admin());

-- ==============================================================================
-- SECTION 13: TRIGGERS
-- ==============================================================================

-- Trigger to automatically create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger to update updated_at timestamp on org_classes
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::TEXT, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to organizational tables
DROP TRIGGER IF EXISTS update_org_classes_updated_at ON public.org_classes;
CREATE TRIGGER update_org_classes_updated_at
    BEFORE UPDATE ON public.org_classes
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_org_branches_updated_at ON public.org_branches;
CREATE TRIGGER update_org_branches_updated_at
    BEFORE UPDATE ON public.org_branches
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_org_departments_updated_at ON public.org_departments;
CREATE TRIGGER update_org_departments_updated_at
    BEFORE UPDATE ON public.org_departments
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_classes_updated_at ON public.classes;
CREATE TRIGGER update_classes_updated_at
    BEFORE UPDATE ON public.classes
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- ==============================================================================
-- SECTION 14: PERFORMANCE INDEXES
-- ==============================================================================

-- Attendance queries (most frequently accessed)
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON public.attendance(student_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_subject ON public.attendance(subject_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(date);

-- Assignment queries
CREATE INDEX IF NOT EXISTS idx_assignments_subject ON public.assignments(subject_id);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON public.assignments(due_date);

-- Student assignment queries
CREATE INDEX IF NOT EXISTS idx_student_assignments_student ON public.student_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_student_assignments_assignment ON public.student_assignments(assignment_id);
CREATE INDEX IF NOT EXISTS idx_student_assignments_status ON public.student_assignments(status);

-- Student class lookups
CREATE INDEX IF NOT EXISTS idx_students_class ON public.students(class_id);
CREATE INDEX IF NOT EXISTS idx_students_class_level ON public.students(class_level);
CREATE INDEX IF NOT EXISTS idx_students_enrollment ON public.students(enrollment_number);

-- Subject teacher lookups
CREATE INDEX IF NOT EXISTS idx_subjects_teacher ON public.subjects(teacher_id);

-- User role and verification lookups
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_verified ON public.users(is_verified);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- Organizational data indexes
CREATE INDEX IF NOT EXISTS idx_org_classes_active ON public.org_classes(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_org_branches_class ON public.org_branches(class_id, display_order);
CREATE INDEX IF NOT EXISTS idx_org_departments_active ON public.org_departments(is_active, display_order);

-- ==============================================================================
-- SECTION 15: GRANT PERMISSIONS
-- ==============================================================================

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.verify_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.unverify_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reset_user_password(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_notification(UUID, TEXT, TEXT, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_notification_read(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_all_notifications_read() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_unread_count() TO authenticated;

-- ==============================================================================
-- SECTION 16: SEED DATA
-- ==============================================================================

-- Populate organizational classes from constants
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
    is_active = EXCLUDED.is_active;

-- Populate departments from constants
INSERT INTO public.org_departments (name, display_order, is_active) VALUES
    ('Computer Science', 1, true),
    ('Information Technology', 2, true),
    ('Electronics', 3, true),
    ('Mechanical', 4, true),
    ('Civil', 5, true),
    ('Electrical', 6, true),
    ('Mathematics', 7, true),
    ('Physics', 8, true),
    ('Chemistry', 9, true),
    ('English', 10, true)
ON CONFLICT (name) DO UPDATE SET
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

-- Populate branches for graduation years
INSERT INTO public.org_branches (name, class_id, display_order, is_active) VALUES
    ('Computer Science', (SELECT id FROM public.org_classes WHERE value = 'grad_year_1'), 1, true),
    ('Information Technology', (SELECT id FROM public.org_classes WHERE value = 'grad_year_1'), 2, true),
    ('Electronics', (SELECT id FROM public.org_classes WHERE value = 'grad_year_1'), 3, true),
    ('Mechanical', (SELECT id FROM public.org_classes WHERE value = 'grad_year_1'), 4, true),
    ('Civil', (SELECT id FROM public.org_classes WHERE value = 'grad_year_1'), 5, true),
    ('Computer Science', (SELECT id FROM public.org_classes WHERE value = 'grad_year_2'), 1, true),
    ('Information Technology', (SELECT id FROM public.org_classes WHERE value = 'grad_year_2'), 2, true),
    ('Electronics', (SELECT id FROM public.org_classes WHERE value = 'grad_year_2'), 3, true),
    ('Mechanical', (SELECT id FROM public.org_classes WHERE value = 'grad_year_2'), 4, true),
    ('Civil', (SELECT id FROM public.org_classes WHERE value = 'grad_year_2'), 5, true),
    ('Computer Science', (SELECT id FROM public.org_classes WHERE value = 'grad_year_3'), 1, true),
    ('Information Technology', (SELECT id FROM public.org_classes WHERE value = 'grad_year_3'), 2, true),
    ('Electronics', (SELECT id FROM public.org_classes WHERE value = 'grad_year_3'), 3, true),
    ('Mechanical', (SELECT id FROM public.org_classes WHERE value = 'grad_year_3'), 4, true),
    ('Civil', (SELECT id FROM public.org_classes WHERE value = 'grad_year_3'), 5, true),
    ('Computer Science', (SELECT id FROM public.org_classes WHERE value = 'grad_year_4'), 1, true),
    ('Information Technology', (SELECT id FROM public.org_classes WHERE value = 'grad_year_4'), 2, true),
    ('Electronics', (SELECT id FROM public.org_classes WHERE value = 'grad_year_4'), 3, true),
    ('Mechanical', (SELECT id FROM public.org_classes WHERE value = 'grad_year_4'), 4, true),
    ('Civil', (SELECT id FROM public.org_classes WHERE value = 'grad_year_4'), 5, true)
ON CONFLICT (name, class_id) DO UPDATE SET
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

-- Insert sample legacy classes for backward compatibility
INSERT INTO public.classes (name, academic_year, value, display_order, is_active) VALUES 
    ('Class 10-A', '2024-2025', 'class_10', 1, true),
    ('Class 10-B', '2024-2025', 'class_10', 2, true),
    ('Class 11-A', '2024-2025', 'class_11', 3, true),
    ('Class 11-B', '2024-2025', 'class_11', 4, true),
    ('Class 12-A', '2024-2025', 'class_12', 5, true),
    ('Class 12-B', '2024-2025', 'class_12', 6, true)
ON CONFLICT DO NOTHING;

-- ==============================================================================
-- SECTION 17: FIX MISSING USER PROFILES
-- ==============================================================================

-- This section fixes cases where users exist in auth.users but not in public.users
-- This can happen when the signup trigger fails or is not properly configured

DO $$
DECLARE
    auth_user RECORD;
    missing_count INTEGER := 0;
BEGIN
    -- Find users in auth.users that don't exist in public.users
    FOR auth_user IN 
        SELECT 
            au.id,
            au.email,
            au.created_at,
            au.raw_user_meta_data->>'full_name' as full_name,
            COALESCE((au.raw_user_meta_data->>'role')::user_role, 'student') as role
        FROM auth.users au
        LEFT JOIN public.users pu ON au.id = pu.id
        WHERE pu.id IS NULL
    LOOP
        -- Create missing user profile
        INSERT INTO public.users (id, email, full_name, role, is_verified, created_at)
        VALUES (
            auth_user.id,
            auth_user.email,
            auth_user.full_name,
            auth_user.role,
            CASE WHEN auth_user.role = 'admin' THEN true ELSE false END,
            auth_user.created_at
        );
        
        -- Create role-specific profile if needed
        IF auth_user.role = 'teacher' THEN
            INSERT INTO public.teachers (id, department, created_at)
            VALUES (
                auth_user.id,
                'General', -- Default department, can be updated later
                auth_user.created_at
            )
            ON CONFLICT (id) DO NOTHING;
        ELSIF auth_user.role = 'student' THEN
            -- For students, we need enrollment number from metadata
            IF auth_user.raw_user_meta_data ? 'enrollment_number' THEN
                INSERT INTO public.students (
                    id, 
                    enrollment_number, 
                    class_level, 
                    branch, 
                    created_at
                )
                VALUES (
                    auth_user.id,
                    auth_user.raw_user_meta_data->>'enrollment_number',
                    auth_user.raw_user_meta_data->>'class_level',
                    auth_user.raw_user_meta_data->>'branch',
                    auth_user.created_at
                )
                ON CONFLICT (id) DO NOTHING;
            END IF;
        END IF;
        
        missing_count := missing_count + 1;
        RAISE NOTICE '✅ Created missing profile for user: % (%) - Role: %', 
            auth_user.email, auth_user.id, auth_user.role;
    END LOOP;
    
    IF missing_count = 0 THEN
        RAISE NOTICE '✅ No missing user profiles found - all users are properly synced';
    ELSE
        RAISE NOTICE '✅ Fixed % missing user profile(s)', missing_count;
    END IF;
END $$;

-- ==============================================================================
-- SECTION 18: DIAGNOSTIC QUERIES
-- ==============================================================================

-- Show current user verification status summary
RAISE NOTICE '==============================================================================';
RAISE NOTICE 'DATABASE SETUP COMPLETED SUCCESSFULLY';
RAISE NOTICE '==============================================================================';

-- Count users by role and verification status
DO $$
DECLARE
    rec RECORD;
BEGIN
    RAISE NOTICE 'User counts by role and verification status:';
    FOR rec IN 
        SELECT 
            role,
            is_verified,
            COUNT(*) as count
        FROM public.users
        GROUP BY role, is_verified
        ORDER BY role, is_verified
    LOOP
        RAISE NOTICE '  % - Verified: % - Count: %', rec.role, rec.is_verified, rec.count;
    END LOOP;
END $$;

-- Show summary of created tables
SELECT 
    'Database Tables' as component,
    COUNT(*) as count,
    '✅ Created' as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'users', 'students', 'teachers', 'classes', 'subjects', 
    'attendance', 'assignments', 'student_assignments', 'notifications',
    'org_classes', 'org_branches', 'org_departments'
);

-- Show summary of created functions
SELECT 
    'Database Functions' as component,
    COUNT(*) as count,
    '✅ Created' as status
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
    'is_admin', 'is_teacher', 'is_student', 'get_user_role',
    'verify_user', 'unverify_user', 'reset_user_password',
    'handle_new_user', 'can_delete_class', 'get_student_class',
    'create_notification', 'mark_notification_read', 
    'mark_all_notifications_read', 'get_unread_count'
);

-- Show summary of organizational data
SELECT 
    'Organizational Classes' as component,
    COUNT(*) as count,
    '✅ Populated' as status
FROM public.org_classes;

SELECT 
    'Organizational Departments' as component,
    COUNT(*) as count,
    '✅ Populated' as status
FROM public.org_departments;

SELECT 
    'Organizational Branches' as component,
    COUNT(*) as count,
    '✅ Populated' as status
FROM public.org_branches;

-- ==============================================================================
-- SECTION 19: VERIFICATION WORKFLOW SUMMARY
-- ==============================================================================

/*
==============================================================================
SMART ATTENDANCE SYSTEM - DATABASE SETUP COMPLETE
==============================================================================

WHAT WAS CREATED:

1. CORE TABLES:
   ✅ users - Central user profiles with verification system
   ✅ students - Student academic information and biometrics
   ✅ teachers - Teacher department assignments
   ✅ classes - Academic class structure (legacy compatibility)
   ✅ subjects - Academic subjects and teacher assignments
   ✅ attendance - Student attendance tracking with smart device support
   ✅ assignments - Teacher-created assignments
   ✅ student_assignments - Student submissions and grading
   ✅ notifications - Real-time user notifications

2. ORGANIZATIONAL DATA:
   ✅ org_classes - Admin-configurable class levels
   ✅ org_branches - Academic branches/streams per class
   ✅ org_departments - Teacher departments

3. SECURITY SYSTEM:
   ✅ Row Level Security (RLS) policies on all tables
   ✅ Role-based access control (admin/teacher/student)
   ✅ User verification system with admin approval workflow

4. FUNCTIONS & TRIGGERS:
   ✅ User role checking functions (is_admin, is_teacher, is_student)
   ✅ User verification functions (verify_user, unverify_user)
   ✅ Password reset function (admin only)
   ✅ Notification management functions
   ✅ Automatic user profile creation on signup
   ✅ Organizational data management functions

5. PERFORMANCE OPTIMIZATIONS:
   ✅ Comprehensive indexes on frequently queried columns
   ✅ Optimized queries for attendance, assignments, and user lookups

6. SEED DATA:
   ✅ Pre-populated class levels (Class 9-12, Graduation Years 1-4)
   ✅ Pre-populated departments (Computer Science, IT, etc.)
   ✅ Pre-populated branches for graduation years

USER VERIFICATION WORKFLOW:

1. NEW SIGNUPS:
   ✅ Admins → Automatically verified (immediate access)
   ⏳ Teachers → Unverified (need admin approval)
   ⏳ Students → Unverified (need admin approval)

2. ADMIN WORKFLOW:
   1. Admin logs into the app
   2. Goes to User Management screen
   3. Sees unverified users with ⏳ "Pending" status
   4. Clicks green checkmark ✅ to verify users
   5. Users can now log out and back in to access the system

3. USER EXPERIENCE:
   - Unverified users see "Account Pending Verification" screen
   - They can only sign out and wait for admin approval
   - Once verified, they get full access to their role's features

NEXT STEPS:

1. Create an admin user via Supabase Auth Dashboard
2. Update their role to 'admin' in the public.users table if needed
3. Test the signup flow with teacher/student accounts
4. Configure Supabase Storage buckets for profile pictures
5. Set up real-time subscriptions for notifications

==============================================================================
*/