import type { ReactNode } from 'react';
import { IconTool } from '@/components/ds';

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
            <IconTool size={s} aria-hidden />
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
      <div className="mono" style={{ fontSize: 11, color: 'var(--fg-mute)' }}>
        03 / TOOLS
      </div>
      <h4 style={{ marginTop: 8, fontSize: 18 }}>Wat de agent daadwerkelijk mag doen</h4>
      <p style={{ marginTop: 10, fontSize: 15 }}>
        Elke actie staat op naam, met de grens erbij. Niets meer dan nodig, en alles achteraf terug
        te lezen in het logboek.
      </p>
      <div className="divider" style={{ margin: '20px 0 4px' }} />
      {[
        ['offerte.opstellen', 'concept — mens keurt goed'],
        ['crm.zoeken', 'alleen lezen'],
        ['agenda.plannen', 'max 3 afspraken per dag'],
      ].map(([tool, limit], i, all) => (
        <div
          key={tool}
          className="spread"
          style={{
            padding: '12px 0',
            borderBottom: i === all.length - 1 ? 'none' : '1px solid var(--line)',
          }}
        >
          <span
            className="mono"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--fg)' }}
          >
            <span style={{ color: 'var(--accent)', display: 'inline-flex' }}>
              <IconTool size={16} aria-hidden />
            </span>
            {tool}
          </span>
          <span className="mono" style={{ fontSize: 11, color: 'var(--fg-mute)' }}>
            {limit}
          </span>
        </div>
      ))}
    </div>
  </Frame>
);
