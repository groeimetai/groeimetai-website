'use client';

import ScrollReveal from '@/components/ui/ScrollReveal';
import { ArrowRight, CheckCircle, ClipboardCopy, FileText, UserX, Search, Phone, TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { blurDataURLs } from '@/lib/image-blurs';

export default function AgentBlindnessProblems() {
  const t = useTranslations('agentBlindness');
  
  const systems = [
    {
      system: t('systems.customer.name'),
      currentState: t('systems.customer.current'),
      agentState: t('systems.customer.agent'),
      solution: t('systems.customer.solution'),
      icon: ClipboardCopy
    },
    {
      system: t('systems.inventory.name'),
      currentState: t('systems.inventory.current'),
      agentState: t('systems.inventory.agent'),
      solution: t('systems.inventory.solution'),
      icon: FileText
    },
    {
      system: t('systems.crm.name'),
      currentState: t('systems.crm.current'),
      agentState: t('systems.crm.agent'),
      solution: t('systems.crm.solution'),
      icon: UserX
    },
    {
      system: t('systems.knowledge.name'),
      currentState: t('systems.knowledge.current'),
      agentState: t('systems.knowledge.agent'),
      solution: t('systems.knowledge.solution'),
      icon: Search
    },
    {
      system: t('systems.planning.name'),
      currentState: t('systems.planning.current'),
      agentState: t('systems.planning.agent'),
      solution: t('systems.planning.solution'),
      icon: Phone
    },
    {
      system: t('systems.custom.name'),
      currentState: t('systems.custom.current'),
      agentState: t('systems.custom.agent'),
      solution: t('systems.custom.solution'),
      icon: TrendingUp
    }
  ];

  return (
    <section className="py-20 sm:py-28 lg:py-36 relative bg-[#080D14]">
      {/* Subtle background variation for visual rhythm */}
      <div className="absolute inset-0 bg-white/[0.02]" />
      {/* Subtle section divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal className="text-center mb-16 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 tracking-[-0.02em]">
              {t('title')}{' '}
              <span className="text-[#F87315]">{t('titleHighlight')}</span>
            </h2>
            <div className="max-w-4xl mx-auto bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8 lg:p-10">
              <p className="text-xl sm:text-2xl text-white/80 leading-relaxed mb-4 font-medium">
                {t('bridgeStatement')}
              </p>
              <p className="text-base sm:text-lg text-white/60 leading-relaxed">
                {t('bridgeDescription')}
              </p>
            </div>
          </ScrollReveal>

          <div className="grid lg:grid-cols-3 gap-6 sm:gap-8 mb-16 sm:mb-20 items-stretch">
            {/* System Cards - 2 wide, 3 high */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {systems.map((system) => (
                <ScrollReveal
                  key={system.system}
                  className="group"
                >
                  <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5 sm:p-6 h-full hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300">
                    {/* System Header */}
                    <div className="flex items-center mb-4">
                      <div
                        className="w-11 h-11 rounded-lg flex items-center justify-center mr-4 flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
                        style={{ background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)' }}
                      >
                        <system.icon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-white">{system.system}</h3>
                    </div>

                    {/* Current State */}
                    <div className="space-y-2.5 mb-4">
                      <p className="text-white/70 text-sm flex items-start">
                        <span className="text-emerald-400 mr-2 mt-0.5">✓</span>
                        <span>{system.currentState}</span>
                      </p>
                      <p className="text-white/50 text-sm flex items-start">
                        <span className="text-red-400 mr-2 mt-0.5">✗</span>
                        <span>{system.agentState}</span>
                      </p>
                    </div>

                    {/* Solution */}
                    <div className="pt-4 border-t border-white/10">
                      <div className="flex items-center">
                        <ArrowRight className="w-4 h-4 mr-2.5 flex-shrink-0 text-[#FF9F43]" />
                        <span className="text-sm font-medium text-[#FF9F43]">
                          {system.solution}
                        </span>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
            
            {/* Sfeer Image naast tekst */}
            <div className="lg:col-span-1 hidden lg:block">
              <ScrollReveal direction="right" distance={20} className="h-full flex items-center justify-center">
                <div className="sfeer-image w-full h-full">
                  <Image
                    src="/images/warren-umoh-FC-2ilPSO6A-unsplash.jpg"
                    alt=""
                    width={330}
                    height={500}
                    sizes="(max-width: 1024px) 0px, 33vw"
                    placeholder="blur"
                    blurDataURL={blurDataURLs['/images/warren-umoh-FC-2ilPSO6A-unsplash.jpg']}
                    className="object-cover w-full h-full"
                  />
                </div>
              </ScrollReveal>
            </div>
          </div>

          {/* Universal Compatibility Message */}
          <ScrollReveal className="text-center">
            <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-8 sm:p-10 max-w-4xl mx-auto">
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-8 leading-snug">
                {t('apisWork')}{' '}
                <br className="hidden sm:block" />
                <span className="text-[#FF9F43]">{t('apisWorkHighlight')}</span>
              </h3>

              <div className="grid md:grid-cols-3 gap-4 sm:gap-6 mb-8">
                <div className="flex items-center justify-center md:justify-start bg-white/[0.03] rounded-lg p-4">
                  <CheckCircle className="w-5 h-5 mr-3 text-[#FF9F43] flex-shrink-0" />
                  <span className="text-white/70 text-sm text-left">{t('keepExisting')}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start bg-white/[0.03] rounded-lg p-4">
                  <CheckCircle className="w-5 h-5 mr-3 text-[#FF9F43] flex-shrink-0" />
                  <span className="text-white/70 text-sm text-left">{t('worksWithEverything')}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start bg-white/[0.03] rounded-lg p-4">
                  <CheckCircle className="w-5 h-5 mr-3 text-[#FF9F43] flex-shrink-0" />
                  <span className="text-white/70 text-sm text-left">{t('apiToMcp')}</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#F87315]/10 to-[#FF9F43]/5 border border-[#F87315]/20 rounded-xl p-6 sm:p-8">
                <p className="text-lg text-white/80 mb-3">
                  {t('systemExamples')}
                </p>
                <p className="text-xl sm:text-2xl font-semibold text-[#FF9F43]">
                  {t('systemsPromise')}
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}