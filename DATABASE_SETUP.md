# Database Setup Guide

## Option 1: Manual Setup (Recommended if CLI fails)

If you cannot use Docker or the Supabase CLI, follow these steps to set up your database manually.

1.  **Open Supabase Dashboard**: Go to [supabase.com/dashboard](https://supabase.com/dashboard) and select your project.
2.  **Go to SQL Editor**: Click on the SQL Editor icon in the left sidebar.
3.  **New Query**: Click "New query".
4.  **Copy Script**: Open the file `COMPLETE_SETUP.sql` in your project, copy **ALL** of its content.
5.  **Run Script**: Paste the content into the SQL Editor and click **Run**.

This will create all the necessary tables, policies, and triggers for your application.

## Option 2: CLI Setup (Requires Docker)

*Skipped as Docker is not available.*

## Environment Variables

After setting up the database, ensure your `.env` file has the correct credentials:

1.  Get your **Project URL** and **Anon Key** from the Supabase Dashboard (Settings > API).
2.  Update your local `.env` file:

```env
EXPO_PUBLIC_SUPABASE_URL=your_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Troubleshooting

-   **"User profile not found"**: This means the database trigger didn't run. Ensure you ran the `COMPLETE_SETUP.sql` script successfully.
-   **"Relation already exists"**: If you run the script multiple times, you might see this. It's usually fine as the script tries to be idempotent (using `IF NOT EXISTS`), but for a clean slate, you can go to **Database > Tables** in the dashboard and delete all tables before running the script.
