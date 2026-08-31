import type { ReactNode } from 'react';
import { IconSettings, Tag } from '@/components/ds';

const Frame = ({ children }: { children: ReactNode }) => (
  <div style={{ padding: '28px 24px' }}>{children}</div>
);

const SCALE: { size: number; role: string }[] = [
  { size: 16, role: 'inline' },
  { size: 24, role: 'lijstrij' },
  { size: 32, role: 'kaart' },
  { size: 48, role: 'accent' },
];

const CONFIG = [
  { pad: 'knowledge/*.md', body: 'Documentatie, beleid en tone of voice. Iedereen mag hier bewerken.' },
  { pad: 'instructions.md', body: 'Doelen, regels en escalatiepaden. Eén leesbaar document.' },
  { pad: 'tools/*.ts', body: 'Welke acties mogen, met permissions en een review-stap.' },
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
            <IconSettings size={size} />
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
        <div className="approach-icon">
          <IconSettings size={22} aria-hidden />
        </div>
        <Tag>Fase 04 · Borgen</Tag>
      </div>
      <h4 style={{ fontSize: 18, marginTop: 14 }}>Configuratie en overdracht</h4>
      <p style={{ fontSize: 14, marginTop: 10, color: 'var(--fg-dim)', maxWidth: '52ch' }}>
        Bij oplevering krijg je drie plekken waar je zelf iets kunt wijzigen. Geen verborgen
        instellingen, geen dashboard waar je een licentie voor nodig hebt.
      </p>
      <div className="divider" style={{ margin: '20px 0 18px' }} />
      <div style={{ display: 'grid', gap: 14 }}>
        {CONFIG.map((c) => (
          <div key={c.pad} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <span style={{ color: 'var(--accent)', display: 'inline-flex', marginTop: 2 }}>
              <IconSettings size={16} aria-hidden />
            </span>
            <div>
              <div className="mono" style={{ fontSize: 12, color: 'var(--fg)' }}>
                {c.pad}
              </div>
              <div style={{ fontSize: 13, marginTop: 4, color: 'var(--fg-dim)' }}>{c.body}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </Frame>
);
