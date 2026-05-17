// Programmatic SEO registry — "AI training per branche".
// Each entry maps to /training/[slug] and is generated from one industry record.

import type { ProgrammaticPage, Locale } from '../types';
import { industries } from './industries';
import { buildPage } from './template';

const pages: ProgrammaticPage[] = industries.flatMap((industry) => [
  buildPage(industry, 'nl'),
  buildPage(industry, 'en'),
]);

export function listProgrammatic(locale: Locale): ProgrammaticPage[] {
  return pages.filter((p) => p.locale === locale);
}

export function getProgrammatic(slug: string, locale: Locale): ProgrammaticPage | undefined {
  return pages.find((p) => p.slug === slug && p.locale === locale);
}

export function allProgrammaticSlugs(): Array<{ slug: string; locale: Locale }> {
  return pages.map(({ slug, locale }) => ({ slug, locale }));
}

export function allProgrammatic(): ProgrammaticPage[] {
  return pages;
}
