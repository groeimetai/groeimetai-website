import { Fragment } from 'react';

const DEFAULT_LOGOS = ['ABN AMRO', 'NS', 'DIM Haarlem', 'NovaSkin'];

export function LogoBar({
  logos = DEFAULT_LOGOS,
  more,
}: {
  logos?: string[];
  /** Optional dimmed "+ … (NDA / more / etc.)" tail, separated by the same · */
  more?: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px 28px',
      }}
    >
      {logos.map((l, i) => (
        <Fragment key={`logo-${i}`}>
          {i > 0 && (
            <span aria-hidden style={{ color: 'var(--fg-mute)', opacity: 0.4, fontSize: 18 }}>
              ·
            </span>
          )}
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 500,
              fontSize: 'clamp(20px, 2.4vw, 28px)',
              letterSpacing: '-0.02em',
              color: 'var(--fg)',
              whiteSpace: 'nowrap',
            }}
          >
            {l}
          </div>
        </Fragment>
      ))}
      {more && (
        <Fragment>
          <span aria-hidden style={{ color: 'var(--fg-mute)', opacity: 0.4, fontSize: 18 }}>
            ·
          </span>
          <div
            className="mono"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'clamp(11px, 1.1vw, 13px)',
              color: 'var(--fg-mute)',
              letterSpacing: '0.02em',
              whiteSpace: 'nowrap',
            }}
            title="Andere klanten/opdrachten die we vanwege NDA niet bij naam noemen"
          >
            {more}
          </div>
        </Fragment>
      )}
    </div>
  );
}

export default LogoBar;
