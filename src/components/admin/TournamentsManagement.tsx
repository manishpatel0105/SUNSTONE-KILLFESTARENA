import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit2,
  Trash2,
  Trophy,
  Search,
  ChevronDown,
  ChevronUp,
  Loader2,
  Play,
  CheckCircle,
  Clock,
  X,
  Check,
  AlertTriangle,
  ArrowRight,
  Users,
  Award,
  Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { GAMES, GameType, GameMode } from '@/types/registration';
import { useAuth } from '@/hooks/useAuth';

// Types
interface Tournament {
  id: string;
  name: string;
  game: string;
  mode: string;
  description: string | null;
  total_rounds: number;
  current_round: number;
  status: 'draft' | 'registration' | 'in_progress' | 'completed' | 'cancelled';
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

interface TournamentRound {
  id: string;
  tournament_id: string;
  round_number: number;
  name: string;
  description: string | null;
  scheduled_date: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  max_teams: number | null;
}

interface Team {
  id: string;
  name: string;
  game: string;
  mode: string;
  is_active: boolean;
}

interface RoundQualification {
  id: string;
  tournament_id: string;
  round_id: string;
  team_id: string;
  status: 'qualified' | 'eliminated' | 'winner';
  points: number | null;
  rank: number | null;
}

interface TournamentFormData {
  name: string;
  game: GameType | '';
  mode: GameMode | '';
  description: string;
  total_rounds: number;
  start_date: string;
  end_date: string;
}

const initialTournamentForm: TournamentFormData = {
  name: '',
  game: '',
  mode: '',
  description: '',
  total_rounds: 3,
  start_date: '',
  end_date: '',
};

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  draft: { bg: 'bg-zinc-500/20', text: 'text-zinc-400', label: 'Draft' },
  registration: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Registration Open' },
  in_progress: { bg: 'bg-amber-500/20', text: 'text-amber-400', label: 'In Progress' },
  completed: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Completed' },
  cancelled: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Cancelled' },
};

const roundStatusColors: Record<string, { bg: string; text: string; icon: any }> = {
  pending: { bg: 'bg-zinc-500/20', text: 'text-zinc-400', icon: Clock },
  in_progress: { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: Play },
  completed: { bg: 'bg-green-500/20', text: 'text-green-400', icon: CheckCircle },
};

