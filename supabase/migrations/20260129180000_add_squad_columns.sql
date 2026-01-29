-- Add squad support to registrations table
ALTER TABLE public.registrations 
ADD COLUMN IF NOT EXISTS squad_name TEXT,
ADD COLUMN IF NOT EXISTS squad_members JSONB;

-- Update unique constraint to include squad_name if applicable
-- Actually, keep it simple: one registration per email per game mode is enough.
