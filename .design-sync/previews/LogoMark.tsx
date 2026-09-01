import type { ReactNode } from 'react';
import { LogoMark, Btn } from '@/components/ds';

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

export const InDeNav = () => (
  <Frame>
    <div
      className="nav"
      style={{ position: 'static', border: '1px solid var(--line)', borderRadius: 12 }}
    >
      <div className="nav-inner" style={{ padding: '0 18px' }}>
        <div className="nav-brand">
          <LogoMark size={26} />
          GroeimetAI
        </div>
        <div className="nav-links" style={{ display: 'flex' }}>
          <a href="#aanpak">Aanpak</a>
          <a href="#trainingen" className="active">
            Trainingen
          </a>
          <a href="#cases">Cases</a>
          <a href="#contact">Contact</a>
        </div>
        <div className="nav-cta" style={{ display: 'flex' }}>
          <Btn variant="ghost">Plan een kennismaking</Btn>
        </div>
      </div>
    </div>
    <p style={{ marginTop: 20 }}>
      In de nav staat de mark op 26px, met 10px lucht tot het woordmerk.
    </p>
  </Frame>
);

export const Groot = () => (
  <Frame>
    <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
      <LogoMark size={112} />
      <div>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 500,
            fontSize: 46,
            letterSpacing: '-0.03em',
            color: 'var(--fg)',
            lineHeight: 1,
          }}
        >
          GroeimetAI
        </div>
        <p style={{ marginTop: 14, maxWidth: '32ch' }}>
          AI-training, strategie en adoptie voor Nederlandse mkb-teams. Van eerste sessie tot
          dagelijks gebruik.
        </p>
      </div>
    </div>
    <div className="divider" style={{ marginTop: 28 }} />
    <div className="spread" style={{ marginTop: 16 }}>
      <div className="mono" style={{ fontSize: 11, color: 'var(--fg-mute)' }}>
        © 2026 GroeimetAI · KvK 90102304
      </div>
      <div className="mono" style={{ fontSize: 11, color: 'var(--fg-mute)' }}>
        Geen hype. Geen lock-in als standaard.
      </div>
    </div>
  </Frame>
);

export const Maten = () => (
  <Frame>
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 44 }}>
      {[20, 26, 32, 48, 72].map((s) => (
        <div key={s} style={{ textAlign: 'center' }}>
          <LogoMark size={s} />
          <Caption>{s}px</Caption>
        </div>
      ))}
    </div>
    <p style={{ marginTop: 28, maxWidth: '54ch' }}>
      De nav gebruikt 26px, de footer 32px. Onder de 20px loopt de folderlijn tegen de node aan en
      wordt het vlak een oranje blokje.
    </p>
  </Frame>
);

export const KleurVarianten = () => (
  <Frame>
    <div className="row" style={{ gap: 44, alignItems: 'flex-end', flexWrap: 'wrap' }}>
      <div style={{ textAlign: 'center' }}>
        <LogoMark size={72} />
        <Caption>standaard — brackets erven currentColor</Caption>
      </div>
      <div style={{ textAlign: 'center' }}>
        <LogoMark size={72} bracket="var(--accent)" folder="var(--accent-deep)" />
        <Caption>bracket + folder — één tint</Caption>
      </div>
      <div
        style={{
          textAlign: 'center',
          background: 'var(--accent)',
          padding: '18px 22px',
          borderRadius: 'var(--r-md)',
        }}
      >
        <LogoMark size={72} bracket="#1a0d05" folder="#1a0d05" />
        <Caption>knockout op accent</Caption>
      </div>
    </div>
  </Frame>
);

export const Compact = () => (
  <Frame>
    <div className="row" style={{ gap: 40, alignItems: 'flex-end', flexWrap: 'wrap' }}>
      {[14, 18, 24].map((s) => (
        <div key={s} style={{ textAlign: 'center' }}>
          <LogoMark size={s} compact />
          <Caption>{s}px compact</Caption>
        </div>
      ))}
      <div style={{ textAlign: 'center' }}>
        <LogoMark size={18} />
        <Caption>18px zonder compact — de tab valt dicht</Caption>
      </div>
    </div>
  </Frame>
);
