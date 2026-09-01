import { Section, Eyebrow, Btn, Stat, IconArrow } from '@/components/ds';

export const Default = () => (
  <Section id="aanpak">
    <div className="sec-head">
      <div>
        <Eyebrow>Approach</Eyebrow>
        <h2 style={{ marginTop: 16 }}>Hoe we het aanpakken</h2>
      </div>
      <div className="sec-head-right">
        <p className="lead">
          In vier stappen van eerste sessie naar een team dat AI dagelijks gebruikt — zonder hype,
          zonder afhankelijkheid van ons.
        </p>
      </div>
    </div>
    <div className="row" style={{ gap: 12 }}>
      <Btn variant="primary">
        Plan een kennismaking <IconArrow size={14} />
      </Btn>
      <Btn variant="ghost">Bekijk de trainingen</Btn>
    </div>
  </Section>
);

export const Light = () => (
  <Section light>
    <Eyebrow>Resultaat</Eyebrow>
    <h2 style={{ marginTop: 16, maxWidth: '20ch' }}>Wat er uit echte trajecten kwam</h2>
    <p className="lead" style={{ marginTop: 20 }}>
      Geen dashboard vol beloftes. Wel cijfers uit opdrachten die af zijn — en mensen die
      begrijpen waarom de uitkomst klopt.
    </p>
    <div className="ds-grid-3" style={{ marginTop: 40 }}>
      <Stat num="1 uur" label="Per kwartaal in plaats van een hele dag" />
      <Stat num="0" label="Financiële data die het pand verlaat" />
      <Stat num="3" suffix="x" label="Merken bediend door één agent" />
    </div>
  </Section>
);

export const Tight = () => (
  <Section tight>
    <Eyebrow>Onder de hero</Eyebrow>
    <p className="lead" style={{ marginTop: 16 }}>
      Een tight section heeft 64px in plaats van 96px lucht — voor een band die bij de band
      erboven hoort, zoals een logobalk onder een hero.
    </p>
  </Section>
);
