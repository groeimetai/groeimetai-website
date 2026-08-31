const BASE_URL = 'https://groeimetai.io';
const ORGANIZATION_ID = `${BASE_URL}/#organization`;
const WEBSITE_ID = `${BASE_URL}/#website`;

/**
 * Canonical, locale-independent @id for the founder. Both /nl/about and /en/about
 * emit their Person node under this id, with the locale-specific page in `url`,
 * so the two locales resolve to one entity instead of two. Exported so pages and
 * content records can point at the same node.
 */
export const FOUNDER_ID = `${BASE_URL}/#niels-van-der-werf`;

/**
 * Live hub page for the service lines. `/[locale]/services` 308-redirects to
 * `/[locale]/trainingen` (next.config.mjs), so structured data must never cite
 * `/services`. Locale-prefixed because the bare path 307-redirects too.
 */
const SERVICES_HUB = `${BASE_URL}/nl/trainingen`;
const CONTACT_URL = `${BASE_URL}/nl/contact`;

/**
 * NAP data. Sources in this repo, used verbatim:
 * - KvK, phone, city: src/app/[locale]/privacy/page.tsx ("Identiteit en contactgegevens")
 * - Street + postcode: src/app/[locale]/privacy/page.tsx ("17.3 Postadres")
 * - Public mailbox: src/components/contact/GoogleMapEmbed.tsx
 * - Coordinates: src/components/contact/MapSection.tsx ("// Apeldoorn coordinates")
 */
const POSTAL_ADDRESS = {
  '@type': 'PostalAddress',
  streetAddress: 'Kweekweg 23',
  postalCode: '7315AP',
  addressLocality: 'Apeldoorn',
  addressCountry: 'NL',
};
const TELEPHONE = '+31681739018';
const EMAIL = 'info@groeimetai.io';

const AREA_SERVED = [
  { '@type': 'Country', name: 'Netherlands' },
  { '@type': 'Country', name: 'Belgium' },
  { '@type': 'Country', name: 'Germany' },
];

interface ServiceLine {
  id: string;
  name: string;
  serviceType: string;
  description: string;
}

const SERVICE_LINES: ServiceLine[] = [
  {
    id: 'ai-training',
    name: 'AI Training & Workshops',
    serviceType: 'AI training',
    description:
      'Practical workshops and team training that help people work better with modern AI models in daily operations.',
  },
  {
    id: 'ai-strategy-adoption',
    name: 'AI Strategy & Adoption',
    serviceType: 'AI strategy and adoption',
    description:
      'Use-case selection, adoption guidance, and roadmap work for organizations that want grounded AI decisions instead of hype-driven experimentation.',
  },
  {
    id: 'workflow-redesign',
    name: 'Workflow Redesign & Implementation',
    serviceType: 'Workflow redesign',
    description:
      'Workflow analysis and redesign that uses AI to reduce manual work, improve quality, and fit how teams already operate.',
  },
  {
    id: 'safe-integrations',
    name: 'Safe Integrations & Tooling',
    serviceType: 'AI integration',
    description:
      'Integrations, internal tools, and custom software when off-the-shelf AI tools are not enough and durable value requires implementation.',
  },
];

function serviceNode(service: ServiceLine) {
  return {
    '@type': 'Service',
    '@id': `${BASE_URL}/#service-${service.id}`,
    name: service.name,
    serviceType: service.serviceType,
    description: service.description,
    provider: { '@id': ORGANIZATION_ID },
    url: SERVICES_HUB,
    areaServed: AREA_SERVED,
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: CONTACT_URL,
      availableLanguage: ['Dutch', 'English'],
    },
  };
}

