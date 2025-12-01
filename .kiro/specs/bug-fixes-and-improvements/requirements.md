# Requirements Document

## Introduction

This document outlines the requirements for fixing critical bugs and improving the user experience in the education management system. The system currently has deprecated API usage causing runtime errors, database relationship ambiguity issues, and visibility problems in the admin interface.

## Glossary

- **System**: The education management React Native application
- **Expo FileSystem API**: The file system API provided by Expo for file operations
- **Expo ImagePicker API**: The image picker API provided by Expo for selecting images
- **Supabase**: The backend database and storage service
- **Admin Interface**: The administrative screens for managing users and viewing reports
- **Profile Picture Upload**: The functionality for uploading user avatar images
- **Face Registration**: The functionality for uploading face images for attendance recognition
- **CSV Export**: The functionality for exporting data to CSV files
- **Students Relationship**: The database relationship between users and students tables
- **Blob API**: The browser/React Native API for handling binary data

## Requirements

### Requirement 1

**User Story:** As a developer, I want to migrate from deprecated Expo FileSystem APIs to the new API, so that the application runs without deprecation warnings and errors.

#### Acceptance Criteria

1. WHEN the System exports CSV files THEN the System SHALL use the new Expo FileSystem API instead of the deprecated writeAsStringAsync method
2. WHEN the System writes files to disk THEN the System SHALL use the File class from the new Expo FileSystem API
3. WHEN the System shares exported files THEN the System SHALL successfully share files created with the new API
4. WHEN the System runs THEN the System SHALL not display deprecation warnings for FileSystem methods

### Requirement 2

**User Story:** As a developer, I want to migrate from deprecated Expo ImagePicker APIs to the new API, so that image selection works without warnings.

#### Acceptance Criteria

1. WHEN the System launches the camera THEN the System SHALL use ImagePicker.MediaType instead of ImagePicker.MediaTypeOptions
2. WHEN the System launches the image library THEN the System SHALL use ImagePicker.MediaType instead of ImagePicker.MediaTypeOptions
3. WHEN the System runs image picker functionality THEN the System SHALL not display deprecation warnings for MediaTypeOptions

### Requirement 3

**User Story:** As a user, I want to upload profile pictures successfully, so that I can personalize my account.

#### Acceptance Criteria

1. WHEN a user selects a profile picture THEN the System SHALL convert the image to a format compatible with Supabase Storage
2. WHEN the System uploads an image THEN the System SHALL use ArrayBuffer instead of blob for React Native compatibility
3. WHEN the upload completes successfully THEN the System SHALL update the user's avatar URL in the database
4. WHEN an upload fails THEN the System SHALL display a clear error message to the user

### Requirement 4

**User Story:** As a developer, I want to fix the ambiguous Supabase relationship error, so that profile data loads correctly.

#### Acceptance Criteria

1. WHEN the System queries user profiles with student data THEN the System SHALL specify the exact foreign key relationship to use
2. WHEN the System queries user profiles with teacher data THEN the System SHALL specify the exact foreign key relationship to use
3. WHEN the System fetches profile data THEN the System SHALL not encounter PGRST201 errors about ambiguous relationships
4. WHEN profile data loads THEN the System SHALL display all user information correctly

### Requirement 5

**User Story:** As an administrator, I want improved color contrast in admin screens, so that all text is clearly visible.

#### Acceptance Criteria

1. WHEN an administrator views the Admin Dashboard THEN the System SHALL display all text with sufficient contrast against backgrounds
2. WHEN an administrator views the User Management screen THEN the System SHALL display all text with sufficient contrast against backgrounds
3. WHEN an administrator views the Reports screen THEN the System SHALL display all text with sufficient contrast against backgrounds
4. WHEN text appears on glassmorphic widgets THEN the System SHALL ensure text color provides readable contrast
5. WHEN text appears on gradient backgrounds THEN the System SHALL use white or high-contrast colors for visibility

### Requirement 6

**User Story:** As a developer, I want to fix face registration image uploads, so that students can register their faces for attendance.

#### Acceptance Criteria

1. WHEN a student uploads a face registration image THEN the System SHALL convert the image to a format compatible with Supabase Storage
2. WHEN the System uploads a face image THEN the System SHALL use ArrayBuffer instead of blob for React Native compatibility
3. WHEN the face upload completes successfully THEN the System SHALL return the public URL of the uploaded image
4. WHEN a face upload fails THEN the System SHALL display a clear error message to the user
