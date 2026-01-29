import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Loader2, Users, User, Trophy, Shield, Info } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { GameInfo, GameMode, Ticket, GAMES, SquadMember } from '@/types/registration';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const memberSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(100),
  gameUsername: z.string().trim().min(2, 'Game username is required').max(50),
  gameId: z.string().trim().min(2, 'Game ID is required').max(50),
});

const registrationSchema = z.object({
  fullName: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  college: z.string().trim().min(2, 'College name is required').max(200),
  studentId: z.string().trim().min(2, 'Student ID is required').max(50),
  phone: z.string().regex(/^(?:0|91|\+91)?[6-9]\d{9}$/, 'Enter a valid phone number'),
  email: z.string().trim().email('Enter a valid email address').max(255),
  gameUsername: z.string().trim().min(2, 'Game username is required').max(50),
  gameId: z.string().trim().min(2, 'Game ID is required').max(50),
  squadName: z.string().trim().min(2, 'Squad name is required').max(100).optional(),
});

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedGame: GameInfo | null;
  onSuccess: (ticket: Ticket) => void;
}

const RegistrationModal = ({ isOpen, onClose, selectedGame, onSuccess }: RegistrationModalProps) => {
  const [step, setStep] = useState(1); // 1: Mode/Rules, 2: Leader Info, 3: Squad Info (for squad games)
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    fullName: '',
    college: '',
    studentId: '',
    phone: '',
    email: '',
    gameUsername: '',
    gameId: '',
    squadName: '',
  });

  const [squadMembers, setSquadMembers] = useState<SquadMember[]>([
    { name: '', gameUsername: '', gameId: '', isLeader: false },
    { name: '', gameUsername: '', gameId: '', isLeader: false },
    { name: '', gameUsername: '', gameId: '', isLeader: false },
  ]);

  const [leaderIndex, setLeaderIndex] = useState<number>(-1); // -1 means main registrant is leader

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedMode(null);
      setErrors({});
      setFormData({
        fullName: '',
        college: '',
        studentId: '',
        phone: '',
        email: '',
        gameUsername: '',
        gameId: '',
        squadName: '',
      });
      setSquadMembers([
        { name: '', gameUsername: '', gameId: '', isLeader: false },
        { name: '', gameUsername: '', gameId: '', isLeader: false },
        { name: '', gameUsername: '', gameId: '', isLeader: false },
      ]);
      setLeaderIndex(-1);
    }
  }, [isOpen]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSquadMemberChange = (index: number, field: keyof SquadMember, value: string) => {
    const newMembers = [...squadMembers];
    newMembers[index] = { ...newMembers[index], [field]: value };
    setSquadMembers(newMembers);
  };

  const handleModeSelect = (mode: GameMode) => {
    setSelectedMode(mode);
    setStep(2);
  };

  const validateStep2 = () => {
    try {
      const dataToValidate = { ...formData };
      if (selectedGame?.isSquad && !formData.squadName) {
        setErrors(prev => ({ ...prev, squadName: 'Squad name is required' }));
        return false;
      }
      registrationSchema.parse(dataToValidate);
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        err.errors.forEach(e => {
          if (e.path[0]) {
            newErrors[e.path[0].toString()] = e.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    squadMembers.forEach((member, idx) => {
      try {
        memberSchema.parse(member);
      } catch (err) {
        if (err instanceof z.ZodError) {
          err.errors.forEach(e => {
            newErrors[`member_${idx}_${e.path[0]}`] = e.message;
          });
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const generateRegistrationId = (): string => {
    return `SKF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  };

  const handleSubmit = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    
    if (selectedGame?.isSquad && step === 2) {
      if (validateStep2()) {
        setStep(3);
      }
      return;
    }

    if (selectedGame?.isSquad && step === 3) {
      if (!validateStep3()) return;
    } else {
      if (!validateStep2()) return;
    }

    setIsSubmitting(true);

    try {
      const registrationId = generateRegistrationId();

      const allMembers: SquadMember[] = [
        {
          name: formData.fullName,
          gameUsername: formData.gameUsername,
          gameId: formData.gameId,
          isLeader: leaderIndex === -1
        },
        ...squadMembers.map((m, i) => ({ ...m, isLeader: leaderIndex === i }))
      ];

      // Insert registration into database
      const { data, error } = await supabase
        .from('registrations')
        .insert({
          registration_id: registrationId,
          full_name: formData.fullName.trim(),
          college: formData.college.trim(),
          student_id: formData.studentId.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim().toLowerCase(),
          game_username: formData.gameUsername.trim(),
          game_id: formData.gameId.trim(),
          game: selectedGame?.id as string,
          mode: selectedMode as string,
          squad_name: formData.squadName.trim() || null,
          squad_members: (selectedGame?.isSquad ? allMembers : null) as any,
        } as any)
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          toast({
            title: 'Already Registered',
            description: `This email is already registered for this game mode.`,
            variant: 'destructive',
          });
          setIsSubmitting(false);
          return;
        }
        throw error;
      }

      const ticket: Ticket = {
        registrationId: data.registration_id,
        participantName: data.full_name,
        college: data.college,
        studentId: data.student_id,
        phone: data.phone,
        email: data.email,
        gameUsername: data.game_username,
        gameId: data.game_id,
        game: selectedGame?.fullName || '',
        mode: selectedGame?.modes.find(m => m.id === selectedMode)?.name || '',
        registeredAt: data.created_at,
        squadName: data.squad_name,
        members: (data.squad_members as any) as SquadMember[],
      };

      toast({
        title: 'Registration Successful!',
        description: 'Your tournament ticket is ready.',
      });

      onSuccess(ticket);
      handleClose();
    } catch (error: any) {
      console.error('Registration error details:', error);

      let errorMessage = 'Something went wrong. Please try again.';

      if (error?.message?.includes('column') && error?.message?.includes('does not exist')) {
        errorMessage = 'Database is not ready for squad registrations. Please run the provided SQL in your Supabase dashboard.';
      } else if (error?.message) {
        errorMessage = error.message;
      }

      toast({
        title: 'Registration Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSelectedMode(null);
    setErrors({});
    onClose();
  };

  if (!isOpen || !selectedGame) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-md"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="glass-card rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border-primary/20"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-border/50 flex items-center justify-between bg-card/50 rounded-t-2xl">
            <div className="flex items-center gap-4">
              {step > 1 && (
                <Button variant="ghost" size="icon" onClick={() => setStep(step - 1)} className="hover:bg-primary/10">
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              )}
              <div>
                <p className="text-[10px] text-primary font-orbitron tracking-[0.2em] uppercase">Tournament Entry</p>
                <h2 className="font-orbitron text-xl font-bold text-foreground flex items-center gap-2">
                  {selectedGame.name} <span className="text-muted-foreground w-1 h-1 rounded-full bg-muted-foreground/50 self-center hidden md:inline-block" />
                  <span className="text-primary/80 hidden md:inline-block">Registration</span>
                </h2>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose} className="hover:bg-destructive/10 hover:text-destructive">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Progress Bar (if squad) */}
          {selectedGame.isSquad && (
            <div className="h-1 w-full bg-muted">
              <motion.div
                className="h-full bg-primary"
                animate={{ width: `${(step / 3) * 100}%` }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            </div>
          )}

          {/* Content */}
          <div className="p-6 md:p-8 overflow-y-auto flex-1">
            {step === 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="flex items-center gap-2 text-primary">
                  <Trophy className="w-5 h-5" />
                  <h3 className="font-orbitron font-bold uppercase tracking-wider">Select Mode</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedGame.modes.map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => handleModeSelect(mode.id)}
                      className="relative group overflow-hidden glass-card rounded-xl p-6 text-left hover:border-primary/50 transition-all border-border/40 bg-card/30"
                    >
                      <div className="absolute top-0 right-0 w-20 h-20 -mr-10 -mt-10 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
                      <h3 className="font-orbitron text-lg font-bold text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                        {mode.name}
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                      </h3>
                      {mode.description && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">{mode.description}</p>
                      )}
                    </button>
                  ))}
                </div>

                {selectedGame.rules && (
                  <div className="mt-8 space-y-4">
                    <div className="flex items-center gap-2 text-primary">
                      <Shield className="w-5 h-5" />
                      <h3 className="font-orbitron font-bold uppercase tracking-wider text-sm">Tournament Rules</h3>
                    </div>
                    <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 space-y-2">
                      {selectedGame.rules.map((rule, idx) => (
                        <div key={idx} className="flex gap-3 text-sm text-foreground/80">
                          <span className="text-primary font-bold">{idx + 1}.</span>
                          <p>{rule}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="flex items-center gap-2 text-primary">
                  <User className="w-5 h-5" />
                  <h3 className="font-orbitron font-bold uppercase tracking-wider">{selectedGame.isSquad ? 'Leader Information' : 'Participant Details'}</h3>
                </div>

                {selectedGame.isSquad && (
                  <div className="space-y-2">
                    <Label htmlFor="squadName" className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5" /> Squad Name *
                    </Label>
                    <Input
                      id="squadName"
                      placeholder="e.g. Team Hyperion"
                      value={formData.squadName}
                      onChange={e => handleInputChange('squadName', e.target.value)}
                      className={`font-orbitron uppercase tracking-widest ${errors.squadName ? 'border-destructive' : ''}`}
                    />
                    {errors.squadName && <p className="text-xs text-destructive">{errors.squadName}</p>}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input id="fullName" value={formData.fullName} onChange={e => handleInputChange('fullName', e.target.value)} className={errors.fullName ? 'border-destructive' : ''} />
                    {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="college">College Name *</Label>
                    <Input id="college" value={formData.college} onChange={e => handleInputChange('college', e.target.value)} className={errors.college ? 'border-destructive' : ''} />
                    {errors.college && <p className="text-xs text-destructive">{errors.college}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="studentId">Student ID *</Label>
                    <Input id="studentId" value={formData.studentId} onChange={e => handleInputChange('studentId', e.target.value)} className={errors.studentId ? 'border-destructive' : ''} />
                    {errors.studentId && <p className="text-xs text-destructive">{errors.studentId}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input id="phone" value={formData.phone} onChange={e => handleInputChange('phone', e.target.value)} className={errors.phone ? 'border-destructive' : ''} />
                    {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input id="email" type="email" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} className={errors.email ? 'border-destructive' : ''} />
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="gameUsername">Game Username *</Label>
                    <Input id="gameUsername" value={formData.gameUsername} onChange={e => handleInputChange('gameUsername', e.target.value)} className={errors.gameUsername ? 'border-destructive' : ''} />
                    {errors.gameUsername && <p className="text-xs text-destructive">{errors.gameUsername}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gameId">Game ID *</Label>
                    <Input id="gameId" value={formData.gameId} onChange={e => handleInputChange('gameId', e.target.value)} className={errors.gameId ? 'border-destructive' : ''} />
                    {errors.gameId && <p className="text-xs text-destructive">{errors.gameId}</p>}
                  </div>
                </div>

                {selectedGame.isSquad && (
                  <div className="bg-primary/5 p-4 rounded-xl flex items-center gap-3 border border-primary/10">
                    <Info className="w-5 h-5 text-primary shrink-0" />
                    <p className="text-xs text-foreground/70">
                      As the registrant, you will be the main point of contact. You can select the squad leader in the next step.
                    </p>
                  </div>
                )}

                <Button type="button" variant="neon" size="lg" className="w-full mt-4" onClick={handleSubmit} disabled={isSubmitting}>
                  {selectedGame.isSquad ? (
                    'Configure Squad'
                  ) : isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Registering...</>
                  ) : (
                    'Complete Registration'
                  )}
                </Button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-primary">
                    <Users className="w-5 h-5" />
                    <h3 className="font-orbitron font-bold uppercase tracking-wider">Squad Members</h3>
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest bg-muted px-2 py-1 rounded">
                    Exactly 4 members total
                  </div>
                </div>

                <div className="space-y-6">
                  <RadioGroup value={leaderIndex.toString()} onValueChange={(v) => setLeaderIndex(parseInt(v))}>
                    {/* Main Registrant (Member 1) */}
                    <div className="p-4 border border-primary/20 bg-primary/5 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">1</div>
                        <div>
                          <p className="font-bold">{formData.fullName}</p>
                          <p className="text-xs text-muted-foreground">{formData.gameUsername} ({formData.gameId})</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="-1" id="leader--1" />
                        <Label htmlFor="leader--1" className="text-xs cursor-pointer">Leader</Label>
                      </div>
                    </div>

                    {/* Additional Members */}
                    {squadMembers.map((member, idx) => (
                      <div key={idx} className="space-y-4 p-5 border border-border/50 rounded-xl relative">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-sm font-bold">{idx + 2}</div>
                            <span className="text-sm font-orbitron uppercase tracking-wider">Member {idx + 2}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value={idx.toString()} id={`leader-${idx}`} />
                            <Label htmlFor={`leader-${idx}`} className="text-xs cursor-pointer">Leader</Label>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase">Name</Label>
                            <Input
                              placeholder="Full Name"
                              value={member.name}
                              onChange={e => handleSquadMemberChange(idx, 'name', e.target.value)}
                              className={`h-9 text-sm ${errors[`member_${idx}_name`] ? 'border-destructive' : ''}`}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase">Username</Label>
                            <Input
                              placeholder="Game Username"
                              value={member.gameUsername}
                              onChange={e => handleSquadMemberChange(idx, 'gameUsername', e.target.value)}
                              className={`h-9 text-sm ${errors[`member_${idx}_gameUsername`] ? 'border-destructive' : ''}`}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase">Game ID</Label>
                            <Input
                              placeholder="Game ID"
                              value={member.gameId}
                              onChange={e => handleSquadMemberChange(idx, 'gameId', e.target.value)}
                              className={`h-9 text-sm ${errors[`member_${idx}_gameId`] ? 'border-destructive' : ''}`}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-start gap-3">
                  <Shield className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-200/80 leading-relaxed">
                    Please ensure all Game IDs and Usernames are correct. Squadded profiles must match their in-game accounts to be eligible for prizes.
                  </p>
                </div>

                <Button type="button" variant="neon" size="lg" className="w-full" onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Registering Quad...</>
                  ) : (
                    'Confirm & Register Squad'
                  )}
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RegistrationModal;