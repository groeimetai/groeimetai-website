import type { ReactNode } from 'react';
import { Wordmark, Section, Eyebrow } from '@/components/ds';

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

export const Maten = () => (
  <Frame>
    <div style={{ display: 'grid', gap: 28 }}>
      {[17, 21.5, 32, 48].map((s) => (
        <div key={s}>
          <Wordmark size={s} />
          <Caption>{s}px</Caption>
        </div>
      ))}
    </div>
  </Frame>
);

export const OpPapier = () => (
  <Section light tight>
    <Eyebrow>Op de papieren ondergrond</Eyebrow>
    <div style={{ marginTop: 24 }}>
      <Wordmark size={32} color="var(--ink)" />
    </div>
    <p className="lead" style={{ marginTop: 20, maxWidth: '48ch' }}>
      Alleen &ldquo;Groeimet&rdquo; volgt de tekstkleur. De &ldquo;AI&rdquo; blijft altijd het
      accent — dat is de enige plek waar het oranje in het woordmerk zit.
    </p>
  </Section>
);
