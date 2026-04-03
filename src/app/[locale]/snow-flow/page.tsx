import Link from 'next/link';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { getBrandSiteContent } from '@/data/brandSiteContent';

export default function SnowFlowPage({
  params,
}: {
  params: { locale: string };
}) {
  const content = getBrandSiteContent(params.locale).snowFlowPage;
  const isExternal = content.hero.primaryHref.startsWith('http');

  return (
    <main className="bg-[#111111] text-[#F6F2E8]">
      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(183,198,165,0.16),_transparent_28%),radial-gradient(circle_at_75%_15%,_rgba(205,111,46,0.18),_transparent_24%),linear-gradient(180deg,_#171717_0%,_#111111_74%)]">
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
            <Link
              href={content.hero.primaryHref}
              target={isExternal ? '_blank' : undefined}
              rel={isExternal ? 'noreferrer noopener' : undefined}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#F2E9DB] px-6 py-3.5 text-sm font-semibold text-[#111111] transition hover:bg-white"
            >
              {content.hero.primaryCta}
              {isExternal ? <ExternalLink className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
            </Link>
            <Link href={content.hero.secondaryHref} className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3.5 text-sm font-semibold text-[#F6F2E8] transition hover:border-white/30 hover:bg-white/5">
              {content.hero.secondaryCta}
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#141414]">
        <div className="container mx-auto px-4 py-18 sm:px-6 sm:py-24 lg:px-8">
          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <article className="rounded-[1.9rem] border border-white/10 bg-[#161616] p-7">
              {content.intro.map((paragraph) => (
                <p key={paragraph} className="mb-5 text-base leading-8 text-[#C8C0B2] last:mb-0">
                  {paragraph}
                </p>
              ))}
            </article>
            <article className="rounded-[1.9rem] border border-white/10 bg-[#101010] p-7">
              <p className="text-xs uppercase tracking-[0.22em] text-[#B7C6A5]">Role on this site</p>
              <p className="mt-4 text-2xl font-semibold tracking-[-0.04em]">
                Visible as proof, not leading as the offer.
              </p>
              <p className="mt-4 text-sm leading-7 text-[#C8C0B2]">
                Snow-Flow should reinforce the message that GroeimetAI understands the technical foundation deeply, while keeping the main commercial story focused on adoption, training, and practical implementation.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#111111]">
        <div className="container mx-auto px-4 py-18 sm:px-6 sm:py-24 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.22em] text-[#B7C6A5]">Foundations</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{content.pillarsTitle}</h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {content.pillars.map((pillar) => (
              <article key={pillar.title} className="rounded-[1.9rem] border border-white/10 bg-[#171717] p-7">
                <h3 className="text-xl font-semibold tracking-[-0.03em]">{pillar.title}</h3>
                <p className="mt-4 text-sm leading-7 text-[#C8C0B2]">{pillar.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#141414]">
        <div className="container mx-auto px-4 py-18 sm:px-6 sm:py-24 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.22em] text-[#CD6F2E]">Why it matters</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{content.whyTitle}</h2>
          </div>
          <ul className="mt-10 grid gap-5 lg:grid-cols-3">
            {content.why.map((item) => (
              <li key={item} className="rounded-[1.9rem] border border-white/10 bg-[#101010] p-7 text-sm leading-7 text-[#D7D0C4]">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-[#111111]">
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
