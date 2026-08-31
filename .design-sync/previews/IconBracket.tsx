import type { ReactNode } from 'react';
import { Eyebrow, IconBracket } from '@/components/ds';

const Frame = ({ children }: { children: ReactNode }) => (
  <div style={{ padding: '28px 24px' }}>{children}</div>
);

const SCALE: { size: number; role: string }[] = [
  { size: 16, role: 'inline' },
  { size: 24, role: 'lijstrij' },
  { size: 32, role: 'kaart' },
  { size: 48, role: 'accent' },
];

const TEMPLATE: { text: string; kind: 'comment' | 'code' }[] = [
  { text: '# rol: servicedesk — antwoordconcept', kind: 'comment' },
  { text: 'klant       = {{ klantnaam }}', kind: 'code' },
  { text: 'onderwerp   = {{ ticket.onderwerp }}', kind: 'code' },
  { text: 'bron        = {{ kennisbank.treffers }}', kind: 'code' },
  { text: '# geen bron gevonden? geef dat terug, verzin niets', kind: 'comment' },
  { text: 'uitvoer     = concept, mens verstuurt', kind: 'code' },
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
            <IconBracket size={size} aria-hidden />
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
        <span
          style={{
            width: 38,
            height: 38,
            borderRadius: 9,
            background: 'rgba(255, 90, 31, 0.12)',
            color: 'var(--accent)',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
          }}
        >
          <IconBracket size={20} aria-hidden />
        </span>
        <div>
          <Eyebrow>Prompt als afspraak</Eyebrow>
          <h4 style={{ fontSize: 18, marginTop: 6 }}>Vaste velden, geen losse tekst</h4>
        </div>
      </div>
      <p style={{ fontSize: 14, marginTop: 14, color: 'var(--fg-dim)', maxWidth: '54ch' }}>
        Een prompt die het team elke dag gebruikt leggen we vast als template met benoemde velden.
        Zo weet iedereen wat erin gaat en wat eruit hoort te komen.
      </p>
      <div
        style={{
          marginTop: 18,
          padding: '16px 18px',
          borderRadius: 10,
          border: '1px solid var(--line)',
          background: 'var(--bg-elev)',
          display: 'grid',
          gap: 6,
        }}
      >
        {TEMPLATE.map((line) => (
          <div
            key={line.text}
            className="mono"
            style={{
              fontSize: 12,
              lineHeight: 1.5,
              whiteSpace: 'pre',
              color: line.kind === 'comment' ? 'var(--fg-mute)' : 'var(--fg-dim)',
            }}
          >
            {line.text}
          </div>
        ))}
      </div>
      <div className="divider" style={{ margin: '18px 0 14px' }} />
      <div
        className="row mono"
        style={{ gap: 8, fontSize: 11, color: 'var(--fg-mute)' }}
      >
        <span style={{ color: 'var(--accent)', display: 'inline-flex' }}>
          <IconBracket size={14} aria-hidden />
        </span>
        templates/servicedesk-antwoord.md · versie 3 · beheerd door het team zelf
      </div>
    </div>
  </Frame>
);
