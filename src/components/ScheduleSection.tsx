import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Timer } from 'lucide-react';
import { EVENT_SCHEDULE } from '@/types/registration';

const ScheduleSection = () => {
  const scheduleItems = [
    { 
      date: EVENT_SCHEDULE.registrationEnd, 
      title: 'Registration Deadline', 
      description: 'Last day to register for the tournament',
      icon: Timer,
      highlight: true
    },
    { 
      date: EVENT_SCHEDULE.qualifiers, 
      title: 'Qualifiers', 
      description: 'Preliminary rounds to determine finalists',
      icon: Calendar,
      highlight: false
    },
    { 
      date: EVENT_SCHEDULE.finals, 
      title: 'Finals', 
      description: 'Championship matches and prize distribution',
      icon: Calendar,
      highlight: false
    },
  ];

  return (
    <section id="schedule" className="py-20 relative bg-gradient-to-b from-background to-card/50">
      <div className="container px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-primary font-orbitron text-sm tracking-[0.3em] uppercase mb-4">
            Mark Your Calendar
          </p>
          <h2 className="font-orbitron text-3xl md:text-5xl font-bold text-foreground mb-4">
            Event <span className="gradient-text">Schedule</span>
          </h2>
        </motion.div>

        {/* Timeline */}
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-secondary to-accent" />

            {/* Timeline Items */}
            {scheduleItems.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative flex gap-6 mb-8 last:mb-0"
              >
                {/* Timeline Dot */}
                <div className={`flex-shrink-0 w-16 h-16 rounded-full ${item.highlight ? 'bg-secondary' : 'bg-primary'} flex items-center justify-center z-10 ${item.highlight ? 'neon-border-magenta' : 'neon-border'}`}>
                  <item.icon className="w-6 h-6 text-primary-foreground" />
                </div>

                {/* Content */}
                <div className={`flex-1 glass-card rounded-xl p-6 ${item.highlight ? 'border-secondary/50' : ''}`}>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                    <h3 className="font-orbitron text-xl font-bold text-foreground">
                      {item.title}
                    </h3>
                    <span className={`font-orbitron text-sm ${item.highlight ? 'text-secondary' : 'text-primary'}`}>
                      {item.date}
                    </span>
                  </div>
                  <p className="text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Venue Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card rounded-xl p-8 max-w-xl mx-auto mt-12 text-center"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <MapPin className="w-8 h-8 text-primary" />
            <Clock className="w-8 h-8 text-secondary" />
          </div>
          <h3 className="font-orbitron text-xl font-bold text-foreground mb-2">
            Venue & Time
          </h3>
          <p className="text-muted-foreground mb-1">
            <span className="text-foreground font-semibold">{EVENT_SCHEDULE.venue}</span>
          </p>
          <p className="text-muted-foreground">
            Starting at <span className="text-primary font-bold">{EVENT_SCHEDULE.time}</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default ScheduleSection;
