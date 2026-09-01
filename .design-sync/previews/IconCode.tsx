import type { ReactNode } from 'react';
import { Btn, Eyebrow, IconCode } from '@/components/ds';

const Frame = ({ children }: { children: ReactNode }) => (
  <div style={{ padding: '28px 24px' }}>{children}</div>
);

const SCALE: { size: number; role: string }[] = [
  { size: 16, role: 'inline' },
  { size: 24, role: 'lijstrij' },
  { size: 32, role: 'kaart' },
  { size: 48, role: 'accent' },
];

const STACK = ['TypeScript', 'Next.js', 'MCP', 'Exact Online', 'Slack', 'Microsoft 365'];

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
            <IconCode size={size} aria-hidden />
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
    <div style={{ maxWidth: 600 }}>
      <Eyebrow>Integraties</Eyebrow>
      <h3 style={{ fontSize: 24, marginTop: 14 }}>Op jouw stack, zonder lock-in.</h3>
      <p className="lead" style={{ marginTop: 12, maxWidth: '54ch' }}>
        Koppelingen schrijven we in de taal die je team al onderhoudt. Elke tool call staat in je
        eigen repo, met de rechten die de taak nodig heeft — niet meer.
      </p>

      <div
        className="row"
        style={{ gap: 8, marginTop: 22, flexWrap: 'wrap', alignItems: 'center' }}
      >
        <span style={{ color: 'var(--accent)', display: 'inline-flex' }}>
          <IconCode size={18} aria-hidden />
        </span>
        {STACK.map((s) => (
          <span key={s} className="stack-pill mono">
            {s}
          </span>
        ))}
      </div>

      <div className="divider" style={{ margin: '22px 0' }} />

      <div className="row" style={{ gap: 12, flexWrap: 'wrap' }}>
        <Btn variant="ghost" href="/agents">
          <IconCode size={14} aria-hidden /> Bekijk de opzet
        </Btn>
        <span
          className="mono"
          style={{ fontSize: 11, color: 'var(--fg-mute)', alignSelf: 'center' }}
        >
          jullie dev reviewt elke pull request
        </span>
      </div>
    </div>
  </Frame>
);
