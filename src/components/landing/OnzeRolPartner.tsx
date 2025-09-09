'use client';

import { motion } from 'framer-motion';
import { Target, Wrench, BarChart3, CheckCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function OnzeRolPartner() {
  const t = useTranslations('onzeRol');
  
  const roles = [
    {
      title: t('roles.strategy.title'),
      icon: Target,
      description: t('roles.strategy.description'),
      action: t('roles.strategy.action'),
      details: [
        t('roles.strategy.details.0'),
        t('roles.strategy.details.1'),
        t('roles.strategy.details.2'),
        t('roles.strategy.details.3')
      ]
    },
    {
      title: t('roles.implementation.title'),
      icon: Wrench, 
      description: t('roles.implementation.description'),
      action: t('roles.implementation.action'),
      details: [
        t('roles.implementation.details.0'),
        t('roles.implementation.details.1'),
        t('roles.implementation.details.2'),
        t('roles.implementation.details.3')
      ]
    },
    {
      title: t('roles.optimization.title'),
      icon: BarChart3,
      description: t('roles.optimization.description'),
      action: t('roles.optimization.action'),
      details: [
        t('roles.optimization.details.0'),
        t('roles.optimization.details.1'),
        t('roles.optimization.details.2'),
        t('roles.optimization.details.3')
      ]
    }
  ];

  return (
    <section className="py-8 sm:py-12 md:py-16 lg:py-24 relative" style={{ backgroundColor: '#080D14' }}>
      <div className="container mx-auto px-2 sm:px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              {t('title')}{' '}
              <span
                className="text-white px-4 py-2 inline-block"
                style={{ background: 'linear-gradient(135deg, #F87315, #FF8533)' }}
              >
                {t('titleHighlight')}
              </span>{' '}
              {t('titleEnd')}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-white/70 max-w-4xl mx-auto leading-relaxed px-2 sm:px-0">
              {t('subtitle')}
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 mb-8 sm:mb-12 md:mb-16 items-stretch">
            {/* Linker kolom - Afbeelding */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex order-2 lg:order-1"
            >
              <div className="sfeer-image w-full h-64 sm:h-80 md:h-96 lg:h-full">
                <Image
                  src="/images/solen-feyissa-sT2AShu9tsA-unsplash.jpg"
                  alt=""
                  width={528}
                  height={600}
                  className="object-cover w-full h-full rounded-lg"
                />
              </div>
            </motion.div>

            {/* Rechter kolom - Rollen */}
            <div className="space-y-4 sm:space-y-6 md:space-y-8 flex flex-col justify-between order-1 lg:order-2">
              {roles.map((role, index) => (
                <motion.div
                  key={role.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-5 md:p-6 hover:border-white/20 hover:bg-white/10 transition-all duration-300"
                >
                  {/* Role Header */}
                  <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                    <div 
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0"
                      style={{ backgroundColor: '#F87315' }}
                    >
                      <role.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="text-center sm:text-left flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{role.title}</h3>
                      <p className="text-white/80 text-xs sm:text-sm leading-relaxed mb-2">
                        {role.description}
                      </p>
                      <p className="font-bold text-white mb-2 sm:mb-3 text-sm sm:text-base">
                        {role.action}
                      </p>
                      
                      {/* Details */}
                      <div className="space-y-1 sm:space-y-2">
                        {role.details.map((detail, idx) => (
                          <div key={idx} className="flex items-start text-white/70 text-xs sm:text-sm">
                            <CheckCircle className="w-3 h-3 mr-2 mt-0.5 flex-shrink-0" style={{ color: '#F87315' }} />
                            <span>{detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>


          {/* Bottom Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-center mt-8 sm:mt-10 md:mt-12"
          >
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 sm:p-5 md:p-6 max-w-4xl mx-auto">
              <p className="text-lg sm:text-xl font-bold text-white mb-2">
                {t('noOneSize')}
              </p>
              <p className="text-base sm:text-lg" style={{ color: '#F87315' }}>
                {t('uniqueJourney')}
              </p>
              <p className="text-white/70 text-xs sm:text-sm mt-3 sm:mt-4">
                {t('listeningFirst')}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}