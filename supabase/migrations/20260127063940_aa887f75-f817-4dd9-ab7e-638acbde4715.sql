-- Create registrations table
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
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Composite unique constraint to prevent duplicate registrations per game mode
  CONSTRAINT unique_registration_per_game_mode UNIQUE (email, game, mode)
);

-- Create index for faster lookups
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