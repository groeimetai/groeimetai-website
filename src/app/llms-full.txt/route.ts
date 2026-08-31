// Dynamic route handler for /llms-full.txt.
// Aggregates the full text of blogs, pillar pages and programmatic SEO pages
// into a single markdown document. LLM-crawlers (ChatGPT-search, Perplexity,
// Claude search) consume this to ingest our entire content surface in one fetch.
//
// Output is plain text/markdown — no HTML, no React. Markdown body is taken
// verbatim from the content registries; inline emphasis is stripped via
// markdownToPlain so the file stays readable as plain text.
//
// Heading hierarchy (one root, so outline-based chunkers keep the parent-child link
// between a body section and the Source: URL above it):
//   #      the document          (exactly one H1)
//   ##     language              Nederlands / English
//   ###    document section      Over GroeimetAI, Inzichten en blog posts, ...
//   ####   a single page         post / pillar / industry page title
//   #####  page section          body headings, shifted down by shiftHeadings()
//   ###### sub-section

import { allPosts } from '@/content/blog';
import { allPillars } from '@/content/pillars';
import { allProgrammatic } from '@/content/programmatic';
import { markdownToPlain } from '@/components/content/MarkdownArticle';
import type { Locale } from '@/content/types';

const BASE = 'https://groeimetai.io';

export const dynamic = 'force-static';
export const revalidate = 3600; // rebuild hourly

interface Counts {
  posts: number;
  pillars: number;
  programmatic: number;
}

const CONTENT_LABELS: Record<Locale, Record<keyof Counts, string>> = {
  nl: {
    posts: 'blogartikelen',
    pillars: "pillar-pagina's per doelgroep",
    programmatic: "branchepagina's over AI-training",
  },
  en: {
    posts: 'blog posts',
    pillars: 'pillar pages per audience',
    programmatic: 'industry pages on AI training',
  },
};

const CONTENT_KEYS: Array<keyof Counts> = ['posts', 'pillars', 'programmatic'];

/**
 * Body markdown carries its own H2/H3 structure. Entries are emitted at H4 here, so every
 * heading inside a body is pushed down `by` levels to keep it below the entry title it
 * belongs to. Content bodies never go deeper than H3, so the result stays within the six
 * levels markdown allows; the clamp is there in case that ever changes.
 */
