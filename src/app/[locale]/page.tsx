import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';
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

function SectionHeader({
  eyebrow,
  title,
  body,
}: {
  eyebrow?: string;
  title: string;
  body: string;
}) {
  return (
    <div className="max-w-3xl">
      {eyebrow ? (
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-[#B7C6A5]">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-3xl font-semibold tracking-[-0.03em] text-[#F6F2E8] sm:text-4xl">
        {title}
      </h2>
      <p className="mt-5 max-w-2xl text-base leading-7 text-[#C8C0B2] sm:text-lg">{body}</p>
    </div>
  );
}

export default function HomePage({
  params,
}: {
  params: { locale: string };
}) {
  const content = getBrandSiteContent(params.locale).home;
  const isEn = params.locale === 'en';
  const heroSideTitle = isEn
    ? 'Foundation models, sharper workflows, and teams that stay in control.'
    : 'Sterke foundation models, scherpere workflows en teams die zelf de controle houden.';
  const problemsImageText = isEn
    ? 'The problem usually is not that you have too little AI. The problem is that there is no clear foundation.'
    : 'Het probleem is meestal niet dat je te weinig AI hebt. Het probleem is dat er geen helder fundament ligt.';

  return (
    <main className="bg-[#120F0C] text-[#F6F2E8]">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,_rgba(255,142,73,0.3),_transparent_26%),radial-gradient(circle_at_82%_16%,_rgba(255,199,142,0.14),_transparent_24%),radial-gradient(circle_at_76%_62%,_rgba(199,94,33,0.22),_transparent_30%),linear-gradient(180deg,_#21150F_0%,_#120F0C_72%)]" />
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'linear-gradient(rgba(255,245,235,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,245,235,0.18) 1px, transparent 1px)', backgroundSize: '52px 52px' }} />
        <div className="absolute inset-y-0 right-0 hidden w-[42%] bg-[linear-gradient(180deg,rgba(255,137,66,0.08),transparent)] lg:block" />
        <div className="container relative mx-auto px-4 pb-20 pt-24 sm:px-6 sm:pb-28 sm:pt-32 lg:px-8">
          <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.92fr)] lg:items-center">
            <div className="max-w-4xl">
              <p className={`${marketingBadge} items-center gap-2 tracking-[0.2em]`}>
                <span className="h-2 w-2 rounded-full bg-[#F28A3F]" />
                {content.hero.badge}
              </p>
              <h1 className="mt-8 max-w-4xl text-5xl font-semibold leading-none tracking-[-0.055em] text-[#F6F2E8] sm:text-6xl lg:text-7xl">
                {content.hero.title}
              </h1>
              <p className="mt-8 max-w-3xl text-lg leading-8 text-[#DDC8BA] sm:text-xl">
                {content.hero.subtitle}
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  href={content.hero.primaryHref}
                  className={marketingPrimaryButton}
                >
                  {content.hero.primaryCta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={content.hero.secondaryHref}
                  className={marketingSecondaryButton}
                >
                  {content.hero.secondaryCta}
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -right-6 top-8 hidden h-48 w-48 rounded-full bg-[#F28A3F]/20 blur-3xl lg:block" />
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#1D120D] shadow-[0_35px_120px_rgba(0,0,0,0.35)] sm:rounded-[2.3rem]">
                <Image
                  src="/images/mariola-grobelska-siujy-8IPrk-unsplash.jpg"
                  alt=""
                  width={760}
                  height={980}
                  placeholder="blur"
                  blurDataURL={blurDataURLs['/images/mariola-grobelska-siujy-8IPrk-unsplash.jpg']}
                  className="h-[300px] w-full object-cover sm:h-[480px]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02),rgba(15,10,8,0.78))]" />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-7">
                  <p className="text-xs uppercase tracking-[0.22em] text-[#E9C8B0]">No-bullshit AI</p>
                  <p className="mt-3 max-w-sm text-xl font-semibold leading-tight tracking-[-0.04em] text-white sm:text-2xl">
                    {heroSideTitle}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative border-b border-white/10 bg-[linear-gradient(180deg,#1A120D_0%,#14110F_100%)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_18%,rgba(242,138,63,0.12),transparent_22%)]" />
        <div className="container mx-auto px-4 py-14 sm:px-6 sm:py-24 lg:px-8">
          <SectionHeader {...content.problemsIntro} />
          <div className="mt-12 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="relative overflow-hidden rounded-[2rem] bg-[#25150E] shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
              <Image
                src="/images/nathan-duck-Jo5FUEkhB_4-unsplash.jpg"
                alt=""
                width={900}
                height={860}
                placeholder="blur"
                blurDataURL={blurDataURLs['/images/nathan-duck-Jo5FUEkhB_4-unsplash.jpg']}
                className="h-full min-h-[420px] w-full object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.06),rgba(25,15,10,0.74))]" />
              <div className="absolute bottom-0 left-0 right-0 p-7">
                <p className="text-sm leading-7 text-[#F4E7DB]">
                  {problemsImageText}
                </p>
              </div>
            </div>
            <div className="grid gap-5 lg:grid-cols-1">
            {content.problems.map((problem) => (
                <article key={problem.title} className={marketingPanel}>
                <h3 className="text-2xl font-semibold tracking-[-0.03em] text-[#F6F2E8]">{problem.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-[#D2C0B3]">{problem.body}</p>
                </article>
            ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative border-b border-white/10 bg-[#130F0D]">
        <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(242,138,63,0.1),transparent)]" />
        <div className="container mx-auto px-4 py-14 sm:px-6 sm:py-24 lg:px-8">
          <SectionHeader {...content.principlesIntro} />
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {content.principles.map((principle, index) => (
              <article
                key={principle.title}
                className={`${
                  index % 2 === 0
                    ? marketingOrangePanel
                    : marketingPanel
                }`}
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-[#F2A56D]" />
                  <h3 className="text-xl font-semibold tracking-[-0.03em] text-[#F6F2E8]">{principle.title}</h3>
                </div>
                <p className="mt-4 text-sm leading-7 text-[#D9C8BC]">{principle.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative border-b border-white/10 bg-[linear-gradient(180deg,#1A120E_0%,#120F0C_100%)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_20%,rgba(242,138,63,0.1),transparent_20%)]" />
        <div className="container mx-auto px-4 py-14 sm:px-6 sm:py-24 lg:px-8">
          <SectionHeader {...content.servicesIntro} />
          <div className="mt-12 grid gap-6 xl:grid-cols-2">
            {content.services.map((service, index) => {
              const anchors = ['training', 'strategie', 'workflow', 'integraties'];
              return (
                <article
                  key={service.title}
                  className="overflow-hidden rounded-[2rem] bg-[#18110E] shadow-[0_20px_70px_rgba(0,0,0,0.22)]"
                  id={anchors[index]}
                >
                  <div className="bg-[linear-gradient(135deg,rgba(242,138,63,0.22),rgba(242,138,63,0.06))] px-7 py-6">
                    <h3 className="text-2xl font-semibold tracking-[-0.03em] text-[#F6F2E8]">{service.title}</h3>
                    <p className="mt-4 max-w-2xl text-base leading-7 text-[#E5D3C5]">{service.body}</p>
                  </div>
                  <div className="px-7 py-7">
                    <ul className="space-y-3">
                    {service.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-3 text-sm leading-6 text-[#D7D0C4]">
                          <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-[#F28A3F]" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative border-b border-white/10 bg-[linear-gradient(180deg,#17110E_0%,#120F0C_100%)]" id="aanpak">
        <div className="absolute inset-y-0 left-0 w-1/3 bg-[radial-gradient(circle_at_20%_40%,rgba(242,138,63,0.12),transparent_45%)]" />
        <div className="container mx-auto px-4 py-14 sm:px-6 sm:py-24 lg:px-8">
          <SectionHeader {...content.approachIntro} />
          <div className="mt-12 grid gap-5 lg:grid-cols-[0.78fr_1.22fr]">
            <div className="relative overflow-hidden rounded-[2rem] bg-[#241610]">
              <Image
                src="/images/adrien-olichon-GBCLhU3rN5w-unsplash.jpg"
                alt=""
                width={820}
                height={980}
                placeholder="blur"
                blurDataURL={blurDataURLs['/images/adrien-olichon-GBCLhU3rN5w-unsplash.jpg']}
                className="h-full min-h-[420px] w-full object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02),rgba(17,12,9,0.7))]" />
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
            {content.steps.map((step, index) => (
              <article
                key={step.title}
                className={`${
                  index === 0 || index === 3
                    ? marketingOrangePanel
                    : marketingPanel
                }`}
              >
                <h3 className="text-xl font-semibold tracking-[-0.03em] text-[#F6F2E8]">{step.title}</h3>
                <p className="mt-4 text-sm leading-7 text-[#C8C0B2]">{step.body}</p>
              </article>
            ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#120F0C]">
        <div className="container mx-auto px-4 py-14 sm:px-6 sm:py-24 lg:px-8">
          <div className="overflow-hidden rounded-[2.2rem] bg-[linear-gradient(135deg,rgba(235,111,35,0.24),rgba(255,255,255,0.05))] p-8 shadow-[0_30px_100px_rgba(0,0,0,0.28)] sm:p-12">
            <h2 className="max-w-3xl text-3xl font-semibold tracking-[-0.04em] text-[#F6F2E8] sm:text-4xl">
              {content.finalCta.title}
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#E6D7CC]">{content.finalCta.body}</p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href={content.finalCta.primaryHref}
                className={marketingPrimaryButton}
              >
                {content.finalCta.primaryCta}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={content.finalCta.secondaryHref}
                className={marketingSecondaryButton}
              >
                {content.finalCta.secondaryCta}
              </Link>
            </div>
            <p className="mt-8 text-sm leading-6 text-[#A7968A]">
              {isEn ? 'Curious about the technical depth underneath? ' : 'Benieuwd naar de technische diepgang onder de motorkap? '}
              <Link href="/snow-flow" className="text-[#F2A56D] underline-offset-4 hover:underline">
                {isEn ? 'Read about Snow-Flow' : 'Lees over Snow-Flow'}
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
