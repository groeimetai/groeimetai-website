// Shared content types for blog posts, pillar pages, programmatic SEO pages.
// All content lives as typed TS modules under src/content/* and is collected
// through registries (blog/index.ts, pillars/index.ts, programmatic/index.ts).

export type Locale = 'nl' | 'en';

export interface Author {
  name: string;
  role: string;
  bio?: string;
  url?: string;
  image?: string;
  linkedin?: string;
}

export const NIELS: Author = {
  name: 'Niels van der Werf',
  role: 'Founder, GroeimetAI',
  bio: 'Helpt MKB-teams nuchter met AI werken: training, strategie, workflow-herontwerp en veilige integraties.',
  url: 'https://groeimetai.io/about#niels-van-der-werf',
  linkedin: 'https://www.linkedin.com/in/nielsvanderwerf',
};

export interface BlogPost {
  slug: string;
  locale: Locale;
  title: string;
  excerpt: string;
  /** Markdown body. Rendered through src/components/MarkdownArticle.tsx. */
  body: string;
  date: string;
  updated?: string;
  author: Author;
  readMinutes: number;
  category: BlogCategory;
  tags: string[];
  image?: string;
  related?: string[];
  /** Optional canonical URL when the same post exists in another locale. */
  canonicalSlug?: string;
}

export type BlogCategory =
  | 'AI Strategy'
  | 'Adoption'
  | 'Workflow'
  | 'Training'
  | 'Integrations'
  | 'Governance'
  | 'Perspective';

export interface PillarPage {
  slug: string;
  locale: Locale;
  audience: Persona;
  title: string;
  intro: string;
  /** Long-form markdown body, target 1500-2500 words. */
  body: string;
  date: string;
  updated?: string;
  keywords: string[];
  faqs?: Array<{ question: string; answer: string }>;
  ctaHeadline: string;
  ctaSubline: string;
}

export type Persona =
  | 'cto'
  | 'operations'
  | 'mkb-gm'
  | 'enterprise-transformation';

export const PERSONAS: Record<Persona, { label_nl: string; label_en: string }> = {
  cto: { label_nl: 'CTO / Tech leadership', label_en: 'CTO / tech leadership' },
  operations: { label_nl: 'Operations & procesteams', label_en: 'Operations & process teams' },
  'mkb-gm': { label_nl: 'MKB-ondernemers en directie', label_en: 'SME owners and management' },
  'enterprise-transformation': {
    label_nl: 'Enterprise digital transformation',
    label_en: 'Enterprise digital transformation',
  },
};

export interface ProgrammaticPage {
  slug: string;
  locale: Locale;
  industry: string;
  title: string;
  intro: string;
  /** Section bodies. Each entry becomes an <h2>. */
  sections: Array<{ heading: string; body: string }>;
  examples: string[];
  pitfalls: string[];
  outcomes: string[];
  faqs: Array<{ question: string; answer: string }>;
}