function shiftHeadings(markdown: string, by: number): string {
  return markdown.replace(/^(#{1,6})(?= )/gm, (hashes) =>
    '#'.repeat(Math.min(6, hashes.length + by))
  );
}

/** The single H1 of the document. Everything else hangs underneath it. */
function documentHeader(): string {
  return `# GroeimetAI — volledige inhoud voor LLM-crawlers / full content for LLM crawlers

> Dit document bundelt de long-form inhoud van groeimetai.io in één bestand: blogartikelen,
> pillar-pagina's per doelgroep en branchepagina's over AI-training. Bedoeld voor
> AI-search-crawlers (ChatGPT, Claude, Perplexity) en voor LLM-training-bots die we toestaan.
> Bekijk robots.txt voor de geldende regels per user-agent.
>
> This document bundles the long-form content of groeimetai.io into a single file. Dutch is the
> primary language; the English section holds only what is actually translated today. The
> inventory line under each language heading states exactly what that section contains.

Site: ${BASE}
Talen / languages: Nederlands (primair), Engels (gedeeltelijk)
Laatste update / last updated: dynamisch — gebaseerd op de huidige content-registry
Structuur / structure: H1 = dit document, H2 = taal, H3 = documentsectie, H4 = pagina,
H5–H6 = koppen binnen die pagina.`;
}

/** H2 per language, with an honest inventory of what that language actually has. */
function languageSection(locale: Locale, counts: Counts, other: Counts): string {
  const labels = CONTENT_LABELS[locale];
  const present = CONTENT_KEYS.filter((key) => counts[key] > 0).map(
    (key) => `${counts[key]} ${labels[key]}`
  );
  const missing = CONTENT_KEYS.filter((key) => counts[key] === 0 && other[key] > 0).map(
    (key) => labels[key]
  );

  const lines = [locale === 'nl' ? '## Nederlands' : '## English', ''];

  if (present.length > 0) {
    lines.push(
      locale === 'nl'
        ? `Deze sectie bevat ${present.join(', ')}.`
        : `This section contains ${present.join(', ')}.`
    );
  } else {
    lines.push(
      locale === 'nl'
        ? 'Deze sectie bevat op dit moment geen inhoud.'
        : 'This section has no content at the moment.'
    );
  }

  if (missing.length > 0) {
    lines.push(
      locale === 'nl'
        ? `Niet in deze taal beschikbaar: ${missing.join(', ')}. Die staan alleen in de andere taalsectie van dit document.`
        : `Not available in this language: ${missing.join(', ')}. Those exist only in the other language section of this document.`
    );
  }

  return lines.join('\n');
}

function organisationProfile(locale: Locale): string {
  return locale === 'nl'
    ? `### Over GroeimetAI

GroeimetAI is een AI-implementatiepartner gevestigd in Apeldoorn, Nederland. Opgericht in 2023 door Niels van der Werf.

We werken met MKB- en middelgrote organisaties die AI nuchter willen inzetten — zonder hype, zonder lock-in, zonder afhankelijkheidsrelatie. Onze diensten:

- AI training en workshops
- AI strategie en adoptiebegeleiding
- Workflow-redesign met AI
- Veilige AI-integraties
- Implementatie van praktische AI in teams
- Tooling en development als tweede stap, alleen waar het waarde toevoegt

We zijn geen technical delivery shop voor "agents", "voice AI" of "chatbots". Die termen mogen voorkomen als bewijs van expertise, maar nooit als hoofdverhaal.

#### Tagline

"Geen AI-hype. Wel teams die er echt beter door werken."

#### Wat we expliciet niet claimen

- "wij vervangen je team met agents"
- "wij automatiseren alles"
- "wij hebben de one-size-fits-all AI stack"
- "koop onze black-box oplossing en het komt goed"

#### Founder

Niels van der Werf — solo founder, technisch en strategisch betrokken bij elke klantorganisatie. Bereikbaar via ${BASE}/contact.`
    : `### About GroeimetAI

GroeimetAI is an AI implementation partner based in Apeldoorn, Netherlands. Founded in 2023 by Niels van der Werf.

We work with SME and mid-market organisations that want to use AI pragmatically — without hype, lock-in or dependency relationships. Our services:

- AI training and workshops
- AI strategy and adoption guidance
- Workflow redesign with AI
- Safe AI integrations
- Implementation of practical AI in teams
- Tooling and development as a second step, only where it adds value

We're not a technical delivery shop for "agents", "voice AI" or "chatbots". These terms may appear as evidence of expertise, never as the headline.

#### Tagline

"No AI hype. Just teams that actually work better with it."

#### What we explicitly don't claim

- "we replace your team with agents"
- "we automate everything"
- "we have the one-size-fits-all AI stack"
- "buy our black-box solution and everything will be fine"

#### Founder

Niels van der Werf — solo founder, technically and strategically involved with every client organisation. Reachable via ${BASE}/contact.`;
}

function renderPost(
  post: ReturnType<typeof allPosts>[number],
  locale: Locale
): string {
  const tags = post.tags.join(', ');
  const meta =
    locale === 'nl'
      ? `**Categorie:** ${post.category} | **Tags:** ${tags} | **Datum:** ${post.date} | **Door:** ${post.author.name}`
      : `**Category:** ${post.category} | **Tags:** ${tags} | **Date:** ${post.date} | **By:** ${post.author.name}`;
  const url = `${BASE}/${locale}/blog/${post.slug}`;

  return [
    `#### ${post.title}`,
    '',
    `Source: ${url}`,
    meta,
    '',
    `> ${post.excerpt}`,
    '',
    shiftHeadings(markdownToPlain(post.body), 3),
  ].join('\n');
}

function renderPillar(
  page: ReturnType<typeof allPillars>[number],
  locale: Locale
): string {
  const url = `${BASE}/${locale}/voor/${page.slug}`;
  const meta =
    locale === 'nl'
      ? `**Type:** Pillar / canonical | **Audience:** ${page.audience} | **Datum:** ${page.date}`
      : `**Type:** Pillar / canonical | **Audience:** ${page.audience} | **Date:** ${page.date}`;

  const faqsBlock = page.faqs && page.faqs.length > 0
    ? `\n\n##### ${locale === 'nl' ? 'Veelgestelde vragen' : 'Frequently asked'}\n\n${page.faqs
        .map((f) => `**Q: ${f.question}**\n${f.answer}`)
        .join('\n\n')}`
    : '';

  return [
    `#### ${page.title}`,
    '',
    `Source: ${url}`,
    meta,
    '',
    `> ${page.intro}`,
    '',
    shiftHeadings(markdownToPlain(page.body), 3),
    faqsBlock,
  ].join('\n');
}

function renderProgrammatic(
  page: ReturnType<typeof allProgrammatic>[number],
  locale: Locale
): string {
  const url = `${BASE}/${locale}/training/${page.slug}`;
  const meta =
    locale === 'nl'
      ? `**Type:** Branche-pagina | **Industry:** ${page.industry}`
      : `**Type:** Industry page | **Industry:** ${page.industry}`;

  const sections = page.sections
    .map((s) => `\n##### ${s.heading}\n\n${shiftHeadings(markdownToPlain(s.body), 4)}`)
    .join('\n');

  const faqs = `\n\n##### ${locale === 'nl' ? 'Veelgestelde vragen' : 'Frequently asked'}\n\n${page.faqs
    .map((f) => `**Q: ${f.question}**\n${f.answer}`)
    .join('\n\n')}`;

  return [
    `#### ${page.title}`,
    '',
    `Source: ${url}`,
    meta,
    '',
    `> ${page.intro}`,
    sections,
    faqs,
  ].join('\n');
}

export async function GET(): Promise<Response> {
  const posts = allPosts();
  const pillars = allPillars();
  const programmatic = allProgrammatic();

  const countsFor = (locale: Locale): Counts => ({
    posts: posts.filter((p) => p.locale === locale).length,
    pillars: pillars.filter((p) => p.locale === locale).length,
    programmatic: programmatic.filter((p) => p.locale === locale).length,
  });

  const locales: Locale[] = ['nl', 'en'];
  const counts: Record<Locale, Counts> = { nl: countsFor('nl'), en: countsFor('en') };

  // One H1 for the whole document; each language sits under it at H2, document sections at
  // H3, individual pages at H4 and their own body headings at H5-H6.
  const sections: string[] = [documentHeader()];

  for (const locale of locales) {
    const other: Locale = locale === 'nl' ? 'en' : 'nl';
    sections.push(languageSection(locale, counts[locale], counts[other]));
    sections.push('');
    sections.push(organisationProfile(locale));
    sections.push('');

    const localePosts = posts.filter((p) => p.locale === locale);
    if (localePosts.length > 0) {
      sections.push(`### ${locale === 'nl' ? 'Inzichten en blog posts' : 'Insights and blog posts'}`);
      sections.push('');
      sections.push(...localePosts.map((p) => renderPost(p, locale)));
    }

    const localePillars = pillars.filter((p) => p.locale === locale);
    if (localePillars.length > 0) {
      sections.push(`### ${locale === 'nl' ? "Pillar-pagina's per doelgroep" : 'Pillar pages per audience'}`);
      sections.push('');
      sections.push(...localePillars.map((p) => renderPillar(p, locale)));
    }

    const localeProgrammatic = programmatic.filter((p) => p.locale === locale);
    if (localeProgrammatic.length > 0) {
      sections.push(`### ${locale === 'nl' ? 'AI-training per branche' : 'AI training per industry'}`);
      sections.push('');
      sections.push(...localeProgrammatic.map((p) => renderProgrammatic(p, locale)));
    }
  }

  return new Response(sections.join('\n\n'), {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
