import type { ReactNode } from 'react';
import { IconLayers } from '@/components/ds';

const Frame = ({ children }: { children: ReactNode }) => (
  <div style={{ padding: '28px 24px' }}>{children}</div>
);

const SCALE: { size: number; role: string }[] = [
  { size: 16, role: 'inline' },
  { size: 24, role: 'lijstrij' },
  { size: 32, role: 'kaart' },
  { size: 48, role: 'accent' },
];

const LAGEN = [
  { num: '01 / Folders', body: 'Dit is wat de agent weet — jouw documentatie, beleid en voorbeelden.' },
  { num: '02 / Instructies', body: 'Dit is hoe de agent denkt — regels, edge cases en escalatie.' },
  { num: '03 / Tools', body: 'Dit is wat de agent kan — niets meer dan jij toestaat.' },
];

const STACK = ['ServiceNow Quebec+', 'Claude Code', 'MCP servers', 'Python localhost'];

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
            <IconLayers size={size} />
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
          <IconLayers size={24} aria-hidden />
        </span>
        <h4 style={{ fontSize: 18 }}>Drie lagen, niet meer</h4>
      </div>
      <p style={{ fontSize: 14, marginTop: 14, color: 'var(--fg-dim)', maxWidth: '52ch' }}>
        Als je deze drie lagen snapt, snap je elke agent die er straks komt — los van het framework
        en los van de leverancier.
      </p>
      <div style={{ display: 'grid', gap: 14, marginTop: 20 }}>
        {LAGEN.map((l) => (
          <div key={l.num} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <span style={{ color: 'var(--accent)', display: 'inline-flex', marginTop: 2 }}>
              <IconLayers size={16} aria-hidden />
            </span>
            <div>
              <div
                className="mono"
                style={{
                  fontSize: 11,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'var(--fg-mute)',
                }}
              >
                {l.num}
              </div>
              <div style={{ fontSize: 13, marginTop: 4, color: 'var(--fg-dim)' }}>{l.body}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="divider" style={{ margin: '20px 0 16px' }} />
      <div
        className="mono"
        style={{ fontSize: 11, letterSpacing: '0.06em', color: 'var(--fg-mute)', marginBottom: 12 }}
      >
        DRAAIT OP JOUW STACK
      </div>
      <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
        {STACK.map((s) => (
          <span className="stack-pill" key={s}>
            {s}
          </span>
        ))}
      </div>
    </div>
  </Frame>
);
