import type { ReactNode } from 'react';
import { Btn, IconLock } from '@/components/ds';

const Frame = ({ children }: { children: ReactNode }) => (
  <div style={{ padding: '28px 24px' }}>{children}</div>
);

const SCALE: { size: number; role: string }[] = [
  { size: 16, role: 'inline' },
  { size: 24, role: 'lijstrij' },
  { size: 32, role: 'kaart' },
  { size: 48, role: 'accent' },
];

const AFSPRAKEN = [
  'Per tool ligt vast wie hem mag aanroepen en wie goedkeurt',
  'Financiële data blijft lokaal — niets naar een externe dienst',
  'Audit log per tool call, inclusief wie er akkoord gaf',
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
            <IconLock size={size} />
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
      <div className="row" style={{ gap: 12 }}>
        <span style={{ color: 'var(--accent)', display: 'inline-flex' }}>
          <IconLock size={24} aria-hidden />
        </span>
        <h4 style={{ fontSize: 18 }}>Toegang en vertrouwelijke data</h4>
      </div>
      <p style={{ fontSize: 14, marginTop: 14, color: 'var(--fg-dim)', maxWidth: '52ch' }}>
        Een agent krijgt alleen de rechten die de taak nodig heeft. Wat je aan afspraken vastlegt vóór
        de eerste koppeling, hoef je later niet terug te draaien.
      </p>
      <div className="checklist">
        {AFSPRAKEN.map((a) => (
          <div className="checklist-item" key={a}>
            <span className="x">
              <IconLock size={12} aria-hidden />
            </span>
            <span style={{ fontSize: 14 }}>{a}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 24 }}>
        <Btn variant="primary">
          <IconLock size={14} aria-hidden /> Inloggen op de klantomgeving
        </Btn>
      </div>
    </div>
  </Frame>
);
