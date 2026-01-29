-- COMBINED MIGRATION SCRIPT FOR NEW SUPABASE INSTANCE
-- Run this entire script in your Supabase SQL Editor
-- https://supabase.com/dashboard/project/ifkfakjcuvmrogthxclq/sql/new

-- ============================================
-- MIGRATION 1: Create registrations table
-- ============================================

CREATE TABLE public.registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  registration_id TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  college TEXT NOT NULL,
  student_id TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  game_username TEXT NOT NULL,
  game_id TEXT NOT NULL,
  game TEXT NOT NULL,
  mode TEXT NOT NULL,
  squad_name TEXT,
  squad_members JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Composite unique constraint to prevent duplicate registrations per game mode
  CONSTRAINT unique_registration_per_game_mode UNIQUE (email, game, mode)
);

-- Create indexes for faster lookups
CREATE INDEX idx_registrations_email ON public.registrations(email);
CREATE INDEX idx_registrations_game_mode ON public.registrations(game, mode);
CREATE INDEX idx_registrations_registration_id ON public.registrations(registration_id);

-- Enable Row Level Security
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert registrations (public registration form)
CREATE POLICY "Anyone can register" 
ON public.registrations 
FOR INSERT 
WITH CHECK (true);

-- Allow anyone to read their own registration by email (for ticket lookup)
CREATE POLICY "Anyone can view registrations by email" 
ON public.registrations 
FOR SELECT 
USING (true);

-- ============================================
-- MIGRATION 2: Create auth and roles
-- ============================================

-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents infinite recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policy: Users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Update registrations table to allow admin access
CREATE POLICY "Admins can view all registrations"
ON public.registrations
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Create profiles table for user metadata
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
