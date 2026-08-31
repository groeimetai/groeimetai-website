import type { ReactNode } from 'react';
import { Eyebrow, IconGraph, Stat } from '@/components/ds';

const Frame = ({ children }: { children: ReactNode }) => (
  <div style={{ padding: '28px 24px' }}>{children}</div>
);

const SCALE: { size: number; role: string }[] = [
  { size: 16, role: 'inline' },
  { size: 24, role: 'lijstrij' },
  { size: 32, role: 'kaart' },
  { size: 48, role: 'accent' },
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
            <IconGraph size={size} />
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
    <div className="row" style={{ gap: 16 }}>
      <div className="approach-icon" style={{ marginBottom: 0, flexShrink: 0 }}>
        <IconGraph size={22} />
      </div>
      <div>
        <Eyebrow>Resultaat</Eyebrow>
        <h3 style={{ fontSize: 24, marginTop: 8 }}>Wat de timesheet-agent opleverde</h3>
      </div>
    </div>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 16,
        marginTop: 32,
        maxWidth: 760,
      }}
    >
      <Stat num="1225" label="Uren voor het urencriterium" />
      <Stat num="Auto" label="Elke vrijdag om 17:00" />
      <Stat num="CSV" label="Export voor de accountant" />
    </div>
    <div
      className="row mono"
      style={{ marginTop: 26, gap: 8, fontSize: 11, color: 'var(--fg-mute)' }}
    >
      <IconGraph size={14} aria-hidden />
      Gemeten in de tool zelf, niet in een tevredenheidsenquête.
    </div>
  </Frame>
);
