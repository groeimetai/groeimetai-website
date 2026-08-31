import type { ReactNode } from 'react';
import { Eyebrow, IconWrench } from '@/components/ds';

const Frame = ({ children }: { children: ReactNode }) => (
  <div style={{ padding: '28px 24px' }}>{children}</div>
);

const SCALE: { size: number; role: string }[] = [
  { size: 16, role: 'inline' },
  { size: 24, role: 'lijstrij' },
  { size: 32, role: 'kaart' },
  { size: 48, role: 'accent' },
];

const RUNBOOK = [
  'Promptversies bijstellen zodra het proces of het model verandert',
  'Tool-permissies opnieuw langslopen bij elke nieuwe koppeling',
  'Kwartaalcheck: welke stappen kunnen eruit, welke moeten terug naar een mens',
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
            <IconWrench size={size} />
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
    <div className="row" style={{ gap: 16 }}>
      <div className="approach-icon" style={{ marginBottom: 0, flexShrink: 0 }}>
        <IconWrench size={22} />
      </div>
      <div>
        <Eyebrow>Fase 04 · Borgen</Eyebrow>
        <h3 style={{ fontSize: 24, marginTop: 8 }}>Onderhoud en bijsturen</h3>
      </div>
    </div>
    <p className="lead" style={{ fontSize: 16, marginTop: 18, maxWidth: '58ch' }}>
      Een herontworpen workflow is nooit af. Dit staat in het runbook dat je team na de overdracht
      zelf beheert.
    </p>
    <div className="divider" style={{ margin: '24px 0 18px', maxWidth: 700 }} />
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 14, maxWidth: 700 }}>
      {RUNBOOK.map((item) => (
        <li key={item} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <span style={{ color: 'var(--accent)', display: 'inline-flex', marginTop: 1 }}>
            <IconWrench size={16} aria-hidden />
          </span>
          <span style={{ fontSize: 14, color: 'var(--fg-dim)' }}>{item}</span>
        </li>
      ))}
    </ul>
  </Frame>
);
