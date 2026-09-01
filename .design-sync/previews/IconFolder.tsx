import type { ReactNode } from 'react';
import { IconFolder } from '@/components/ds';

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
            <IconFolder size={s} aria-hidden />
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
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          background: 'rgba(255, 90, 31, 0.12)',
          color: 'var(--accent)',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <IconFolder size={22} aria-hidden />
      </div>
      <div className="mono" style={{ fontSize: 11, color: 'var(--fg-mute)', marginTop: 18 }}>
        01 / FOLDERS
      </div>
      <h4 style={{ marginTop: 6, fontSize: 18 }}>Kennis als folderstructuur</h4>
      <p style={{ marginTop: 10, fontSize: 15 }}>
        Een agent weet wat hij weet doordat zijn kennis in mappen staat. Leesbaar voor het hele
        team, niet weggestopt in een prompt die niemand durft aan te raken.
      </p>
      <div className="divider" style={{ margin: '20px 0 16px' }} />
      <div style={{ display: 'grid', gap: 10 }}>
        {[
          ['kennisbank/klanten', '18 dossiers'],
          ['kennisbank/prijzen', '4 documenten'],
          ['kennisbank/voorwaarden', '2 documenten'],
        ].map(([path, meta]) => (
          <div key={path} className="spread">
            <span
              className="mono"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--fg-dim)' }}
            >
              <span style={{ color: 'var(--accent)', display: 'inline-flex' }}>
                <IconFolder size={14} aria-hidden />
              </span>
              {path}
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
