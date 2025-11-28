# FRAMS - Features & Functionality

## Overview

FRAMS (Face Recognition & Attendance Management System) is a mobile application built with React Native and Expo that enables educational institutions to manage attendance, assignments, and student performance tracking with role-based access control.

## Technology Stack

- **Frontend**: React Native (Expo)
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **UI Library**: React Native Paper
- **Navigation**: React Navigation
- **State Management**: React Context API
- **Face Recognition**: Planned hardware integration (Python)

## User Roles

The system supports three distinct user roles:

1. **Admin** - System administrators with full access
2. **Teacher** - Faculty members who manage classes and students
3. **Student** - Students who view attendance and submit assignments

## Authentication Features

### Login Screen

- Email and password authentication
- Remember me functionality (secure credential storage)
- Password visibility toggle
- Email format validation
- "Forgot Password" integration
- Auto-redirect to role-specific dashboard

### Forgot Password

- **File**: `screens/ForgotPasswordScreen.tsx`
- Password reset via email
- Secure token-based verification

### Email Verification

- **File**: `screens/EmailVerificationScreen.tsx`
- Email confirmation workflow
- Resend verification email option

---

## Student Features

### Student Dashboard

- **File**: `screens/student/StudentDashboard.tsx`
- **Features**:
  - Quick access to attendance records
  - Quick access to assignments
  - Overview statistics (attendance rate, pending tasks)
  - Gradient background with glassmorphism UI

### Attendance View

- **File**: `screens/student/AttendanceScreen.tsx`
- **Features**:
  - View personal attendance records
  - Filter by date range
  - View attendance by subject
  - Attendance percentage calculation
  - Status indicators (present/absent/late)

### Assignment View & Submission

- **File**: `screens/student/AssignmentScreen.tsx`
- **Features**:
  - View all assigned assignments
  - Filter by status (pending/submitted/graded)
  - View assignment details (title, description, due date, max score)
  - Submit assignment URL
  - View grades and teacher remarks
  - Track submission status

---

## Teacher Features

### Teacher Dashboard

- **File**: `screens/teacher/TeacherDashboard.tsx`
- **Features**:
  - Quick access to attendance management
  - Quick access to assignment management
  - Quick access to marks review
  - Overview statistics (total students, classes, pending reviews)

### Attendance Management

- **File**: `screens/teacher/AttendanceManager.tsx`
- **Features**:
  - Mark student attendance (present/absent/late)
  - Select subject and date
  - Bulk attendance marking
  - View attendance history
  - Edit previous attendance records
  - Export attendance reports

### Assignment Management

- **File**: `screens/teacher/AssignmentManager.tsx`
- **Features**:
  - Create new assignments
  - Set assignment details (title, description, due date, max score)
  - Link assignments to subjects
  - Edit existing assignments
  - Delete assignments
  - View all assignments by subject
  - Track submission statistics

### Marks Review & Grading

- **File**: `screens/teacher/MarksReviewManager.tsx`
- **Features**:
  - View student submissions
  - Grade assignments (assign scores)
  - Add remarks/feedback
  - Update assignment status (pending → submitted → graded)
  - Filter by submission status
  - View student details

---

## Admin Features

### Admin Dashboard

- **File**: `screens/admin/AdminDashboard.tsx`
- **Features**:
  - Quick access to user management
  - Quick access to system reports
  - Overview statistics (total users, teachers, students, classes)

### User Management

- **File**: `screens/admin/UserManagement.tsx`
- **Features**:
  - View all users (students, teachers, admins)
  - Filter users by role
  - Search users
  - Edit user profiles
  - Change user roles
  - Delete users
  - View detailed user information
  - Create new users

### System Reports & Analytics

- **File**: `screens/admin/ReportsScreen.tsx`
- **Features**:
  - View comprehensive system statistics
  - Attendance trends visualization (line charts)
  - Assignment completion rates (bar charts)
  - Subject-wise performance analysis
  - Date range filtering
  - Export reports to CSV
  - Real-time data aggregation
  - Multiple statistics cards:
    - Total students
    - Total teachers
    - Total admins
    - Today's attendance count
  - Total assignments
  - Completed assignments

---

## Common Features (All Users)

### Dashboard Screen

- **File**: `screens/DashboardScreen.tsx`
- Role-based dashboard routing
- Displays appropriate dashboard based on user role

### Profile Management

- **File**: `screens/ProfileScreen.tsx`
- **Features**:
  - View personal profile information
  - Edit full name and contact details
  - View enrollment/employee ID
  - View role and department/class information
  - Change profile picture

### Notifications

- **File**: `screens/NotificationsScreen.tsx`
- **Features**:
  - View all notifications
  - Filter by notification type
  - Mark notifications as read
  - Delete notifications
  - Real-time notification updates

### Settings

- **File**: `screens/SettingsScreen.tsx`
- **Features**:
  - Account settings
  - Change password
  - Notification preferences
  - Theme settings (dark/light mode)
  - Privacy settings
  - Logout functionality

---

## UI Components

### Reusable Components

All components located in `components/` directory:

1. **AnimatedCard** - Animated card with press effects
2. **ChartCard** - Card wrapper for charts
3. **ConfirmDialog** - Confirmation dialog modal
4. **CountdownTimer** - Countdown timer component
5. **DateRangePicker** - Date range selection
6. **EmptyState** - Empty state placeholder
7. **ErrorBoundary** - Error boundary wrapper
8. **FilterBar** - Filter toolbar
9. **GradientBackground** - Gradient background with role variants
10. **LoadingSpinner** - Loading indicator
11. **PasswordStrengthIndicator** - Password strength meter
12. **SkeletonLoader** - Skeleton loading placeholder
13. **Toast** - Toast notification system
14. **ImagePickerComponent** - Image selection from camera or gallery

