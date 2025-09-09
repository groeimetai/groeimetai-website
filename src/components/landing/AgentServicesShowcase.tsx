'use client';

import { motion } from 'framer-motion';
import { Eye, Wrench, Activity, ArrowRight, CheckCircle } from 'lucide-react';

export default function AgentServicesShowcase() {
  const services = [
    {
      icon: Eye,
      title: 'ASSESS',
      subtitle: 'Agent Readiness Scan',
      description: 'Ontdek hoe agent-ready jouw organisatie werkelijk is',
      features: [
        'Complete API inventory en analyse',
        'Agent toegankelijkheid assessment', 
        'MCP readiness roadmap',
        'ROI berekening en prioritering'
      ],
      highlight: 'Gratis 30-minuten assessment'
    },
    {
      icon: Wrench,
      title: 'BUILD', 
      subtitle: 'Agent Infrastructure',
      description: 'Transformeer jouw systemen naar agent-ready platforms',
      features: [
        'API naar MCP protocol conversie',
        'Veilige agent toegangslagen',
        'Custom agent integrations',
        'Testing & deployment'
      ],
      highlight: 'Bewezen methode sinds 2023'
    },
    {
      icon: Activity,
      title: 'MONITOR',
      subtitle: 'Agent Intelligence',
      description: 'Houd bij welke agents actief zijn en wat ze doen',
      features: [
        'Real-time agent activity tracking',
        'Performance monitoring',
        'Nieuwe mogelijkheden detectie', 
        'Competitor agent analyse'
      ],
      highlight: '24/7 monitoring dashboard'
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
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Jouw weg naar{' '}
              <span style={{ color: '#F87315' }}>Agent Readiness</span>
            </h2>
            <p className="text-xl text-white/70 max-w-4xl mx-auto leading-relaxed mb-4">
              Van agent-blind naar agent-ready in drie stappen.
            </p>
            <div className="bg-white/5 rounded-lg p-6 max-w-4xl mx-auto">
              <p className="text-white/90 leading-relaxed">
                <strong>Wij zijn je gids in de agent economie.</strong> Niet alleen technisch, maar vooral strategisch. We helpen je:
              </p>
              <div className="grid md:grid-cols-2 gap-4 mt-4 text-sm">
                <div className="flex items-center text-white/80">
                  <CheckCircle className="w-4 h-4 mr-3" style={{ color: '#F87315' }} />
                  Begrijpen welke systemen prioriteit hebben
                </div>
                <div className="flex items-center text-white/80">
                  <CheckCircle className="w-4 h-4 mr-3" style={{ color: '#F87315' }} />
                  Een realistische roadmap maken
                </div>
                <div className="flex items-center text-white/80">
                  <CheckCircle className="w-4 h-4 mr-3" style={{ color: '#F87315' }} />
                  De juiste technische keuzes maken
                </div>
                <div className="flex items-center text-white/80">
                  <CheckCircle className="w-4 h-4 mr-3" style={{ color: '#F87315' }} />
                  Stap voor stap implementeren
                </div>
                <div className="flex items-center text-white/80">
                  <CheckCircle className="w-4 h-4 mr-3" style={{ color: '#F87315' }} />
                  Meten en optimaliseren
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="group"
              >
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 h-full hover:border-white/20 hover:bg-white/10 transition-all duration-300">
                  {/* Service Header */}
                  <div className="flex items-center mb-6">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center mr-4"
                      style={{ backgroundColor: '#F87315' }}
                    >
                      <service.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">{service.title}</h3>
                      <p className="text-white/60 font-medium">{service.subtitle}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-white/80 mb-6 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-3 mb-6">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start text-white/70">
                        <CheckCircle className="w-4 h-4 mr-3 mt-0.5 flex-shrink-0" style={{ color: '#F87315' }} />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Highlight */}
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-sm font-semibold" style={{ color: '#F87315' }}>
                      {service.highlight}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center mt-16"
          >
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-4">
                Wil je weten waar jij staat?
              </h3>
              <p className="text-white/70 mb-6">
                Start met onze gratis Agent Readiness Assessment en ontdek precies wat er nodig is
                om jouw bedrijf voor te bereiden op Agent Season 2025.
              </p>
              <button 
                className="inline-flex items-center px-8 py-4 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-xl transform hover:scale-105"
                style={{ 
                  backgroundColor: '#F87315',
                  boxShadow: '0 10px 25px -5px rgba(248, 115, 21, 0.25)'
                }}
              >
                Krijg jouw MCP Roadmap
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}