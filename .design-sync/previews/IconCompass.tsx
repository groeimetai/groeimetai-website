import type { ReactNode } from 'react';
import { Btn, Eyebrow, IconArrow, IconCompass } from '@/components/ds';

const Frame = ({ children }: { children: ReactNode }) => (
  <div style={{ padding: '28px 24px' }}>{children}</div>
);

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
            <IconCompass size={s} aria-hidden />
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
    <div className="card" style={{ maxWidth: 560 }}>
      <div className="row" style={{ gap: 16, alignItems: 'flex-start' }}>
        <div
          style={{
            width: 52,
            height: 52,
            flexShrink: 0,
            borderRadius: 12,
            background: 'rgba(255, 90, 31, 0.12)',
            color: 'var(--accent)',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <IconCompass size={28} aria-hidden />
        </div>
        <div>
          <Eyebrow>Strategie</Eyebrow>
          <h4 style={{ marginTop: 12, fontSize: 20 }}>Waar begint AI bij jullie?</h4>
          <p style={{ marginTop: 10, fontSize: 15 }}>
            In één sessie van twee uur brengen we jullie werkprocessen in kaart en kiezen we de
            twee plekken waar AI het snelst iets oplevert. Geen tool-lijstje, wel een volgorde.
          </p>
        </div>
      </div>
      <div className="row" style={{ gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
        <Btn variant="primary">
          <IconCompass size={14} aria-hidden /> Plan een strategiesessie
        </Btn>
        <Btn variant="ghost">
          Lees onze aanpak <IconArrow size={14} aria-hidden />
        </Btn>
      </div>
    </div>
  </Frame>
);
