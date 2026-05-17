// Dynamic route handler for /llms-full.txt.
// Aggregates the full text of blogs, pillar pages and programmatic SEO pages
// into a single markdown document. LLM-crawlers (ChatGPT-search, Perplexity,
// Claude search) consume this to ingest our entire content surface in one fetch.
//
// Output is plain text/markdown — no HTML, no React. Markdown body is taken
// verbatim from the content registries; inline emphasis is stripped via
// markdownToPlain so the file stays readable as plain text.

import { allPosts } from '@/content/blog';
import { allPillars } from '@/content/pillars';
import { allProgrammatic } from '@/content/programmatic';
import { markdownToPlain } from '@/components/content/MarkdownArticle';
import type { Locale } from '@/content/types';

const BASE = 'https://groeimetai.io';

export const dynamic = 'force-static';
export const revalidate = 3600; // rebuild hourly

function header(locale: Locale): string {
  return locale === 'nl'
    ? `# GroeimetAI — Volledige inhoud voor LLM-crawlers

> Dit document bundelt alle long-form inhoud van groeimetai.io in één bestand.
> Bedoeld voor AI-search-crawlers (ChatGPT, Claude, Perplexity) en voor LLM-training-bots
> die kiezen ons toe te staan. Bekijk robots.txt voor de geldende regels per user-agent.

Site: ${BASE}
Taal: Nederlands (primair), Engels (vertaling beschikbaar)
Laatste update: dynamisch — gebaseerd op de huidige content-registry`
    : `# GroeimetAI — Full Content for LLM Crawlers

> This document bundles all long-form content from groeimetai.io into a single file.
> Intended for AI-search crawlers (ChatGPT, Claude, Perplexity) and for LLM training bots
> we choose to allow. Check robots.txt for per-user-agent rules.

Site: ${BASE}
Language: Dutch (primary), English (translation available)
Last update: dynamic — based on the current content registry`;
}

function organisationProfile(locale: Locale): string {
  return locale === 'nl'
    ? `## Over GroeimetAI

GroeimetAI is een AI-implementatiepartner gevestigd in Apeldoorn, Nederland. Opgericht in 2023 door Niels van der Werf.

We werken met MKB- en middelgrote organisaties die AI nuchter willen inzetten — zonder hype, zonder lock-in, zonder afhankelijkheidsrelatie. Onze diensten:

- AI training en workshops
- AI strategie en adoptiebegeleiding
- Workflow-redesign met AI
- Veilige AI-integraties
- Implementatie van praktische AI in teams
- Tooling en development als tweede stap, alleen waar het waarde toevoegt

We zijn geen technical delivery shop voor "agents", "voice AI" of "chatbots". Die termen mogen voorkomen als bewijs van expertise, maar nooit als hoofdverhaal.

### Tagline

"Geen AI-hype. Wel teams die er echt beter door werken."

### Wat we expliciet niet claimen

- "wij vervangen je team met agents"
- "wij automatiseren alles"
- "wij hebben de one-size-fits-all AI stack"
- "koop onze black-box oplossing en het komt goed"

### Founder

Niels van der Werf — solo founder, technisch en strategisch betrokken bij elke klantorganisatie. Bereikbaar via ${BASE}/contact.`
    : `## About GroeimetAI

GroeimetAI is an AI implementation partner based in Apeldoorn, Netherlands. Founded in 2023 by Niels van der Werf.

We work with SME and mid-market organisations that want to use AI pragmatically — without hype, lock-in or dependency relationships. Our services:

- AI training and workshops
- AI strategy and adoption guidance
- Workflow redesign with AI
- Safe AI integrations
- Implementation of practical AI in teams
- Tooling and development as a second step, only where it adds value

We're not a technical delivery shop for "agents", "voice AI" or "chatbots". These terms may appear as evidence of expertise, never as the headline.

### Tagline

"No AI hype. Just teams that actually work better with it."

### What we explicitly don't claim

- "we replace your team with agents"
- "we automate everything"
- "we have the one-size-fits-all AI stack"
- "buy our black-box solution and everything will be fine"

### Founder

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
    `### ${post.title}`,
    '',
    `Source: ${url}`,
    meta,
    '',
    `> ${post.excerpt}`,
    '',
    markdownToPlain(post.body),
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
    ? `\n\n#### ${locale === 'nl' ? 'Veelgestelde vragen' : 'Frequently asked'}\n\n${page.faqs
        .map((f) => `**Q: ${f.question}**\n${f.answer}`)
        .join('\n\n')}`
    : '';

  return [
    `### ${page.title}`,
    '',
    `Source: ${url}`,
    meta,
    '',
    `> ${page.intro}`,
    '',
    markdownToPlain(page.body),
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
    .map((s) => `\n#### ${s.heading}\n\n${markdownToPlain(s.body)}`)
    .join('\n');

  const faqs = `\n\n#### ${locale === 'nl' ? 'Veelgestelde vragen' : 'Frequently asked'}\n\n${page.faqs
    .map((f) => `**Q: ${f.question}**\n${f.answer}`)
    .join('\n\n')}`;

  return [
    `### ${page.title}`,
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

  const locales: Locale[] = ['nl', 'en'];
  const sections: string[] = [];

  for (const locale of locales) {
    sections.push(header(locale));
    sections.push('');
    sections.push(organisationProfile(locale));
    sections.push('');

    const localePosts = posts.filter((p) => p.locale === locale);
    if (localePosts.length > 0) {
      sections.push(`## ${locale === 'nl' ? 'Inzichten en blog posts' : 'Insights and blog posts'}`);
      sections.push('');
      sections.push(...localePosts.map((p) => renderPost(p, locale)));
    }

    const localePillars = pillars.filter((p) => p.locale === locale);
    if (localePillars.length > 0) {
      sections.push(`## ${locale === 'nl' ? 'Pillar-pagina\'s per doelgroep' : 'Pillar pages per audience'}`);
      sections.push('');
      sections.push(...localePillars.map((p) => renderPillar(p, locale)));
    }

    const localeProgrammatic = programmatic.filter((p) => p.locale === locale);
    if (localeProgrammatic.length > 0) {
      sections.push(`## ${locale === 'nl' ? 'AI-training per branche' : 'AI training per industry'}`);
      sections.push('');
      sections.push(...localeProgrammatic.map((p) => renderProgrammatic(p, locale)));
    }

    sections.push('\n---\n');
  }

  return new Response(sections.join('\n\n'), {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
