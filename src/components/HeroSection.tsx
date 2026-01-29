import { motion } from 'framer-motion';
import { Trophy, Calendar, MapPin, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PRIZE_POOL, EVENT_SCHEDULE } from '@/types/registration';
import heroBg from '@/assets/hero-bg.jpg';

interface HeroSectionProps {
  onRegisterClick: () => void;
}

const HeroSection = ({ onRegisterClick }: HeroSectionProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={heroBg} 
          alt="Gaming Arena Background" 
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
        <div className="absolute inset-0 bg-cyber-grid bg-[size:50px_50px] opacity-10" />
      </div>

      {/* Content */}
      <div className="container relative z-10 px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          {/* Sunstone Branding */}
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-primary font-orbitron text-sm md:text-base tracking-[0.3em] uppercase mb-4"
          >
            Sunstone Esports Presents
          </motion.p>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="font-orbitron text-4xl md:text-6xl lg:text-7xl font-black mb-6"
          >
            <span className="gradient-text">SUNSTONE</span>
            <br />
            <span className="text-foreground">KILL FEST</span>
            <br />
            <span className="text-secondary neon-text-magenta">ARENA</span>
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-xl md:text-2xl text-muted-foreground font-rajdhani mb-8 max-w-2xl mx-auto"
          >
            The Ultimate College Esports Showdown
          </motion.p>

          {/* Prize Pool Highlight */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 rounded-full px-6 py-3 mb-10"
          >
            <Trophy className="w-6 h-6 text-primary" />
            <span className="font-orbitron text-2xl md:text-3xl font-bold text-foreground">
              ₹{PRIZE_POOL.total.toLocaleString()}
            </span>
            <span className="text-muted-foreground font-rajdhani">Prize Pool</span>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <Button
              variant="neon"
              size="xl"
              onClick={onRegisterClick}
              className="min-w-[200px]"
            >
              Register Now
            </Button>
            <Button
              variant="neonOutline"
              size="xl"
              onClick={() => document.getElementById('games')?.scrollIntoView({ behavior: 'smooth' })}
              className="min-w-[200px]"
            >
              View Games
            </Button>
          </motion.div>

          {/* Event Info Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto"
          >
            <div className="glass-card rounded-xl p-4 flex items-center gap-3">
              <Calendar className="w-8 h-8 text-primary" />
              <div className="text-left">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Event Dates</p>
                <p className="font-orbitron text-sm">{EVENT_SCHEDULE.qualifiers} - {EVENT_SCHEDULE.finals}</p>
              </div>
            </div>
            <div className="glass-card rounded-xl p-4 flex items-center gap-3">
              <MapPin className="w-8 h-8 text-secondary" />
              <div className="text-left">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Venue</p>
                <p className="font-orbitron text-sm">{EVENT_SCHEDULE.venue}</p>
              </div>
            </div>
            <div className="glass-card rounded-xl p-4 flex items-center gap-3">
              <Users className="w-8 h-8 text-accent" />
              <div className="text-left">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Games</p>
                <p className="font-orbitron text-sm">BGMI • Free Fire • Shadow Fight</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-6 h-10 border-2 border-primary/50 rounded-full flex items-start justify-center p-2"
          >
            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
