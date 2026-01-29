import { useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import GamesSection from '@/components/GamesSection';
import PrizeSection from '@/components/PrizeSection';
import RulesSection from '@/components/RulesSection';
import ScheduleSection from '@/components/ScheduleSection';
import RegistrationModal from '@/components/RegistrationModal';
import TicketModal from '@/components/TicketModal';
import Footer from '@/components/Footer';
import { GameInfo, Ticket } from '@/types/registration';

const Index = () => {
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isTicketOpen, setIsTicketOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameInfo | null>(null);
  const [generatedTicket, setGeneratedTicket] = useState<Ticket | null>(null);
  const gamesRef = useRef<HTMLDivElement>(null);

  const handleRegisterClick = () => {
    gamesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleGameSelect = (game: GameInfo) => {
    setSelectedGame(game);
    setIsRegistrationOpen(true);
  };

  const handleRegistrationSuccess = (ticket: Ticket) => {
    setGeneratedTicket(ticket);
    setIsRegistrationOpen(false);
    setIsTicketOpen(true);
  };

  const handleTicketClose = () => {
    setIsTicketOpen(false);
    setGeneratedTicket(null);
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar onRegisterClick={handleRegisterClick} />
      <HeroSection onRegisterClick={handleRegisterClick} />
      
      <div ref={gamesRef}>
        <GamesSection onGameSelect={handleGameSelect} />
      </div>
      
      <PrizeSection />
      <RulesSection />
      <ScheduleSection />
      <Footer />

      {/* Modals */}
      <RegistrationModal
        isOpen={isRegistrationOpen}
        onClose={() => setIsRegistrationOpen(false)}
        selectedGame={selectedGame}
        onSuccess={handleRegistrationSuccess}
      />

      <TicketModal
        isOpen={isTicketOpen}
        onClose={handleTicketClose}
        ticket={generatedTicket}
      />
    </main>
  );
};

export default Index;