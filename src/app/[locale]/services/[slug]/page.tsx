import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StartProjectButton } from '@/components/ui/StartProjectButton';
import { Link } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';
import { locales } from '@/i18n';
import {
  Brain,
  Bot,
  Layers,
  Shield,
  Cloud,
  LineChart,
  Workflow,
  Sparkles,
  ArrowRight,
  Check,
  ArrowLeft,
  Chrome,
} from 'lucide-react';

const BrochureDownloadButton = dynamic(
  () => import('@/components/BrochureDownloadButton').then((mod) => mod.BrochureDownloadButton),
  {
    ssr: false,
    loading: () => (
      <Button size="lg" variant="outline" className="hover-lift" disabled>
        Loading...
      </Button>
    ),
  }
);

interface ServiceDetailData {
  slug: string;
  icon: any;
  title: string;
  subtitle: string;
  description: string;
  longDescription: string;
  benefits: string[];
  features: {
    title: string;
    description: string;
  }[];
  process: {
    title: string;
    description: string;
  }[];
  deliverables: string[];
  technologies: string[];
  duration: string;
  pricing: string;
}

const iconMap = {
  strategy: Brain,
  transformation: Bot,
  governance: Shield,
  innovation: Sparkles,
  advisory: Layers,
  adoption: Workflow,
  // Legacy slugs for backwards compatibility
  'genai-consultancy': Brain,
  'llm-integration': Bot,
  'rag-architecture': Layers,
  'servicenow-ai': Workflow,
  'multi-agent-orchestration': Sparkles,
  'small-projects': Chrome,
};

function getServiceDataFromTranslations(slug: string, t: any): ServiceDetailData | null {
  const serviceKey = {
    // New service slugs (matching landing page)
    strategy: 'genai',
    transformation: 'llm',
    governance: 'security',
    innovation: 'multiAgent',
    advisory: 'rag',
    adoption: 'servicenow',
    // Legacy slugs for backwards compatibility
    'genai-consultancy': 'genai',
    'llm-integration': 'llm',
    'rag-architecture': 'rag',
    'servicenow-ai': 'servicenow',
    'multi-agent-orchestration': 'multiAgent',
    'small-projects': 'security',
  }[slug];

  if (!serviceKey) return null;

  return {
    slug,
    icon: iconMap[slug as keyof typeof iconMap],
    title: t(`${serviceKey}.title`),
    subtitle: t(`${serviceKey}.subtitle`),
    description: t(`${serviceKey}.description`),
    longDescription: t(`${serviceKey}.longDescription`),
    benefits: t.raw(`${serviceKey}.benefits`),
    features: t.raw(`${serviceKey}.features`),
    process: t.raw(`${serviceKey}.process`),
    deliverables: t.raw(`${serviceKey}.deliverables`),
    technologies: t.raw(`${serviceKey}.technologies`),
    duration: t(`${serviceKey}.duration`),
    pricing: t('onRequest'),
  };
}

