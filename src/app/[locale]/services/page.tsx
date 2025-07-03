import { Metadata } from 'next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';
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
} from 'lucide-react';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const locale = params.locale as 'nl' | 'en';
  const messages = (await import(`@/translations/${locale}.json`)).default;

  return {
    title: `${messages.servicesPage.hero.title} - GroeimetAI`,
    description: messages.servicesPage.hero.description,
    openGraph: {
      title: `${messages.servicesPage.hero.title} - GroeimetAI`,
      description: messages.servicesPage.hero.description,
    },
  };
}

export default async function ServicesPage() {
  const t = await getTranslations('servicesPage');
  const tServiceDetails = await getTranslations('serviceDetails');

  const services = [
    {
      title: tServiceDetails('ai-strategy.title'),
      description: tServiceDetails('ai-strategy.description'),
      icon: Brain,
      slug: 'ai-strategy',
      features: [
        tServiceDetails('ai-strategy.features.0'),
        tServiceDetails('ai-strategy.features.1'),
        tServiceDetails('ai-strategy.features.2'),
        tServiceDetails('ai-strategy.features.3'),
      ],
      highlights: [
        tServiceDetails('ai-strategy.highlights.0'),
        tServiceDetails('ai-strategy.highlights.1'),
        tServiceDetails('ai-strategy.highlights.2'),
      ],
    },
    {
      title: tServiceDetails('chatbot-development.title'),
      description: tServiceDetails('chatbot-development.description'),
      icon: Bot,
      slug: 'chatbot-development',
      features: [
        tServiceDetails('chatbot-development.features.0'),
        tServiceDetails('chatbot-development.features.1'),
        tServiceDetails('chatbot-development.features.2'),
        tServiceDetails('chatbot-development.features.3'),
      ],
      highlights: [
        tServiceDetails('chatbot-development.highlights.0'),
        tServiceDetails('chatbot-development.highlights.1'),
        tServiceDetails('chatbot-development.highlights.2'),
      ],
    },
    {
      title: tServiceDetails('ai-integration.title'),
      description: tServiceDetails('ai-integration.description'),
      icon: Layers,
      slug: 'ai-integration',
      features: [
        tServiceDetails('ai-integration.features.0'),
        tServiceDetails('ai-integration.features.1'),
        tServiceDetails('ai-integration.features.2'),
        tServiceDetails('ai-integration.features.3'),
      ],
      highlights: [
        tServiceDetails('ai-integration.highlights.0'),
        tServiceDetails('ai-integration.highlights.1'),
        tServiceDetails('ai-integration.highlights.2'),
      ],
    },
    {
      title: tServiceDetails('prompt-engineering.title'),
      description: tServiceDetails('prompt-engineering.description'),
      icon: Sparkles,
      slug: 'prompt-engineering',
      features: [
        tServiceDetails('prompt-engineering.features.0'),
        tServiceDetails('prompt-engineering.features.1'),
        tServiceDetails('prompt-engineering.features.2'),
        tServiceDetails('prompt-engineering.features.3'),
      ],
      highlights: [
        tServiceDetails('prompt-engineering.highlights.0'),
        tServiceDetails('prompt-engineering.highlights.1'),
        tServiceDetails('prompt-engineering.highlights.2'),
      ],
    },
    {
      title: tServiceDetails('workflow-automation.title'),
      description: tServiceDetails('workflow-automation.description'),
      icon: Workflow,
      slug: 'workflow-automation',
      features: [
        tServiceDetails('workflow-automation.features.0'),
        tServiceDetails('workflow-automation.features.1'),
        tServiceDetails('workflow-automation.features.2'),
        tServiceDetails('workflow-automation.features.3'),
      ],
      highlights: [
        tServiceDetails('workflow-automation.highlights.0'),
        tServiceDetails('workflow-automation.highlights.1'),
        tServiceDetails('workflow-automation.highlights.2'),
      ],
    },
    {
      title: tServiceDetails('compliance-safety.title'),
      description: tServiceDetails('compliance-safety.description'),
      icon: Shield,
      slug: 'compliance-safety',
      features: [
        tServiceDetails('compliance-safety.features.0'),
        tServiceDetails('compliance-safety.features.1'),
        tServiceDetails('compliance-safety.features.2'),
        tServiceDetails('compliance-safety.features.3'),
      ],
      highlights: [
        tServiceDetails('compliance-safety.highlights.0'),
        tServiceDetails('compliance-safety.highlights.1'),
        tServiceDetails('compliance-safety.highlights.2'),
      ],
    },
  ];

  const processSteps = [
    {
      number: '01',
      title: t('process.steps.discovery.title'),
      description: t('process.steps.discovery.description'),
    },
    {
      number: '02',
      title: t('process.steps.strategy.title'),
      description: t('process.steps.strategy.description'),
    },
    {
      number: '03',
      title: t('process.steps.implementation.title'),
      description: t('process.steps.implementation.description'),
    },
    {
      number: '04',
      title: t('process.steps.optimization.title'),
      description: t('process.steps.optimization.description'),
    },
  ];

  return (
    <main className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-orange/5 to-green/5" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white px-8 py-4 inline-block"
              style={{ background: 'linear-gradient(135deg, #FF6600, #FF8833)' }}
            >
              {t('hero.title')}
            </h1>
            <p className="text-xl text-white/80 mb-8">{t('hero.description')}</p>
            <Link href="/contact">
              <Button size="lg" className="shadow-premium hover-lift">
                {t('cta.start')}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card
                key={index}
                className="p-6 hover-lift hover:shadow-premium transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <service.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                <p className="text-muted-foreground mb-4">{service.description}</p>

                <div className="space-y-2 mb-6">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {service.highlights.map((highlight, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 bg-primary/10 rounded-full">
                        {highlight}
                      </span>
                    ))}
                  </div>
                  <Link href={`/services/${service.slug}`}>
                    <Button variant="outline" className="w-full hover-lift">
                      {tServiceDetails('moreInfo')}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              {t('process.title')}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {processSteps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="text-5xl font-bold gradient-text mb-4">{step.number}</div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{t('whyUs.title')}</h2>
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-xl font-semibold mb-4">{t('whyUs.expertise.title')}</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary mt-0.5" />
                    <span>{t('whyUs.expertise.items.0')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary mt-0.5" />
                    <span>{t('whyUs.expertise.items.1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary mt-0.5" />
                    <span>{t('whyUs.expertise.items.2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary mt-0.5" />
                    <span>{t('whyUs.expertise.items.3')}</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">{t('whyUs.approach.title')}</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary mt-0.5" />
                    <span>{t('whyUs.approach.items.0')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary mt-0.5" />
                    <span>{t('whyUs.approach.items.1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary mt-0.5" />
                    <span>{t('whyUs.approach.items.2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary mt-0.5" />
                    <span>{t('whyUs.approach.items.3')}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-purple-600/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('readyToStart.title')}</h2>
            <p className="text-xl text-muted-foreground mb-8">{t('readyToStart.description')}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" className="shadow-premium hover-lift">
                  {t('cta.consultation')}
                </Button>
              </Link>
              <Link href="/cases">
                <Button size="lg" variant="outline" className="hover-lift">
                  {t('cta.caseStudies')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
