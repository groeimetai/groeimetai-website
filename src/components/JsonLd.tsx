export function OrganizationJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'GroeimetAI',
    alternateName: 'Groei met AI',
    url: 'https://groeimetai.io',
    logo: 'https://groeimetai.io/gecentreerd-logo.svg',
    description:
      'AI implementation partner that builds practical AI solutions for businesses. Chatbots, voice assistants, automations, system integrations, and AI strategy. Fixed prices, real results.',
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
      'AI Automation',
      'Voice AI',
      'AI Chatbots',
      'AI Strategy',
      'Business Automation',
      'System Integration',
      'MCP Protocol',
      'Large Language Models',
      'RAG Architecture',
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
      name: 'AI Strategy & Consultancy',
      description:
        'Practical advice on how AI can strengthen your business. From use case discovery to implementation roadmaps and ROI analysis.',
      url: 'https://groeimetai.io/services',
    },
    {
      name: 'AI Integrations',
      description:
        'Connect your existing systems and tools with AI. We build the bridges so your software works together seamlessly with smart automation.',
      url: 'https://groeimetai.io/services',
    },
    {
      name: 'Voice AI Development',
      description:
        'Intelligent voice agents that handle inbound calls, qualify leads, book appointments, and provide 24/7 customer support.',
      url: 'https://groeimetai.io/services',
    },
    {
      name: 'Full-stack Web Development',
      description:
        'Modern, scalable websites and web applications. From landing pages to complex platforms built with Next.js, React, and TypeScript.',
      url: 'https://groeimetai.io/services',
    },
    {
      name: 'AI Training & Workshops',
      description:
        'Get your team AI-ready. From fundamentals to hands-on agent development workshops. 1-3 day programs.',
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
      'AI implementation partner for businesses. We build chatbots, voice assistants, automations, and AI integrations. Fixed prices, real results.',
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
