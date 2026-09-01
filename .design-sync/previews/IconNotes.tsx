import type { ReactNode } from 'react';
import { Eyebrow, IconNotes, Tag } from '@/components/ds';

const Frame = ({ children }: { children: ReactNode }) => (
  <div style={{ padding: '28px 24px' }}>{children}</div>
);

const SCALE: { size: number; role: string }[] = [
  { size: 16, role: 'inline' },
  { size: 24, role: 'lijstrij' },
  { size: 32, role: 'kaart' },
  { size: 48, role: 'accent' },
];

const OPLEVERING = [
  {
    label: 'VERSLAG',
    title: 'Wat er in de werksessie is besloten',
    meta: '4 pagina’s · dezelfde dag',
  },
  {
    label: 'ACTIELIJST',
    title: 'Wie pakt wat op, met een datum erbij',
    meta: '9 punten · eigenaar per punt',
  },
  {
    label: 'WERKAFSPRAAK',
    title: 'Waar AI wel en niet voor gebruikt wordt',
    meta: '1 pagina · door het team getekend',
  },
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
            <IconNotes size={size} aria-hidden />
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
    <div style={{ maxWidth: 580 }}>
      <div className="spread">
        <div>
          <Eyebrow>Na de sessie</Eyebrow>
          <h3 style={{ fontSize: 22, marginTop: 10 }}>Wat je zwart-op-wit meekrijgt</h3>
        </div>
        <Tag>Oplevering</Tag>
      </div>
      <div style={{ display: 'grid', gap: 14, marginTop: 24 }}>
        {OPLEVERING.map((o) => (
          <div key={o.label} className="contact-line" style={{ cursor: 'default' }}>
            <div className="contact-line-icon">
              <IconNotes size={18} aria-hidden />
            </div>
            <div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--fg-mute)' }}>
                {o.label}
              </div>
              <div style={{ fontSize: 16, marginTop: 4 }}>{o.title}</div>
              <div className="mono" style={{ fontSize: 11, marginTop: 6, color: 'var(--fg-mute)' }}>
                {o.meta}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div
        className="row mono"
        style={{ marginTop: 20, gap: 8, fontSize: 11, color: 'var(--fg-mute)' }}
      >
        <IconNotes size={14} aria-hidden />
        Alles in jullie eigen omgeving, niet in een portaal van ons.
      </div>
    </div>
  </Frame>
);
