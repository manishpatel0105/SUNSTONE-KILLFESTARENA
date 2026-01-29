import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit2,
  Trash2,
  Users,
  Search,
  ChevronDown,
  ChevronUp,
  Loader2,
  UserPlus,
  X,
  Check,
  AlertTriangle,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { GAMES, GameType, GameMode } from '@/types/registration';
import { useAuth } from '@/hooks/useAuth';

interface Team {
  id: string;
  name: string;
  game: string;
  mode: string;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface TeamMember {
  id: string;
  team_id: string;
  name: string;
  game_username: string;
  game_id: string;
  is_leader: boolean;
  email: string | null;
  phone: string | null;
}

interface TeamFormData {
  name: string;
  game: GameType | '';
  mode: GameMode | '';
  notes: string;
}

interface MemberFormData {
  name: string;
  game_username: string;
  game_id: string;
  is_leader: boolean;
  email: string;
  phone: string;
}

const initialTeamForm: TeamFormData = {
  name: '',
  game: '',
  mode: '',
  notes: '',
};

const initialMemberForm: MemberFormData = {
  name: '',
  game_username: '',
  game_id: '',
  is_leader: false,
  email: '',
  phone: '',
};

export function TeamsManagement() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamMembers, setTeamMembers] = useState<Record<string, TeamMember[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [gameFilter, setGameFilter] = useState('all');

  // Modal states
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [selectedTeamForMember, setSelectedTeamForMember] = useState<Team | null>(null);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);

  // Form states
  const [teamForm, setTeamForm] = useState<TeamFormData>(initialTeamForm);
  const [memberForm, setMemberForm] = useState<MemberFormData>(initialMemberForm);
  const [isSaving, setIsSaving] = useState(false);

  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch teams
  const fetchTeams = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeams((data as Team[]) || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch teams.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch team members for a specific team
  const fetchTeamMembers = async (teamId: string) => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', teamId)
        .order('is_leader', { ascending: false });

      if (error) throw error;
      setTeamMembers((prev) => ({ ...prev, [teamId]: (data as TeamMember[]) || [] }));
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  // Toggle team expansion and fetch members
  const toggleTeamExpansion = async (teamId: string) => {
    if (expandedTeam === teamId) {
      setExpandedTeam(null);
    } else {
      setExpandedTeam(teamId);
      if (!teamMembers[teamId]) {
        await fetchTeamMembers(teamId);
      }
    }
  };

  // Filter teams
  const filteredTeams = teams.filter((team) => {
    const matchesSearch =
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (team.notes && team.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesGame = gameFilter === 'all' || team.game === gameFilter;
    return matchesSearch && matchesGame;
  });

  // Get available modes for selected game
  const getModesForGame = (gameId: string) => {
    const game = GAMES.find((g) => g.id === gameId);
    return game?.modes || [];
  };

  // Open team modal for create/edit
  const openTeamModal = (team?: Team) => {
    if (team) {
      setEditingTeam(team);
      setTeamForm({
        name: team.name,
        game: team.game as GameType,
        mode: team.mode as GameMode,
        notes: team.notes || '',
      });
    } else {
      setEditingTeam(null);
      setTeamForm(initialTeamForm);
    }
    setIsTeamModalOpen(true);
  };

  // Open member modal for create/edit
  const openMemberModal = (team: Team, member?: TeamMember) => {
    setSelectedTeamForMember(team);
    if (member) {
      setEditingMember(member);
      setMemberForm({
        name: member.name,
        game_username: member.game_username,
        game_id: member.game_id,
        is_leader: member.is_leader,
        email: member.email || '',
        phone: member.phone || '',
      });
    } else {
      setEditingMember(null);
      setMemberForm(initialMemberForm);
    }
    setIsMemberModalOpen(true);
  };

  // Save team
  const handleSaveTeam = async () => {
    if (!teamForm.name || !teamForm.game || !teamForm.mode) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      if (editingTeam) {
        const { error } = await supabase
          .from('teams')
          .update({
            name: teamForm.name,
            game: teamForm.game,
            mode: teamForm.mode,
            notes: teamForm.notes || null,
          })
          .eq('id', editingTeam.id);

        if (error) throw error;
        toast({ title: 'Success', description: 'Team updated successfully.' });
      } else {
        const { error } = await supabase.from('teams').insert({
          name: teamForm.name,
          game: teamForm.game,
          mode: teamForm.mode,
          notes: teamForm.notes || null,
          created_by: user?.id,
        });

        if (error) throw error;
        toast({ title: 'Success', description: 'Team created successfully.' });
      }

      setIsTeamModalOpen(false);
      fetchTeams();
    } catch (error: any) {
      console.error('Error saving team:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save team.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Save member
  const handleSaveMember = async () => {
    if (!memberForm.name || !memberForm.game_username || !memberForm.game_id || !selectedTeamForMember) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      if (editingMember) {
        const { error } = await supabase
          .from('team_members')
          .update({
            name: memberForm.name,
            game_username: memberForm.game_username,
            game_id: memberForm.game_id,
            is_leader: memberForm.is_leader,
            email: memberForm.email || null,
            phone: memberForm.phone || null,
          })
          .eq('id', editingMember.id);

        if (error) throw error;
        toast({ title: 'Success', description: 'Member updated successfully.' });
      } else {
        const { error } = await supabase.from('team_members').insert({
          team_id: selectedTeamForMember.id,
          name: memberForm.name,
          game_username: memberForm.game_username,
          game_id: memberForm.game_id,
          is_leader: memberForm.is_leader,
          email: memberForm.email || null,
          phone: memberForm.phone || null,
        });

        if (error) throw error;
        toast({ title: 'Success', description: 'Member added successfully.' });
      }

      setIsMemberModalOpen(false);
      fetchTeamMembers(selectedTeamForMember.id);
    } catch (error: any) {
      console.error('Error saving member:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save member.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Delete team
  const handleDeleteTeam = async () => {
    if (!teamToDelete) return;

    try {
      const { error } = await supabase.from('teams').delete().eq('id', teamToDelete.id);

      if (error) throw error;
      toast({ title: 'Success', description: 'Team deleted successfully.' });
      setIsDeleteDialogOpen(false);
      setTeamToDelete(null);
      fetchTeams();
    } catch (error: any) {
      console.error('Error deleting team:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete team.',
        variant: 'destructive',
      });
    }
  };

  // Delete member
  const handleDeleteMember = async () => {
    if (!memberToDelete) return;

    try {
      const { error } = await supabase.from('team_members').delete().eq('id', memberToDelete.id);

      if (error) throw error;
      toast({ title: 'Success', description: 'Member removed successfully.' });
      setIsDeleteDialogOpen(false);

      // Refresh the team members
      if (expandedTeam) {
        fetchTeamMembers(expandedTeam);
      }
      setMemberToDelete(null);
    } catch (error: any) {
      console.error('Error deleting member:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove member.',
        variant: 'destructive',
      });
    }
  };

  const confirmDelete = (type: 'team' | 'member', item: Team | TeamMember) => {
    if (type === 'team') {
      setTeamToDelete(item as Team);
      setMemberToDelete(null);
    } else {
      setMemberToDelete(item as TeamMember);
      setTeamToDelete(null);
    }
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-1 sm:min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/10"
            />
          </div>
          <Select value={gameFilter} onValueChange={setGameFilter}>
            <SelectTrigger className="w-full sm:w-[180px] bg-white/5 border-white/10">
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
        </div>
        <Button variant="neon" onClick={() => openTeamModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Team
        </Button>
      </div>

      {/* Teams Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-white/5 bg-card/20">
        <Table>
          <TableHeader>
            <TableRow className="border-white/5 bg-white/5 hover:bg-white/5">
              <TableHead className="w-[50px]"></TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-primary">
                Team Name
              </TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Game / Mode
              </TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-400 text-center">
                Members
              </TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Status
              </TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                  <p className="text-xs text-muted-foreground mt-2">Loading teams...</p>
                </TableCell>
              </TableRow>
            ) : filteredTeams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-16">
                  <Users className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">No teams found</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredTeams.map((team) => (
                <>
                  <TableRow
                    key={team.id}
                    className={`border-white/5 cursor-pointer transition-colors ${
                      expandedTeam === team.id ? 'bg-primary/5' : 'hover:bg-white/5'
                    }`}
                    onClick={() => toggleTeamExpansion(team.id)}
                  >
                    <TableCell>
                      {expandedTeam === team.id ? (
                        <ChevronUp className="w-4 h-4 text-primary" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-zinc-500" />
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="font-orbitron text-sm font-bold text-white">{team.name}</p>
                      {team.notes && (
                        <p className="text-[10px] text-muted-foreground truncate max-w-[200px]">
                          {team.notes}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded text-[10px] font-bold uppercase bg-primary/20 text-primary">
                        {team.game}
                      </span>
                      <span className="ml-2 text-[10px] text-zinc-500">{team.mode}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-mono text-sm text-white">
                        {teamMembers[team.id]?.length || '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-[9px] font-bold uppercase ${
                          team.is_active
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-zinc-500/20 text-zinc-400'
                        }`}
                      >
                        {team.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            openMemberModal(team);
                          }}
                        >
                          <UserPlus className="w-4 h-4 text-primary" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            openTeamModal(team);
                          }}
                        >
                          <Edit2 className="w-4 h-4 text-zinc-400" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-destructive/20"
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmDelete('team', team);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Expanded Team Members */}
                  <AnimatePresence>
                    {expandedTeam === team.id && (
                      <TableRow className="border-white/5 bg-zinc-950/50 hover:bg-zinc-950/50">
                        <TableCell colSpan={6} className="p-0">
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-6">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                                  Team Members
                                </h4>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openMemberModal(team)}
                                  className="h-8"
                                >
                                  <UserPlus className="w-3 h-3 mr-2" />
                                  Add Member
                                </Button>
                              </div>

                              {teamMembers[team.id]?.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {teamMembers[team.id].map((member) => (
                                    <div
                                      key={member.id}
                                      className={`p-4 rounded-xl border ${
                                        member.is_leader
                                          ? 'bg-primary/10 border-primary/30'
                                          : 'bg-white/5 border-white/5'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <span
                                          className={`text-[10px] font-bold uppercase ${
                                            member.is_leader ? 'text-primary' : 'text-zinc-500'
                                          }`}
                                        >
                                          {member.is_leader ? '★ Leader' : 'Member'}
                                        </span>
                                        <div className="flex gap-1">
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() => openMemberModal(team, member)}
                                          >
                                            <Edit2 className="w-3 h-3" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 hover:bg-destructive/20"
                                            onClick={() => confirmDelete('member', member)}
                                          >
                                            <Trash2 className="w-3 h-3 text-destructive" />
                                          </Button>
                                        </div>
                                      </div>
                                      <p className="font-bold text-white text-sm">{member.name}</p>
                                      <p className="text-xs text-primary">{member.game_username}</p>
                                      <p className="text-[10px] text-zinc-500 font-mono">
                                        ID: {member.game_id}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-8 text-zinc-500">
                                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                  <p className="text-xs">No members added yet</p>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        </TableCell>
                      </TableRow>
                    )}
                  </AnimatePresence>
                </>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Team Modal */}
      <Dialog open={isTeamModalOpen} onOpenChange={setIsTeamModalOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-orbitron">
              {editingTeam ? 'Edit Team' : 'Create New Team'}
            </DialogTitle>
            <DialogDescription>
              {editingTeam
                ? 'Update team information below.'
                : 'Add a new team to the tournament system.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="team-name">Team Name *</Label>
              <Input
                id="team-name"
                value={teamForm.name}
                onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                placeholder="Enter team name"
                className="bg-white/5 border-white/10"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Game *</Label>
                <Select
                  value={teamForm.game}
                  onValueChange={(value) =>
                    setTeamForm({ ...teamForm, game: value as GameType, mode: '' })
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
                  value={teamForm.mode}
                  onValueChange={(value) => setTeamForm({ ...teamForm, mode: value as GameMode })}
                  disabled={!teamForm.game}
                >
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10">
                    {teamForm.game &&
                      getModesForGame(teamForm.game).map((mode) => (
                        <SelectItem key={mode.id} value={mode.id}>
                          {mode.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="team-notes">Notes (optional)</Label>
              <Textarea
                id="team-notes"
                value={teamForm.notes}
                onChange={(e) => setTeamForm({ ...teamForm, notes: e.target.value })}
                placeholder="Any additional notes..."
                className="bg-white/5 border-white/10 min-h-[80px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTeamModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="neon" onClick={handleSaveTeam} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  {editingTeam ? 'Update' : 'Create'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Member Modal */}
      <Dialog open={isMemberModalOpen} onOpenChange={setIsMemberModalOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-orbitron">
              {editingMember ? 'Edit Member' : 'Add Team Member'}
            </DialogTitle>
            <DialogDescription>
              {selectedTeamForMember && (
                <span>
                  Team: <strong className="text-primary">{selectedTeamForMember.name}</strong>
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="member-name">Full Name *</Label>
              <Input
                id="member-name"
                value={memberForm.name}
                onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                placeholder="Player's full name"
                className="bg-white/5 border-white/10"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="game-username">Game Username *</Label>
                <Input
                  id="game-username"
                  value={memberForm.game_username}
                  onChange={(e) => setMemberForm({ ...memberForm, game_username: e.target.value })}
                  placeholder="In-game name"
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="game-id">Game ID *</Label>
                <Input
                  id="game-id"
                  value={memberForm.game_id}
                  onChange={(e) => setMemberForm({ ...memberForm, game_id: e.target.value })}
                  placeholder="Player ID"
                  className="bg-white/5 border-white/10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="member-email">Email (optional)</Label>
                <Input
                  id="member-email"
                  type="email"
                  value={memberForm.email}
                  onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                  placeholder="email@example.com"
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="member-phone">Phone (optional)</Label>
                <Input
                  id="member-phone"
                  value={memberForm.phone}
                  onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
                  placeholder="+91 XXXXXXXXXX"
                  className="bg-white/5 border-white/10"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 py-2">
              <input
                type="checkbox"
                id="is-leader"
                checked={memberForm.is_leader}
                onChange={(e) => setMemberForm({ ...memberForm, is_leader: e.target.checked })}
                className="w-4 h-4 rounded border-white/20 bg-white/5"
              />
              <Label htmlFor="is-leader" className="cursor-pointer">
                This player is the Team Leader
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMemberModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="neon" onClick={handleSaveMember} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  {editingMember ? 'Update' : 'Add Member'}
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
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              {teamToDelete
                ? `Are you sure you want to delete team "${teamToDelete.name}"? This will also delete all team members and cannot be undone.`
                : memberToDelete
                ? `Are you sure you want to remove "${memberToDelete.name}" from the team?`
                : 'Are you sure you want to delete this item?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={teamToDelete ? handleDeleteTeam : handleDeleteMember}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
