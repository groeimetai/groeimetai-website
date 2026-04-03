import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getBrandSiteContent } from '@/data/brandSiteContent';

export default function ServicesPage({
  params,
}: {
  params: { locale: string };
}) {
  const content = getBrandSiteContent(params.locale).servicesPage;
  const ids = params.locale === 'en'
    ? ['training', 'strategy', 'workflow', 'integrations']
    : ['training', 'strategie', 'workflow', 'integraties'];
  const approachId = params.locale === 'en' ? 'approach' : 'aanpak';

  return (
    <main className="bg-[#111111] text-[#F6F2E8]">
      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(183,198,165,0.15),_transparent_32%),linear-gradient(180deg,_#171717_0%,_#111111_72%)]">
        <div className="container mx-auto px-4 pb-20 pt-24 sm:px-6 sm:pb-28 sm:pt-32 lg:px-8">
          <p className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.22em] text-[#D7D0C4]">
            {content.hero.badge}
          </p>
          <h1 className="mt-8 max-w-5xl text-5xl font-semibold leading-none tracking-[-0.05em] sm:text-6xl">
            {content.hero.title}
          </h1>
          <p className="mt-8 max-w-3xl text-lg leading-8 text-[#C8C0B2] sm:text-xl">{content.hero.subtitle}</p>
          <p className="mt-6 max-w-2xl text-sm leading-7 text-[#9B9386]">{content.hero.supporting}</p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link href={content.hero.primaryHref} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#F2E9DB] px-6 py-3.5 text-sm font-semibold text-[#111111] transition hover:bg-white">
              {content.hero.primaryCta}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href={content.hero.secondaryHref} className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3.5 text-sm font-semibold text-[#F6F2E8] transition hover:border-white/30 hover:bg-white/5">
              {content.hero.secondaryCta}
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#141414]">
        <div className="container mx-auto px-4 py-18 sm:px-6 sm:py-24 lg:px-8">
          <p className="max-w-3xl text-lg leading-8 text-[#C8C0B2]">{content.intro}</p>
          <div className="mt-12 grid gap-5 xl:grid-cols-2">
            {content.serviceCards.map((service, index) => (
              <article key={service.title} id={ids[index]} className="rounded-[1.9rem] border border-white/10 bg-[#101010] p-7">
                <h2 className="text-2xl font-semibold tracking-[-0.03em]">{service.title}</h2>
                <p className="mt-4 text-base leading-7 text-[#C8C0B2]">{service.body}</p>
                <ul className="mt-6 space-y-3">
                  {service.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-3 text-sm leading-6 text-[#D7D0C4]">
                      <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-[#CD6F2E]" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#111111]" id={approachId}>
        <div className="container mx-auto px-4 py-18 sm:px-6 sm:py-24 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.22em] text-[#B7C6A5]">Approach</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{content.processTitle}</h2>
          </div>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {content.process.map((step) => (
              <article key={step.title} className="rounded-[1.9rem] border border-white/10 bg-[#171717] p-7">
                <h3 className="text-xl font-semibold tracking-[-0.03em]">{step.title}</h3>
                <p className="mt-4 text-sm leading-7 text-[#C8C0B2]">{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#141414]">
        <div className="container mx-auto px-4 py-18 sm:px-6 sm:py-24 lg:px-8">
          <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,_rgba(242,233,219,0.08),_rgba(183,198,165,0.06))] p-8 sm:p-12">
            <h2 className="max-w-3xl text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{content.finalCta.title}</h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#C8C0B2]">{content.finalCta.body}</p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link href={content.finalCta.primaryHref} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#F2E9DB] px-6 py-3.5 text-sm font-semibold text-[#111111] transition hover:bg-white">
                {content.finalCta.primaryCta}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href={content.finalCta.secondaryHref} className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3.5 text-sm font-semibold text-[#F6F2E8] transition hover:border-white/30 hover:bg-white/5">
                {content.finalCta.secondaryCta}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
