# Implementation Plan - Smart Attendance System

## Goal Description
Build a Smart Attendance and Academic Performance Management System using Raspberry Pi (Face Recognition), Supabase (Backend), and React Native (Mobile App).

## User Review Required
> [!IMPORTANT]
> **Hardware Requirement**: This plan assumes access to a Raspberry Pi 3 B+ with a Camera Module.
> **Supabase Account**: A Supabase project needs to be created to obtain the API URL and Anon Key.

## Proposed Changes

### Phase 1: Setup & Backend (Supabase)
#### [NEW] Database Schema
- Create tables: `users`, `students`, `teachers`, `subjects`, `classes`, `attendance`, `assignments`, `student_assignments`.
- Set up Foreign Key relationships.
#### [NEW] Authentication & Security
- Enable Email/Password Auth.
- Configure RLS policies for Admin, Teacher, and Student roles.
#### [NEW] Storage
- Create a bucket `profile-images` for storing student photos.

### Phase 2: Mobile App Development (React Native + Expo)
#### [NEW] Project Initialization
- Initialize Expo project with TypeScript.
- Install dependencies: `@supabase/supabase-js`, `react-navigation`, `ui-kitten` or `paper`.
#### [NEW] Authentication Flow
- Implement Login Screen.
- Implement Role-based Navigation (AdminStack, TeacherStack, StudentStack).
#### [NEW] Student Module
- `StudentDashboard`: View attendance summary.
- `AttendanceScreen`: Calendar view of attendance.
- `AssignmentScreen`: List assignments and grades.
#### [NEW] Teacher Module
- `TeacherDashboard`: Class overview.
- `AttendanceManager`: Manual override for attendance.
- `AssignmentManager`: Create/Grade assignments.
#### [NEW] Admin Module
- `UserManagement`: Add/Edit users.
- `ReportsScreen`: View analytics.

### Phase 3: Raspberry Pi Integration (Device Layer)
#### [NEW] Environment Setup
- Install Python 3, OpenCV, `face_recognition`, `requests`.
#### [NEW] Face Recognition Script
- `capture.py`: Capture video frames.
- `recognize.py`: Load known faces from Supabase, detect faces in real-time, and match.
- `sync.py`: Post attendance data to Supabase API.

### Phase 4: Testing & Deployment
#### [NEW] Integration Testing
- Verify Raspberry Pi correctly posts attendance to Supabase.
- Verify Mobile App updates in real-time (using Supabase subscriptions).
#### [NEW] User Acceptance Testing
- Test full flow: Register Student -> Train Face -> Mark Attendance via Pi -> View on App.

## Verification Plan

### Automated Tests
- **Backend**: Use Supabase SQL Editor to run test queries on RLS policies.
- **Mobile**: Run `npm run test` (if unit tests are added) or manual verification via Expo Go.
- **Device**: Run `python recognize.py --test` to verify camera feed and API connection.

### Manual Verification
1.  **Auth**: Login as Admin, Teacher, and Student to verify correct routing.
2.  **Attendance**: Show a registered face to the Pi camera and check if a new row appears in the `attendance` table and reflects in the Student App.
3.  **Assignments**: Create an assignment as Teacher, check visibility as Student.
