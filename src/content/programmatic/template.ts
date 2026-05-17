// Template that turns an Industry record into one ProgrammaticPage per locale.
// All content lives in industries.ts — this file only assembles it.

import type { Industry } from './industries';
import type { Locale, ProgrammaticPage } from '../types';

export function buildPage(industry: Industry, locale: Locale): ProgrammaticPage {
  const isNl = locale === 'nl';
  const label = isNl ? industry.labelNl : industry.labelEn;
  const intro = isNl ? industry.introNl : industry.introEn;
  const examples = isNl ? industry.examplesNl : industry.examplesEn;
  const pitfalls = isNl ? industry.pitfallsNl : industry.pitfallsEn;
  const outcomes = isNl ? industry.outcomesNl : industry.outcomesEn;

  const title = isNl
    ? `AI-training voor ${label}: wat werkt in de praktijk`
    : `AI training for ${label}: what works in practice`;

  return {
    slug: industry.slug,
    locale,
    industry: industry.slug,
    title,
    intro,
    sections: isNl ? sectionsNl(label, examples, pitfalls, outcomes) : sectionsEn(label, examples, pitfalls, outcomes),
    examples,
    pitfalls,
    outcomes,
    faqs: isNl ? faqsNl(label) : faqsEn(label),
  };
}

function bulletList(items: string[]): string {
  return items.map((item) => `- ${item}`).join('\n');
}

function sectionsNl(
  label: string,
  examples: string[],
  pitfalls: string[],
  outcomes: string[]
): ProgrammaticPage['sections'] {
  return [
    {
      heading: `Waar AI in ${label} echt waarde oplevert`,
      body: `In ${label} zien we vier soorten werk waar AI structureel tijd bespaart zonder de kwaliteit te schaden:

${bulletList(examples)}

Dit zijn geen visionaire toepassingen. Het is werk dat veel teams dagelijks doen en waar AI in 2026 robuust genoeg voor is — mits de implementatie netjes wordt aangepakt.`,
    },
    {
      heading: 'Waar het vaak misgaat',
      body: `Niet alles in ${label} dat "kan met AI" is ook een goed idee om te doen. Drie patronen die wij regelmatig terugzien:

${bulletList(pitfalls)}

Het gemene aan deze fouten is dat ze pas zichtbaar worden zodra je ze hebt gemaakt — dus voorkomen is goedkoper dan herstellen.`,
    },
    {
      heading: 'Realistische uitkomsten',
      body: `Een goed uitgevoerd AI-training-traject in ${label} levert in onze ervaring op:

${bulletList(outcomes)}

Niet "10x productiviteit". Niet "vervang je team". Wel structureel sneller en consistenter werken op de plekken waar dat ertoe doet.`,
    },
    {
      heading: 'Onze aanpak voor deze sector',
      body: `Wij beginnen elk traject met een inventarisatie van het werk zoals het *echt* gebeurt — niet zoals het in een procedure staat. Met dat als basis kiezen we 1-3 use cases waar AI voldoende waarde oplevert om de investering te rechtvaardigen, draaien we een pilot van 3-6 weken, en bouwen we daarna uit naar het bredere team als de pilot werkt.

Geen platform-verkoop. Geen lange consultancy-rapporten. Wel een werkende combinatie van training, implementatie en adoptie — afgestemd op hoe ${label} werkelijk werkt.`,
    },
  ];
}

function sectionsEn(
  label: string,
  examples: string[],
  pitfalls: string[],
  outcomes: string[]
): ProgrammaticPage['sections'] {
  return [
    {
      heading: `Where AI delivers real value in ${label}`,
      body: `In ${label}, we see four types of work where AI structurally saves time without hurting quality:

${bulletList(examples)}

These aren't visionary applications. They're work that many teams do daily, and AI in 2026 is robust enough to support — provided the implementation is well executed.`,
    },
    {
      heading: 'Where it often goes wrong',
      body: `Not everything in ${label} that "can be done with AI" is a good idea. Three patterns we see regularly:

${bulletList(pitfalls)}

The tricky part of these mistakes is that they only surface after you've made them — so preventing them is cheaper than fixing them.`,
    },
    {
      heading: 'Realistic outcomes',
      body: `A well-executed AI training programme in ${label} typically delivers:

${bulletList(outcomes)}

Not "10x productivity". Not "replace your team". But structurally faster and more consistent work where it matters.`,
    },
    {
      heading: 'Our approach for this sector',
      body: `We start every project by mapping how work *actually* gets done — not how it appears in procedures. On that basis we pick 1-3 use cases where AI delivers enough value to justify the investment, run a 3-6 week pilot, and scale to the wider team if the pilot succeeds.

No platform sales. No long consultancy reports. A working combination of training, implementation, and adoption — tuned to how ${label} actually works.`,
    },
  ];
}

function faqsNl(label: string): ProgrammaticPage['faqs'] {
  return [
    {
      question: `Wat is de typische investering voor een AI-training-traject in ${label}?`,
      answer:
        'Voor een team van 10-50 mensen: tussen €15k en €60k afhankelijk van scope, plus licentiekosten als die nog niet liggen. Adoptie-begeleiding zit hierbij in. ROI is meestal positief binnen 3-9 maanden bij goede use case-keuze.',
    },
    {
      question: 'Hoe lang duurt zo\'n traject?',
      answer:
        'Voor één werkstroom: 2-3 maanden van eerste verkenning tot werkende implementatie met begeleide adoptie. Voor bredere uitrol over meerdere teams: 4-9 maanden.',
    },
    {
      question: `Werken jullie alleen in ${label}?`,
      answer:
        'Nee. We werken sector-overstijgend met focus op MKB en middelgroot bedrijfsleven. Onze aanpak past op verschillende sectoren omdat de onderliggende vragen — adoptie, governance, integratie — vergelijkbaar zijn. Sectorspecifieke kennis ontwikkelen we per traject.',
    },
    {
      question: 'Wat als ons team al iets met AI doet?',
      answer:
        'Goed. Dan beginnen we niet vanaf nul, maar werken we vanuit wat er al draait. Vaak zit het rendement in beter inrichten van wat er al gebeurt — niet in iets nieuws toevoegen.',
    },
  ];
}

function faqsEn(label: string): ProgrammaticPage['faqs'] {
  return [
    {
      question: `What's the typical investment for an AI training programme in ${label}?`,
      answer:
        'For a team of 10-50 people: between €15k and €60k depending on scope, plus license costs if not already in place. Adoption guidance is included. ROI is usually positive within 3-9 months with good use case selection.',
    },
    {
      question: 'How long does it take?',
      answer:
        'For one workflow: 2-3 months from first scoping to a working implementation with guided adoption. For broader rollout across multiple teams: 4-9 months.',
    },
    {
      question: `Do you only work in ${label}?`,
      answer:
        'No. We work across sectors with a focus on SME and mid-market organisations. Our approach maps onto different sectors because the underlying questions — adoption, governance, integration — are similar. Sector-specific knowledge we develop per engagement.',
    },
    {
      question: 'What if our team is already doing something with AI?',
      answer:
        'Good. Then we don\'t start from zero — we work from what\'s already running. Often the return is in better organising what\'s already happening, not adding something new.',
    },
  ];
}
