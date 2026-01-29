-- ==========================================
-- ADMIN ACCESS FIX & HELPER
-- Run this in Supabase SQL Editor
-- ==========================================

-- 1. Ensure the user_roles table exists and policies are correct
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- 2. Create a function to easily promote a user to admin by email
-- Usage: SELECT promote_to_admin('your_email@example.com');
CREATE OR REPLACE FUNCTION public.promote_to_admin(target_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Find user ID
  SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;
  
  IF target_user_id IS NULL THEN
    RETURN 'User not found. Please sign up first.';
  END IF;

  -- Insert admin role if not exists
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN 'Success! User ' || target_email || ' is now an admin.';
END;
$$;

-- 3. (OPTIONAL) UNCOMMENT AND REPLACE EMAIL TO RUN AUTOMATICALLY
-- SELECT promote_to_admin('admin@example.com');
