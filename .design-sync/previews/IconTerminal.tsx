import type { ReactNode } from 'react';
import { IconTerminal, Tag } from '@/components/ds';

const Frame = ({ children }: { children: ReactNode }) => (
  <div style={{ padding: '28px 24px' }}>{children}</div>
);

const SCALE: { size: number; role: string }[] = [
  { size: 16, role: 'inline' },
  { size: 24, role: 'lijstrij' },
  { size: 32, role: 'kaart' },
  { size: 48, role: 'accent' },
];

const SESSIE: { prompt: boolean; text: string }[] = [
  { prompt: true, text: 'agent init servicedesk' },
  { prompt: false, text: 'aangemaakt: knowledge/  instructions.md  tools/' },
  { prompt: true, text: 'agent run "vat de openstaande tickets samen"' },
  { prompt: false, text: '12 tickets gelezen · 3 wachten op een mens' },
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
            <IconTerminal size={size} aria-hidden />
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
    <div className="card" style={{ maxWidth: 620 }}>
      <div className="spread">
        <div className="row" style={{ gap: 14 }}>
          <div className="approach-icon" style={{ marginBottom: 0 }}>
            <IconTerminal size={22} aria-hidden />
          </div>
          <div>
            <h4 style={{ fontSize: 18 }}>Hands-on, geen slides</h4>
            <div className="mono" style={{ fontSize: 11, color: 'var(--fg-mute)', marginTop: 4 }}>
              1 dag · 6–12 personen
            </div>
          </div>
        </div>
        <Tag>Werksessie</Tag>
      </div>

      <p style={{ fontSize: 14, marginTop: 16, color: 'var(--fg-dim)', maxWidth: '52ch' }}>
        Je werkt met echte tools op je eigen casus. Aan het eind van de dag draait er bij elk team
        een agent die ze zelf kunnen aanpassen.
      </p>

      <div
        style={{
          marginTop: 18,
          background: 'var(--bg-elev)',
          border: '1px solid var(--line)',
          borderRadius: 10,
          overflow: 'hidden',
        }}
      >
        <div
          className="row"
          style={{
            gap: 10,
            padding: '10px 14px',
            borderBottom: '1px solid var(--line)',
            color: 'var(--accent)',
          }}
        >
          <IconTerminal size={16} aria-hidden />
          <span className="mono" style={{ fontSize: 11, color: 'var(--fg-mute)' }}>
            terminal — dag 1, oefening 02
          </span>
        </div>
        <div style={{ padding: '14px 16px', display: 'grid', gap: 8 }}>
          {SESSIE.map(({ prompt, text }) => (
            <div
              key={text}
              className="mono"
              style={{
                fontSize: 12.5,
                lineHeight: 1.5,
                color: prompt ? 'var(--fg)' : 'var(--fg-mute)',
              }}
            >
              <span style={{ color: prompt ? 'var(--accent)' : 'transparent' }}>$&nbsp;</span>
              {text}
            </div>
          ))}
        </div>
      </div>
    </div>
  </Frame>
);
