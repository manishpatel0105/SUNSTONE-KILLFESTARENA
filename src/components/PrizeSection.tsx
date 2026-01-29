import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Gamepad2 } from 'lucide-react';
import { PRIZE_POOL, POINT_SYSTEM, FEATURED_MODES } from '@/types/registration';

const PrizeSection = () => {
  const prizes = [
    { place: '1st', amount: PRIZE_POOL.first, icon: Trophy, color: 'from-yellow-400 to-amber-600', glow: 'shadow-[0_0_30px_hsl(45,100%,50%,0.3)]' },
    { place: '2nd', amount: PRIZE_POOL.second, icon: Medal, color: 'from-slate-300 to-slate-500', glow: 'shadow-[0_0_30px_hsl(220,10%,70%,0.3)]' },
    { place: '3rd', amount: PRIZE_POOL.third, icon: Award, color: 'from-amber-600 to-amber-800', glow: 'shadow-[0_0_30px_hsl(30,80%,40%,0.3)]' },
  ];

  return (
    <section id="prizes" className="py-20 relative bg-gradient-to-b from-card/50 to-background">
      <div className="container px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-secondary font-orbitron text-sm tracking-[0.3em] uppercase mb-4">
            What's At Stake
          </p>
          <h2 className="font-orbitron text-3xl md:text-5xl font-bold text-foreground mb-4">
            Prize <span className="text-secondary">Pool</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Total Prize Pool: <span className="text-foreground font-bold">₹{PRIZE_POOL.total.toLocaleString()}</span> • ₹{PRIZE_POOL.perMode.toLocaleString()} per mode
          </p>
        </motion.div>

        {/* Featured Modes with Prize */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h3 className="font-orbitron text-xl font-bold text-foreground mb-6 text-center">
            5 Featured Game Modes
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-5xl mx-auto">
            {FEATURED_MODES.map((item, index) => (
              <motion.div
                key={`${item.game}-${item.mode}`}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                viewport={{ once: true }}
                className="glass-card rounded-lg p-4 text-center border border-primary/20 hover:border-primary/50 transition-colors"
              >
                <Gamepad2 className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="font-orbitron text-xs text-muted-foreground">{item.game}</p>
                <p className="font-rajdhani text-sm font-semibold text-foreground">{item.mode}</p>
                <p className="font-orbitron text-lg font-bold text-primary mt-2">₹{item.prize.toLocaleString()}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Prize Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
          {prizes.map((prize, index) => (
            <motion.div
              key={prize.place}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`glass-card rounded-xl p-8 text-center ${prize.glow} ${index === 0 ? 'md:-mt-4 md:scale-105' : ''}`}
            >
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br ${prize.color} mb-4`}>
                <prize.icon className="w-8 h-8 text-background" />
              </div>
              <p className="font-orbitron text-lg text-muted-foreground mb-2">{prize.place} Place</p>
              <p className="font-orbitron text-4xl font-bold text-foreground">₹{prize.amount.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">(per mode)</p>
            </motion.div>
          ))}
        </div>

        {/* Point System */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card rounded-xl p-8 max-w-3xl mx-auto"
        >
          <h3 className="font-orbitron text-xl font-bold text-foreground mb-6 text-center">
            Point System <span className="text-muted-foreground font-rajdhani text-sm">(BGMI Classic & Free Fire BR)</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {POINT_SYSTEM.positions.map((pos) => (
              <div key={pos.position} className="text-center p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">Position {pos.position}</p>
                <p className="font-orbitron text-2xl font-bold text-primary">{pos.points}</p>
                <p className="text-xs text-muted-foreground">points</p>
              </div>
            ))}
            <div className="text-center p-4 bg-secondary/20 rounded-lg border border-secondary/30">
              <p className="text-sm text-muted-foreground">Per Kill</p>
              <p className="font-orbitron text-2xl font-bold text-secondary">{POINT_SYSTEM.killPoints}</p>
              <p className="text-xs text-muted-foreground">point</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PrizeSection;
