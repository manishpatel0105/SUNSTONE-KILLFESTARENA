-- ============================================
-- MIGRATION: Admin Tournament Management System
-- Date: 30 January 2026
-- Description: Adds tables for team management, 
-- tournament rounds, and qualification tracking
-- ============================================

-- ============================================
-- 1. TEAMS TABLE
-- Stores team information managed by admins
-- ============================================

CREATE TABLE IF NOT EXISTS public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  game TEXT NOT NULL,
  mode TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Unique team name per game/mode combination
  CONSTRAINT unique_team_per_game_mode UNIQUE (name, game, mode)
);

-- Create indexes for faster lookups
CREATE INDEX idx_teams_game_mode ON public.teams(game, mode);
CREATE INDEX idx_teams_is_active ON public.teams(is_active);

-- Enable Row Level Security
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Policies for teams table
CREATE POLICY "Admins can view all teams"
ON public.teams
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert teams"
ON public.teams
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update teams"
ON public.teams
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete teams"
ON public.teams
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- 2. TEAM MEMBERS TABLE
-- Stores members belonging to each team
-- ============================================

CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  game_username TEXT NOT NULL,
  game_id TEXT NOT NULL,
  is_leader BOOLEAN NOT NULL DEFAULT false,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_team_members_team_id ON public.team_members(team_id);

-- Enable Row Level Security
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Policies for team_members table
CREATE POLICY "Admins can view all team members"
ON public.team_members
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert team members"
ON public.team_members
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update team members"
ON public.team_members
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete team members"
ON public.team_members
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- 3. TOURNAMENTS TABLE
-- Main tournament configuration
-- ============================================

CREATE TABLE IF NOT EXISTS public.tournaments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  game TEXT NOT NULL,
  mode TEXT NOT NULL,
  description TEXT,
  total_rounds INTEGER NOT NULL DEFAULT 1,
  current_round INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'registration', 'in_progress', 'completed', 'cancelled')),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Unique tournament name per game/mode
  CONSTRAINT unique_tournament_per_game_mode UNIQUE (name, game, mode)
);

-- Create indexes
CREATE INDEX idx_tournaments_game_mode ON public.tournaments(game, mode);
CREATE INDEX idx_tournaments_status ON public.tournaments(status);

-- Enable Row Level Security
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;

-- Policies for tournaments table
CREATE POLICY "Admins can view all tournaments"
ON public.tournaments
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert tournaments"
ON public.tournaments
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update tournaments"
ON public.tournaments
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete tournaments"
ON public.tournaments
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- 4. TOURNAMENT ROUNDS TABLE
-- Configuration for each round in a tournament
-- ============================================

CREATE TABLE IF NOT EXISTS public.tournament_rounds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  scheduled_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  max_teams INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Unique round number per tournament
  CONSTRAINT unique_round_per_tournament UNIQUE (tournament_id, round_number)
);

-- Create indexes
CREATE INDEX idx_tournament_rounds_tournament_id ON public.tournament_rounds(tournament_id);
CREATE INDEX idx_tournament_rounds_status ON public.tournament_rounds(status);

-- Enable Row Level Security
ALTER TABLE public.tournament_rounds ENABLE ROW LEVEL SECURITY;

-- Policies for tournament_rounds table
CREATE POLICY "Admins can view all tournament rounds"
ON public.tournament_rounds
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert tournament rounds"
ON public.tournament_rounds
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update tournament rounds"
ON public.tournament_rounds
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete tournament rounds"
ON public.tournament_rounds
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- 5. ROUND QUALIFICATIONS TABLE
-- Tracks which teams qualify for each round
-- ============================================

CREATE TABLE IF NOT EXISTS public.round_qualifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  round_id UUID NOT NULL REFERENCES public.tournament_rounds(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'qualified' CHECK (status IN ('qualified', 'eliminated', 'winner')),
  points INTEGER DEFAULT 0,
  rank INTEGER,
  notes TEXT,
  qualified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Each team can only appear once per round
  CONSTRAINT unique_team_per_round UNIQUE (round_id, team_id)
);

-- Create indexes
CREATE INDEX idx_round_qualifications_tournament_id ON public.round_qualifications(tournament_id);
CREATE INDEX idx_round_qualifications_round_id ON public.round_qualifications(round_id);
CREATE INDEX idx_round_qualifications_team_id ON public.round_qualifications(team_id);
CREATE INDEX idx_round_qualifications_status ON public.round_qualifications(status);

-- Enable Row Level Security
ALTER TABLE public.round_qualifications ENABLE ROW LEVEL SECURITY;

-- Policies for round_qualifications table
CREATE POLICY "Admins can view all round qualifications"
ON public.round_qualifications
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert round qualifications"
ON public.round_qualifications
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update round qualifications"
ON public.round_qualifications
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete round qualifications"
ON public.round_qualifications
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- 6. UPDATE TRIGGERS FOR updated_at
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all new tables
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tournaments_updated_at
  BEFORE UPDATE ON public.tournaments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tournament_rounds_updated_at
  BEFORE UPDATE ON public.tournament_rounds
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_round_qualifications_updated_at
  BEFORE UPDATE ON public.round_qualifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- END OF MIGRATION
-- ============================================
