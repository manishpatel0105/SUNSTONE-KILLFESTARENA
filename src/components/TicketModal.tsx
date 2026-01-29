import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Shield, CheckCircle, Users, User, ArrowRight } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Ticket, SquadMember } from '@/types/registration';
import { EVENT_SCHEDULE } from '@/types/registration';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket | null;
}

const TicketModal = ({ isOpen, onClose, ticket }: TicketModalProps) => {
  const ticketRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !ticket) return null;

  const qrData = JSON.stringify({
    id: ticket.registrationId,
    name: ticket.participantName,
    game: ticket.game,
    mode: ticket.mode,
    squad: ticket.squadName
  });

  const handleDownloadPDF = async () => {
    if (!ticketRef.current) return;

    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        backgroundColor: '#030712', // Match background-zinc-950
        logging: false,
        useCORS: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`KillFestTicket-${ticket.registrationId}.pdf`);
    } catch (error) {
      console.error('PDF Generation error:', error);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-2xl flex flex-col items-center"
          onClick={e => e.stopPropagation()}
        >
          {/* Success Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="mb-8"
          >
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center neon-border">
              <CheckCircle className="w-8 h-8 text-primary shadow-[0_0_15px_rgba(255,107,0,0.5)]" />
            </div>
          </motion.div>

          {/* Ticket Body Wrapper (for PDF generation) */}
          <div className="w-full max-w-lg overflow-hidden rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/5 relative bg-zinc-950" ref={ticketRef}>
            {/* Top Stripe */}
            <div className="h-2 bg-gradient-to-r from-primary via-accent to-primary w-full" />

            {/* Decorative Cutouts */}
            <div className="absolute top-48 -left-4 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm border-r border-white/5 z-10" />
            <div className="absolute top-48 -right-4 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm border-l border-white/5 z-10" />

            {/* Header */}
            <div className="px-8 pt-8 pb-6 flex justify-between items-start">
              <div>
                <p className="font-orbitron text-[10px] text-primary tracking-[0.3em] uppercase mb-1">Elite Esports</p>
                <h2 className="font-orbitron text-2xl font-black text-white italic tracking-tighter">
                  KILL FEST <span className="text-primary italic">ARENA</span>
                </h2>
                <div className="h-1 w-12 bg-primary mt-2" />
              </div>
              <div className="text-right">
                <p className="text-[8px] text-muted-foreground uppercase tracking-widest font-medium">Tournament Ticket</p>
                <p className="font-orbitron text-sm font-bold text-white mt-1">2026 EDITION</p>
              </div>
            </div>

            {/* Main Details */}
            <div className="px-8 space-y-8 pb-8">
              <div className="grid grid-cols-2 gap-8 relative">
                <div className="space-y-4">
                  <div>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5">Player/Leader</p>
                    <p className="font-orbitron text-sm font-bold text-white uppercase truncate">{ticket.participantName}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5">Game & Mode</p>
                    <p className="font-orbitron text-xs font-bold text-white uppercase">
                      {ticket.game} <span className="text-primary mx-1">/</span> {ticket.mode}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 text-right">
                  <div>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5">Registration ID</p>
                    <p className="font-mono text-xs font-black text-primary letter-spacing-1">{ticket.registrationId}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5">Event Venue</p>
                    <p className="font-orbitron text-[10px] font-bold text-white uppercase">{EVENT_SCHEDULE.venue}</p>
                  </div>
                </div>
              </div>

              {/* Squad Section */}
              {ticket.squadName && (
                <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      <span className="font-orbitron text-xs font-bold text-white uppercase tracking-wider">Squad: {ticket.squadName}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    {ticket.members?.map((member, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${member.isLeader ? 'bg-primary shadow-[0_0_5px_#ff6b00]' : 'bg-zinc-600'}`} />
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-zinc-300 truncate">{member.name}</p>
                          <p className="text-[8px] text-zinc-500 truncate">{member.gameUsername}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Row */}
              <div className="flex items-center justify-between gap-8 pt-4 border-t border-dashed border-white/10">
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[8px] text-muted-foreground uppercase tracking-wider mb-0.5">Date</p>
                      <p className="text-[10px] font-bold text-white uppercase">{EVENT_SCHEDULE.qualifiers}</p>
                    </div>
                    <div>
                      <p className="text-[8px] text-muted-foreground uppercase tracking-wider mb-0.5">Time</p>
                      <p className="text-[10px] font-bold text-white uppercase">{EVENT_SCHEDULE.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded py-1.5 px-3 w-fit">
                    <Shield className="w-3 h-3 text-primary" />
                    <span className="text-[8px] font-bold text-primary uppercase tracking-widest">Official Entry</span>
                  </div>
                </div>

                <div className="p-2 bg-white rounded-lg shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                  <QRCodeSVG
                    value={qrData}
                    size={70}
                    level="L"
                    bgColor="#ffffff"
                    fgColor="#000000"
                  />
                </div>
              </div>
            </div>

            {/* Footer Text */}
            <div className="bg-zinc-900/50 px-8 py-4 flex justify-between items-center text-[8px] text-muted-foreground font-medium uppercase tracking-widest border-t border-white/5">
              <span>Sunstone Kill Fest Arena</span>
              <span className="flex items-center gap-1">
                Valid Student ID Required <ArrowRight className="w-2 h-2" />
              </span>
            </div>
          </div>

          {/* User Actions (Not for PDF) */}
          <div className="mt-8 flex gap-4 w-full justify-center">
            <Button variant="outline" size="lg" className="px-8 border-white/10 hover:bg-white/5 gap-2" onClick={handleDownloadPDF}>
              <Download className="w-4 h-4" />
              Download PDF Ticket
            </Button>
            <Button variant="neon" size="lg" className="px-12" onClick={onClose}>
              Done
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TicketModal;