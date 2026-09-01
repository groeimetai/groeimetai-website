import type { ReactNode } from 'react';
import { Btn, IconInstructions, Tag } from '@/components/ds';

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
            <IconInstructions size={s} aria-hidden />
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
      <div className="spread">
        <span
          className="mono"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--fg)' }}
        >
          <span style={{ color: 'var(--accent)', display: 'inline-flex' }}>
            <IconInstructions size={20} aria-hidden />
          </span>
          INSTRUCTIES.md
        </span>
        <Tag>02 / instructies</Tag>
      </div>
      <h4 style={{ marginTop: 18, fontSize: 18 }}>Eén korte, scherpe rolomschrijving</h4>
      <p style={{ marginTop: 10, fontSize: 15 }}>
        Wat mag de agent wel, wat niet, en in welke toon? Eén pagina die een collega in een minuut
        leest en die de agent letterlijk volgt.
      </p>
      <div className="divider" style={{ margin: '20px 0 16px' }} />
      <div style={{ display: 'grid', gap: 10 }}>
        {[
          'Doel en grenzen — waar stopt de agent',
          'Toon en stijl — nuchter, geen verkooppraat',
          'Wanneer terug naar een mens',
        ].map((line) => (
          <span
            key={line}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--fg-dim)' }}
          >
            <span style={{ color: 'var(--fg-mute)', display: 'inline-flex' }}>
              <IconInstructions size={16} aria-hidden />
            </span>
            {line}
          </span>
        ))}
      </div>
      <div style={{ marginTop: 22 }}>
        <Btn variant="ghost">
          <IconInstructions size={14} aria-hidden /> Bekijk een voorbeeld
        </Btn>
      </div>
    </div>
  </Frame>
);
