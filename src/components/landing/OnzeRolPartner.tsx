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
    <section className="py-20 sm:py-28 lg:py-36 relative" style={{ backgroundColor: '#080D14' }}>
      {/* Subtle section divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            className="text-center mb-16 sm:mb-20"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 tracking-[-0.02em]">
              {t('title')}{' '}
              <span
                className="text-white px-3 py-1 sm:px-4 sm:py-2 inline-block"
                style={{
                  background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)',
                  boxShadow: '0 8px 32px -8px rgba(248, 115, 21, 0.4)',
                }}
              >
                {t('titleHighlight')}
              </span>{' '}
              {t('titleEnd')}
            </h2>
            <p className="text-lg sm:text-xl text-white/60 max-w-3xl mx-auto leading-relaxed">
              {t('subtitle')}
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-16 items-stretch">
            {/* Linker kolom - Afbeelding */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="flex order-2 lg:order-1"
            >
              <div className="sfeer-image w-full h-72 sm:h-96 lg:h-full rounded-2xl overflow-hidden">
                <Image
                  src="/images/solen-feyissa-sT2AShu9tsA-unsplash.jpg"
                  alt=""
                  width={528}
                  height={600}
                  className="object-cover w-full h-full"
                />
              </div>
            </motion.div>

            {/* Rechter kolom - Rollen */}
            <div className="space-y-5 flex flex-col justify-between order-1 lg:order-2">
              {roles.map((role, index) => (
                <motion.div
                  key={role.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  viewport={{ once: true }}
                  className="group bg-white/[0.03] border border-white/10 rounded-xl p-5 sm:p-6 hover:border-white/20 hover:bg-white/[0.06] transition-all duration-300"
                >
                  {/* Role Header */}
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0 transition-transform duration-300 group-hover:scale-105"
                      style={{ background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)' }}
                    >
                      <role.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-center sm:text-left flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2">{role.title}</h3>
                      <p className="text-white/60 text-sm leading-relaxed mb-2">
                        {role.description}
                      </p>
                      <p className="font-medium text-white mb-3">
                        {role.action}
                      </p>

                      {/* Details */}
                      <div className="space-y-2">
                        {role.details.map((detail, idx) => (
                          <div key={idx} className="flex items-start text-white/60 text-sm">
                            <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-[#FF9F43]" />
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
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-8 max-w-3xl mx-auto">
              <p className="text-xl sm:text-2xl font-semibold text-white mb-3">
                {t('noOneSize')}
              </p>
              <p className="text-lg sm:text-xl text-[#FF9F43] font-medium mb-4">
                {t('uniqueJourney')}
              </p>
              <p className="text-white/50 text-sm">
                {t('listeningFirst')}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}