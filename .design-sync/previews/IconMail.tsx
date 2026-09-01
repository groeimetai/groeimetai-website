import type { ReactNode } from 'react';
import { Btn, Eyebrow, IconMail } from '@/components/ds';

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
            <IconMail size={size} />
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
    <div style={{ maxWidth: 520 }}>
      <Eyebrow>Direct contact</Eyebrow>
      <h4 style={{ fontSize: 20, marginTop: 12 }}>Liever eerst even mailen</h4>
      <p style={{ fontSize: 14, marginTop: 12, color: 'var(--fg-dim)', maxWidth: '48ch' }}>
        Schrijf in drie regels waar jullie nu vastlopen. Je krijgt binnen één werkdag antwoord van
        Niels zelf.
      </p>
      <div className="contact-line" style={{ marginTop: 20 }}>
        <div className="contact-line-icon">
          <IconMail size={18} aria-hidden />
        </div>
        <div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--fg-mute)' }}>
            E-MAIL
          </div>
          <div style={{ fontSize: 18, marginTop: 4 }}>info@groeimetai.io</div>
        </div>
      </div>
      <div className="row" style={{ marginTop: 20, gap: 12, flexWrap: 'wrap' }}>
        <Btn variant="ghost">
          <IconMail size={14} /> Stuur een bericht
        </Btn>
        <span className="mono" style={{ fontSize: 11, color: 'var(--fg-mute)' }}>
          REACTIE BINNEN 1 WERKDAG
        </span>
      </div>
    </div>
  </Frame>
);
