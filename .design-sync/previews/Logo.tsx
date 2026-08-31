import type { ReactNode } from 'react';
import { Logo, Section, Eyebrow } from '@/components/ds';

const Frame = ({ children }: { children: ReactNode }) => (
  <div style={{ padding: '36px 28px' }}>{children}</div>
);

const Caption = ({ children }: { children: ReactNode }) => (
  <div
    className="mono"
    style={{ fontSize: 11, color: 'var(--fg-mute)', letterSpacing: '0.02em', marginTop: 12 }}
  >
    {children}
  </div>
);

export const Horizontaal = () => (
  <Frame>
    <div style={{ display: 'grid', gap: 32 }}>
      {[24, 32, 48].map((s) => (
        <div key={s}>
          <Logo size={s} />
          <Caption>size={s} — tussenruimte is 0,4x de merkhoogte</Caption>
        </div>
      ))}
    </div>
  </Frame>
);

export const Gestapeld = () => (
  <Frame>
    <div className="row" style={{ gap: 56, alignItems: 'flex-end' }}>
      <div style={{ textAlign: 'center' }}>
        <Logo size={40} stacked />
        <Caption>stacked — 0,35x</Caption>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Logo size={64} stacked />
        <Caption>stacked, groot</Caption>
      </div>
    </div>
  </Frame>
);

export const OpPapier = () => (
  <Section light tight>
    <Eyebrow>Lockup op papier</Eyebrow>
    <div style={{ marginTop: 24, color: 'var(--ink)' }}>
      <Logo size={40} />
    </div>
    <p className="lead" style={{ marginTop: 20, maxWidth: '46ch' }}>
      De brackets erven de tekstkleur, dus dezelfde component werkt op beide ondergronden zonder
      variant-prop. Minimaal 96px breed voor de horizontale lockup.
    </p>
  </Section>
);
