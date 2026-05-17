const BASE_URL = 'https://groeimetai.io';
const ORGANIZATION_ID = `${BASE_URL}/#organization`;
const FOUNDER_ID = `${BASE_URL}/about#niels-van-der-werf`;

export function OrganizationJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: 'GroeimetAI',
    alternateName: 'Groei met AI',
    url: BASE_URL,
    logo: `${BASE_URL}/gecentreerd-logo.svg`,
    description:
      'GroeimetAI helps companies use AI with practical training, workflow improvement, safe integrations, and clear adoption guidance.',
    foundingDate: '2023',
    founder: {
      '@id': FOUNDER_ID,
    },
    areaServed: [
      { '@type': 'Country', name: 'Netherlands' },
      { '@type': 'Country', name: 'Belgium' },
      { '@type': 'Country', name: 'Germany' },
    ],
    serviceArea: {
      '@type': 'GeoCircle',
      geoMidpoint: {
        '@type': 'GeoCoordinates',
        latitude: 52.3676,
        longitude: 4.9041,
      },
      geoRadius: '500 km',
    },
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
      url: `${BASE_URL}/contact`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ServicesJsonLd() {
  const services = [
    {
      name: 'AI Training & Workshops',
      description:
        'Practical workshops and team training that help people work better with modern AI models in daily operations.',
      url: `${BASE_URL}/services`,
    },
    {
      name: 'AI Strategy & Adoption',
      description:
        'Use-case selection, adoption guidance, and roadmap work for organizations that want grounded AI decisions instead of hype-driven experimentation.',
      url: `${BASE_URL}/services`,
    },
    {
      name: 'Workflow Redesign & Implementation',
      description:
        'Workflow analysis and redesign that uses AI to reduce manual work, improve quality, and fit how teams already operate.',
      url: `${BASE_URL}/services`,
    },
    {
      name: 'Safe Integrations & Tooling',
      description:
        'Integrations, internal tools, and custom software when off-the-shelf AI tools are not enough and durable value requires implementation.',
      url: `${BASE_URL}/services`,
    },
  ];

  const schema = services.map((service) => ({
    '@context': 'https://schema.org',
    '@type': 'Service',
    provider: {
      '@id': ORGANIZATION_ID,
    },
    name: service.name,
    description: service.description,
    url: service.url,
    areaServed: { '@type': 'Country', name: 'Netherlands' },
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: `${BASE_URL}/contact`,
      availableLanguage: ['Dutch', 'English'],
    },
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
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'GroeimetAI',
    url: BASE_URL,
    description:
      'No-bullshit AI for teams that want to work better through training, adoption, workflow improvement, and safe integrations.',
    inLanguage: ['nl', 'en'],
    publisher: {
      '@id': ORGANIZATION_ID,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
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
  name,
  jobTitle,
  description,
  url,
  image,
  sameAs,
  worksFor,
}: {
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
    '@id': url,
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
    image: image ? `${BASE_URL}${image}` : `${BASE_URL}/og-image.png`,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Person',
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
