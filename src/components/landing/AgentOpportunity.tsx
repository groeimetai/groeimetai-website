'use client';

import { motion } from 'framer-motion';
import { Clock, Zap, Users, TrendingUp, ArrowRight } from 'lucide-react';

export default function AgentOpportunity() {
  const opportunities = [
    {
      title: 'AI agents die 24/7 jouw services kunnen gebruiken',
      icon: Clock,
      description: 'Geen wachttijden, geen kantooruren - agents werken altijd'
    },
    {
      title: 'Volledige automatisering van repetitieve taken',
      icon: Zap,
      description: 'Van handmatig naar automatisch - agents nemen over'
    },
    {
      title: 'Klanten die instant geholpen worden',
      icon: Users,
      description: 'Van uren wachten naar seconden respons - agents zijn er altijd'
    },
    {
      title: 'Processen die zichzelf optimaliseren', 
      icon: TrendingUp,
      description: 'Van statisch naar lerend - agents verbeteren continu'
    }
  ];

  return (
    <section className="py-24 relative" style={{ backgroundColor: '#080D14' }}>
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
              Stel je <span style={{ color: '#F87315' }}>voor</span>:
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {opportunities.map((opportunity, index) => (
              <motion.div
                key={opportunity.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-white/20 hover:bg-white/10 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#F87315' }}
                  >
                    <opportunity.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3 leading-tight">
                      {opportunity.title}
                    </h3>
                    <p className="text-white/70 text-sm leading-relaxed">
                      {opportunity.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Reality Check */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center"
          >
            <div className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-8 max-w-4xl mx-auto">
              <p className="text-xl text-white/90 mb-4 leading-relaxed">
                <strong>Dit is geen toekomst. Dit gebeurt NU bij bedrijven die agent-ready zijn.</strong>
              </p>
              <p className="text-lg mb-6" style={{ color: '#F87315' }}>
                De vraag is: hoe word <strong>JIJ</strong> agent-ready?
              </p>
              <p className="text-white/70 text-sm">
                Wij begeleiden je van de eerste vraag tot volledige implementatie.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}