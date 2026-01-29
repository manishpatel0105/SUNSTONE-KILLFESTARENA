import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LogOut,
  Gamepad2,
  Ticket,
  Calendar,
  User,
  ShieldCheck,
  Plus,
  RefreshCw,
  Trophy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { GAMES } from '@/types/registration';

interface Registration {
  id: string;
  registration_id: string;
  full_name: string;
  college: string;
  student_id: string;
  game: string;
  mode: string;
  game_username: string;
  created_at: string;
  squad_name?: string;
}

const UserDashboard = () => {
  const [myRegistrations, setMyRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // If we don't have a user object yet, wait
    if (!user) {
      // Small timeout to allow auth to restore session if present
      const timer = setTimeout(() => {
        if (!user) navigate('/auth');
      }, 1000);
      return () => clearTimeout(timer);
    }

    const fetchMyRegistrations = async () => {
      try {
        setIsLoading(true); // Ensure loading state is set true at start
        const { data, error } = await supabase
          .from('registrations')
          .select('*')
          .eq('email', user.email)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Database fetch error:', error);
          throw error;
        }
        setMyRegistrations((data as any) as Registration[] || []);
      } catch (error: any) {
        console.error('Error fetching registrations:', error);
        toast({
          title: 'Connection Error',
          description: error.message || 'Failed to load registrations. Check your connection.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyRegistrations();
  }, [user, navigate, toast]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getGameImage = (gameId: string) => {
    return GAMES.find(g => g.id === gameId)?.image || '/game-icons/bgmi.png';
  };

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
                PLAYER <span className="text-primary">DASHBOARD</span>
              </h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">
                {user?.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-xs uppercase font-bold tracking-wider">
              <Plus className="w-4 h-4 mr-2" />
              Register New
            </Button>
            <div className="h-6 w-px bg-border mx-2" />
            <Button variant="outline" size="sm" onClick={handleSignOut} className="border-destructive/20 text-destructive hover:bg-destructive/10 text-xs uppercase font-bold tracking-wider">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-orbitron text-2xl font-bold text-white flex items-center gap-3">
            <Ticket className="w-6 h-6 text-primary" />
            My Registrations
          </h2>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <RefreshCw className="w-10 h-10 animate-spin text-primary mb-4" />
            <p className="text-zinc-500 font-orbitron text-sm">Loading your battle passes...</p>
          </div>
        ) : myRegistrations.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center border-dashed border-2 border-white/10">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Gamepad2 className="w-8 h-8 text-zinc-500" />
            </div>
            <h3 className="font-orbitron text-xl font-bold text-white mb-2">No Registrations Found</h3>
            <p className="text-zinc-400 mb-8 max-w-md mx-auto">
              You haven't registered for any tournaments yet. Join the battle and prove your skills!
            </p>
            <Button variant="neon" size="lg" onClick={() => navigate('/')}>
              Browse Tournaments
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myRegistrations.map((reg, idx) => (
              <motion.div
                key={reg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card rounded-2xl overflow-hidden group hover:border-primary/50 transition-colors"
              >
                {/* Card Header */}
                <div className="relative h-32 bg-zinc-900 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                  <img 
                    src={getGameImage(reg.game)} 
                    alt={reg.game}
                    className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-4 left-4 z-20">
                    <span className="px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest bg-primary text-black mb-2 inline-block">
                      {reg.mode}
                    </span>
                    <h3 className="font-orbitron text-lg font-bold text-white">
                      {GAMES.find(g => g.id === reg.game)?.name || reg.game}
                    </h3>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-white/5">
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Registration ID</p>
                      <p className="font-mono text-primary font-bold">{reg.registration_id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Date</p>
                      <p className="text-xs text-white font-bold">{new Date(reg.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-zinc-500" />
                      <div>
                        <p className="text-[10px] text-zinc-500 uppercase font-bold">Player Name</p>
                        <p className="text-sm text-white font-medium">{reg.full_name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Gamepad2 className="w-4 h-4 text-zinc-500" />
                      <div>
                        <p className="text-[10px] text-zinc-500 uppercase font-bold">In-Game Name</p>
                        <p className="text-sm text-white font-medium">{reg.game_username}</p>
                      </div>
                    </div>

                    {reg.squad_name && (
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="w-4 h-4 text-zinc-500" />
                        <div>
                          <p className="text-[10px] text-zinc-500 uppercase font-bold">Squad</p>
                          <p className="text-sm text-amber-500 font-bold">{reg.squad_name}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-4 mt-4 border-t border-white/5">
                    <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
                      <Trophy className="w-8 h-8 text-yellow-500/50" />
                      <div>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase">Status</p>
                        <p className="text-xs text-white">Registered • <span className="text-green-400">Qualified for Selection</span></p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;
