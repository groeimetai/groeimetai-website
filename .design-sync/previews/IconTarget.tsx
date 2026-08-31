import type { ReactNode } from 'react';
import { IconTarget, Stat, Tag } from '@/components/ds';

const Frame = ({ children }: { children: ReactNode }) => (
  <div style={{ padding: '28px 24px' }}>{children}</div>
);

const SCALE: { size: number; role: string }[] = [
  { size: 16, role: 'inline' },
  { size: 24, role: 'lijstrij' },
  { size: 32, role: 'kaart' },
  { size: 48, role: 'accent' },
];

const DOELEN: { num: string; label: string; suffix?: string }[] = [
  { num: '1-3', label: 'use-cases in kaart' },
  { num: '6', suffix: 'wkn', label: 'tot eerste versie' },
  { num: '1', label: 'vaste eigenaar' },
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
            <IconTarget size={size} />
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
    <div className="card" style={{ maxWidth: 580 }}>
      <div className="spread">
        <div className="row" style={{ gap: 12 }}>
          <span style={{ color: 'var(--accent)', display: 'inline-flex' }}>
            <IconTarget size={24} aria-hidden />
          </span>
          <h4 style={{ fontSize: 18 }}>Doel van de pilot</h4>
        </div>
        <Tag>Fase 01</Tag>
      </div>
      <p style={{ fontSize: 14, marginTop: 14, color: 'var(--fg-dim)', maxWidth: '52ch' }}>
        We kiezen samen één use-case op impact én risico. Welke past bij een agent, welke is gewoon
        een script? Dat spreken we af voordat er iets gebouwd wordt.
      </p>
      <div className="divider" style={{ margin: '22px 0 20px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
        {DOELEN.map((d) => (
          <Stat key={d.label} num={d.num} suffix={d.suffix} label={d.label} />
        ))}
      </div>
    </div>
  </Frame>
);
