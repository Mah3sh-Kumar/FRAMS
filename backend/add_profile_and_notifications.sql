-- ==============================================================================
-- PROFILE PICTURES & NOTIFICATIONS - DATABASE UPDATES
-- ==============================================================================
-- Run this script after the main database_setup_final.sql
-- ==============================================================================

-- Add avatar_url column to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

COMMENT ON COLUMN public.users.avatar_url IS 'URL to user profile picture in Supabase Storage';

-- ==============================================================================
-- NOTIFICATIONS TABLE
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  read BOOLEAN DEFAULT false,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

COMMENT ON TABLE public.notifications IS 'User notifications for real-time updates';
COMMENT ON COLUMN public.notifications.user_id IS 'User who receives this notification';
COMMENT ON COLUMN public.notifications.type IS 'Notification type: info, success, warning, or error';
COMMENT ON COLUMN public.notifications.read IS 'Whether the notification has been read';
COMMENT ON COLUMN public.notifications.data IS 'Additional data payload (JSON)';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, read) WHERE read = false;

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
CREATE POLICY "Users can delete own notifications" ON public.notifications
  FOR DELETE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can create notifications" ON public.notifications;
CREATE POLICY "Admins can create notifications" ON public.notifications
  FOR INSERT
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT
  WITH CHECK (true);

-- ==============================================================================
-- STORAGE BUCKET POLICIES (Run in Supabase Dashboard SQL Editor)
-- ==============================================================================

-- Note: Storage buckets must be created via Dashboard or Storage API first
-- Create bucket named 'avatars' with public access

-- After creating the bucket, apply these policies:

-- Policy: Avatar images are publicly accessible
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

-- Policy: Users can upload own avatar
CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Users can update own avatar
CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Users can delete own avatar
CREATE POLICY "Users can delete own avatar" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ==============================================================================
-- HELPER FUNCTIONS FOR NOTIFICATIONS
-- ==============================================================================

-- Function to create notification
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT DEFAULT 'info',
  p_data JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, data)
  VALUES (p_user_id, p_title, p_message, p_type, p_data)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.create_notification IS 'Helper function to create a notification for a user';

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION public.mark_notification_read(notification_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.notifications
  SET read = true
  WHERE id = notification_id
  AND user_id = auth.uid();
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all notifications as read for current user
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE public.notifications
  SET read = true
  WHERE user_id = auth.uid()
  AND read = false;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION public.get_unread_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM public.notifications
    WHERE user_id = auth.uid()
    AND read = false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- EXAMPLE NOTIFICATION TRIGGERS (Optional)
-- ==============================================================================

-- Example: Notify student when assignment is graded
CREATE OR REPLACE FUNCTION public.notify_assignment_graded()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'graded' AND (OLD.status IS NULL OR OLD.status != 'graded') THEN
    PERFORM public.create_notification(
      NEW.student_id,
      'Assignment Graded',
      'Your assignment has been graded by the teacher.',
      'success',
      jsonb_build_object('assignment_id', NEW.assignment_id, 'score', NEW.score)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_assignment_graded ON public.student_assignments;
CREATE TRIGGER trigger_assignment_graded
  AFTER UPDATE ON public.student_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_assignment_graded();

-- ==============================================================================
-- END OF SCRIPT
-- ==============================================================================
