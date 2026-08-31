import { Section, Eyebrow, Stat } from '@/components/ds';

/**
 * Stat is never shown alone — a single figure has nothing to compare against.
 * Every cell renders it the way the site does: a row of three or four inside a
 * Section, so the left hairline and the mono caption line up across the band.
 *
 * All figures are real outcomes from src/translations/redesign/nl.json
 * (cases.list[].outcomes) or from the repo's own showcase page. This design
 * system belongs to a brand whose pitch is "geen hype" — the previews must not
 * seed invented percentages into the designs built with it.
 */

export const RowOfThree = () => (
  <Section>
    <div className="ds-grid-3">
      <Stat num="1 uur" label="Per kwartaal in plaats van een hele dag" />
      <Stat num="0" label="Financiële data die het pand verlaat" />
      <Stat num="Per Q" label="Regels groeien mee met de aangifte" />
    </div>
  </Section>
);

export const RowOfFour = () => (
  <Section>
    <div className="ds-grid-4">
      <Stat num="1225" label="Uren voor het urencriterium" />
      <Stat num="3" suffix="x" label="Merken bediend door één agent" />
      <Stat num="12" label="Assets per dagelijkse scan" />
      <Stat num="0" label="Orders — alleen analyse" />
    </div>
  </Section>
);

export const OnLightSection = () => (
  <Section light>
    <div className="ds-grid-3">
      <Stat num="3" suffix="x" label="Bouwstenen per agent" />
      <Stat num="100" suffix="%" label="Open en transparant" />
      <Stat num="0" label="Vendor lock-in in de stack" />
    </div>
  </Section>
);

export const NonNumericFigures = () => (
  <Section tight>
    <Eyebrow>Service portal</Eyebrow>
    <div className="ds-grid-3" style={{ marginTop: 32 }}>
      <Stat num="Auto" label="Request-type detectie" />
      <Stat num="500ms" label="Live status polling" />
      <Stat num="Multi" label="Klant-implementaties" />
    </div>
  </Section>
);
