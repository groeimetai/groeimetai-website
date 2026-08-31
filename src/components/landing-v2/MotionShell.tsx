'use client';

import type { ReactNode } from 'react';
import { useSiteMotion, type FrameState, type MotionLevel } from '@/hooks/useSiteMotion';

export interface MotionShellProps {
  children: ReactNode;
  /** 'full' (default), 'subtle' (0.45x) or 'off'. `prefers-reduced-motion` forces off. */
  motionLevel?: MotionLevel;
  /** The cursor-following spotlight. */
  spotlight?: boolean;
  /** Per-page choreography, called once per animation frame. */
  onFrame?: (state: FrameState) => void;
}

/**
 * The fixed layers every marketing page shares, plus the motion loop.
 *
 * z-order: backdrop 0 · spotlight 1 · page content 2 · nav 50 · progress 60.
 * The backdrop is a fixed sheet whose colour is lerped between the dark and the
 * paper ground by scroll position, so a `<Section light>` band reads as the whole
 * viewport changing rather than a stripe sliding past.
 *
 * Sections that should pull the page toward paper carry `data-band="paper"`.
 */
export function MotionShell({ children, motionLevel, spotlight, onFrame }: MotionShellProps) {
  useSiteMotion({ motionLevel, spotlight, onFrame });

  return (
    <div data-r="root">
      <div
        data-r="backdrop"
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          background: 'var(--bg)',
          transition: 'background .5s linear',
          pointerEvents: 'none',
        }}
      />
      <div
        data-r="spot"
        aria-hidden
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 1,
          width: 760,
          height: 760,
          marginLeft: -380,
          marginTop: -380,
          borderRadius: '50%',
          opacity: 0,
          pointerEvents: 'none',
          filter: 'blur(10px)',
          background:
            'radial-gradient(circle, rgba(255,112,20,.13), rgba(255,112,20,.04) 42%, transparent 68%)',
        }}
      />
      <div
        aria-hidden
        style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 2, zIndex: 60 }}
      >
        <div
          data-r="prog"
          style={{
            height: '100%',
            width: '0%',
            background:
              'linear-gradient(90deg, var(--accent-deep), var(--accent), var(--accent-hot))',
            boxShadow: '0 0 12px var(--accent)',
          }}
        />
      </div>
      <div style={{ position: 'relative', zIndex: 2 }}>{children}</div>
    </div>
  );
}

export default MotionShell;
