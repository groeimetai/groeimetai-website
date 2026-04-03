export function OrganizationJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'GroeimetAI',
    alternateName: 'Groei met AI',
    url: 'https://groeimetai.io',
    logo: 'https://groeimetai.io/gecentreerd-logo.svg',
    description:
      'GroeimetAI helps companies use AI with practical training, workflow improvement, safe integrations, and clear adoption guidance.',
    foundingDate: '2023',
    founder: {
      '@type': 'Person',
      name: 'Niels van der Werf',
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
      url: 'https://groeimetai.io/contact',
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
      url: 'https://groeimetai.io/services',
    },
    {
      name: 'AI Strategy & Adoption',
      description:
        'Use-case selection, adoption guidance, and roadmap work for organizations that want grounded AI decisions instead of hype-driven experimentation.',
      url: 'https://groeimetai.io/services',
    },
    {
      name: 'Workflow Redesign & Implementation',
      description:
        'Workflow analysis and redesign that uses AI to reduce manual work, improve quality, and fit how teams already operate.',
      url: 'https://groeimetai.io/services',
    },
    {
      name: 'Safe Integrations & Tooling',
      description:
        'Integrations, internal tools, and custom software when off-the-shelf AI tools are not enough and durable value requires implementation.',
      url: 'https://groeimetai.io/services',
    },
  ];

  const schema = services.map((service) => ({
    '@context': 'https://schema.org',
    '@type': 'Service',
    provider: {
      '@type': 'Organization',
      name: 'GroeimetAI',
      url: 'https://groeimetai.io',
    },
    name: service.name,
    description: service.description,
    url: service.url,
    areaServed: { '@type': 'Country', name: 'Netherlands' },
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: 'https://groeimetai.io/contact',
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
    url: 'https://groeimetai.io',
    description:
      'No-bullshit AI for teams that want to work better through training, adoption, workflow improvement, and safe integrations.',
    inLanguage: ['nl', 'en'],
    publisher: {
      '@type': 'Organization',
      name: 'GroeimetAI',
      url: 'https://groeimetai.io',
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
