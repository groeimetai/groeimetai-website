import type { ReactNode } from 'react';
import { Btn, IconArrow, IconBook } from '@/components/ds';

const Frame = ({ children }: { children: ReactNode }) => (
  <div style={{ padding: '28px 24px' }}>{children}</div>
);

const TRAININGEN = [
  ['AI-basis voor je hele team', 'halve dag · geen voorkennis'],
  ['Prompten voor je eigen werk', '2 sessies van 2 uur'],
  ['AI veilig gebruiken met klantdata', 'halve dag · MT en privacy'],
];

export const Sizes = () => (
  <Frame>
    <div className="row" style={{ gap: 44 }}>
      {[16, 24, 32, 48].map((s) => (
        <div
          key={s}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}
        >
          <div
            style={{
              height: 56,
              display: 'grid',
              placeItems: 'center',
              color: s === 48 ? 'var(--accent)' : 'var(--fg)',
            }}
          >
            <IconBook size={s} aria-hidden />
          </div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--fg-mute)' }}>
            {s}px
          </div>
        </div>
      ))}
    </div>
  </Frame>
);

export const InContext = () => (
  <Frame>
    <div style={{ maxWidth: 560 }}>
      <div className="mono" style={{ fontSize: 11, color: 'var(--fg-mute)' }}>
        TRAININGSAANBOD
      </div>
      <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
        {TRAININGEN.map(([title, meta]) => (
          <div key={title} className="card" style={{ padding: 18 }}>
            <div className="row" style={{ gap: 14 }}>
              <span
                style={{
                  width: 38,
                  height: 38,
                  flexShrink: 0,
                  borderRadius: 9,
                  background: 'rgba(255, 90, 31, 0.12)',
                  color: 'var(--accent)',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <IconBook size={18} aria-hidden />
              </span>
              <div>
                <h4 style={{ fontSize: 16 }}>{title}</h4>
                <div className="mono" style={{ fontSize: 11, color: 'var(--fg-mute)', marginTop: 6 }}>
                  {meta}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 20 }}>
        <Btn variant="ghost">
          Bekijk het lesmateriaal <IconArrow size={14} aria-hidden />
        </Btn>
      </div>
    </div>
  </Frame>
);
