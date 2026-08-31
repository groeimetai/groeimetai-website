import type { ReactNode } from 'react';
import { Eyebrow, IconCheck, Tag } from '@/components/ds';

const Frame = ({ children }: { children: ReactNode }) => (
  <div style={{ padding: '28px 24px' }}>{children}</div>
);

const SCALE: { size: number; role: string }[] = [
  { size: 16, role: 'inline' },
  { size: 24, role: 'lijstrij' },
  { size: 32, role: 'kaart' },
  { size: 48, role: 'accent' },
];

const INBEGREPEN = [
  'Drie werksessies van een dagdeel, bij jullie op kantoor',
  'Een promptbibliotheek met de tien taken die jullie het vaakst doen',
  'Afspraken over wat er wel en niet in een AI-tool mag',
  'Terugkomsessie na zes weken om het gebruik te toetsen',
];

export const Sizes = () => (
  <Frame>
    <div className="row" style={{ gap: 44 }}>
      {SCALE.map(({ size, role }) => (
        <div
          key={size}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}
        >
          <div
            style={{
              height: 48,
              display: 'flex',
              alignItems: 'center',
              color: size === 48 ? 'var(--accent)' : 'var(--fg)',
            }}
          >
            <IconCheck size={size} />
          </div>
          <div className="mono" style={{ fontSize: 12, color: 'var(--fg-dim)' }}>
            {size}px
          </div>
          <div
            className="mono"
            style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fg-mute)' }}
          >
            {role}
          </div>
        </div>
      ))}
    </div>
  </Frame>
);

export const InContext = () => (
  <Frame>
    <div style={{ maxWidth: 560 }}>
      <div className="spread">
        <Eyebrow>Inbegrepen</Eyebrow>
        <Tag>Adoptietraject</Tag>
      </div>
      <h4 style={{ fontSize: 20, marginTop: 12 }}>Wat je krijgt in zes weken</h4>
      <div className="checklist">
        {INBEGREPEN.map((item) => (
          <div key={item} className="checklist-item">
            <div className="x">
              <IconCheck size={12} aria-hidden />
            </div>
            <div>{item}</div>
          </div>
        ))}
      </div>
    </div>
  </Frame>
);
