import type { ReactNode } from 'react';
import { Eyebrow, IconX } from '@/components/ds';

const Frame = ({ children }: { children: ReactNode }) => (
  <div style={{ padding: '28px 24px' }}>{children}</div>
);

const SCALE: { size: number; role: string }[] = [
  { size: 16, role: 'inline' },
  { size: 24, role: 'lijstrij' },
  { size: 32, role: 'kaart' },
  { size: 48, role: 'accent' },
];

const NIET = [
  'Een dure SaaS-tool die "AI" in de naam heeft',
  'Een licentie voor het hele bedrijf voordat iemand het gebruikt',
  'Een rapport van veertig pagina’s dat niemand openslaat',
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
            <IconX size={size} />
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
      <div className="card" style={{ padding: '16px 18px' }}>
        <div className="spread" style={{ gap: 16 }}>
          <span style={{ fontSize: 13, color: 'var(--fg-dim)' }}>
            De intake van dinsdag 14:00 staat in je agenda.
          </span>
          <button
            type="button"
            aria-label="Melding sluiten"
            style={{
              background: 'transparent',
              border: 0,
              padding: 4,
              color: 'var(--fg-mute)',
              display: 'inline-flex',
              cursor: 'pointer',
            }}
          >
            <IconX size={16} />
          </button>
        </div>
      </div>

      <div style={{ marginTop: 28 }}>
        <Eyebrow>Buiten scope</Eyebrow>
        <h4 style={{ fontSize: 20, marginTop: 12 }}>Wat je van ons niet krijgt</h4>
        <div className="checklist">
          {NIET.map((item) => (
            <div key={item} className="checklist-item">
              <div className="x">
                <IconX size={12} aria-hidden />
              </div>
              <div>{item}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </Frame>
);
