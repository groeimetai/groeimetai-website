import type { Metadata } from 'next';
import { AboutPageView } from '@/components/landing-v2/pages/AboutPageView';
import { PersonJsonLd, BreadcrumbJsonLd, FOUNDER_ID } from '@/components/JsonLd';

const BASE = 'https://groeimetai.io';
// Generated card image (src/app/opengraph-image.tsx).
const OG_IMAGE = 'https://groeimetai.io/opengraph-image/og.png';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const url = `${BASE}/${params.locale}/about`;
  const title =
    params.locale === 'nl'
      ? 'Over Niels van der Werf — GroeimetAI'
      : 'About Niels van der Werf — GroeimetAI';
  const description =
    params.locale === 'nl'
      ? 'Founder van GroeimetAI. Helpt MKB-teams nuchter werken met AI via training, strategie, workflow-herontwerp en veilige integraties.'
      : 'Founder of GroeimetAI. Helps SME teams work pragmatically with AI through training, strategy, workflow redesign and safe integrations.';

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        'nl-NL': `${BASE}/nl/about`,
        en: `${BASE}/en/about`,
        'x-default': `${BASE}/nl/about`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      type: 'profile',
      locale: params.locale === 'nl' ? 'nl_NL' : 'en_US',
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [OG_IMAGE],
    },
  };
}

export default function AboutPage({ params }: { params: { locale: string } }) {
  const personUrl = `${BASE}/${params.locale}/about#niels-van-der-werf`;
  const personDescription =
    params.locale === 'nl'
      ? 'Founder van GroeimetAI. Helpt MKB- en middelgrote organisaties nuchter werken met AI via training, strategie, workflow-herontwerp en veilige integraties.'
      : 'Founder of GroeimetAI. Helps SME and mid-market organisations work pragmatically with AI through training, strategy, workflow redesign and safe integrations.';

  return (
    <>
      {/*
        One canonical, locale-independent @id (FOUNDER_ID) so /nl/about and
        /en/about describe the same person instead of two entities, and so
        Organization.founder resolves to a real node. The locale-specific page
        stays in `url`, which is what `url` is for.
      */}
      <PersonJsonLd
        id={FOUNDER_ID}
        name="Niels van der Werf"
        jobTitle={params.locale === 'nl' ? 'Founder, GroeimetAI' : 'Founder, GroeimetAI'}
        description={personDescription}
        url={personUrl}
        sameAs={[
          'https://www.linkedin.com/in/nielsvanderwerf',
          'https://github.com/GroeimetAI',
        ]}
        worksFor={{ '@id': `${BASE}/#organization` }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: params.locale === 'nl' ? 'Home' : 'Home', url: `${BASE}/${params.locale}` },
          { name: params.locale === 'nl' ? 'Over Niels' : 'About Niels', url: `${BASE}/${params.locale}/about` },
        ]}
      />
      <div className="ds">
        <AboutPageView basePath={`/${params.locale}`} />
      </div>
    </>
  );
}
