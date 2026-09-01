import type { ReactNode } from 'react';
import { Btn, IconChat } from '@/components/ds';

const Frame = ({ children }: { children: ReactNode }) => (
  <div style={{ padding: '28px 24px' }}>{children}</div>
);

const SCALE: { size: number; role: string }[] = [
  { size: 16, role: 'inline' },
  { size: 24, role: 'lijstrij' },
  { size: 32, role: 'kaart' },
  { size: 48, role: 'accent' },
];

const VRAGEN = [
  'Waar gaat in jullie werkweek de meeste tijd zitten?',
  'Wie heeft er al iets met AI geprobeerd, en wat liep vast?',
  'Welke data mag wel en welke absoluut niet het gebouw uit?',
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
            <IconChat size={size} aria-hidden />
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
    <div className="card" style={{ maxWidth: 560 }}>
      <div className="approach-icon" style={{ marginBottom: 0 }}>
        <IconChat size={22} aria-hidden />
      </div>
      <div className="mono" style={{ fontSize: 11, color: 'var(--fg-mute)', marginTop: 18 }}>
        KENNISMAKING · 45 MINUTEN
      </div>
      <h4 style={{ marginTop: 6, fontSize: 18 }}>Eerst het gesprek, dan pas de tooling</h4>
      <p style={{ marginTop: 10, fontSize: 15, color: 'var(--fg-dim)', maxWidth: '52ch' }}>
        We bellen een keer door met jou en iemand die het werk echt doet. Geen demo, geen offerte —
        we willen weten waar het schuurt voordat we iets aanraden.
      </p>
      <div className="divider" style={{ margin: '20px 0 16px' }} />
      <div style={{ display: 'grid', gap: 12 }}>
        {VRAGEN.map((v) => (
          <div key={v} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ color: 'var(--accent)', display: 'inline-flex', marginTop: 2 }}>
              <IconChat size={16} aria-hidden />
            </span>
            <span style={{ fontSize: 14, color: 'var(--fg-dim)' }}>{v}</span>
          </div>
        ))}
      </div>
      <div className="row" style={{ marginTop: 24 }}>
        <Btn variant="primary">
          Plan een kennismaking <IconChat size={14} aria-hidden />
        </Btn>
        <Btn variant="ghost">Liever eerst mailen</Btn>
      </div>
    </div>
  </Frame>
);
