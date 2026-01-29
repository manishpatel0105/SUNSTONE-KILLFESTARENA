import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { GameInfo } from '@/types/registration';
import { Button } from '@/components/ui/button';

interface GameCardProps {
  game: GameInfo;
  index: number;
  onSelect: (game: GameInfo) => void;
}

const GameCard = ({ game, index, onSelect }: GameCardProps) => {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      viewport={{ once: true }}
      className="game-card group cursor-pointer"
      onClick={() => onSelect(game)}
    >
      {/* Game Image (prefers local official asset) */}
      <div className={`h-48 relative overflow-hidden rounded-t-2xl bg-gradient-to-br ${game.color}`}>
        {!imgError && game.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={game.image}
            alt={game.fullName}
            onError={() => setImgError(true)}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <span className="font-orbitron text-4xl font-black text-foreground/90 drop-shadow-lg">
              {game.name}
            </span>
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Card Content */}
      <div className="p-6">
        <h3 className="font-orbitron text-xl font-bold text-foreground mb-2">
          {game.fullName}
        </h3>
        
        {/* Modes */}
        <div className="space-y-2 mb-4">
          {game.modes.map((mode) => (
            <div key={mode.id} className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span className="text-muted-foreground">{mode.name}</span>
            </div>
          ))}
        </div>

        {/* Prize Info */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Prize Pool</p>
            <p className="font-orbitron text-lg font-bold text-primary">
              ₹{(game.modes.length * 8500).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">₹8,500 per mode</p>
          </div>
          <Button variant="neonOutline" size="sm" className="group-hover:bg-primary/10">
            Register <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default GameCard;
