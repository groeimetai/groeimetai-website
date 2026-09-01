import type { ReactNode } from 'react';
import { Numbered, Section, Eyebrow } from '@/components/ds';

/**
 * Numbered is one row of a list — the hairline on top only reads as a list once
 * the steps are stacked as siblings, so every cell renders three or four of them.
 */
const Frame = ({ children }: { children: ReactNode }) => (
  <div style={{ padding: '24px' }}>{children}</div>
);

export const FourSteps = () => (
  <Frame>
    <Numbered n="01" title="Verkennen">
      Welke use-case past bij een agent, en welke is gewoon een script?
    </Numbered>
    <Numbered n="02" title="Trainen">
      Het team dat de agent beheert krijgt eerst de basis: folder, instructies, tools.
    </Numbered>
    <Numbered n="03" title="Bouwen">
      Pair-building. Wij sturen, jullie typen. Eerste werkende versie binnen weken.
    </Numbered>
    <Numbered n="04" title="Borgen">
      Overdracht, runbook, monitoring. Wie keurt nieuwe versies goed?
    </Numbered>
  </Frame>
);

export const ThreeSteps = () => (
  <Frame>
    <Numbered n="01" title="Begin bij de basis">
      Een agent is een folder, een set instructies en een paar tools. Wie die basis snapt, houdt
      de kosten laag.
    </Numbered>
    <Numbered n="02" title="Gebruik wat je al hebt">
      Je documenten staan al ergens en je tooling werkt al. We bouwen de agent daaromheen, niet
      er bovenop.
    </Numbered>
    <Numbered n="03" title="Houd de regie in huis">
      We trainen je team, zodat de agent over zes maanden nog past bij wat jullie doen.
    </Numbered>
  </Frame>
);

export const OnLightSection = () => (
  <Section light tight>
    <Eyebrow>Wat we geloven</Eyebrow>
    <div style={{ marginTop: 28 }}>
      <Numbered n="01" title="De mens beslist">
        Klantcontact, juridisch, financieel — daar gaat geen agent zelfstandig over.
      </Numbered>
      <Numbered n="02" title="Geen vendor lock-in">
        We bouwen op de stack die past, niet op de stack waar wij commissie van krijgen.
      </Numbered>
      <Numbered n="03" title="Documentatie telt mee">
        Kunnen jullie het na de overdracht niet lezen, dan is ons werk niet af.
      </Numbered>
    </div>
  </Section>
);