export async function generateStaticParams() {
  // Only include the service slugs that are actually used in the navigation
  const services = [
    'strategy',
    'transformation',
    'governance',
    'innovation',
    'advisory',
    'adoption',
  ];

  return locales.flatMap((locale) =>
    services.map((slug) => ({
      locale,
      slug,
    }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const locale = params.locale as 'nl' | 'en';
  const messages = (await import(`@/translations/${locale}.json`)).default;

  const serviceKey = {
    // New service slugs (matching landing page)
    strategy: 'genai',
    transformation: 'llm',
    governance: 'security',
    innovation: 'multiAgent',
    advisory: 'rag',
    adoption: 'servicenow',
    // Legacy slugs for backwards compatibility
    'genai-consultancy': 'genai',
    'llm-integration': 'llm',
    'rag-architecture': 'rag',
    'servicenow-ai': 'servicenow',
    'multi-agent-orchestration': 'multiAgent',
    'small-projects': 'security',
  }[params.slug];

  if (!serviceKey) {
    return {
      title:
        locale === 'nl' ? 'Service niet gevonden - GroeimetAI' : 'Service not found - GroeimetAI',
    };
  }

  const title = messages.serviceDetails[serviceKey].title;
  const description = messages.serviceDetails[serviceKey].description;

  return {
    title: `${title} - GroeimetAI`,
    description,
    openGraph: {
      title: `${title} - AI Consultancy Services`,
      description,
    },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const t = await getTranslations('serviceDetails');
  const tServicesPage = await getTranslations('servicesPage');
  const service = getServiceDataFromTranslations(params.slug, t);

  if (!service) {
    notFound();
  }

  const Icon = service.icon;

  return (
    <main className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-orange/5 to-green/5" />
        <div className="container mx-auto px-4 relative z-10">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('backToServices')}
          </Link>
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-xl bg-orange/10 flex items-center justify-center">
                <Icon className="w-8 h-8 text-orange" />
              </div>
              <div>
                <h1
                  className="text-4xl md:text-5xl font-bold text-white px-6 py-3 inline-block"
                  style={{ background: 'linear-gradient(135deg, #FF6600, #FF8833)' }}
                >
                  {service.title}
                </h1>
                <p className="text-xl text-white/70 mt-2">{service.subtitle}</p>
              </div>
            </div>
            <p className="text-lg text-white/80 mb-8">{service.longDescription}</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <StartProjectButton 
                size="lg" 
                className="shadow-premium hover-lift"
                preselectedService={
                  {
                    'strategy': 'genai-consultancy',
                    'transformation': 'llm-integration',
                    'governance': 'ai-security',
                    'innovation': 'multi-agent',
                    'advisory': 'rag-architecture',
                    'adoption': 'servicenow-ai',
                    // Legacy slugs already match
                    'genai-consultancy': 'genai-consultancy',
                    'llm-integration': 'llm-integration',
                    'rag-architecture': 'rag-architecture',
                    'servicenow-ai': 'servicenow-ai',
                    'multi-agent-orchestration': 'multi-agent',
                    'ai-security': 'ai-security',
                  }[service.slug] || service.slug
                }
              >
                {t('startProject')}
                <ArrowRight className="ml-2 w-5 h-5" />
              </StartProjectButton>
              <BrochureDownloadButton locale={params.locale as 'en' | 'nl'} />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-black/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">{t('benefits')}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {service.benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-orange mt-0.5" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">{t('features')}</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {service.features.map((feature, index) => (
                <Card key={index} className="p-6 hover-lift">
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-white/70">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-black/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">{t('process')}</h2>
            <div className="space-y-8">
              {service.process.map((step, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-orange flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-white/70">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Deliverables & Info */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Deliverables */}
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">{t('deliverables')}</h3>
                <ul className="space-y-2">
                  {service.deliverables.map((deliverable, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-orange mt-0.5" />
                      <span className="text-sm">{deliverable}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Technologies */}
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">{t('technologies')}</h3>
                <div className="flex flex-wrap gap-2">
                  {service.technologies.map((tech, index) => (
                    <span key={index} className="px-3 py-1 bg-orange/10 rounded-full text-sm">
                      {tech}
                    </span>
                  ))}
                </div>
              </Card>

              {/* Project Info */}
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">{t('projectInfo')}</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-white/70">{t('duration')}</p>
                    <p className="font-semibold">{service.duration}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/70">{t('investment')}</p>
                    <p className="font-semibold">{service.pricing}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-purple-600/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('readyToStart', { service: service.title })}
            </h2>
            <p className="text-xl text-white/70 mb-8">{t('letsRealize')}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <StartProjectButton size="lg" className="shadow-premium hover-lift" preselectedService="genai-consultancy">
                {tServicesPage('cta.consultation')}
              </StartProjectButton>
              <Link href="/cases">
                <Button size="lg" variant="outline" className="hover-lift">
                  {tServicesPage('cta.caseStudies')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
