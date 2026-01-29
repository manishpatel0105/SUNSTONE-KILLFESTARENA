import { motion } from 'framer-motion';
import { GAMES, GameInfo } from '@/types/registration';
import GameCard from './GameCard';

interface GamesSectionProps {
  onGameSelect: (game: GameInfo) => void;
}

const GamesSection = ({ onGameSelect }: GamesSectionProps) => {
  return (
    <section id="games" className="py-20 relative">
      <div className="container px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-primary font-orbitron text-sm tracking-[0.3em] uppercase mb-4">
            Choose Your Battle
          </p>
          <h2 className="font-orbitron text-3xl md:text-5xl font-bold text-foreground mb-4">
            Featured <span className="gradient-text">Games</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Select your game and dominate the arena. Each mode has a prize pool of ₹8,500.
          </p>
        </motion.div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {GAMES.map((game, index) => (
            <GameCard
              key={game.id}
              game={game}
              index={index}
              onSelect={onGameSelect}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default GamesSection;
