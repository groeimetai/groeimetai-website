import { MetadataRoute } from 'next';

// Auth/admin paths kept private from any crawler
const PRIVATE_PATHS = [
  '/api/',
  '/admin/',
  '/_next/',
  '/dashboard/',
  '/login/',
  '/register/',
  '/forgot-password/',
  '/verify-email/',
  '/auth/',
  '/settings/',
];

// AI search crawlers — these fetch URLs in real time to cite in answers.
// Allow them so GroeimetAI content can be surfaced inside ChatGPT, Claude,
// Perplexity, You.com and DuckDuckGo answers.
const AI_SEARCH_BOTS = [
  'ChatGPT-User',
  'OAI-SearchBot',
  'Claude-SearchBot',
  'Claude-Web',
  'PerplexityBot',
  'Perplexity-User',
  'YouBot',
  'DuckAssistBot',
];

// AI training crawlers — they scrape content into model training corpora.
// Block them: we want our work to be cited (via the search bots above)
// rather than absorbed wholesale into model weights without attribution.
const AI_TRAINING_BOTS = [
  'GPTBot',
  'ClaudeBot',
  'anthropic-ai',
  'CCBot',
  'Google-Extended',
  'Applebot-Extended',
  'Amazonbot',
  'Meta-ExternalAgent',
  'cohere-ai',
  'Bytespider',
  'Diffbot',
  'ImagesiftBot',
  'omgili',
  'omgilibot',
  'Timpibot',
  'Webzio-Extended',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: PRIVATE_PATHS,
      },
      ...AI_SEARCH_BOTS.map((userAgent) => ({
        userAgent,
        allow: '/',
        disallow: PRIVATE_PATHS,
      })),
      ...AI_TRAINING_BOTS.map((userAgent) => ({
        userAgent,
        disallow: '/',
      })),
    ],
    sitemap: 'https://groeimetai.io/sitemap.xml',
    host: 'https://groeimetai.io',
  };
}
