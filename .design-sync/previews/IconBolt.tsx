import type { ReactNode } from 'react';
import { Eyebrow, IconBolt, Tag } from '@/components/ds';

const Frame = ({ children }: { children: ReactNode }) => (
  <div style={{ padding: '28px 24px' }}>{children}</div>
);

const SCALE: { size: number; role: string }[] = [
  { size: 16, role: 'inline' },
  { size: 24, role: 'lijstrij' },
  { size: 32, role: 'kaart' },
  { size: 48, role: 'accent' },
];

const QUICK_WINS = [
  {
    title: 'Verslag en actielijst uit de opname',
    body: 'Notulist draait mee in Teams. De projectleider controleert en verstuurt.',
    meta: '± 45 min per overleg',
  },
  {
    title: 'Eerste versie van de offertetekst',
    body: 'Getrokken uit het intakeformulier en drie eerdere offertes van jullie zelf.',
    meta: '± 2 uur per offerte',
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
            <IconBolt size={size} aria-hidden />
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
    <div style={{ maxWidth: 600 }}>
      <div className="spread">
        <div>
          <Eyebrow>Week 1 — 2</Eyebrow>
          <h3 style={{ fontSize: 22, marginTop: 10 }}>Twee taken die meteen tijd schelen</h3>
        </div>
        <Tag>Quick wins</Tag>
      </div>
      <p style={{ fontSize: 14, marginTop: 12, color: 'var(--fg-dim)', maxWidth: '56ch' }}>
        We beginnen bij werk dat vaak terugkomt en weinig risico draagt. Zo ziet het team resultaat
        voordat er ergens een integratie in productie staat.
      </p>
      <div style={{ display: 'grid', gap: 12, marginTop: 22 }}>
        {QUICK_WINS.map((w) => (
          <div key={w.title} className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <span
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: 'rgba(255, 90, 31, 0.12)',
                  color: 'var(--accent)',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                <IconBolt size={18} aria-hidden />
              </span>
              <div>
                <h4 style={{ fontSize: 16 }}>{w.title}</h4>
                <p style={{ fontSize: 13, marginTop: 6, color: 'var(--fg-dim)' }}>{w.body}</p>
                <div className="mono" style={{ fontSize: 11, marginTop: 10, color: 'var(--fg-mute)' }}>
                  Geschatte winst · {w.meta}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div
        className="row mono"
        style={{ marginTop: 20, gap: 8, fontSize: 11, color: 'var(--fg-mute)' }}
      >
        <IconBolt size={14} aria-hidden />
        Schattingen uit de intake, na twee weken opnieuw gemeten.
      </div>
    </div>
  </Frame>
);
