import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  LogOut,
  Search,
  Users,
  Gamepad2,
  Trophy,
  RefreshCw,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  ClipboardList,
  Swords,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { GAMES, SquadMember } from '@/types/registration';
import { TeamsManagement } from '@/components/admin/TeamsManagement';
import { TournamentsManagement } from '@/components/admin/TournamentsManagement';

interface Registration {
  id: string;
  registration_id: string;
  full_name: string;
  college: string;
  student_id: string;
  phone: string;
  email: string;
  game_username: string;
  game_id: string;
  game: string;
  mode: string;
  created_at: string;
  squad_name?: string;
  squad_members?: SquadMember[];
}

const Admin = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [gameFilter, setGameFilter] = useState('all');
  const [modeFilter, setModeFilter] = useState('all');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('registrations');

  const { user, isAdmin, isLoading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/auth');
    }
  }, [user, isAdmin, authLoading, navigate]);

  const fetchRegistrations = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRegistrations((data as any) as Registration[] || []);
      setFilteredRegistrations((data as any) as Registration[] || []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch registrations.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      fetchRegistrations();
    }
  }, [user, isAdmin]);

  useEffect(() => {
    let filtered = [...registrations];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (reg) =>
          reg.full_name.toLowerCase().includes(query) ||
          reg.email.toLowerCase().includes(query) ||
          reg.college.toLowerCase().includes(query) ||
          reg.registration_id.toLowerCase().includes(query) ||
          reg.phone.includes(query) ||
          (reg.squad_name && reg.squad_name.toLowerCase().includes(query))
      );
    }

    if (gameFilter !== 'all') {
      filtered = filtered.filter((reg) => reg.game === gameFilter);
    }

    if (modeFilter !== 'all') {
      filtered = filtered.filter((reg) => reg.mode === modeFilter);
    }

    setFilteredRegistrations(filtered);
  }, [searchQuery, gameFilter, modeFilter, registrations]);

  const getModesForGame = () => {
    if (gameFilter === 'all') {
      return GAMES.flatMap((g) => g.modes);
    }
    const game = GAMES.find((g) => g.id === gameFilter);
    return game?.modes || [];
  };

  const exportToCSV = () => {
    const headers = [
      'Registration ID',
      'Squad Name',
      'Leader/Participant Name',
      'College',
      'Student ID',
      'Phone',
      'Email',
      'Game Username',
      'Game ID',
      'Game',
      'Mode',
      'Squad Members (Name | Username | ID | IsLeader)',
      'Registered At',
    ];

    const csvContent = [
      headers.join(','),
      ...filteredRegistrations.map((reg) =>
        [
          reg.registration_id,
          reg.squad_name ? `"${reg.squad_name}"` : 'N/A',
          `"${reg.full_name}"`,
          `"${reg.college}"`,
          reg.student_id,
          reg.phone,
          reg.email,
          `"${reg.game_username}"`,
          reg.game_id,
          GAMES.find((g) => g.id === reg.game)?.fullName || reg.game,
          reg.mode,
          reg.squad_members
            ? `"${reg.squad_members.map(m => `${m.name}|${m.gameUsername}|${m.gameId}|${m.isLeader}`).join('; ')}"`
            : 'N/A',
          new Date(reg.created_at).toLocaleString(),
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `killfest_registrations_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Export Complete',
      description: `Exported ${filteredRegistrations.length} registrations to CSV.`,
    });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const stats = {
    total: registrations.length,
    bgmi: registrations.filter((r) => r.game === 'bgmi').length,
    freefire: registrations.filter((r) => r.game === 'freefire').length,
    shadowfight: registrations.filter((r) => r.game === 'shadowfight').length,
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background selection:bg-primary/30">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <Gamepad2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="font-orbitron text-xl font-black tracking-tight text-white italic">
                ADMIN <span className="text-primary">ZONE</span>
              </h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">Tournament Management System</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-xs uppercase font-bold tracking-wider">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Portal
            </Button>
            <div className="h-6 w-px bg-border mx-2" />
            <Button variant="outline" size="sm" onClick={handleSignOut} className="border-destructive/20 text-destructive hover:bg-destructive/10 text-xs uppercase font-bold tracking-wider">
              <LogOut className="w-4 h-4 mr-2" />
              Exit
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Registrations', value: stats.total, icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
            { label: 'BGMI Entries', value: stats.bgmi, icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-500/10' },
            { label: 'Free Fire Entries', value: stats.freefire, icon: Trophy, color: 'text-orange-500', bg: 'bg-orange-500/10' },
            { label: 'Shadow Fight 4', value: stats.shadowfight, icon: Trophy, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-2xl p-6 border border-white/5 bg-gradient-to-br from-card to-card/50"
            >
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{stat.label}</p>
                  <p className="font-orbitron text-2xl font-black text-white">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-card/50 border border-white/5 p-1 h-auto flex-wrap">
            <TabsTrigger 
              value="registrations" 
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary font-bold text-xs uppercase tracking-wider px-6 py-3"
            >
              <ClipboardList className="w-4 h-4 mr-2" />
              Registrations
            </TabsTrigger>
            <TabsTrigger 
              value="teams" 
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary font-bold text-xs uppercase tracking-wider px-6 py-3"
            >
              <Users className="w-4 h-4 mr-2" />
              Teams
            </TabsTrigger>
            <TabsTrigger 
              value="tournaments" 
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary font-bold text-xs uppercase tracking-wider px-6 py-3"
            >
              <Swords className="w-4 h-4 mr-2" />
              Tournaments
            </TabsTrigger>
          </TabsList>

          {/* Registrations Tab */}
          <TabsContent value="registrations" className="mt-6">
            {/* Control Bar */}
            <div className="glass-card rounded-2xl p-6 mb-8 border border-white/5 bg-card/30 backdrop-blur-md">
              <div className="flex flex-col xl:flex-row gap-6 items-start xl:items-center justify-between">
                <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto">
                  {/* Search */}
                  <div className="relative flex-1 md:min-w-[400px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by ID, Name, Squad, email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 bg-white/5 border-white/10 h-12 rounded-xl focus:ring-primary/20"
                    />
                  </div>

                  {/* Game Filter */}
                  <Select value={gameFilter} onValueChange={(value) => {
                    setGameFilter(value);
                    setModeFilter('all');
                  }}>
                    <SelectTrigger className="w-full md:w-[200px] h-12 bg-white/5 border-white/10 rounded-xl">
                      <Gamepad2 className="w-4 h-4 mr-2 text-primary" />
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

                  {/* Mode Filter */}
                  <Select value={modeFilter} onValueChange={setModeFilter}>
                    <SelectTrigger className="w-full md:w-[200px] h-12 bg-white/5 border-white/10 rounded-xl">
                      <SelectValue placeholder="All Modes" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10">
                      <SelectItem value="all">All Modes</SelectItem>
                      {getModesForGame().map((mode) => (
                        <SelectItem key={mode.id} value={mode.id}>
                          {mode.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                  <Button variant="outline" size="lg" onClick={fetchRegistrations} className="flex-1 md:flex-none border-white/10 bg-white/5 h-12 rounded-xl">
                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Button variant="neon" size="lg" onClick={exportToCSV} className="flex-1 md:flex-none h-12 rounded-xl px-8">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Table */}
            <div className="glass-card rounded-2xl overflow-hidden border border-white/5 bg-card/20 pb-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/5 bg-white/5 hover:bg-white/5">
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-primary">Reg. ID</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Team / Participant</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-400">College</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-400 text-center">Game</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-400">In-Game Details</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-20 border-transparent">
                          <div className="flex flex-col items-center gap-4">
                            <RefreshCw className="w-10 h-10 animate-spin text-primary/50" />
                            <p className="font-orbitron text-xs text-muted-foreground animate-pulse tracking-widest uppercase">Initializing Database...</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredRegistrations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-20 border-transparent">
                          <div className="flex flex-col items-center gap-4">
                            <ShieldAlert className="w-10 h-10 text-destructive/50" />
                            <p className="font-orbitron text-xs text-muted-foreground tracking-widest uppercase">No Active Registrations Found</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRegistrations.map((reg) => (
                        <>
                          <TableRow
                            key={reg.id}
                            className={`border-white/5 transition-colors cursor-pointer ${expandedRow === reg.id ? 'bg-primary/5' : 'hover:bg-white/5'}`}
                            onClick={() => toggleRow(reg.id)}
                          >
                            <TableCell>
                              {reg.squad_members ? (
                                expandedRow === reg.id ? <ChevronUp className="w-4 h-4 text-primary" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />
                              ) : null}
                            </TableCell>
                            <TableCell className="font-mono text-[10px] font-bold text-primary">
                              {reg.registration_id}
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-orbitron text-sm font-bold text-white uppercase truncate max-w-[200px]">
                                  {reg.squad_name || reg.full_name}
                                </p>
                                <p className="text-[10px] text-muted-foreground lowercase truncate max-w-[200px]">
                                  {reg.email}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-[150px]">
                                <p className="text-xs text-zinc-300 font-medium truncate">{reg.college}</p>
                                <p className="text-[9px] text-zinc-500 uppercase font-black">{reg.student_id}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="inline-flex flex-col gap-1">
                                <span className="px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest bg-primary/20 text-primary border border-primary/20">
                                  {reg.game}
                                </span>
                                <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-tighter">
                                  {reg.mode}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="text-xs font-bold text-zinc-300">{reg.game_username}</p>
                                <p className="text-[9px] text-primary/70 font-mono italic">{reg.game_id}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-zinc-500 font-mono text-[10px]">
                              {new Date(reg.created_at).toLocaleDateString()}
                            </TableCell>
                          </TableRow>

                          {/* Expanded View for Squad Members */}
                          <AnimatePresence>
                            {expandedRow === reg.id && reg.squad_members && (
                              <TableRow className="border-white/5 bg-zinc-950/50 hover:bg-zinc-950/50">
                                <TableCell colSpan={7} className="p-0 border-transparent">
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                      {reg.squad_members.map((member, idx) => (
                                        <div key={idx} className={`p-4 rounded-xl border ${member.isLeader ? 'bg-primary/10 border-primary/30' : 'bg-white/5 border-white/5 shadow-sm'}`}>
                                          <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                                            <div className="flex items-center gap-2">
                                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${member.isLeader ? 'bg-primary text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                                                {idx + 1}
                                              </div>
                                              <span className="text-[10px] font-orbitron font-bold text-white uppercase tracking-widest">
                                                {member.isLeader ? 'Squad Leader' : `Member ${idx + 1}`}
                                              </span>
                                            </div>
                                            {member.isLeader && <ShieldAlert className="w-3 h-3 text-primary" />}
                                          </div>
                                          <div className="space-y-1.5 min-w-0">
                                            <p className="text-xs font-black text-white uppercase truncate">{member.name}</p>
                                            <p className="text-[10px] font-bold text-primary truncate italic">{member.gameUsername}</p>
                                            <p className="text-[10px] font-mono text-zinc-500 font-bold uppercase">{member.gameId}</p>
                                          </div>
                                        </div>
                                      ))}
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
            </div>

            {/* Results count indicator */}
            <div className="mt-8 flex items-center justify-center gap-3">
              <div className="h-px w-10 bg-white/5" />
              <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.5em]">
                Syncing {filteredRegistrations.length} of {registrations.length} Active Records
              </p>
              <div className="h-px w-10 bg-white/5" />
            </div>
          </TabsContent>

          {/* Teams Tab */}
          <TabsContent value="teams" className="mt-6">
            <TeamsManagement />
          </TabsContent>

          {/* Tournaments Tab */}
          <TabsContent value="tournaments" className="mt-6">
            <TournamentsManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
