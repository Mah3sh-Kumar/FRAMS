# SQL Scripts

This directory contains all SQL scripts for the Smart Attendance System database.

## Directory Structure

### setup/
Complete database setup scripts:
- `complete_setup.sql` - Full database schema setup including tables, policies, triggers, and seed data

### maintenance/
Scripts for fixing and maintaining data integrity:
- `fix_missing_profiles.sql` - Creates missing user profiles for auth users
- `fix_teacher_role.sql` - Fixes user role assignments and profiles

### verification/
Scripts for checking database state:
- `check_user_profiles.sql` - Validates user profiles and role assignments

## Usage

### Initial Setup
Run the complete setup script in your Supabase SQL Editor:
```sql
-- Copy and paste the contents of scripts/setup/complete_setup.sql
```

### Maintenance
Run maintenance scripts as needed when data issues occur.

### Verification
Run verification scripts to check data integrity and diagnose issues.
