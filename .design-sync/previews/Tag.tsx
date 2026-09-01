import type { ReactNode } from 'react';
import { Btn, IconArrow, Tag } from '@/components/ds';

const Frame = ({ children }: { children: ReactNode }) => (
  <div style={{ padding: '28px 24px' }}>{children}</div>
);

export const TopicTags = () => (
  <Frame>
    <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
      <Tag>Folders</Tag>
      <Tag>Instructies</Tag>
      <Tag>Tools</Tag>
      <Tag>Geheugen</Tag>
      <Tag>Guardrails</Tag>
      <Tag>Audit log</Tag>
    </div>
  </Frame>
);

export const NumberedPairs = () => (
  <Frame>
    <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
      <Tag>01 / Hands-on</Tag>
      <Tag>02 / Strategisch</Tag>
      <Tag>03 / Programma</Tag>
    </div>
  </Frame>
);

export const InCards = () => (
  <Frame>
    <div style={{ display: 'grid', gap: 16 }}>
      <div className="card">
        <Tag>01 / Hands-on</Tag>
        <h3 style={{ marginTop: 16 }}>Bouw je eerste agent</h3>
        <p style={{ marginTop: 12 }}>
          Aan het eind van de dag heeft elk team een werkende agent met een eigen folder,
          instructies en één tool.
        </p>
        <div className="mono" style={{ marginTop: 18, fontSize: 12, color: 'var(--fg-mute)' }}>
          1 dag · 6-12 personen · op locatie of remote
        </div>
      </div>
      <div className="card">
        <Tag>02 / Strategisch</Tag>
        <h3 style={{ marginTop: 16 }}>AI-literacy voor management</h3>
        <p style={{ marginTop: 12 }}>
          We maken scherp wat agents wél en niet kunnen, en welke keuzes alleen jullie kunnen
          maken.
        </p>
        <div className="mono" style={{ marginTop: 18, fontSize: 12, color: 'var(--fg-mute)' }}>
          Halve dag · directie + L&amp;D · op locatie
        </div>
      </div>
    </div>
  </Frame>
);

export const InCtaBlock = () => (
  <Frame>
    <div className="cta-block">
      <div className="cta-block-inner">
        <Tag>Volgende stap</Tag>
        <h2 style={{ marginTop: 16 }}>Aan de slag in één sessie</h2>
        <p style={{ maxWidth: 540, marginTop: 16 }}>
          Boek een intake. We kijken een uur naar wat je al hebt en je gaat weg met een concreet
          folderplan voor je eerste agent.
        </p>
        <div className="row">
          <Btn variant="primary">
            Plan een intake <IconArrow size={14} />
          </Btn>
          <Btn variant="ghost">Lees hoe we werken</Btn>
        </div>
      </div>
    </div>
  </Frame>
);
