import type { ReactNode } from 'react';
import { IconUsers } from '@/components/ds';

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
            <IconUsers size={size} />
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
    <div
      className="card"
      style={{ display: 'flex', gap: 24, alignItems: 'flex-start', maxWidth: 720 }}
    >
      <div className="approach-icon" style={{ marginBottom: 0, flexShrink: 0 }}>
        <IconUsers size={22} />
      </div>
      <div>
        <div
          className="mono"
          style={{
            fontSize: 11,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--fg-mute)',
          }}
        >
          Pijler 03
        </div>
        <h4 style={{ fontSize: 18, marginTop: 8 }}>AI Literacy &amp; adoptie</h4>
        <p style={{ fontSize: 14, marginTop: 10, color: 'var(--fg-dim)', maxWidth: '52ch' }}>
          Management én uitvoering op één lijn, voordat de eerste tool wordt aangeschaft.
          Leiderschapssessies, een org-breed curriculum en use-case prioritering op impact en risico.
        </p>
        <div className="divider" style={{ margin: '18px 0 14px' }} />
        <div className="row mono" style={{ gap: 22, fontSize: 11, color: 'var(--fg-mute)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <IconUsers size={14} aria-hidden /> 6–12 deelnemers
          </span>
          <span>In-company · NL of EN</span>
        </div>
      </div>
    </div>
  </Frame>
);
