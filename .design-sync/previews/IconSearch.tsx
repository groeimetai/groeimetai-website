import type { ReactNode } from 'react';
import { Eyebrow, IconSearch } from '@/components/ds';

const Frame = ({ children }: { children: ReactNode }) => (
  <div style={{ padding: '28px 24px' }}>{children}</div>
);

const SCALE: { size: number; role: string }[] = [
  { size: 16, role: 'inline' },
  { size: 24, role: 'lijstrij' },
  { size: 32, role: 'kaart' },
  { size: 48, role: 'accent' },
];

const TREFFERS = [
  {
    title: 'Garantietermijn bij montage door derden',
    bron: 'kennisbank/voorwaarden/levering-2025.pdf',
    regel: 'p. 4, artikel 7.2',
  },
  {
    title: 'Uitzondering voor onderhoudscontracten',
    bron: 'kennisbank/voorwaarden/onderhoud.md',
    regel: 'regel 38 — 52',
  },
  {
    title: 'Wat de servicedesk hierover mag toezeggen',
    bron: 'kennisbank/servicedesk/antwoordkaders.md',
    regel: 'regel 12 — 19',
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
            <IconSearch size={size} aria-hidden />
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
      <Eyebrow>Zoeken in eigen documenten</Eyebrow>
      <h3 style={{ fontSize: 22, marginTop: 10 }}>Antwoord mét vindplaats</h3>
      <div
        style={{
          marginTop: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '13px 16px',
          border: '1px solid var(--line)',
          borderRadius: 12,
          background: 'var(--bg-elev)',
        }}
      >
        <span style={{ color: 'var(--accent)', display: 'inline-flex' }}>
          <IconSearch size={18} aria-hidden />
        </span>
        <span style={{ fontSize: 15, color: 'var(--fg)' }}>
          Hoe lang loopt de garantie bij montage door een derde?
        </span>
      </div>
      <div className="mono" style={{ fontSize: 11, color: 'var(--fg-mute)', margin: '18px 0 12px' }}>
        3 TREFFERS · 0,8 S
      </div>
      <div style={{ display: 'grid', gap: 10 }}>
        {TREFFERS.map((t) => (
          <div key={t.bron} className="card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--fg-mute)', display: 'inline-flex', marginTop: 2 }}>
                <IconSearch size={16} aria-hidden />
              </span>
              <div>
                <div style={{ fontSize: 14, color: 'var(--fg)' }}>{t.title}</div>
                <div
                  className="mono"
                  style={{ fontSize: 11, marginTop: 6, color: 'var(--fg-mute)' }}
                >
                  {t.bron} · {t.regel}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 13, marginTop: 16, color: 'var(--fg-dim)', maxWidth: '56ch' }}>
        Geen antwoord zonder bron. Staat het er niet in, dan zegt het systeem dat — dat is het
        verschil met een los chatvenster.
      </p>
    </div>
  </Frame>
);
