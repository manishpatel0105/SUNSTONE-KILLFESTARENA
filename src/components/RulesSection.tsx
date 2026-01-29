import { motion } from 'framer-motion';
import { Shield, Smartphone, AlertTriangle, IdCard, Clock, Trophy } from 'lucide-react';

const RulesSection = () => {
  const rules = [
    { icon: Shield, title: 'No Hacking', description: 'Absolutely no hacking, cheats, or exploits allowed. Violators will be permanently banned.' },
    { icon: Smartphone, title: 'Mobile Only', description: 'Only mobile phones are permitted. Tablets and emulators are NOT allowed.' },
    { icon: AlertTriangle, title: 'No Tablets/Laptops', description: 'Tablets, iPads, and laptops are strictly prohibited for gameplay.' },
    { icon: IdCard, title: 'Student ID Required', description: 'Valid student ID is mandatory for verification. No ID = No entry.' },
    { icon: Clock, title: 'Arrive Early', description: 'Participants must arrive 20 minutes before their scheduled match time.' },
    { icon: Trophy, title: 'Shadow Fight 4', description: 'Match type: 3v3. Characters: Player’s choice. Levels: Equal for all.' },
  ];

  return (
    <section id="rules" className="py-20 relative">
      <div className="container px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-accent font-orbitron text-sm tracking-[0.3em] uppercase mb-4">
            Play Fair
          </p>
          <h2 className="font-orbitron text-3xl md:text-5xl font-bold text-foreground mb-4">
            Rules & <span className="text-accent">Regulations</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Follow these rules to ensure a fair and exciting competition for everyone.
          </p>
        </motion.div>

        {/* Rules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {rules.map((rule, index) => (
            <motion.div
              key={rule.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="glass-card rounded-xl p-6 flex gap-4"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                  <rule.icon className="w-6 h-6 text-accent" />
                </div>
              </div>
              <div>
                <h3 className="font-orbitron text-lg font-bold text-foreground mb-2">
                  {rule.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {rule.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RulesSection;
