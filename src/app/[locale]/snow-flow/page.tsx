import Image from 'next/image';
import { ArrowRight, ExternalLink } from 'lucide-react';
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

export default function SnowFlowPage({
  params,
}: {
  params: { locale: string };
}) {
  const content = getBrandSiteContent(params.locale).snowFlowPage;
  const isEn = params.locale === 'en';
  const isExternal = content.hero.primaryHref.startsWith('http');
  const roleLabel = isEn ? 'Role on this site' : 'Rol op deze site';
  const roleTitle = isEn
    ? 'Visible as proof, not leading as the offer.'
    : 'Zichtbaar als bewijs, niet leidend als aanbod.';
  const roleBody = isEn
    ? 'Snow-Flow should reinforce the message that GroeimetAI understands the technical foundation deeply, while keeping the main commercial story focused on adoption, training, and practical implementation.'
    : 'Snow-Flow moet vooral laten zien dat GroeimetAI de technische fundering diep begrijpt, terwijl het commerciële hoofdverhaal draait om adoptie, training en praktische implementatie.';
  const foundationsLabel = isEn ? 'Foundations' : 'Fundament';
  const whyLabel = isEn ? 'Why it matters' : 'Waarom dit belangrijk is';

  return (
    <main className="bg-[#120F0C] text-[#F6F2E8]">
      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(242,138,63,0.22),_transparent_30%),radial-gradient(circle_at_75%_15%,_rgba(255,199,142,0.12),_transparent_24%),linear-gradient(180deg,_#1C130F_0%,_#120F0C_74%)]">
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
                <Link
                  href={content.hero.primaryHref}
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noreferrer noopener' : undefined}
                  className={marketingPrimaryButton}
                >
                  {content.hero.primaryCta}
                  {isExternal ? <ExternalLink className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                </Link>
                <Link href={content.hero.secondaryHref} className={marketingSecondaryButton}>
                  {content.hero.secondaryCta}
                </Link>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-[2.2rem] bg-[#241610] shadow-[0_28px_90px_rgba(0,0,0,0.28)]">
              <Image
                src="/images/warren-umoh-FC-2ilPSO6A-unsplash.jpg"
                alt=""
                width={900}
                height={1000}
                placeholder="blur"
                blurDataURL={blurDataURLs['/images/warren-umoh-FC-2ilPSO6A-unsplash.jpg']}
                className="h-[420px] w-full object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04),rgba(19,12,9,0.72))]" />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#15110E]">
        <div className="container mx-auto px-4 py-14 sm:px-6 sm:py-24 lg:px-8">
          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <article className={marketingPanel}>
              {content.intro.map((paragraph) => (
                <p key={paragraph} className="mb-5 text-base leading-8 text-[#C8C0B2] last:mb-0">
                  {paragraph}
                </p>
              ))}
            </article>
            <article className={marketingOrangePanel}>
              <p className="text-xs uppercase tracking-[0.22em] text-[#B7C6A5]">{roleLabel}</p>
              <p className="mt-4 text-2xl font-semibold tracking-[-0.04em]">
                {roleTitle}
              </p>
              <p className="mt-4 text-sm leading-7 text-[#C8C0B2]">
                {roleBody}
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#120F0C]">
        <div className="container mx-auto px-4 py-14 sm:px-6 sm:py-24 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.22em] text-[#F4B382]">{foundationsLabel}</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{content.pillarsTitle}</h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {content.pillars.map((pillar, index) => (
              <article key={pillar.title} className={index === 1 ? marketingOrangePanel : marketingPanel}>
                <h3 className="text-xl font-semibold tracking-[-0.03em]">{pillar.title}</h3>
                <p className="mt-4 text-sm leading-7 text-[#C8C0B2]">{pillar.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#15110E]">
        <div className="container mx-auto px-4 py-14 sm:px-6 sm:py-24 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.22em] text-[#CD6F2E]">{whyLabel}</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{content.whyTitle}</h2>
          </div>
          <ul className="mt-10 grid gap-5 lg:grid-cols-3">
            {content.why.map((item, index) => (
              <li key={item} className={`${index === 0 ? marketingOrangePanel : marketingPanel} text-sm leading-7 text-[#D7D0C4]`}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-[#120F0C]">
        <div className="container mx-auto px-4 py-14 sm:px-6 sm:py-24 lg:px-8">
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
