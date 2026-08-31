import type { ReactNode } from 'react';
import { Btn, Eyebrow, IconPlus } from '@/components/ds';

const Frame = ({ children }: { children: ReactNode }) => (
  <div style={{ padding: '28px 24px' }}>{children}</div>
);

const SCALE: { size: number; role: string }[] = [
  { size: 16, role: 'inline' },
  { size: 24, role: 'lijstrij' },
  { size: 32, role: 'kaart' },
  { size: 48, role: 'accent' },
];

const VRAGEN: { q: string; a?: string }[] = [
  {
    q: 'Hoeveel tijd kost het mijn team?',
    a: 'Drie dagdelen verspreid over zes weken, plus ongeveer een uur per week eigen oefening. We plannen de sessies rond jullie drukke periodes.',
  },
  { q: 'Werkt dit ook zonder technische mensen in huis?' },
  { q: 'Wat gebeurt er met onze data?' },
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
            <IconPlus size={size} />
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
      <Eyebrow>Veelgestelde vragen</Eyebrow>
      <div style={{ marginTop: 16 }}>
        {VRAGEN.map(({ q, a }) => (
          <div key={q} className={'faq-item' + (a ? ' open' : '')}>
            <div className="faq-q">
              <span>{q}</span>
              <span className="faq-toggle">
                <IconPlus size={13} aria-hidden />
              </span>
            </div>
            <div className="faq-a">
              <p>{a}</p>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 24 }}>
        <Btn variant="ghost">
          <IconPlus size={14} /> Meer vragen tonen
        </Btn>
      </div>
    </div>
  </Frame>
);
