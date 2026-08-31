import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { allPillarSlugs, getPillar } from '@/content/pillars';
import { MarkdownArticle } from '@/components/content/MarkdownArticle';
import { ArticleLayout } from '@/components/content/ArticleLayout';
import { ArticleJsonLd, BreadcrumbJsonLd, FAQJsonLd, FOUNDER_ID } from '@/components/JsonLd';
import type { Locale } from '@/content/types';

const BASE = 'https://groeimetai.io';
// Generated card image (src/app/opengraph-image.tsx).
const OG_IMAGE = 'https://groeimetai.io/opengraph-image/og.png';

export async function generateStaticParams() {
  return allPillarSlugs().map(({ slug, locale }) => ({ slug, locale }));
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const page = getPillar(params.slug, params.locale as Locale);
  if (!page) return { title: 'Niet gevonden — GroeimetAI' };

  const url = `${BASE}/${params.locale}/voor/${params.slug}`;
  return {
    title: `${page.title} — GroeimetAI`,
    description: page.intro,
    alternates: {
      // Pillar pages are NL-only — no EN hreflang. Self-referential canonical
      // and an x-default that mirrors the canonical so search engines don't
      // try to find a non-existent translation.
      canonical: url,
      languages: {
        'nl-NL': `${BASE}/nl/voor/${params.slug}`,
        'x-default': `${BASE}/nl/voor/${params.slug}`,
      },
    },
    openGraph: {
      title: page.title,
      description: page.intro,
      url,
      type: 'article',
      locale: params.locale === 'nl' ? 'nl_NL' : 'en_US',
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: page.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: page.title,
      description: page.intro,
      images: [OG_IMAGE],
    },
    keywords: page.keywords,
  };
}

export default function PillarPage({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const page = getPillar(params.slug, params.locale as Locale);
  if (!page) notFound();

  const url = `${BASE}/${params.locale}/voor/${params.slug}`;
  const breadcrumbs = [
    { name: 'Home', url: `${BASE}/${params.locale}` },
    { name: page.title, url },
  ];

  return (
    <>
      <ArticleJsonLd
        headline={page.title}
        description={page.intro}
        url={url}
        authorId={FOUNDER_ID}
        datePublished={page.date}
        dateModified={page.updated || page.date}
        authorName="Niels van der Werf"
        authorUrl={`${BASE}/${params.locale}/about#niels-van-der-werf`}
        inLanguage={params.locale === 'nl' ? 'nl' : 'en'}
        keywords={page.keywords}
        articleSection="Pillar"
      />
      <BreadcrumbJsonLd items={breadcrumbs} />
      {page.faqs && page.faqs.length > 0 && <FAQJsonLd faqs={page.faqs} />}

      <ArticleLayout
        locale={params.locale}
        meta={{
          title: page.title,
          excerpt: page.intro,
          date: page.date,
          category: params.locale === 'nl' ? 'Routekaart' : 'Roadmap',
          authorName: 'Niels van der Werf',
          authorRole: 'Founder, GroeimetAI',
        }}
        breadcrumbs={[{ label: page.title }]}
        cta={{
          headline: page.ctaHeadline,
          subline: page.ctaSubline,
          href: `/${params.locale}/contact`,
          label: params.locale === 'nl' ? 'Plan een gesprek' : 'Schedule a conversation',
        }}
      >
        <MarkdownArticle source={page.body} />

        {page.faqs && page.faqs.length > 0 && (
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
        )}
      </ArticleLayout>
    </>
  );
}
