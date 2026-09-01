import type { ReactNode } from 'react';
import { Btn, IconArrow, Pill } from '@/components/ds';

const Frame = ({ children }: { children: ReactNode }) => (
  <div style={{ padding: '28px 24px' }}>{children}</div>
);

export const Status = () => (
  <Frame>
    <div className="row" style={{ gap: 12, flexWrap: 'wrap' }}>
      <Pill>Beschikbaar voor Q3 trajecten</Pill>
      <Pill>Volgende open training: 12 juni</Pill>
      <Pill>Antwoord binnen 24 uur</Pill>
    </div>
  </Frame>
);

export const NeutralLabel = () => (
  <Frame>
    <div className="row" style={{ gap: 12, flexWrap: 'wrap' }}>
      <Pill withDot={false}>Nederlands &amp; Engels</Pill>
      <Pill withDot={false}>In-company of remote</Pill>
      <Pill withDot={false}>6 tot 12 deelnemers</Pill>
    </div>
  </Frame>
);

export const InHero = () => (
  <Frame>
    <div style={{ maxWidth: 620 }}>
      <Pill>Beschikbaar voor Q3 trajecten</Pill>
      <h2 style={{ marginTop: 24 }}>
        Een agent is geen magie. Het is een{' '}
        <em style={{ color: 'var(--accent)', fontStyle: 'normal' }}>folder, instructies en tools.</em>
      </h2>
      <p className="lead" style={{ marginTop: 20 }}>
        We leren teams agents bouwen die ze zelf begrijpen, beheren en aanpassen. Geen black box,
        geen lock-in.
      </p>
      <div className="row" style={{ marginTop: 28, gap: 12 }}>
        <Btn variant="primary">
          Plan een verkennend gesprek <IconArrow size={14} />
        </Btn>
        <Btn variant="ghost">Zo bouwen wij ze</Btn>
      </div>
    </div>
  </Frame>
);
