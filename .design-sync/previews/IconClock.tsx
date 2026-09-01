import type { ReactNode } from 'react';
import { Btn, IconClock } from '@/components/ds';

const Frame = ({ children }: { children: ReactNode }) => (
  <div style={{ padding: '28px 24px' }}>{children}</div>
);

const SCALE: { size: number; role: string }[] = [
  { size: 16, role: 'inline' },
  { size: 24, role: 'lijstrij' },
  { size: 32, role: 'kaart' },
  { size: 48, role: 'accent' },
];

const TRAININGEN = [
  { title: 'Bouw je eerste agent', duur: '1 dag · 6-12 personen · op locatie of remote' },
  { title: 'AI Literacy voor management', duur: 'Halve dag · directie + L&D · op locatie' },
  { title: 'Org-brede AI adoptie', duur: '6 weken · org-breed · hybride' },
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
            <IconClock size={size} />
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
      <div className="row" style={{ gap: 12 }}>
        <span style={{ color: 'var(--accent)', display: 'inline-flex' }}>
          <IconClock size={24} aria-hidden />
        </span>
        <h4 style={{ fontSize: 18 }}>Doorlooptijd per training</h4>
      </div>
      <p style={{ fontSize: 14, marginTop: 14, color: 'var(--fg-dim)', maxWidth: '52ch' }}>
        We werken alleen in-company. Hieronder wat een dag of een traject in de praktijk kost aan tijd
        van je team.
      </p>
      <div className="divider" style={{ margin: '20px 0 18px' }} />
      <div style={{ display: 'grid', gap: 16 }}>
        {TRAININGEN.map((t) => (
          <div key={t.title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <span style={{ color: 'var(--accent)', display: 'inline-flex', marginTop: 2 }}>
              <IconClock size={16} aria-hidden />
            </span>
            <div>
              <div style={{ fontSize: 14, color: 'var(--fg)' }}>{t.title}</div>
              <div className="mono" style={{ fontSize: 11, marginTop: 4, color: 'var(--fg-mute)' }}>
                {t.duur}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 24 }}>
        <Btn variant="ghost">
          Plan een datum <IconClock size={14} aria-hidden />
        </Btn>
      </div>
    </div>
  </Frame>
);
