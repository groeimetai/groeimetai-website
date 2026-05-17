import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { allProgrammaticSlugs, getProgrammatic } from '@/content/programmatic';
import { ArticleLayout } from '@/components/content/ArticleLayout';
import { MarkdownArticle } from '@/components/content/MarkdownArticle';
import { ArticleJsonLd, BreadcrumbJsonLd, FAQJsonLd } from '@/components/JsonLd';
import type { Locale } from '@/content/types';

const BASE = 'https://groeimetai.io';

export async function generateStaticParams() {
  return allProgrammaticSlugs().map(({ slug, locale }) => ({ slug, locale }));
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const page = getProgrammatic(params.slug, params.locale as Locale);
  if (!page) return { title: 'Niet gevonden — GroeimetAI' };

  const url = `${BASE}/${params.locale}/training/${params.slug}`;
  return {
    title: `${page.title} — GroeimetAI`,
    description: page.intro,
    alternates: {
      canonical: url,
      languages: {
        'nl-NL': `${BASE}/nl/training/${params.slug}`,
        en: `${BASE}/en/training/${params.slug}`,
        'x-default': `${BASE}/nl/training/${params.slug}`,
      },
    },
    openGraph: {
      title: page.title,
      description: page.intro,
      url,
      type: 'article',
      locale: params.locale === 'nl' ? 'nl_NL' : 'en_US',
    },
  };
}

export default function ProgrammaticPage({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const page = getProgrammatic(params.slug, params.locale as Locale);
  if (!page) notFound();

  const url = `${BASE}/${params.locale}/training/${params.slug}`;
  const breadcrumbs = [
    { name: params.locale === 'nl' ? 'Training' : 'Training', url: `${BASE}/${params.locale}` },
    { name: page.title, url },
  ];

  // Assemble markdown body from sections so MarkdownArticle can render it.
  const body = page.sections
    .map((section) => `## ${section.heading}\n\n${section.body}`)
    .join('\n\n');

  return (
    <>
      <ArticleJsonLd
        headline={page.title}
        description={page.intro}
        url={url}
        datePublished="2026-05-15"
        authorName="Niels van der Werf"
        authorUrl={`${BASE}/${params.locale}/about#niels-van-der-werf`}
        inLanguage={params.locale === 'nl' ? 'nl' : 'en'}
        articleSection="Training"
      />
      <BreadcrumbJsonLd items={breadcrumbs} />
      <FAQJsonLd faqs={page.faqs} />

      <ArticleLayout
        locale={params.locale}
        meta={{
          title: page.title,
          excerpt: page.intro,
          category: params.locale === 'nl' ? 'Branche-gericht' : 'Industry-focused',
          authorName: 'Niels van der Werf',
          authorRole: 'Founder, GroeimetAI',
        }}
        breadcrumbs={[
          {
            label: params.locale === 'nl' ? 'Trainingen' : 'Training',
            href: `/${params.locale}/trainingen`,
          },
          { label: page.title },
        ]}
        cta={{
          headline:
            params.locale === 'nl'
              ? 'Wil je weten of dit bij jullie organisatie past?'
              : 'Want to know if this fits your organisation?',
          subline:
            params.locale === 'nl'
              ? 'Een verkennend gesprek kost een uur en geeft je concrete vervolgstappen, ongeacht of we samenwerken.'
              : 'A scoping conversation takes an hour and gives you concrete next steps regardless of whether we work together.',
          href: `/${params.locale}/contact`,
          label: params.locale === 'nl' ? 'Plan een gesprek' : 'Schedule a conversation',
        }}
      >
        <MarkdownArticle source={body} />

        <section className="mt-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8">
            {params.locale === 'nl' ? 'Veelgestelde vragen' : 'Frequently asked'}
          </h2>
          <div className="space-y-4">
            {page.faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white/[0.03] border border-white/10 rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-2">{faq.question}</h3>
                <p className="text-white/70 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </ArticleLayout>
    </>
  );
}
