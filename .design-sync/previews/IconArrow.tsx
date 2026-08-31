import type { ReactNode } from 'react';
import { Btn, Eyebrow, IconArrow } from '@/components/ds';

const Frame = ({ children }: { children: ReactNode }) => (
  <div style={{ padding: '28px 24px' }}>{children}</div>
);

const SCALE: { size: number; role: string }[] = [
  { size: 16, role: 'inline' },
  { size: 24, role: 'lijstrij' },
  { size: 32, role: 'kaart' },
  { size: 48, role: 'accent' },
];

const STAPPEN = ['Intake', 'Werksessies', 'Eigen use cases live'];

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
            <IconArrow size={size} />
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
      <Eyebrow>Volgende stap</Eyebrow>
      <h4 style={{ fontSize: 20, marginTop: 12 }}>Van kennismaking naar een team dat het zelf doet</h4>
      <p style={{ fontSize: 14, marginTop: 12, color: 'var(--fg-dim)', maxWidth: '52ch' }}>
        Eén uur intake, daarna drie werksessies met jullie eigen werk op tafel. Geen offertetraject
        van weken.
      </p>
      <div className="row" style={{ marginTop: 20, gap: 12, flexWrap: 'wrap' }}>
        <Btn variant="primary">
          Plan een kennismaking <IconArrow size={14} />
        </Btn>
        <Btn variant="ghost">
          Bekijk de trainingen <IconArrow size={14} />
        </Btn>
      </div>
      <div className="divider" style={{ margin: '22px 0 16px' }} />
      <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
        {STAPPEN.map((stap, i) => (
          <span key={stap} className="row" style={{ gap: 10 }}>
            <span className="mono" style={{ fontSize: 12, color: 'var(--fg-dim)' }}>
              {stap}
            </span>
            {i < STAPPEN.length - 1 && (
              <span style={{ color: 'var(--accent)', display: 'inline-flex' }}>
                <IconArrow size={16} aria-hidden />
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  </Frame>
);
