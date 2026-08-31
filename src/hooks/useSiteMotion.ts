'use client';

import { useEffect, useRef } from 'react';

/**
 * Shared scroll-motion controller for the marketing pages.
 *
 * One rAF loop drives parallax, the paper-band backdrop crossfade, the cursor
 * spotlight, magnetic buttons, card tilt, word-by-word highlight and the top
 * progress bar. Pages add their own choreography through `onFrame`.
 *
 * Ported from design_handoff_website_2026/design/site-motion.js. Deliberately
 * kept as one init/destroy pair driving the DOM directly: scroll progress must
 * never go through React state, or every frame re-renders the page.
 */

export type MotionLevel = 'full' | 'subtle' | 'off';

export interface FrameState {
  /** Current scrollY. */
  y: number;
  /** Viewport height. */
  vh: number;
  /** Motion multiplier: 1 full, 0.45 subtle, 0 off/reduced. */
  k: number;
  /** Damped 0..1 paper-band blend, so page choreography can follow the backdrop. */
  paper: number;
  clamp01: (v: number) => number;
}

export interface SiteMotionOptions {
  motionLevel?: MotionLevel;
  spotlight?: boolean;
  /** Per-page choreography, called once per frame. Keep it allocation-free. */
  onFrame?: (state: FrameState) => void;
  /** Re-initialise when this changes (e.g. after a route swap). */
  deps?: unknown[];
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const DARK: [number, number, number] = [10, 10, 11];
const PAPER: [number, number, number] = [246, 243, 236];

export function useSiteMotion(opts: SiteMotionOptions = {}) {
  const { motionLevel = 'full', spotlight = true, onFrame } = opts;
  // Keep the latest onFrame without re-initialising the loop every render.
  const frameRef = useRef(onFrame);
  frameRef.current = onFrame;

  useEffect(() => {
    const reduced =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches || motionLevel === 'off';
    const k = reduced ? 0 : motionLevel === 'subtle' ? 0.45 : 1;

    const qa = <T extends Element = Element>(s: string) =>
      Array.from(document.querySelectorAll<T>(s));
    const q = <T extends HTMLElement = HTMLElement>(s: string) =>
      document.querySelector<T>(`[data-r="${s}"]`);

    const el = {
      backdrop: q('backdrop'),
      spot: q('spot'),
      prog: q('prog'),
      nav: q('nav'),
    };
    const parallax = qa<HTMLElement>('[data-parallax]').map((n) => ({
      n,
      f: parseFloat(n.dataset.parallax || '') || 0.1,
    }));
    const paperBands = qa('[data-band="paper"]');
    const mags = qa<HTMLElement>('[data-mag]');
    const tilts = qa<HTMLElement>('[data-tilt]');
    const wordGroups = qa<HTMLElement>('[data-words]').map((h) => ({
      h,
      w: Array.from(h.querySelectorAll<HTMLElement>('[data-w]')),
    }));

    if (reduced) document.querySelector('[data-r="root"]')?.setAttribute('data-nomotion', '');

    wordGroups.forEach(({ w }) =>
      w.forEach((s) => {
        s.style.display = 'inline-block';
        s.style.transition = 'opacity .5s linear';
        if (k) s.style.opacity = '0.26';
      })
    );

    let io: IntersectionObserver | null = null;
    const revealTargets = qa<HTMLElement>('[data-reveal]');
    if (!k) {
      revealTargets.forEach((n) => {
        n.style.opacity = '1';
        n.style.transform = 'none';
      });
    } else {
      io = new IntersectionObserver(
        (es) => {
          es.forEach((e) => {
            if (!e.isIntersecting) return;
            const t = e.target as HTMLElement;
            t.style.opacity = '1';
            t.style.transform = 'none';
            io?.unobserve(t);
          });
        },
        { rootMargin: '0px 0px -12% 0px', threshold: 0.08 }
      );
      revealTargets.forEach((n) => io?.observe(n));
    }

    const ptr = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      sx: window.innerWidth / 2,
      sy: window.innerHeight / 2,
    };

    function onPointer(e: PointerEvent) {
      ptr.x = e.clientX;
      ptr.y = e.clientY;
      if (!k) return;
      if (spotlight && el.spot) el.spot.style.opacity = '1';
      for (const m of mags) {
        const soft = m.dataset.mag === 'soft';
        const r = m.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        const d = Math.hypot(dx, dy);
        const reach = soft ? Math.max(r.width * 0.7, 74) : Math.max(r.width, 150);
        if (d < reach) {
          const f = (1 - d / reach) * (soft ? 3.2 : 11) * k;
          m.style.transform = `translate(${(dx / d || 0) * f}px,${(dy / d || 0) * f}px)`;
        } else if (m.style.transform) {
          m.style.transform = '';
        }
      }
      for (const t of tilts) {
        const r = t.getBoundingClientRect();
        if (
          e.clientX > r.left - 40 &&
          e.clientX < r.right + 40 &&
          e.clientY > r.top - 40 &&
          e.clientY < r.bottom + 40
        ) {
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          t.style.transform = `perspective(900px) rotateY(${px * 5 * k}deg) rotateX(${-py * 5 * k}deg) translateY(-3px)`;
        } else if (t.style.transform && t.style.transform.indexOf('perspective') === 0) {
          t.style.transform = 'none';
        }
      }
    }
    window.addEventListener('pointermove', onPointer, { passive: true });

    let raf = 0;
    let paperSmoothed: number | undefined;
    let alive = true;

    function tick() {
      if (!alive) return;
      raf = requestAnimationFrame(tick);
      const vh = window.innerHeight;
      const y = window.scrollY || document.documentElement.scrollTop || 0;

      const max = Math.max(1, document.documentElement.scrollHeight - vh);
      if (el.prog) el.prog.style.width = `${(clamp01(y / max) * 100).toFixed(2)}%`;

      if (k) for (const p of parallax) p.n.style.transform = `translate3d(0,${y * p.f * k}px,0)`;

      let paper = 0;
      for (const b of paperBands) {
        const r = b.getBoundingClientRect();
        paper = Math.max(
          paper,
          Math.min(
            clamp01((vh * 0.8 - r.top) / (vh * 0.45)),
            clamp01((r.bottom - vh * 0.2) / (vh * 0.45))
          )
        );
      }
      if (paperSmoothed === undefined) paperSmoothed = paper;
      paperSmoothed += (paper - paperSmoothed) * 0.14;
      const p = paperSmoothed;
      if (el.backdrop) {
        el.backdrop.style.background = `rgb(${Math.round(mix(DARK[0], PAPER[0], p))},${Math.round(
          mix(DARK[1], PAPER[1], p)
        )},${Math.round(mix(DARK[2], PAPER[2], p))})`;
      }
      if (el.nav) {
        el.nav.style.background = `rgba(10,10,11,${(0.74 + p * 0.16).toFixed(3)})`;
        el.nav.style.borderBottomColor = p > 0.5 ? 'rgba(255,255,255,.1)' : '#26262d';
      }
      if (el.spot) {
        el.spot.style.opacity = !spotlight || !k ? '0' : String(0.85 - p * 0.45);
        if (k) {
          ptr.sx += (ptr.x - ptr.sx) * 0.1;
          ptr.sy += (ptr.y - ptr.sy) * 0.1;
          el.spot.style.transform = `translate3d(${ptr.sx}px,${ptr.sy}px,0)`;
        }
      }

      if (k)
        for (const g of wordGroups) {
          const r = g.h.getBoundingClientRect();
          const t = clamp01((vh * 0.78 - r.top) / Math.max(120, r.height + vh * 0.2));
          const n = g.w.length;
          for (let i = 0; i < n; i++)
            g.w[i].style.opacity = String(0.26 + clamp01(t * (n + 3) - i) * 0.74);
        }

      frameRef.current?.({ y, vh, k, paper: p, clamp01 });
    }
    raf = requestAnimationFrame(tick);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      io?.disconnect();
      window.removeEventListener('pointermove', onPointer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [motionLevel, spotlight, ...(opts.deps ?? [])]);
}
