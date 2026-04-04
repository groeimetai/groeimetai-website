import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import {
  marketingBadge,
  marketingOrangePanel,
  marketingPanel,
  marketingPrimaryButton,
  marketingSecondaryButton,
} from '@/components/marketing/marketingStyles';
import { getBrandSiteContent } from '@/data/brandSiteContent';
import { Link } from '@/i18n/routing';
import { blurDataURLs } from '@/lib/image-blurs';

export default function ServicesPage({
  params,
}: {
  params: { locale: string };
}) {
  const content = getBrandSiteContent(params.locale).servicesPage;
  const isEn = params.locale === 'en';
  const ids = params.locale === 'en'
    ? ['training', 'strategy', 'workflow', 'integrations']
    : ['training', 'strategie', 'workflow', 'integraties'];
  const approachId = params.locale === 'en' ? 'approach' : 'aanpak';

  return (
    <main className="bg-[#120F0C] text-[#F6F2E8]">
      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(242,138,63,0.24),_transparent_30%),radial-gradient(circle_at_78%_15%,_rgba(255,199,142,0.12),_transparent_24%),linear-gradient(180deg,_#1C130F_0%,_#120F0C_74%)]">
        <div className="container mx-auto px-4 pb-20 pt-24 sm:px-6 sm:pb-28 sm:pt-32 lg:px-8">
          <p className={marketingBadge}>
            {content.hero.badge}
          </p>
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-end">
            <div>
              <h1 className="max-w-5xl text-5xl font-semibold leading-none tracking-[-0.05em] sm:text-6xl">
                {content.hero.title}
              </h1>
              <p className="mt-8 max-w-3xl text-lg leading-8 text-[#D9C8BC] sm:text-xl">{content.hero.subtitle}</p>
              <p className="mt-6 max-w-2xl text-sm leading-7 text-[#A7968A]">{content.hero.supporting}</p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link href={content.hero.primaryHref} className={marketingPrimaryButton}>
                  {content.hero.primaryCta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href={content.hero.secondaryHref} className={marketingSecondaryButton}>
                  {content.hero.secondaryCta}
                </Link>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-[2.2rem] bg-[#241610] shadow-[0_28px_90px_rgba(0,0,0,0.28)]">
              <Image
                src="/images/jelena-lapina-hX8n1lbjNH8-unsplash.jpg"
                alt=""
                width={900}
                height={1000}
                placeholder="blur"
                blurDataURL={blurDataURLs['/images/jelena-lapina-hX8n1lbjNH8-unsplash.jpg']}
                className="h-[420px] w-full object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04),rgba(19,12,9,0.72))]" />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#15110E]">
        <div className="container mx-auto px-4 py-18 sm:px-6 sm:py-24 lg:px-8">
          <p className="max-w-3xl text-lg leading-8 text-[#D2C0B3]">{content.intro}</p>
          <div className="mt-12 grid gap-5 xl:grid-cols-2">
            {content.serviceCards.map((service, index) => (
              <article
                key={service.title}
                id={ids[index]}
                className={index % 2 === 0 ? marketingOrangePanel : marketingPanel}
              >
                <h2 className="text-2xl font-semibold tracking-[-0.03em]">{service.title}</h2>
                <p className="mt-4 text-base leading-7 text-[#D2C0B3]">{service.body}</p>
                <ul className="mt-6 space-y-3">
                  {service.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-3 text-sm leading-6 text-[#D7D0C4]">
                      <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-[#F28A3F]" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#120F0C]" id={approachId}>
        <div className="container mx-auto px-4 py-18 sm:px-6 sm:py-24 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.22em] text-[#F4B382]">{isEn ? 'Approach' : 'Aanpak'}</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{content.processTitle}</h2>
          </div>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {content.process.map((step, index) => (
              <article key={step.title} className={index === 1 ? marketingOrangePanel : marketingPanel}>
                <h3 className="text-xl font-semibold tracking-[-0.03em]">{step.title}</h3>
                <p className="mt-4 text-sm leading-7 text-[#C8C0B2]">{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#15110E]">
        <div className="container mx-auto px-4 py-18 sm:px-6 sm:py-24 lg:px-8">
          <div className="rounded-[2rem] bg-[linear-gradient(135deg,rgba(235,111,35,0.24),rgba(255,255,255,0.05))] p-8 shadow-[0_30px_100px_rgba(0,0,0,0.28)] sm:p-12">
            <h2 className="max-w-3xl text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{content.finalCta.title}</h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#E6D7CC]">{content.finalCta.body}</p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link href={content.finalCta.primaryHref} className={marketingPrimaryButton}>
                {content.finalCta.primaryCta}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href={content.finalCta.secondaryHref} className={marketingSecondaryButton}>
                {content.finalCta.secondaryCta}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
