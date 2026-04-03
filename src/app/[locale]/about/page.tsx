import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import {
  marketingBadge,
  marketingLightButton,
  marketingOrangePanel,
  marketingPanel,
  marketingPrimaryButton,
  marketingSecondaryButton,
} from '@/components/marketing/marketingStyles';
import { getBrandSiteContent } from '@/data/brandSiteContent';
import { blurDataURLs } from '@/lib/image-blurs';

export default function AboutPage({
  params,
}: {
  params: { locale: string };
}) {
  const content = getBrandSiteContent(params.locale).aboutPage;

  return (
    <main className="bg-[#120F0C] text-[#F6F2E8]">
      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(242,138,63,0.24),_transparent_30%),linear-gradient(180deg,_#1C130F_0%,_#120F0C_74%)]">
        <div className="container mx-auto px-4 pb-20 pt-24 sm:px-6 sm:pb-28 sm:pt-32 lg:px-8">
          <p className={marketingBadge}>
            {content.hero.badge}
          </p>
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.86fr] lg:items-end">
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
                src="/images/planet-volumes-byU63rK5W2E-unsplash.jpg"
                alt=""
                width={900}
                height={1000}
                placeholder="blur"
                blurDataURL={blurDataURLs['/images/planet-volumes-byU63rK5W2E-unsplash.jpg']}
                className="h-[420px] w-full object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02),rgba(19,12,9,0.72))]" />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#15110E]">
        <div className="container mx-auto px-4 py-18 sm:px-6 sm:py-24 lg:px-8">
          <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <div className={marketingPanel}>
              {content.intro.map((paragraph) => (
                <p key={paragraph} className="mb-5 text-base leading-8 text-[#C8C0B2] last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
            <div className={marketingOrangePanel}>
              <p className="text-xs uppercase tracking-[0.22em] text-[#B7C6A5]">Core stance</p>
              <p className="mt-4 text-2xl font-semibold tracking-[-0.04em]">Advise what works. Build what lasts.</p>
              <p className="mt-4 text-sm leading-7 text-[#C8C0B2]">
                GroeimetAI sits between vague consulting and feature-first delivery. The positioning is sharper on purpose: practical AI, safer rollout, and stronger teams.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#120F0C]">
        <div className="container mx-auto px-4 py-18 sm:px-6 sm:py-24 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.22em] text-[#F4B382]">Principles</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{content.principlesTitle}</h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {content.principles.map((principle, index) => (
              <article key={principle.title} className={index % 2 === 0 ? marketingOrangePanel : marketingPanel}>
                <h3 className="text-xl font-semibold tracking-[-0.03em]">{principle.title}</h3>
                <p className="mt-4 text-sm leading-7 text-[#C8C0B2]">{principle.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#15110E]">
        <div className="container mx-auto px-4 py-18 sm:px-6 sm:py-24 lg:px-8">
          <div className="grid gap-5 lg:grid-cols-2">
            <article className={marketingPanel}>
              <p className="text-xs uppercase tracking-[0.22em] text-[#B7C6A5]">Niels</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">{content.nielsTitle}</h2>
              {content.nielsBody.map((paragraph) => (
                <p key={paragraph} className="mt-4 text-sm leading-7 text-[#C8C0B2]">
                  {paragraph}
                </p>
              ))}
            </article>
            <article className={marketingOrangePanel}>
              <p className="text-xs uppercase tracking-[0.22em] text-[#CD6F2E]">Commercially relevant</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">{content.credibilityTitle}</h2>
              <ul className="mt-6 space-y-4">
                {content.credibility.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-7 text-[#D7D0C4]">
                    <span className="mt-3 h-1.5 w-1.5 flex-none rounded-full bg-[#CD6F2E]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="bg-[#120F0C]">
        <div className="container mx-auto px-4 py-18 sm:px-6 sm:py-24 lg:px-8">
          <div className="rounded-[2rem] bg-[linear-gradient(135deg,rgba(235,111,35,0.24),rgba(255,255,255,0.05))] p-8 shadow-[0_30px_100px_rgba(0,0,0,0.28)] sm:p-12">
            <h2 className="max-w-3xl text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{content.finalCta.title}</h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#E6D7CC]">{content.finalCta.body}</p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link href={content.finalCta.primaryHref} className={marketingLightButton}>
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
