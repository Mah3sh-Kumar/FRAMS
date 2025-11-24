# Project Design Document: Smart Attendance and Academic Performance Management System

## 1. System Architecture

The system follows a 3-tier architecture:

1.  **Device Layer (Edge):**
    *   **Hardware:** Raspberry Pi 3 B+ with Camera Module.
    *   **Software:** Python script using OpenCV/Face_recognition libraries.
    *   **Function:** Captures video, detects faces, recognizes students, and sends attendance data to the backend via REST API.
2.  **Backend Layer (Cloud):**
    *   **Platform:** Supabase (BaaS).
    *   **Database:** PostgreSQL.
    *   **Auth:** Supabase Auth (JWT based).
    *   **Storage:** Supabase Storage (for profile photos).
    *   **API:** Auto-generated REST/GraphQL APIs from Supabase.
3.  **Client Layer (Mobile):**
    *   **Platform:** Android (React Native + Expo).
    *   **Users:** Student, Teacher, Admin.
    *   **Function:** Interface for viewing stats, managing assignments, and administrative tasks.

## 2. Database Schema (PostgreSQL/Supabase)

### Tables

#### `users`
*   `id` (UUID, PK) - Linked to Supabase Auth
*   `email` (Text, Unique)
*   `role` (Enum: 'admin', 'teacher', 'student')
*   `full_name` (Text)
*   `created_at` (Timestamp)

#### `students`
*   `id` (UUID, PK) - References `users.id`
*   `enrollment_number` (Text, Unique)
*   `class_id` (UUID, FK)
*   `face_encoding` (JSONB/Array) - Stores face embedding for recognition

#### `teachers`
*   `id` (UUID, PK) - References `users.id`
*   `department` (Text)

#### `subjects`
*   `id` (UUID, PK)
*   `name` (Text)
*   `code` (Text)
*   `teacher_id` (UUID, FK) - References `teachers.id`

#### `classes`
*   `id` (UUID, PK)
*   `name` (Text) - e.g., "Class 10-A"
*   `academic_year` (Text)

#### `attendance`
*   `id` (UUID, PK)
*   `student_id` (UUID, FK)
*   `subject_id` (UUID, FK)
*   `date` (Date)
*   `status` (Enum: 'present', 'absent', 'late')
*   `timestamp` (Timestamp)
*   `device_id` (Text) - To track which Pi recorded it

#### `assignments`
*   `id` (UUID, PK)
*   `subject_id` (UUID, FK)
*   `title` (Text)
*   `description` (Text)
*   `due_date` (Timestamp)
*   `max_score` (Integer)

#### `student_assignments`
*   `id` (UUID, PK)
*   `assignment_id` (UUID, FK)
*   `student_id` (UUID, FK)
*   `score` (Integer)
*   `status` (Enum: 'pending', 'submitted', 'graded')
*   `submission_url` (Text)

## 3. API Endpoints (Supabase Auto-generated)

Supabase provides RESTful endpoints for all tables. Key interactions include:

*   **POST /auth/v1/token**: Login (Email/Password).
*   **POST /rest/v1/attendance**: Raspberry Pi posts new attendance records.
*   **GET /rest/v1/attendance?student_id=eq.X**: Fetch attendance for a specific student.
*   **GET /rest/v1/student_assignments?select=*,assignments(*)&student_id=eq.X**: Fetch assignments with details for a student.
*   **RPC Functions**: Custom PostgreSQL functions for complex reports (e.g., `get_attendance_percentage(student_id, subject_id)`).

## 4. Module Specifications

### 4.1 Raspberry Pi Face Recognition Module
*   **Input**: Live video feed.
*   **Process**:
    1.  Detect faces using Haar Cascades or HOG.
    2.  Compute 128-d face embeddings.
    3.  Compare with known embeddings fetched from Supabase (cached locally for performance).
    4.  If match found > threshold, mark attendance.
*   **Output**: HTTP POST request to Supabase with `student_id`, `timestamp`, `subject_id`.

### 4.2 Mobile App - Student View
*   **Dashboard**: Overall attendance %, upcoming assignments.
*   **Attendance Tab**: Calendar view of present/absent days.
*   **Assignments Tab**: List of pending/completed assignments with grades.

### 4.3 Mobile App - Teacher View
*   **Dashboard**: Today's classes, quick stats.
*   **Class Management**: View list of students, manually edit attendance.
*   **Assignment Manager**: Create new assignment, grade submissions.

### 4.4 Mobile App - Admin View
*   **User Management**: Add/Edit/Delete users.
*   **Reports**: View institution-wide statistics.

## 5. Security & Privacy
*   **RLS (Row Level Security)**:
    *   Students can only see their own data.
    *   Teachers can see data for their assigned classes/subjects.
    *   Admins have full access.
*   **Data Protection**: Face embeddings are stored as numbers, not actual images, to preserve some privacy.
