import type { ReactNode } from 'react';
import { Btn, IconSpark } from '@/components/ds';

const Frame = ({ children }: { children: ReactNode }) => (
  <div style={{ padding: '28px 24px' }}>{children}</div>
);

const SCALE: { size: number; role: string }[] = [
  { size: 16, role: 'inline' },
  { size: 24, role: 'lijstrij' },
  { size: 32, role: 'kaart' },
  { size: 48, role: 'accent' },
];

const IDEEEN = [
  {
    meta: 'Sales · offertes',
    title: 'Offerte-concept uit het intakeformulier',
    body: 'Scheelt naar schatting 2 uur per offerte. Eerst vijf stuks handmatig naast elkaar leggen.',
    weging: 'Impact hoog · risico laag',
  },
  {
    meta: 'Servicedesk · e-mail',
    title: 'Antwoordsuggesties voor terugkerende vragen',
    body: 'De behandelaar kiest en verstuurt zelf. Niets gaat automatisch de deur uit.',
    weging: 'Impact midden · risico laag',
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
            <IconSpark size={size} />
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
    <div className="spread" style={{ maxWidth: 760 }}>
      <div className="row" style={{ gap: 10 }}>
        <span style={{ color: 'var(--accent)', display: 'inline-flex' }}>
          <IconSpark size={22} aria-hidden />
        </span>
        <h4 style={{ fontSize: 18 }}>Use-case incubator</h4>
      </div>
      <Btn variant="ghost">
        Use-case toevoegen <IconSpark size={14} aria-hidden />
      </Btn>
    </div>
    <p style={{ fontSize: 14, marginTop: 14, color: 'var(--fg-dim)', maxWidth: '58ch' }}>
      Wat teams zelf aandragen tijdens de wekelijkse werksessie. Elke suggestie wegen we op impact en
      risico voordat er iets gebouwd wordt.
    </p>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 16,
        marginTop: 22,
        maxWidth: 760,
      }}
    >
      {IDEEEN.map((idee) => (
        <div key={idee.title} className="card" style={{ padding: 22 }}>
          <div className="row" style={{ gap: 10 }}>
            <span style={{ color: 'var(--accent)', display: 'inline-flex' }}>
              <IconSpark size={16} aria-hidden />
            </span>
            <span
              className="mono"
              style={{
                fontSize: 11,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--fg-mute)',
              }}
            >
              {idee.meta}
            </span>
          </div>
          <h4 style={{ fontSize: 16, marginTop: 12 }}>{idee.title}</h4>
          <p style={{ fontSize: 13, marginTop: 8, color: 'var(--fg-dim)' }}>{idee.body}</p>
          <div className="divider" style={{ margin: '16px 0 12px' }} />
          <div className="mono" style={{ fontSize: 11, color: 'var(--fg-mute)' }}>
            {idee.weging}
          </div>
        </div>
      ))}
    </div>
  </Frame>
);
