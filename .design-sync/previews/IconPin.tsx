import type { ReactNode } from 'react';
import { IconPin, Tag } from '@/components/ds';

const Frame = ({ children }: { children: ReactNode }) => (
  <div style={{ padding: '28px 24px' }}>{children}</div>
);

const SCALE: { size: number; role: string }[] = [
  { size: 16, role: 'inline' },
  { size: 24, role: 'lijstrij' },
  { size: 32, role: 'kaart' },
  { size: 48, role: 'accent' },
];

const LOCATIES: [string, string][] = [
  ['Bouw je eerste agent', 'op jullie kantoor · 1 dag'],
  ['AI Literacy voor management', 'op locatie · halve dag'],
  ['Org-brede adoptie', 'hybride · 6 weken'],
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
            <IconPin size={size} aria-hidden />
          </div>
          <div className="mono" style={{ fontSize: 12, color: 'var(--fg-dim)' }}>
            {size}px
          </div>
          <div
            className="mono"
            style={{
              fontSize: 10,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--fg-mute)',
            }}
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
      <div className="contact-line" style={{ cursor: 'default' }}>
        <div className="contact-line-icon">
          <IconPin size={18} aria-hidden />
        </div>
        <div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--fg-mute)' }}>
            BASIS
          </div>
          <div style={{ fontSize: 18, marginTop: 4 }}>Nederland · werkt NL &amp; remote</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="spread">
          <h4 style={{ fontSize: 18 }}>Trainingen op jullie locatie</h4>
          <Tag>In-company</Tag>
        </div>
        <p style={{ fontSize: 14, marginTop: 12, color: 'var(--fg-dim)', maxWidth: '50ch' }}>
          Geen open inschrijving. We komen naar jullie toe en werken de hele dag aan een casus die
          bij jullie op de plank ligt.
        </p>
        <div className="divider" style={{ margin: '18px 0 4px' }} />
        {LOCATIES.map(([titel, meta], i) => (
          <div
            key={titel}
            className="spread"
            style={{
              padding: '12px 0',
              borderBottom: i === LOCATIES.length - 1 ? 'none' : '1px solid var(--line)',
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
              <span style={{ color: 'var(--accent)', display: 'inline-flex' }}>
                <IconPin size={16} aria-hidden />
              </span>
              {titel}
            </span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--fg-mute)' }}>
              {meta}
            </span>
          </div>
        ))}
      </div>
    </div>
  </Frame>
);
