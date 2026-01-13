'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import {
  Brain,
  Bot,
  Layers,
  Shield,
  Sparkles,
  Workflow,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

const advisoryServices = [
  {
    title: 'AI Strategy & Roadmap',
    description:
      'Define your AI vision and create actionable roadmaps that align technology investments with business objectives.',
    icon: Brain,
    slug: 'strategy',
    highlights: ['Executive Advisory', 'ROI Analysis', 'Strategic Planning'],
  },
  {
    title: 'Digital Transformation',
    description:
      'Navigate complex digital ecosystems with comprehensive transformation strategies focused on optimization.',
    icon: Bot,
    slug: 'transformation',
    highlights: ['Process Redesign', 'Change Management', 'Value Realization'],
  },
  {
    title: 'AI Governance & Ethics',
    description:
      'Establish responsible AI frameworks that balance innovation with ethics, compliance and security.',
    icon: Shield,
    slug: 'governance',
    highlights: ['Risk Management', 'Compliance', 'Ethical AI'],
  },
  {
    title: 'Innovation Labs',
    description:
      'Accelerate innovation through strategic pilots and proof-of-concepts that demonstrate clear business value.',
    icon: Sparkles,
    slug: 'innovation',
    highlights: ['POC Development', 'Innovation Workshops', 'Use Case Discovery'],
  },
  {
    title: 'Technology Advisory',
    description:
      'Make informed decisions with independent technology assessments and vendor evaluations.',
    icon: Layers,
    slug: 'advisory',
    highlights: ['Architecture Review', 'Vendor Selection', 'Due Diligence'],
  },
  {
    title: 'Change & Adoption',
    description:
      'Ensure successful AI adoption with comprehensive change management and training programs.',
    icon: Workflow,
    slug: 'adoption',
    highlights: ['Training Programs', 'Change Strategy', 'User Adoption'],
  },
];

const whyChooseReasons = [
  {
    title: 'Executive-Level Partnership',
    description: 'Direct engagement with C-suite leaders to align AI initiatives with business strategy and ensure measurable ROI.',
  },
  {
    title: 'Proven Methodology',
    description: 'Our SPARC framework ensures systematic approach to AI adoption, from strategy to implementation and optimization.',
  },
  {
    title: 'Industry Expertise',
    description: 'Deep understanding of European markets and regulations, with experience across multiple industries.',
  },
  {
    title: 'Vendor-Neutral Approach',
    description: 'Independent assessments and recommendations focused solely on your business needs and objectives.',
  },
];

export default function AdvisoryServicesPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: '#080D14' }}>
      {/* Hero Section */}
      <section className="pt-28 pb-20 sm:pt-32 sm:pb-28 relative overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#F87315]/5 via-transparent to-transparent" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-[-0.02em]">
              Our{' '}
              <span
                className="text-white px-3 py-1 sm:px-4 sm:py-2 inline-block"
                style={{
                  background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)',
                  boxShadow: '0 8px 32px -8px rgba(248, 115, 21, 0.4)',
                }}
              >
                Advisory Services
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-white/70 mb-8 max-w-3xl mx-auto leading-relaxed">
              Strategic guidance to help leaders navigate AI complexity and unlock transformative
              business value through intelligent process optimization
            </p>
            <Link href="/contact">
              <Button
                size="lg"
                className="text-white font-medium rounded-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)',
                  boxShadow: '0 4px 20px -4px rgba(248, 115, 21, 0.5)',
                }}
              >
                Schedule Consultation
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Services Grid */}
      <section className="py-20 sm:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-[-0.02em]">
              Strategic AI Solutions
            </h2>
            <p className="text-lg text-white/65 max-w-2xl mx-auto">
              Comprehensive advisory services tailored to your organization's AI journey
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {advisoryServices.map((service, index) => (
              <motion.div
                key={service.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
              >
                <Link href={`/services/${service.slug}`}>
                  <Card className="h-full p-6 sm:p-8 transition-all duration-300 bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.06] group cursor-pointer">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-105"
                      style={{ background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)' }}
                    >
                      <service.icon className="w-7 h-7 text-white" />
                    </div>

                    <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-[#FF9F43] transition-colors">
                      {service.title}
                    </h3>

                    <p className="text-white/60 mb-6 text-sm leading-relaxed">{service.description}</p>

                    <div className="space-y-2.5">
                      {service.highlights.map((highlight, idx) => (
                        <div key={idx} className="flex items-center gap-2.5 text-sm text-white/55">
                          <CheckCircle className="w-4 h-4 text-[#FF9F43]" />
                          <span>{highlight}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 flex items-center text-[#FF9F43] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-sm font-medium">Learn more</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Why Choose Our Advisory Services */}
      <section className="py-20 sm:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-[-0.02em]">
                Why Choose Our{' '}
                <span
                  className="text-white px-2 py-0.5 inline-block"
                  style={{
                    background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)',
                  }}
                >
                  Advisory Services
                </span>
                ?
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
              {whyChooseReasons.map((reason, index) => (
                <motion.div
                  key={reason.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  viewport={{ once: true }}
                  className="p-6 bg-white/[0.03] border border-white/10 rounded-xl hover:border-white/20 transition-all duration-300"
                >
                  <h3 className="text-xl font-semibold text-white mb-3">{reason.title}</h3>
                  <p className="text-white/65 leading-relaxed">{reason.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* CTA Section */}
      <section className="py-20 sm:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-gradient-to-r from-white/[0.05] to-white/[0.08] backdrop-blur-sm border border-white/10 rounded-2xl p-8 sm:p-12 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-[-0.02em]">
                Ready to Transform Your Business with AI?
              </h2>
              <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">
                Let's discuss how our advisory services can accelerate your AI journey
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button
                    size="lg"
                    className="text-white font-medium rounded-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      background: 'linear-gradient(135deg, #F87315 0%, #FF9F43 100%)',
                      boxShadow: '0 4px 20px -4px rgba(248, 115, 21, 0.5)',
                    }}
                  >
                    Schedule Strategic Consultation
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/cases">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10 hover:border-[#FF9F43] transition-all duration-300"
                  >
                    View Success Stories
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
