import { MetadataRoute } from 'next';

// next-intl runs with `localePrefix: 'always'` (src/middleware.ts), so every
// real page URL carries a locale segment: /nl/dashboard, /en/portal, …
// robots.txt path matching is a literal prefix match from the start of the
// path, so a bare `Disallow: /dashboard/` matches nothing on this site. Each
// private segment is therefore emitted twice: once bare (covers the URL before
// the middleware redirect) and once wildcard-prefixed (covers /nl/… and /en/…).
// Google and Bing both support `*` in robots.txt paths.
//
// Trailing slashes are deliberately omitted so the segment root matches too:
// `/dashboard` covers /nl/dashboard as well as /nl/dashboard/admin.
const PRIVATE_SEGMENTS = [
  'admin', // also prefix-matches /admin-dashboard — both are private
  'dashboard',
  'portal',
  'betalen', // customer invoice pages, /betalen/<invoiceId>
  'payment',
  'quote-success',
  'settings',
  'auth',
  'login',
  'forgot-password',
  'verify-email',
  'preview', // the (redesign-preview) route group → /<locale>/preview/*
];

// Auth/admin paths kept private from any crawler. `/api/` is not
// locale-prefixed, so it needs no wildcard variant.
const PRIVATE_PATHS = [
  '/api/',
  ...PRIVATE_SEGMENTS.flatMap((segment) => [`/${segment}`, `/*/${segment}`]),
];

// AI search crawlers — these fetch URLs in real time to cite in answers.
// Allow them so GroeimetAI content can be surfaced inside ChatGPT, Claude,
// Perplexity, You.com and DuckDuckGo answers.
const AI_SEARCH_BOTS = [
  'ChatGPT-User',
  'OAI-SearchBot',
  'Claude-SearchBot',
  'Claude-User', // user-triggered fetches; replaces the retired Claude-Web token
  'PerplexityBot',
  'Perplexity-User',
  'YouBot',
  'DuckAssistBot',
];

// AI training crawlers — they scrape content into model training corpora.
// Block them: we want our work to be cited (via the search bots above)
// rather than absorbed wholesale into model weights without attribution.
// Note: Google-Extended also governs grounding in the Gemini apps, so blocking
// it costs Gemini citations as well as Gemini training. Google Search, AI
// Overviews and AI Mode are unaffected — those follow Googlebot.
const AI_TRAINING_BOTS = [
  'GPTBot',
  'ClaudeBot',
  'anthropic-ai', // retired token, kept as harmless belt-and-braces
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

// Curated, LLM-optimized content surfaced explicitly in robots.txt so crawlers
// (and humans inspecting the file) can find it: /llms.txt is a short index,
// /llms-full.txt the full machine-readable corpus.
const LLM_FILES = ['/llms.txt', '/llms-full.txt'];

// /_next/static/ holds every stylesheet, client chunk and web font. Googlebot
// needs them to render the page; blocking them makes it evaluate the site
// unstyled, which weakens the index that AI Overviews and AI Mode read from.
// The files are content-hashed and immutable, so nothing is protected by
// hiding them. Stated explicitly rather than merely left un-disallowed.
const ALLOW = ['/', '/_next/static/', ...LLM_FILES];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ALLOW,
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: 'Googlebot',
        allow: ALLOW,
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: 'Bingbot',
        allow: ALLOW,
        disallow: PRIVATE_PATHS,
      },
      ...AI_SEARCH_BOTS.map((userAgent) => ({
        userAgent,
        allow: ALLOW,
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