export function OrganizationJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: 'GroeimetAI',
    legalName: 'GroeimetAI',
    alternateName: 'Groei met AI',
    url: BASE_URL,
    logo: `${BASE_URL}/gecentreerd-logo.svg`,
    description:
      'GroeimetAI helps companies use AI with practical training, workflow improvement, safe integrations, and clear adoption guidance.',
    slogan: 'Geen AI-hype. Wel teams die er echt beter door werken.',
    foundingDate: '2023',
    founder: {
      '@id': FOUNDER_ID,
    },
    address: POSTAL_ADDRESS,
    telephone: TELEPHONE,
    email: EMAIL,
    identifier: {
      '@type': 'PropertyValue',
      name: 'Kamer van Koophandel',
      propertyID: 'KvK',
      value: '90102304',
    },
    location: {
      '@type': 'Place',
      name: 'GroeimetAI',
      address: POSTAL_ADDRESS,
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 52.2112,
        longitude: 5.9699,
      },
    },
    areaServed: AREA_SERVED,
    knowsAbout: [
      'Artificial Intelligence',
      'AI Training',
      'AI Strategy',
      'AI Adoption',
      'Workflow Improvement',
      'System Integration',
      'Open Standards',
      'Large Language Models',
      'Governance',
    ],
    sameAs: [
      'https://github.com/GroeimetAI',
      'https://www.linkedin.com/company/groeimetai',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      availableLanguage: ['Dutch', 'English'],
      telephone: TELEPHONE,
      email: EMAIL,
      url: CONTACT_URL,
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      '@id': `${BASE_URL}/#offercatalog`,
      name: 'AI-diensten',
      url: SERVICES_HUB,
      itemListElement: SERVICE_LINES.map((service, index) => ({
        '@type': 'Offer',
        position: index + 1,
        itemOffered: serviceNode(service),
      })),
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * Standalone Service nodes. The same nodes (same @id) are already carried by
 * `Organization.hasOfferCatalog`, so this component is redundant wherever
 * OrganizationJsonLd renders and should be dropped from the root layout.
 */
export function ServicesJsonLd() {
  const schema = SERVICE_LINES.map((service) => ({
    '@context': 'https://schema.org',
    ...serviceNode(service),
  }));

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function FAQJsonLd({
  faqs,
}: {
  faqs: Array<{ question: string; answer: string }>;
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function WebSiteJsonLd() {
  // No `potentialAction`: there is no user-facing /[locale]/search route, so a
  // SearchAction would point agents at a 404. Re-add it when the page exists.
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: 'GroeimetAI',
    url: BASE_URL,
    description:
      'No-bullshit AI for teams that want to work better through training, adoption, workflow improvement, and safe integrations.',
    inLanguage: ['nl', 'en'],
    publisher: {
      '@id': ORGANIZATION_ID,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: Array<{ name: string; url: string }>;
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function PersonJsonLd({
  id,
  name,
  jobTitle,
  description,
  url,
  image,
  sameAs,
  worksFor,
}: {
  /** Canonical @id. Pass FOUNDER_ID so both locales describe one entity. */
  id?: string;
  name: string;
  jobTitle?: string;
  description?: string;
  url: string;
  image?: string;
  sameAs?: string[];
  worksFor?: { name: string; url: string } | { '@id': string };
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': id || url,
    name,
    jobTitle,
    description,
    url,
    image: image ? `${BASE_URL}${image}` : undefined,
    sameAs,
    worksFor: worksFor && '@id' in worksFor ? worksFor : worksFor
      ? { '@type': 'Organization', name: worksFor.name, url: worksFor.url }
      : undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ArticleJsonLd({
  headline,
  description,
  url,
  datePublished,
  dateModified,
  authorName,
  authorUrl,
  authorId,
  image,
  inLanguage = 'nl',
  keywords,
  articleSection,
}: {
  headline: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  authorName: string;
  authorUrl?: string;
  /** Canonical @id of the author, so every article links to one Person node. */
  authorId?: string;
  image?: string;
  inLanguage?: 'nl' | 'en';
  keywords?: string[];
  articleSection?: string;
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    headline,
    description,
    // No fallback image: the previous `/og-image.png` default returned 404 on
    // every article. Omit `image` rather than cite a dead asset.
    image: image ? `${BASE_URL}${image}` : undefined,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Person',
      '@id': authorId,
      name: authorName,
      url: authorUrl,
    },
    publisher: {
      '@id': ORGANIZATION_ID,
    },
    inLanguage,
    keywords: keywords?.join(', '),
    articleSection,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function CourseJsonLd({
  name,
  description,
  url,
  inLanguage = 'nl',
  teaches,
  about,
  audienceType,
  courseMode,
}: {
  name: string;
  description: string;
  url: string;
  inLanguage?: 'nl' | 'en';
  /** Concrete skills the programme covers. Must come from real page content. */
  teaches?: string[];
  about?: string;
  audienceType?: string;
  /** e.g. ['onsite', 'online']. Only pass modes the site actually offers. */
  courseMode?: string[];
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    '@id': `${url}#course`,
    name,
    description,
    url,
    inLanguage,
    provider: {
      '@id': ORGANIZATION_ID,
    },
    teaches: teaches && teaches.length > 0 ? teaches : undefined,
    about,
    audience: audienceType
      ? { '@type': 'Audience', audienceType }
      : undefined,
    hasCourseInstance:
      courseMode && courseMode.length > 0
        ? {
            '@type': 'CourseInstance',
            '@id': `${url}#courseinstance`,
            name,
            courseMode,
            inLanguage,
            organizer: { '@id': ORGANIZATION_ID },
          }
        : undefined,
    isPartOf: {
      '@id': WEBSITE_ID,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function HowToJsonLd({
  name,
  description,
  steps,
  totalTime,
  url,
}: {
  name: string;
  description: string;
  steps: Array<{ name: string; text: string; url?: string }>;
  totalTime?: string;
  url: string;
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    totalTime,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      url: step.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
