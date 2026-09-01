import type { ReactNode } from 'react';
import { Btn, IconPhone } from '@/components/ds';

const Frame = ({ children }: { children: ReactNode }) => (
  <div style={{ padding: '28px 24px' }}>{children}</div>
);

const SCALE: { size: number; role: string }[] = [
  { size: 16, role: 'inline' },
  { size: 24, role: 'lijstrij' },
  { size: 32, role: 'kaart' },
  { size: 48, role: 'accent' },
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
            <IconPhone size={size} aria-hidden />
          </div>
          <div className="mono" style={{ fontSize: 12, color: 'var(--fg-dim)' }}>
            {size}px
          </div>
          <div
            className="mono"
            style={{
              fontSize: 10,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--fg-mute)',
            }}
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
    <div style={{ maxWidth: 520 }}>
      <div className="contact-line" style={{ cursor: 'default' }}>
        <div className="contact-line-icon">
          <IconPhone size={18} aria-hidden />
        </div>
        <div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--fg-mute)' }}>
            TELEFOON
          </div>
          <div style={{ fontSize: 18, marginTop: 4 }}>+31 6 8173 9018</div>
        </div>
      </div>

      <p style={{ fontSize: 14, marginTop: 20, color: 'var(--fg-dim)' }}>
        Liever meteen even sparren? Bellen mag. Je spreekt Niels, geen tussenpersoon — en als een
        andere partij beter past, zeg ik dat gewoon.
      </p>

      <div className="row" style={{ gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
        <Btn variant="ghost" href="tel:+31681739018">
          <IconPhone size={14} aria-hidden /> Bel direct
        </Btn>
        <span
          className="mono"
          style={{ fontSize: 11, color: 'var(--fg-mute)', alignSelf: 'center' }}
        >
          ma–vr · 09:00–17:30
        </span>
      </div>
    </div>
  </Frame>
);