export function TournamentsManagement() {
  // State management
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [rounds, setRounds] = useState<Record<string, TournamentRound[]>>({});
  const [teams, setTeams] = useState<Team[]>([]);
  const [qualifications, setQualifications] = useState<Record<string, RoundQualification[]>>({});
  
  const [isLoading, setIsLoading] = useState(true);
  const [expandedTournament, setExpandedTournament] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [gameFilter, setGameFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal states
  const [isTournamentModalOpen, setIsTournamentModalOpen] = useState(false);
  const [isRoundSelectionOpen, setIsRoundSelectionOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [tournamentToDelete, setTournamentToDelete] = useState<Tournament | null>(null);
  const [selectedRound, setSelectedRound] = useState<TournamentRound | null>(null);
  const [selectedTournamentForRound, setSelectedTournamentForRound] = useState<Tournament | null>(null);

  // Form states
  const [tournamentForm, setTournamentForm] = useState<TournamentFormData>(initialTournamentForm);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch all tournaments
  const fetchTournaments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTournaments((data as Tournament[]) || []);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch tournaments.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch rounds for a tournament
  const fetchRounds = async (tournamentId: string) => {
    try {
      const { data, error } = await supabase
        .from('tournament_rounds')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('round_number', { ascending: true });

      if (error) throw error;
      setRounds((prev) => ({ ...prev, [tournamentId]: (data as TournamentRound[]) || [] }));
    } catch (error) {
      console.error('Error fetching rounds:', error);
    }
  };

  // Fetch teams for a specific game/mode
  const fetchTeamsForGameMode = async (game: string, mode: string) => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('game', game)
        .eq('mode', mode)
        .eq('is_active', true);

      if (error) throw error;
      setTeams((data as Team[]) || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  // Fetch qualifications for a round
  const fetchQualifications = async (roundId: string) => {
    try {
      const { data, error } = await supabase
        .from('round_qualifications')
        .select('*')
        .eq('round_id', roundId);

      if (error) throw error;
      setQualifications((prev) => ({ ...prev, [roundId]: (data as RoundQualification[]) || [] }));
      return (data as RoundQualification[]) || [];
    } catch (error) {
      console.error('Error fetching qualifications:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  // Toggle tournament expansion
  const toggleTournamentExpansion = async (tournamentId: string) => {
    if (expandedTournament === tournamentId) {
      setExpandedTournament(null);
    } else {
      setExpandedTournament(tournamentId);
      const tournament = tournaments.find((t) => t.id === tournamentId);
      if (tournament && !rounds[tournamentId]) {
        await fetchRounds(tournamentId);
      }
    }
  };

  // Filter tournaments
  const filteredTournaments = tournaments.filter((tournament) => {
    const matchesSearch =
      tournament.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tournament.description && tournament.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesGame = gameFilter === 'all' || tournament.game === gameFilter;
    const matchesStatus = statusFilter === 'all' || tournament.status === statusFilter;
    return matchesSearch && matchesGame && matchesStatus;
  });

  // Get modes for selected game
  const getModesForGame = (gameId: string) => {
    const game = GAMES.find((g) => g.id === gameId);
    return game?.modes || [];
  };

  // Open tournament modal
  const openTournamentModal = (tournament?: Tournament) => {
    if (tournament) {
      setEditingTournament(tournament);
      setTournamentForm({
        name: tournament.name,
        game: tournament.game as GameType,
        mode: tournament.mode as GameMode,
        description: tournament.description || '',
        total_rounds: tournament.total_rounds,
        start_date: tournament.start_date?.split('T')[0] || '',
        end_date: tournament.end_date?.split('T')[0] || '',
      });
    } else {
      setEditingTournament(null);
      setTournamentForm(initialTournamentForm);
    }
    setIsTournamentModalOpen(true);
  };

  // Save tournament
  const handleSaveTournament = async () => {
    if (!tournamentForm.name || !tournamentForm.game || !tournamentForm.mode) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      if (editingTournament) {
        // Update existing tournament
        const { error } = await supabase
          .from('tournaments')
          .update({
            name: tournamentForm.name,
            game: tournamentForm.game,
            mode: tournamentForm.mode,
            description: tournamentForm.description || null,
            total_rounds: tournamentForm.total_rounds,
            start_date: tournamentForm.start_date || null,
            end_date: tournamentForm.end_date || null,
          })
          .eq('id', editingTournament.id);

        if (error) throw error;

        // Update rounds if total_rounds changed
        if (editingTournament.total_rounds !== tournamentForm.total_rounds) {
          await updateTournamentRounds(editingTournament.id, tournamentForm.total_rounds);
        }

        toast({ title: 'Success', description: 'Tournament updated successfully.' });
      } else {
        // Create new tournament
        const { data, error } = await supabase
          .from('tournaments')
          .insert({
            name: tournamentForm.name,
            game: tournamentForm.game,
            mode: tournamentForm.mode,
            description: tournamentForm.description || null,
            total_rounds: tournamentForm.total_rounds,
            start_date: tournamentForm.start_date || null,
            end_date: tournamentForm.end_date || null,
            created_by: user?.id,
          })
          .select()
          .single();

        if (error) throw error;

        // Create rounds for the new tournament
        await createTournamentRounds(data.id, tournamentForm.total_rounds);

        toast({ title: 'Success', description: 'Tournament created successfully.' });
      }

      setIsTournamentModalOpen(false);
      fetchTournaments();
    } catch (error: any) {
      console.error('Error saving tournament:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save tournament.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Create tournament rounds
  const createTournamentRounds = async (tournamentId: string, totalRounds: number) => {
    const roundsToCreate = Array.from({ length: totalRounds }, (_, i) => ({
      tournament_id: tournamentId,
      round_number: i + 1,
      name: i === totalRounds - 1 ? 'Final' : `Round ${i + 1}`,
      status: 'pending' as const,
    }));

    const { error } = await supabase.from('tournament_rounds').insert(roundsToCreate);
    if (error) throw error;
  };

  // Update tournament rounds when total_rounds changes
  const updateTournamentRounds = async (tournamentId: string, newTotalRounds: number) => {
    const existingRounds = rounds[tournamentId] || [];
    const currentCount = existingRounds.length;

    if (newTotalRounds > currentCount) {
      // Add more rounds
      const roundsToAdd = Array.from({ length: newTotalRounds - currentCount }, (_, i) => ({
        tournament_id: tournamentId,
        round_number: currentCount + i + 1,
        name: currentCount + i + 1 === newTotalRounds ? 'Final' : `Round ${currentCount + i + 1}`,
        status: 'pending' as const,
      }));
      await supabase.from('tournament_rounds').insert(roundsToAdd);
    } else if (newTotalRounds < currentCount) {
      // Remove extra rounds (only pending ones)
      const roundsToRemove = existingRounds
        .filter((r) => r.round_number > newTotalRounds && r.status === 'pending')
        .map((r) => r.id);
      if (roundsToRemove.length > 0) {
        await supabase.from('tournament_rounds').delete().in('id', roundsToRemove);
      }
    }

    // Refresh rounds
    await fetchRounds(tournamentId);
  };

  // Delete tournament
  const handleDeleteTournament = async () => {
    if (!tournamentToDelete) return;

    try {
      const { error } = await supabase.from('tournaments').delete().eq('id', tournamentToDelete.id);

      if (error) throw error;
      toast({ title: 'Success', description: 'Tournament deleted successfully.' });
      setIsDeleteDialogOpen(false);
      setTournamentToDelete(null);
      fetchTournaments();
    } catch (error: any) {
      console.error('Error deleting tournament:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete tournament.',
        variant: 'destructive',
      });
    }
  };

  // Update tournament status
  const updateTournamentStatus = async (tournamentId: string, newStatus: Tournament['status']) => {
    try {
      const { error } = await supabase
        .from('tournaments')
        .update({ status: newStatus })
        .eq('id', tournamentId);

      if (error) throw error;
      
      toast({ title: 'Success', description: `Tournament status updated to ${newStatus}.` });
      fetchTournaments();
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update status.',
        variant: 'destructive',
      });
    }
  };

  // Open round selection modal
  const openRoundSelection = async (tournament: Tournament, round: TournamentRound) => {
    setSelectedTournamentForRound(tournament);
    setSelectedRound(round);
    await fetchTeamsForGameMode(tournament.game, tournament.mode);
    
    // Get existing qualifications for this round
    const existingQuals = await fetchQualifications(round.id);
    setSelectedTeams(existingQuals.map((q) => q.team_id));
    
    setIsRoundSelectionOpen(true);
  };

  // Save round qualifications
  const handleSaveQualifications = async () => {
    if (!selectedRound || !selectedTournamentForRound) return;

    setIsSaving(true);
    try {
      // Delete existing qualifications for this round
      await supabase.from('round_qualifications').delete().eq('round_id', selectedRound.id);

      // Insert new qualifications
      if (selectedTeams.length > 0) {
        const qualificationsToInsert = selectedTeams.map((teamId) => ({
          tournament_id: selectedTournamentForRound.id,
          round_id: selectedRound.id,
          team_id: teamId,
          status: 'qualified' as const,
          qualified_by: user?.id,
        }));

        const { error } = await supabase.from('round_qualifications').insert(qualificationsToInsert);
        if (error) throw error;
      }

      toast({
        title: 'Success',
        description: `${selectedTeams.length} teams qualified for ${selectedRound.name}.`,
      });
      setIsRoundSelectionOpen(false);
    } catch (error: any) {
      console.error('Error saving qualifications:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save qualifications.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Update round status
  const updateRoundStatus = async (round: TournamentRound, newStatus: TournamentRound['status']) => {
    try {
      const { error } = await supabase
        .from('tournament_rounds')
        .update({ status: newStatus })
        .eq('id', round.id);

      if (error) throw error;
      
      // Also update tournament current_round if starting a new round
      if (newStatus === 'in_progress') {
        await supabase
          .from('tournaments')
          .update({ current_round: round.round_number, status: 'in_progress' })
          .eq('id', round.tournament_id);
      }

      toast({ title: 'Success', description: `Round status updated to ${newStatus}.` });
      fetchRounds(round.tournament_id);
      fetchTournaments();
    } catch (error: any) {
      console.error('Error updating round status:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update round status.',
        variant: 'destructive',
      });
    }
  };

  // Toggle team selection
  const toggleTeamSelection = (teamId: string) => {
    setSelectedTeams((prev) =>
      prev.includes(teamId) ? prev.filter((id) => id !== teamId) : [...prev, teamId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <div className="relative flex-1 sm:min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tournaments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/10"
            />
          </div>
          <Select value={gameFilter} onValueChange={setGameFilter}>
            <SelectTrigger className="w-full sm:w-[160px] bg-white/5 border-white/10">
              <SelectValue placeholder="All Games" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-white/10">
              <SelectItem value="all">All Games</SelectItem>
              {GAMES.map((game) => (
                <SelectItem key={game.id} value={game.id}>
                  {game.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[160px] bg-white/5 border-white/10">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-white/10">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="registration">Registration</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="neon" onClick={() => openTournamentModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Create Tournament
        </Button>
      </div>

      {/* Tournaments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
            <p className="text-xs text-muted-foreground mt-2">Loading tournaments...</p>
          </div>
        ) : filteredTournaments.length === 0 ? (
          <div className="text-center py-16 glass-card rounded-2xl border border-white/5">
            <Trophy className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No tournaments found</p>
            <Button variant="outline" className="mt-4" onClick={() => openTournamentModal()}>
              <Plus className="w-4 h-4 mr-2" />
              Create your first tournament
            </Button>
          </div>
        ) : (
          filteredTournaments.map((tournament) => (
            <motion.div
              key={tournament.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl border border-white/5 bg-card/20 overflow-hidden"
            >
              {/* Tournament Header */}
              <div
                className={`p-6 cursor-pointer transition-colors ${
                  expandedTournament === tournament.id ? 'bg-primary/5' : 'hover:bg-white/5'
                }`}
                onClick={() => toggleTournamentExpansion(tournament.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Trophy className="w-5 h-5 text-primary" />
                      <h3 className="font-orbitron text-lg font-bold text-white">{tournament.name}</h3>
                      <span
                        className={`px-2 py-1 rounded text-[9px] font-bold uppercase ${
                          statusColors[tournament.status].bg
                        } ${statusColors[tournament.status].text}`}
                      >
                        {statusColors[tournament.status].label}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <span className="text-zinc-400">
                        <span className="text-primary font-bold">{tournament.game.toUpperCase()}</span>
                        <span className="mx-2">•</span>
                        {tournament.mode}
                      </span>
                      <span className="text-zinc-500">
                        {tournament.total_rounds} Rounds
                      </span>
                      {tournament.current_round > 0 && (
                        <span className="text-amber-400">
                          Currently: Round {tournament.current_round}
                        </span>
                      )}
                    </div>
                    {tournament.description && (
                      <p className="text-xs text-muted-foreground mt-2 max-w-xl">
                        {tournament.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        openTournamentModal(tournament);
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-destructive/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTournamentToDelete(tournament);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                    {expandedTournament === tournament.id ? (
                      <ChevronUp className="w-5 h-5 text-primary" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-zinc-500" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Content - Rounds */}
              <AnimatePresence>
                {expandedTournament === tournament.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-white/5"
                  >
                    <div className="p-6 bg-zinc-950/50">
                      {/* Status Controls */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        <span className="text-xs text-zinc-500 uppercase tracking-wider mr-2">
                          Update Status:
                        </span>
                        {(['draft', 'registration', 'in_progress', 'completed', 'cancelled'] as const).map(
                          (status) => (
                            <Button
                              key={status}
                              variant={tournament.status === status ? 'default' : 'outline'}
                              size="sm"
                              className={`h-7 text-[10px] ${
                                tournament.status === status ? '' : 'border-white/10'
                              }`}
                              onClick={() => updateTournamentStatus(tournament.id, status)}
                            >
                              {statusColors[status].label}
                            </Button>
                          )
                        )}
                      </div>

                      {/* Rounds Timeline */}
                      <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Tournament Rounds
                      </h4>
                      
                      {rounds[tournament.id]?.length > 0 ? (
                        <div className="space-y-3">
                          {rounds[tournament.id].map((round, idx) => {
                            const StatusIcon = roundStatusColors[round.status].icon;
                            const qualCount = qualifications[round.id]?.length || 0;
                            
                            return (
                              <div
                                key={round.id}
                                className={`p-4 rounded-xl border flex items-center justify-between ${
                                  round.status === 'in_progress'
                                    ? 'bg-amber-500/10 border-amber-500/30'
                                    : round.status === 'completed'
                                    ? 'bg-green-500/10 border-green-500/30'
                                    : 'bg-white/5 border-white/5'
                                }`}
                              >
                                <div className="flex items-center gap-4">
                                  <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                      roundStatusColors[round.status].bg
                                    }`}
                                  >
                                    <StatusIcon
                                      className={`w-5 h-5 ${roundStatusColors[round.status].text}`}
                                    />
                                  </div>
                                  <div>
                                    <p className="font-bold text-white">{round.name}</p>
                                    <p className="text-xs text-zinc-500">
                                      {round.status === 'pending'
                                        ? 'Not started'
                                        : round.status === 'in_progress'
                                        ? 'Currently playing'
                                        : 'Completed'}
                                      {qualCount > 0 && (
                                        <span className="ml-2 text-primary">
                                          • {qualCount} teams qualified
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8"
                                    onClick={() => openRoundSelection(tournament, round)}
                                  >
                                    <Users className="w-3 h-3 mr-2" />
                                    Select Teams
                                  </Button>
                                  
                                  {round.status === 'pending' && (
                                    <Button
                                      variant="default"
                                      size="sm"
                                      className="h-8 bg-amber-500 hover:bg-amber-600"
                                      onClick={() => updateRoundStatus(round, 'in_progress')}
                                    >
                                      <Play className="w-3 h-3 mr-2" />
                                      Start
                                    </Button>
                                  )}
                                  
                                  {round.status === 'in_progress' && (
                                    <Button
                                      variant="default"
                                      size="sm"
                                      className="h-8 bg-green-500 hover:bg-green-600"
                                      onClick={() => updateRoundStatus(round, 'completed')}
                                    >
                                      <CheckCircle className="w-3 h-3 mr-2" />
                                      Complete
                                    </Button>
                                  )}
                                </div>
                                
                                {idx < rounds[tournament.id].length - 1 && (
                                  <ArrowRight className="w-4 h-4 text-zinc-600 absolute right-[-20px] hidden md:block" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-zinc-500">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                          <p className="text-xs">Loading rounds...</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>

      {/* Tournament Modal */}
      <Dialog open={isTournamentModalOpen} onOpenChange={setIsTournamentModalOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-orbitron">
              {editingTournament ? 'Edit Tournament' : 'Create New Tournament'}
            </DialogTitle>
            <DialogDescription>
              {editingTournament
                ? 'Update tournament information below.'
                : 'Set up a new tournament with rounds and team management.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="tournament-name">Tournament Name *</Label>
              <Input
                id="tournament-name"
                value={tournamentForm.name}
                onChange={(e) => setTournamentForm({ ...tournamentForm, name: e.target.value })}
                placeholder="e.g., KillFest Arena Championship"
                className="bg-white/5 border-white/10"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Game *</Label>
                <Select
                  value={tournamentForm.game}
                  onValueChange={(value) =>
                    setTournamentForm({ ...tournamentForm, game: value as GameType, mode: '' })
                  }
                >
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue placeholder="Select game" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10">
                    {GAMES.map((game) => (
                      <SelectItem key={game.id} value={game.id}>
                        {game.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Mode *</Label>
                <Select
                  value={tournamentForm.mode}
                  onValueChange={(value) =>
                    setTournamentForm({ ...tournamentForm, mode: value as GameMode })
                  }
                  disabled={!tournamentForm.game}
                >
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10">
                    {tournamentForm.game &&
                      getModesForGame(tournamentForm.game).map((mode) => (
                        <SelectItem key={mode.id} value={mode.id}>
                          {mode.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="total-rounds">Number of Rounds *</Label>
              <Select
                value={tournamentForm.total_rounds.toString()}
                onValueChange={(value) =>
                  setTournamentForm({ ...tournamentForm, total_rounds: parseInt(value) })
                }
              >
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} Round{num > 1 ? 's' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={tournamentForm.start_date}
                  onChange={(e) => setTournamentForm({ ...tournamentForm, start_date: e.target.value })}
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={tournamentForm.end_date}
                  onChange={(e) => setTournamentForm({ ...tournamentForm, end_date: e.target.value })}
                  className="bg-white/5 border-white/10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={tournamentForm.description}
                onChange={(e) => setTournamentForm({ ...tournamentForm, description: e.target.value })}
                placeholder="Tournament details, rules, etc."
                className="bg-white/5 border-white/10 min-h-[80px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTournamentModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="neon" onClick={handleSaveTournament} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  {editingTournament ? 'Update' : 'Create'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Round Team Selection Modal */}
      <Dialog open={isRoundSelectionOpen} onOpenChange={setIsRoundSelectionOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="font-orbitron flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Select Teams for {selectedRound?.name}
            </DialogTitle>
            <DialogDescription>
              Choose which teams qualify for this round. Selected teams will be marked as qualified.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-zinc-400">
                {selectedTeams.length} team{selectedTeams.length !== 1 ? 's' : ''} selected
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTeams(teams.map((t) => t.id))}
              >
                Select All
              </Button>
            </div>

            <div className="max-h-[400px] overflow-y-auto space-y-2">
              {teams.length === 0 ? (
                <div className="text-center py-8 text-zinc-500">
                  <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No teams available for this game/mode.</p>
                  <p className="text-xs mt-1">Add teams in the Teams Management tab first.</p>
                </div>
              ) : (
                teams.map((team) => (
                  <div
                    key={team.id}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedTeams.includes(team.id)
                        ? 'bg-primary/20 border-primary/50'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                    onClick={() => toggleTeamSelection(team.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedTeams.includes(team.id)}
                        onCheckedChange={() => toggleTeamSelection(team.id)}
                        className="data-[state=checked]:bg-primary"
                      />
                      <div className="flex-1">
                        <p className="font-bold text-white">{team.name}</p>
                        <p className="text-xs text-zinc-500">
                          {team.game.toUpperCase()} • {team.mode}
                        </p>
                      </div>
                      {selectedTeams.includes(team.id) && (
                        <CheckCircle className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoundSelectionOpen(false)}>
              Cancel
            </Button>
            <Button variant="neon" onClick={handleSaveQualifications} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Save Qualifications
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-zinc-900 border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Delete Tournament
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{tournamentToDelete?.name}"? This will also delete all
              rounds and qualifications. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={handleDeleteTournament}
            >
              Delete Tournament
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
