import type { ReactNode } from 'react';
import { Btn, IconGithub } from '@/components/ds';

const Frame = ({ children }: { children: ReactNode }) => (
  <div style={{ padding: '28px 24px' }}>{children}</div>
);

const SCALE: { size: number; role: string }[] = [
  { size: 16, role: 'inline' },
  { size: 24, role: 'lijstrij' },
  { size: 32, role: 'kaart' },
  { size: 48, role: 'accent' },
];

const REPO: [string, string][] = [
  ['knowledge/*.md', 'wat de agent weet'],
  ['instructions.md', 'hoe de agent denkt'],
  ['tools/*.ts', 'wat de agent mag doen'],
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
            <IconGithub size={size} aria-hidden />
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
    <div style={{ maxWidth: 580 }}>
      <div className="card">
        <div className="row" style={{ gap: 12 }}>
          <span style={{ color: 'var(--accent)', display: 'inline-flex' }}>
            <IconGithub size={24} aria-hidden />
          </span>
          <h4 style={{ fontSize: 18 }}>Alles staat in jullie eigen repo</h4>
        </div>
        <p style={{ fontSize: 14, marginTop: 12, color: 'var(--fg-dim)', maxWidth: '52ch' }}>
          Geen black box en geen lock-in. Een agent is drie dingen in git: een folder met kennis,
          één leesbaar instructiedocument en tool calls in je eigen code.
        </p>
        <div className="divider" style={{ margin: '18px 0 4px' }} />
        {REPO.map(([pad, wat], i) => (
          <div
            key={pad}
            className="spread"
            style={{
              padding: '11px 0',
              borderBottom: i === REPO.length - 1 ? 'none' : '1px solid var(--line)',
            }}
          >
            <span
              className="mono"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 13 }}
            >
              <span style={{ color: 'var(--fg-mute)', display: 'inline-flex' }}>
                <IconGithub size={14} aria-hidden />
              </span>
              {pad}
            </span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--fg-mute)' }}>
              {wat}
            </span>
          </div>
        ))}
      </div>

      <div className="row" style={{ gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
        <Btn variant="ghost" href="https://github.com/serac-labs/serac">
          <IconGithub size={14} aria-hidden /> Serac
        </Btn>
        <span
          className="mono"
          style={{ fontSize: 11, color: 'var(--fg-mute)', alignSelf: 'center' }}
        >
          open source · je mag meelezen
        </span>
      </div>
    </div>
  </Frame>
);
