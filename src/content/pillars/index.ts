// Pillar pages registry — one canonical long-form page per persona.

import type { PillarPage, Locale, Persona } from '../types';

import { pillarCto } from './pages/cto';
import { pillarOperations } from './pages/operations';
import { pillarMkbGm } from './pages/mkb-gm';
import { pillarEnterprise } from './pages/enterprise-transformation';

const pages: PillarPage[] = [
  pillarCto,
  pillarOperations,
  pillarMkbGm,
  pillarEnterprise,
];

export function listPillars(locale: Locale): PillarPage[] {
  return pages.filter((p) => p.locale === locale);
}

export function getPillar(slug: string, locale: Locale): PillarPage | undefined {
  return pages.find((p) => p.slug === slug && p.locale === locale);
}

export function getPillarByAudience(audience: Persona, locale: Locale): PillarPage | undefined {
  return pages.find((p) => p.audience === audience && p.locale === locale);
}

export function allPillarSlugs(): Array<{ slug: string; locale: Locale }> {
  return pages.map(({ slug, locale }) => ({ slug, locale }));
}

export function allPillars(): PillarPage[] {
  return pages;
}