---

## Database Schema

### Tables

1. **users** - User profiles (linked to Supabase Auth)
2. **students** - Student-specific data
3. **teachers** - Teacher-specific data
4. **classes** - Academic classes
5. **subjects** - Academic subjects
6. **attendance** - Attendance records
7. **assignments** - Assignment definitions
8. **student_assignments** - Student submissions and grades

### Key Features

- Row Level Security (RLS) policies for all tables
- Helper functions: `is_admin()`, `is_teacher()`, `is_student()`, `get_user_role()`
- Automatic user profile creation via triggers
- Comprehensive foreign key relationships
- Indexed for performance

---

## Hardware Integration (Prototype)

### Face Recognition System

- **Directory**: `hardware/`
- **Language**: Python
- **Purpose**: Smart attendance using facial recognition
- **Features**:
  - Face detection and encoding
  - Real-time attendance marking
  - Integration with mobile app via API
  - Device ID tracking

---

## Navigation Structure

```
├── Auth Stack (Unauthenticated)
│   ├── SignIn
│   ├── SignUp
│   ├── EmailVerification
│   └── ForgotPassword
│
└── App Stack (Authenticated)
    ├── Dashboard (Role-based routing)
    ├── Profile
    ├── Notifications
    ├── Settings
    │
    ├── Student Stack (role === 'student')
    │   ├── Attendance
    │   └── Assignments
    │
    ├── Teacher Stack (role === 'teacher')
    │   ├── AttendanceManager
    │   ├── AssignmentManager
    │   └── MarksReviewManager
    │
    └── Admin Stack (role === 'admin')
        ├── UserManagement
        └── Reports
```

---

## Security Features

1. **Row Level Security (RLS)**
   - Students can only view their own data
   - Teachers can view students and manage their subjects
   - Admins have full access

2. **Authentication**
   - Supabase Auth integration
   - Secure password requirements
   - Email verification
   - Secure token storage

3. **Authorization**
   - Role-based access control (RBAC)
   - Helper functions for permission checks
   - Separate policies for each role

---

## Future Feature Roadmap

### Planned Enhancements

- [ ] Real-time notifications using Supabase Realtime
- [ ] Push notifications
- [x] Profile picture upload
- [ ] Face recognition attendance integration
- [ ] Bulk data import/export
- [ ] Advanced analytics dashboards
- [ ] Parent portal
- [ ] Messaging system (teacher-student communication)
- [ ] Attendance QR code scanning
- [ ] Offline mode support
- [ ] Calendar integration
- [ ] Grade/GPA calculation
- [ ] Subject enrollment management

---

## API Endpoints (Supabase)

All data operations go through Supabase client:

- **Auth**: `supabase.auth.*`
- **Database**: `supabase.from('table_name').*`
- **Storage**: `supabase.storage.*` (Active - Profile Pictures)

### Key Operations

- `signUp()` - Create new user
- `signInWithPassword()` - Authenticate user
- `signOut()` - Logout
- `from('table').select()` - Fetch data
- `from('table').insert()` - Create records
- `from('table').update()` - Update records
- `from('table').delete()` - Delete records

---

## File Structure

```
SemProject/
├── App.tsx                 # Main app entry with navigation
├── index.js                # Expo entry point
├── app.json               # Expo configuration
├── package.json           # Dependencies
│
├── components/            # Reusable UI components
├── screens/              # All screen components
│   ├── admin/           # Admin screens
│   ├── teacher/         # Teacher screens
│   └── student/         # Student screens
│
├── context/             # React Context providers
│   └── AuthContext.tsx  # Authentication context
│
├── lib/                # Utilities and configs
│   ├── supabase.ts    # Supabase client
│   ├── database.ts    # Database helpers
│   ├── theme.ts       # Theme configuration
│   └── constants.ts   # App constants
│
├── backend/           # Database scripts
│   └── database_setup_final.sql
│
├── scripts/          # SQL maintenance scripts
│   ├── setup/
│   ├── maintenance/
│   └── verification/
│
├── supabase/        # Supabase configuration
│   ├── config.toml
│   └── migrations/
│
└── hardware/        # Face recognition (future)
    └── main.py
```

---

## Getting Started for Developers

### Prerequisites

- Node.js and npm
- Expo CLI
- Supabase account

### Setup Steps

1. Clone repository
2. Install dependencies: `npm install`
3. Configure Supabase (update `.env`)
4. Run database setup script in Supabase SQL Editor
5. Start development server: `npm start` or `expo start`

### Environment Variables

```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Contributing Guidelines

When adding new features:

1. Follow the existing file structure
2. Use TypeScript for type safety
3. Implement RLS policies for new tables
4. Add comprehensive error handling
5. Update this documentation
6. Test with all three user roles
7. Follow React Native best practices
8. Use the theme system for consistent styling

---

## Support & Maintenance

### Bug Reports

- Document the user role experiencing the issue
- Include screen name and steps to reproduce
- Check database policies if data access issues occur

### Performance Optimization

- Use pagination for large data sets
- Implement skeleton loaders
- Optimize database queries
- Use React.memo for expensive components

---

## Version History

**Current Version**: 1.0.0

- Initial release with core features
- Complete authentication system
- Student, Teacher, and Admin portals
- Attendance and assignment management
- Reports and analytics

---

## License

[Add your license information here]

## Contact

[Add contact information here]
