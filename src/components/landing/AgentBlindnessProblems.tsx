'use client';

import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Users, Package, Database, FileText, Calendar, Code } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function AgentBlindnessProblems() {
  const t = useTranslations('agentBlindness');
  
  const systems = [
    {
      system: t('systems.customer.name'),
      currentState: t('systems.customer.current'),
      agentState: t('systems.customer.agent'),
      solution: t('systems.customer.solution'),
      icon: Users
    },
    {
      system: t('systems.inventory.name'),
      currentState: t('systems.inventory.current'),
      agentState: t('systems.inventory.agent'), 
      solution: t('systems.inventory.solution'),
      icon: Package
    },
    {
      system: t('systems.crm.name'),
      currentState: t('systems.crm.current'),
      agentState: t('systems.crm.agent'),
      solution: t('systems.crm.solution'),
      icon: Database
    },
    {
      system: t('systems.knowledge.name'),
      currentState: t('systems.knowledge.current'),
      agentState: t('systems.knowledge.agent'),
      solution: t('systems.knowledge.solution'),
      icon: FileText
    },
    {
      system: t('systems.planning.name'),
      currentState: t('systems.planning.current'),
      agentState: t('systems.planning.agent'),
      solution: t('systems.planning.solution'),
      icon: Calendar
    },
    {
      system: t('systems.custom.name'),
      currentState: t('systems.custom.current'),
      agentState: t('systems.custom.agent'),
      solution: t('systems.custom.solution'),
      icon: Code
    }
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-24 relative" style={{ backgroundColor: '#080D14' }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 sm:mb-16 lg:mb-20 px-2 sm:px-0"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              {t('title')}{' '}
              <span className="text-red-400">{t('titleHighlight')}</span>
            </h2>
            <div className="max-w-5xl mx-auto bg-gradient-to-r from-white/5 to-white/10 border border-white/10 rounded-xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
              <p className="text-lg sm:text-xl md:text-2xl text-white/90 leading-relaxed mb-3 sm:mb-4">
                <strong>{t('bridgeStatement')}</strong>
              </p>
              <p className="text-base sm:text-lg text-white/70 leading-relaxed">
                {t('bridgeDescription')}
              </p>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16 lg:mb-20 items-stretch">
            {/* System Cards - 2 wide, 3 high */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {systems.map((system, index) => (
              <motion.div
                key={system.system}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="relative group"
              >
                <div className="bg-white/5 border-l-4 rounded-r-xl p-4 sm:p-6 h-full hover:bg-white/10 transition-all duration-300 shadow-lg" style={{ borderLeftColor: '#F87315' }}>
                  {/* System Header */}
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0" style={{ backgroundColor: '#F87315' }}>
                      <system.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white leading-tight">{system.system}</h3>
                  </div>

                  {/* Current State */}
                  <div className="space-y-3 mb-4">
                    <p className="text-white/80 text-sm">
                      <span className="text-green-400">✓</span> {system.currentState}
                    </p>
                    <p className="text-white/60 text-sm">
                      <span className="text-red-400">✗</span> {system.agentState}
                    </p>
                  </div>

                  {/* Solution */}
                  <div className="pt-4 border-t border-white/20">
                    <div className="flex items-center">
                      <ArrowRight className="w-4 h-4 mr-3 flex-shrink-0" style={{ color: '#F87315' }} />
                      <span className="text-sm font-medium" style={{ color: '#F87315' }}>
                        {system.solution}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            </div>
            
            {/* Sfeer Image naast tekst */}
            <div className="lg:col-span-1 hidden lg:block">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="h-full flex items-center justify-center"
              >
                <div className="sfeer-image w-full h-full">
                  <Image
                    src="/images/warren-umoh-FC-2ilPSO6A-unsplash.jpg"
                    alt=""
                    width={330}
                    height={500}
                    className="object-cover w-full h-full"
                  />
                </div>
              </motion.div>
            </div>
          </div>

          {/* Universal Compatibility Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center"
          >
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-6">
                {t('apisWork')}{' '}
                <br />
                <span style={{ color: '#F87315' }}>{t('apisWorkHighlight')}</span>
              </h3>

              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-3" style={{ color: '#F87315' }} />
                  <span className="text-white/80 text-sm">{t('keepExisting')}</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-3" style={{ color: '#F87315' }} />
                  <span className="text-white/80 text-sm">{t('worksWithEverything')}</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-3" style={{ color: '#F87315' }} />
                  <span className="text-white/80 text-sm">{t('apiToMcp')}</span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-white/5 to-white/10 rounded-lg p-6">
                <p className="text-lg font-bold text-white mb-4">
                  {t('systemExamples')}
                </p>
                <p className="text-xl" style={{ color: '#F87315' }}>
                  <strong>{t('systemsPromise')}</strong>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}