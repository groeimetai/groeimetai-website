import { Metadata } from 'next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StartProjectButton } from '@/components/ui/StartProjectButton';
import { Link } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';
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

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const locale = params.locale as 'nl' | 'en';
  const messages = (await import(`@/translations/${locale}.json`)).default;

  return {
    title: `Advisory Services - GroeimetAI`,
    description: 'Strategic AI advisory services to accelerate your business transformation',
    openGraph: {
      title: `Advisory Services - GroeimetAI`,
      description: 'Strategic AI advisory services to accelerate your business transformation',
    },
  };
}

const advisoryServices = [
  {
    title: 'AI Strategy & Roadmap',
    description:
      'Define your AI vision and create actionable roadmaps that align technology investments with business objectives.',
    icon: Brain,
    slug: 'strategy',
    highlights: ['Executive Advisory', 'ROI Analysis', 'Strategic Planning'],
    color: 'from-orange to-orange-100',
  },
  {
    title: 'Digital Transformation',
    description:
      'Navigate complex digital ecosystems with comprehensive transformation strategies focused on optimization.',
    icon: Bot,
    slug: 'transformation',
    highlights: ['Process Redesign', 'Change Management', 'Value Realization'],
    color: 'from-green-100 to-green',
  },
  {
    title: 'AI Governance & Ethics',
    description:
      'Establish responsible AI frameworks that balance innovation with ethics, compliance and security.',
    icon: Shield,
    slug: 'governance',
    highlights: ['Risk Management', 'Compliance', 'Ethical AI'],
    color: 'from-orange-100 to-orange',
  },
  {
    title: 'Innovation Labs',
    description:
      'Accelerate innovation through strategic pilots and proof-of-concepts that demonstrate clear business value.',
    icon: Sparkles,
    slug: 'innovation',
    highlights: ['POC Development', 'Innovation Workshops', 'Use Case Discovery'],
    color: 'from-green to-green-100',
  },
  {
    title: 'Technology Advisory',
    description:
      'Make informed decisions with independent technology assessments and vendor evaluations.',
    icon: Layers,
    slug: 'advisory',
    highlights: ['Architecture Review', 'Vendor Selection', 'Due Diligence'],
    color: 'from-orange to-orange-100',
  },
  {
    title: 'Change & Adoption',
    description:
      'Ensure successful AI adoption with comprehensive change management and training programs.',
    icon: Workflow,
    slug: 'adoption',
    highlights: ['Training Programs', 'Change Strategy', 'User Adoption'],
    color: 'from-green-100 to-green',
  },
];

export default async function AdvisoryServicesPage() {
  const t = await getTranslations('services');

  return (
    <main className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-orange/5 to-green/5" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
              Our{' '}
              <span
                className="text-white px-4 py-2 inline-block"
                style={{ background: 'linear-gradient(135deg, #FF6600, #FF8833)' }}
              >
                Advisory Services
              </span>
            </h1>
            <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
              Strategic guidance to help leaders navigate AI complexity and unlock transformative
              business value through intelligent process optimization
            </p>
            <StartProjectButton size="lg" className="shadow-premium hover-lift">
              Schedule Consultation
              <ArrowRight className="ml-2 w-5 h-5" />
            </StartProjectButton>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {advisoryServices.map((service, index) => (
              <Link key={service.slug} href={`/services/${service.slug}`}>
                <Card className="h-full p-8 hover-lift transition-all duration-300 bg-black-50 border-white/10 hover:border-orange/30 group cursor-pointer">
                  <div
                    className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${service.color} text-white mb-6`}
                  >
                    <service.icon className="w-6 h-6" />
                  </div>

                  <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-orange transition-colors">
                    {service.title}
                  </h3>

                  <p className="text-white/60 mb-6">{service.description}</p>

                  <div className="space-y-2">
                    {service.highlights.map((highlight, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-white/50">
                        <CheckCircle className="w-4 h-4 text-orange" />
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex items-center text-orange opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-sm font-medium">Learn more</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Our Advisory Services */}
      <section className="py-20 bg-black/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-white">
              Why Choose Our Advisory Services?
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">Executive-Level Partnership</h3>
                <p className="text-white/70">
                  Direct engagement with C-suite leaders to align AI initiatives with business
                  strategy and ensure measurable ROI.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">Proven Methodology</h3>
                <p className="text-white/70">
                  Our SPARC framework ensures systematic approach to AI adoption, from strategy to
                  implementation and optimization.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">Industry Expertise</h3>
                <p className="text-white/70">
                  Deep understanding of European markets and regulations, with experience across
                  multiple industries.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">Vendor-Neutral Approach</h3>
                <p className="text-white/70">
                  Independent assessments and recommendations focused solely on your business needs
                  and objectives.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-purple-600/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Ready to Transform Your Business with AI?
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Let&apos;s discuss how our advisory services can accelerate your AI journey
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <StartProjectButton size="lg" className="shadow-premium hover-lift">
                Schedule Strategic Consultation
              </StartProjectButton>
              <Link href="/cases">
                <Button
                  size="lg"
                  variant="outline"
                  className="hover-lift border-white/20 text-white hover:bg-white/10 hover:border-orange hover:text-orange"
                >
                  View Success Stories
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
