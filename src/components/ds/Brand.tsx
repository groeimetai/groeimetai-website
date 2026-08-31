import type { CSSProperties } from 'react';

/**
 * The GroeimetAI brand mark: open square brackets around a folder.
 *
 * The brackets are never closed — the box is open, you can see in. The folder is
 * what's inside. One accent colour, used once, and only on the inside.
 *
 * Rendered as inline SVG rather than an `<img>` on purpose: an `<img>` cannot
 * see the page's CSS custom properties, which is exactly why the previous
 * wordmark rendered black-on-black in the nav (it referenced `.logo-text` /
 * `.text` classes that never loaded inside the image).
 *
 * Geometry is on a 32-unit grid. See design_handoff_website_2026/logo/README.md.
 */

export interface LogoMarkProps {
  /** Rendered size in px. Default 28. Below 24 use `compact`. */
  size?: number;
  /**
   * Bracket colour. Defaults to `currentColor`, so the mark inherits the
   * surrounding text colour and works on both the dark and the paper surface
   * without a variant prop.
   */
  bracket?: string;
  /** Folder colour. The one place the accent is allowed. */
  folder?: string;
  /**
   * Heavier brackets and a larger folder, for 14–24px. The tab is redrawn
   * bigger so it survives at small sizes.
   */
  compact?: boolean;
  className?: string;
  style?: CSSProperties;
  title?: string;
}

const PRIMARY = {
  left: 'M4 5h6.5v3H7v16h3.5v3H4V5z',
  right: 'M28 5h-6.5v3H25v16h-3.5v3h6.5V5z',
  folder:
    'M10.9 10.7H13.7a0.9 0.9 0 0 1 0.9 0.9V12.6a0.7 0.7 0 0 0 0.7 0.7H20.7a1.3 1.3 0 0 1 1.3 1.3V20a1.3 1.3 0 0 1-1.3 1.3H11.3A1.3 1.3 0 0 1 10 20V11.6a0.9 0.9 0 0 1 0.9-0.9z',
};

const COMPACT = {
  left: 'M3 4h7v3.5H6.5v17H10V28H3V4z',
  right: 'M29 4h-7v3.5h3.5v17H22V28h7V4z',
  folder:
    'M10.6 10.3H14.4a1.1 1.1 0 0 1 1.1 1.1V12.9a0.8 0.8 0 0 0 0.8 0.8H20.9a1.6 1.6 0 0 1 1.6 1.6V20.1a1.6 1.6 0 0 1-1.6 1.6H11.1a1.6 1.6 0 0 1-1.6-1.6V11.4a1.1 1.1 0 0 1 1.1-1.1z',
};

export function LogoMark({
  size = 28,
  bracket = 'currentColor',
  folder = 'var(--accent)',
  compact = false,
  className,
  style,
  title,
}: LogoMarkProps) {
  const d = compact ? COMPACT : PRIMARY;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      style={{ display: 'block', flexShrink: 0, ...style }}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      <path d={d.left} fill={bracket} />
      <path d={d.right} fill={bracket} />
      <path d={d.folder} fill={folder} />
    </svg>
  );
}

export interface WordmarkProps {
  /** Font size in px. Default 21.5, the size used in the horizontal lockup. */
  size?: number;
  /** Colour of "Groeimet". "AI" is always the accent. */
  color?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * "Groeimet" in the foreground colour, "AI" in the accent — the two-part
 * colouring the original wordmark had, but as live text so it inherits the
 * loaded Geist rather than depending on a font being available inside an SVG.
 */
export function Wordmark({ size = 21.5, color = 'currentColor', className, style }: WordmarkProps) {
  return (
    <span
      className={className}
      style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 500,
        fontSize: size,
        letterSpacing: '-0.02em',
        lineHeight: 1,
        color,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      Groeimet<span style={{ color: 'var(--accent)' }}>AI</span>
    </span>
  );
}

export interface LogoProps {
  /** Mark size in px; the wordmark and gap scale from it. Default 32. */
  size?: number;
  /** Stacked puts the wordmark under the mark, both centred. */
  stacked?: boolean;
  /** Use the compact mark. Set automatically below 24px. */
  compact?: boolean;
  color?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Mark + wordmark lockup. Horizontal gap is 0.4x the mark height, stacked is
 * 0.35x — the ratios from the brand pack.
 */
export function Logo({ size = 32, stacked = false, compact, color, className, style }: LogoProps) {
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        flexDirection: stacked ? 'column' : 'row',
        alignItems: 'center',
        gap: size * (stacked ? 0.35 : 0.4),
        color,
        ...style,
      }}
    >
      <LogoMark size={size} compact={compact ?? size < 24} />
      <Wordmark size={size * 0.672} />
    </span>
  );
}

export default LogoMark;
