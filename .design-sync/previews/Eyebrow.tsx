import type { ReactNode } from 'react';
import { Eyebrow, Section } from '@/components/ds';

const Frame = ({ children }: { children: ReactNode }) => (
  <div style={{ padding: '28px 24px' }}>{children}</div>
);

export const AboveHeading = () => (
  <Frame>
    <Eyebrow>Aanpak</Eyebrow>
    <h2 style={{ marginTop: 16, maxWidth: '18ch' }}>Trainen, begeleiden, borgen</h2>
  </Frame>
);

export const AboveLead = () => (
  <Frame>
    <Eyebrow>In elke training</Eyebrow>
    <p className="lead" style={{ marginTop: 16 }}>
      Je werkt met je eigen casus als rode draad, met naslagwerk dat je over zes maanden nog
      gebruikt. Los van de duur of het niveau van de dag.
    </p>
  </Frame>
);

export const InSectionHead = () => (
  <Section id="adoptie">
    <div className="sec-head">
      <div>
        <Eyebrow>Adoptie</Eyebrow>
        <h2 style={{ marginTop: 16 }}>Van eerste sessie naar dagelijks gebruik</h2>
      </div>
      <div className="sec-head-right">
        <p className="lead">
          Een training van één dag verandert nog geen werkweek. De maanden erna bepalen of het
          blijft hangen — daar richten we de begeleiding op in.
        </p>
      </div>
    </div>
  </Section>
);

export const OnLightSection = () => (
  <Section light tight>
    <Eyebrow>Voor wie</Eyebrow>
    <h2 style={{ marginTop: 16, maxWidth: '20ch' }}>MKB-teams die verder willen dan losse tools</h2>
    <p className="lead" style={{ marginTop: 20 }}>
      Meestal een MT dat AI serieus wil inzetten, samen met de mensen die het werk doen. Zes tot
      twaalf deelnemers per sessie, op locatie of remote.
    </p>
  </Section>
);
