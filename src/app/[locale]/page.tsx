import Link from 'next/link';
import { ArrowRight, CheckCircle2, Shield, Sparkles } from 'lucide-react';
import { getBrandSiteContent } from '@/data/brandSiteContent';

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

  return (
    <main className="bg-[#111111] text-[#F6F2E8]">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(183,198,165,0.14),_transparent_32%),radial-gradient(circle_at_80%_20%,_rgba(205,111,46,0.2),_transparent_28%),linear-gradient(180deg,_#171717_0%,_#111111_72%)]" />
        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)', backgroundSize: '42px 42px' }} />
        <div className="container relative mx-auto px-4 pb-20 pt-24 sm:px-6 sm:pb-28 sm:pt-32 lg:px-8">
          <div className="grid gap-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:items-end">
            <div className="max-w-4xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-[#D7D0C4]">
                <span className="h-2 w-2 rounded-full bg-[#B7C6A5]" />
                {content.hero.badge}
              </p>
              <h1 className="mt-8 max-w-4xl text-5xl font-semibold leading-none tracking-[-0.055em] text-[#F6F2E8] sm:text-6xl lg:text-7xl">
                {content.hero.title}
              </h1>
              <p className="mt-8 max-w-3xl text-lg leading-8 text-[#C8C0B2] sm:text-xl">
                {content.hero.subtitle}
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  href={content.hero.primaryHref}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#F2E9DB] px-6 py-3.5 text-sm font-semibold text-[#111111] transition hover:bg-white"
                >
                  {content.hero.primaryCta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={content.hero.secondaryHref}
                  className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3.5 text-sm font-semibold text-[#F6F2E8] transition hover:border-white/30 hover:bg-white/5"
                >
                  {content.hero.secondaryCta}
                </Link>
              </div>
              <p className="mt-8 max-w-2xl text-sm leading-6 text-[#9B9386]">{content.hero.supporting}</p>
            </div>

            <div className="relative rounded-[2rem] border border-white/10 bg-[#161616]/90 p-7 shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur">
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#9B9386]">Positioning</p>
                  <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">No-bullshit AI</p>
                </div>
                <Shield className="h-7 w-7 text-[#B7C6A5]" />
              </div>
              <div className="space-y-5 py-6">
                {[
                  'Training en workshops die mensen beter laten werken',
                  'Workflowverbetering vóór maatwerksoftware',
                  'Veilige implementatie zonder black-box afhankelijkheid',
                  'Open standaarden waar mogelijk, governance waar nodig',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-[#CD6F2E]" />
                    <p className="text-sm leading-6 text-[#D7D0C4]">{item}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-[1.5rem] border border-[#B7C6A5]/20 bg-[#1D1D1D] p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-[#9B9386]">Primary message</p>
                <p className="mt-3 text-lg leading-7 text-[#F6F2E8]">
                  We leren teams hoe ze beter werken met AI, en bouwen alleen tooling of integraties wanneer dat echt duurzame waarde toevoegt.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#141414]">
        <div className="container mx-auto px-4 py-18 sm:px-6 sm:py-24 lg:px-8">
          <SectionHeader {...content.problemsIntro} />
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {content.problems.map((problem) => (
              <article key={problem.title} className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-7">
                <h3 className="text-2xl font-semibold tracking-[-0.03em] text-[#F6F2E8]">{problem.title}</h3>
                <p className="mt-4 text-sm leading-7 text-[#C8C0B2]">{problem.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#111111]">
        <div className="container mx-auto px-4 py-18 sm:px-6 sm:py-24 lg:px-8">
          <SectionHeader {...content.principlesIntro} />
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {content.principles.map((principle) => (
              <article key={principle.title} className="rounded-[1.75rem] border border-white/10 bg-[#171717] p-7">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-[#B7C6A5]" />
                  <h3 className="text-xl font-semibold tracking-[-0.03em] text-[#F6F2E8]">{principle.title}</h3>
                </div>
                <p className="mt-4 text-sm leading-7 text-[#C8C0B2]">{principle.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#141414]">
        <div className="container mx-auto px-4 py-18 sm:px-6 sm:py-24 lg:px-8">
          <SectionHeader {...content.servicesIntro} />
          <div className="mt-12 grid gap-5 xl:grid-cols-2">
            {content.services.map((service, index) => {
              const anchors = ['training', 'strategie', 'workflow', 'integraties'];
              return (
                <article
                  key={service.title}
                  className="rounded-[1.9rem] border border-white/10 bg-[#101010] p-7"
                  id={anchors[index]}
                >
                  <h3 className="text-2xl font-semibold tracking-[-0.03em] text-[#F6F2E8]">{service.title}</h3>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-[#C8C0B2]">{service.body}</p>
                  <ul className="mt-6 space-y-3">
                    {service.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-3 text-sm leading-6 text-[#D7D0C4]">
                        <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-[#CD6F2E]" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#111111]">
        <div className="container mx-auto px-4 py-18 sm:px-6 sm:py-24 lg:px-8">
          <SectionHeader {...content.audienceIntro} />
          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            <article className="rounded-[1.9rem] border border-white/10 bg-[#181818] p-7">
              <p className="text-xs uppercase tracking-[0.2em] text-[#B7C6A5]">Goede fit</p>
              <ul className="mt-5 space-y-4">
                {content.audience.goodFit.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-7 text-[#D7D0C4]">
                    <CheckCircle2 className="mt-1 h-5 w-5 flex-none text-[#B7C6A5]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
            <article className="rounded-[1.9rem] border border-white/10 bg-[#151515] p-7">
              <p className="text-xs uppercase tracking-[0.2em] text-[#CD6F2E]">Minder geschikt</p>
              <ul className="mt-5 space-y-4">
                {content.audience.notFit.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-7 text-[#C8C0B2]">
                    <span className="mt-3 h-px w-5 flex-none bg-[#CD6F2E]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#141414]" id="aanpak">
        <div className="container mx-auto px-4 py-18 sm:px-6 sm:py-24 lg:px-8">
          <SectionHeader {...content.approachIntro} />
          <div className="mt-12 grid gap-5 lg:grid-cols-4">
            {content.steps.map((step) => (
              <article key={step.title} className="rounded-[1.9rem] border border-white/10 bg-[#101010] p-7">
                <h3 className="text-xl font-semibold tracking-[-0.03em] text-[#F6F2E8]">{step.title}</h3>
                <p className="mt-4 text-sm leading-7 text-[#C8C0B2]">{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#111111]">
        <div className="container mx-auto px-4 py-18 sm:px-6 sm:py-24 lg:px-8">
          <SectionHeader {...content.proofIntro} />
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {content.proofs.map((proof) => (
              <article key={proof.title} className="rounded-[1.9rem] border border-white/10 bg-[#171717] p-7">
                <h3 className="text-xl font-semibold tracking-[-0.03em] text-[#F6F2E8]">{proof.title}</h3>
                <p className="mt-4 text-sm leading-7 text-[#C8C0B2]">{proof.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#141414]">
        <div className="container mx-auto px-4 py-18 sm:px-6 sm:py-24 lg:px-8">
          <SectionHeader {...content.snowFlowIntro} />
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/snow-flow"
              className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3.5 text-sm font-semibold text-[#F6F2E8] transition hover:border-white/30 hover:bg-white/5"
            >
              {content.snowFlowCta}
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#111111]">
        <div className="container mx-auto px-4 py-18 sm:px-6 sm:py-24 lg:px-8">
          <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,_rgba(242,233,219,0.08),_rgba(183,198,165,0.06))] p-8 sm:p-12">
            <h2 className="max-w-3xl text-3xl font-semibold tracking-[-0.04em] text-[#F6F2E8] sm:text-4xl">
              {content.finalCta.title}
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#C8C0B2]">{content.finalCta.body}</p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href={content.finalCta.primaryHref}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#F2E9DB] px-6 py-3.5 text-sm font-semibold text-[#111111] transition hover:bg-white"
              >
                {content.finalCta.primaryCta}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={content.finalCta.secondaryHref}
                className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3.5 text-sm font-semibold text-[#F6F2E8] transition hover:border-white/30 hover:bg-white/5"
              >
                {content.finalCta.secondaryCta}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
