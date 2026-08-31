'use client';

import { Fragment, useCallback, useRef } from 'react';
import type { CSSProperties, Ref } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Btn, Eyebrow, Section, PillarCard, CaseCard, LogoBar, Stat } from '@/components/ds';
import { IconArrow } from '@/components/ds/icons';
import { AgentAnatomy } from '@/components/landing-v2/AgentAnatomy';
import { MotionShell } from '@/components/landing-v2/MotionShell';
import type { FrameState } from '@/hooks/useSiteMotion';
import type { MorphObjectHandle, MorphObjectProps } from '@/components/landing-v2/MorphObject';

/* The three.js object is client-only. next/dynamic swallows `ref` (it exposes
   its own retry handle), so the handle travels as a plain `handleRef` prop
   through a wrapper defined inside the loader. */
type MorphProps = MorphObjectProps & { handleRef?: Ref<MorphObjectHandle> };

const MorphObject = dynamic<MorphProps>(
  async () => {
    const mod = await import('@/components/landing-v2/MorphObject');
    const MorphObjectClient = ({ handleRef, ...rest }: MorphProps) => (
      <mod.MorphObject ref={handleRef} {...rest} />
    );
    MorphObjectClient.displayName = 'MorphObjectClient';
    return MorphObjectClient;
  },
  { ssr: false }
);

/* Everything inline styles cannot express: the load-in keyframes and the
   breakpoints. Scoped to .home-2026 so it cannot leak into the other pages.
   (The CSS files are owned by the design system and stay untouched.) */
const PAGE_CSS = `
@keyframes gmWIn {
  from { opacity: 0; transform: translateY(0.42em) rotate(1.2deg); filter: blur(6px); }
  to { opacity: 1; transform: none; filter: blur(0); }
}
@keyframes gmFIn {
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: none; }
}
@keyframes gmCueDrop {
  0%, 100% { transform: translateY(0); opacity: .35; }
  50% { transform: translateY(7px); opacity: 1; }
}
/* the hero pill's live dot — ds-pulse is already defined by the design system */
.home-2026 .hero .pill .dot { animation: ds-pulse 2s infinite; }
/* the drifting glow below replaces the static one baked into .cta-block */
.home-2026 .cta-block::before { display: none; }
@media (max-width: 900px) {
  .home-2026 [data-heroobj] { display: none !important; }
}
/* Homepage-only cta-block metrics: the prototype deliberately runs larger here
   than on the other five pages (70/56 vs 64/56, 760 vs 720, row 34 vs 32). */
.home-2026 .cta-block { padding: 70px 56px; }
.home-2026 .cta-block-inner { max-width: 760px; }
.home-2026 .cta-block .row { margin-top: 34px; }
@media (max-width: 900px) {
  .home-2026 .cta-block { padding: 44px 26px; }
}
@media (max-width: 1040px) {
  .home-2026 [data-morphgrid] { grid-template-columns: 1fr !important; gap: 0 !important; }
  .home-2026 [data-r="morphHolder"] {
    position: absolute !important; inset: 0 !important;
    width: 100% !important; height: 100% !important;
    opacity: .42; z-index: 0;
  }
  .home-2026 [data-morphcopy] { position: relative; z-index: 2; }
  .home-2026 [data-chrome] { display: none !important; }
  .home-2026 [data-r="bignums"] { font-size: 150px !important; opacity: .6; }
  .home-2026 [data-stagewrap] { min-height: 210px !important; }
  [data-home-hud] { display: none !important; }
}
@media (prefers-reduced-motion: reduce) {
  .home-2026 [data-anim] {
    animation: none !important; opacity: 1 !important;
    transform: none !important; filter: none !important;
  }
}
[data-nomotion] .home-2026 [data-anim] {
  animation: none !important; opacity: 1 !important;
  transform: none !important; filter: none !important;
}
`;

/** Start state for a `[data-reveal]` element — the loop only sets the end state. */
/* Pinned-section pacing.
 *
 * The three stages sit at t = 0, 0.5 and 1 over the 420vh track. Originally a
 * stage was fully legible at exactly one scroll position (o = 1 - |t-c|/0.3
 * peaks at a single point), so the text was only ever sharp in passing and you
 * could not comfortably stop on it.
 *
 * Now each stage gets a plateau: fully clear while |t-c| <= HOLD, then a short
 * ramp to zero at |t-c| = HOLD+FADE. With 0.15 + 0.10 that ramp ends exactly at
 * the midpoint between two stages, so stages never overlap and each one stays
 * readable across 30% of the track — roughly 126vh of scrolling.
 */
const STAGE_HOLD = 0.15;
const STAGE_FADE = 0.1;
/** Half-width of a stage: it owns the track from centre - SPAN to centre + SPAN. */
const STAGE_SPAN = STAGE_HOLD + STAGE_FADE;

/** Trapezoid: 1 on the plateau, linear ramp to 0 at HOLD + FADE. */
function stageClarity(t: number, centre: number): number {
  const d = Math.abs(t - centre) - STAGE_HOLD;
  if (d <= 0) return 1;
  const o = 1 - d / STAGE_FADE;
  return o < 0 ? 0 : o;
}

/**
 * Remaps raw scroll to the progress the 3D object gets, so the object rests on
 * its shape while a stage is being read and does its morph during the ramps.
 * Without this the text holds still while the composition keeps rearranging
 * behind it, which reads as two unrelated animations.
 */
function morphProgress(t: number): number {
  const a = STAGE_HOLD; // 0.15 — end of the first plateau
  const b = 0.5 - STAGE_HOLD; // 0.35 — start of the middle plateau
  const c = 0.5 + STAGE_HOLD; // 0.65 — end of the middle plateau
  const d = 1 - STAGE_HOLD; // 0.85 — start of the last plateau
  if (t <= a) return 0;
  if (t < b) return ((t - a) / (b - a)) * 0.5;
  if (t <= c) return 0.5;
  if (t < d) return 0.5 + ((t - c) / (d - c)) * 0.5;
  return 1;
}

const reveal = (delay = 0, dy = 24): CSSProperties => ({
  opacity: 0,
  transform: `translateY(${dy}px)`,
  transition: `opacity .8s var(--ease) ${delay}s, transform .8s var(--ease) ${delay}s`,
});

/** Wrapper for a magnetic button. */
const MAG: CSSProperties = {
  display: 'inline-flex',
  willChange: 'transform',
  transition: 'transform .3s var(--ease)',
};

/* Right-edge section HUD. Numerals rather than words: no translated labels
   exist for these yet (see needsOrchestrator), and a numeral index reads the
   same in both locales. The accessible name comes from a real string. */
const HUD_IDS = ['top', 'problem', 'anatomy', 'pillars', 'cases-preview', 'proof', 'cta'] as const;

export function HomePageView({ basePath }: { basePath: string }) {
  const t = useTranslations('redesign.home');
  const tn = useTranslations('redesign.nav');

  /* hero */
  const heroGlowRef = useRef<HTMLDivElement | null>(null);
  const heroGlow2Ref = useRef<HTMLDivElement | null>(null);
  const heroObjRef = useRef<HTMLDivElement | null>(null);

  /* pinned morph */
  const morph = useRef<MorphObjectHandle>(null);
  const morphTrackRef = useRef<HTMLElement | null>(null);
  const morphGridRef = useRef<HTMLDivElement | null>(null);
  const morphGlowRef = useRef<HTMLDivElement | null>(null);
  const morphScaleRef = useRef<HTMLDivElement | null>(null);
  const horizonRef = useRef<HTMLDivElement | null>(null);
  const pathOutRef = useRef<HTMLDivElement | null>(null);
  const stageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const numRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const barRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const stepRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const stageIdxRef = useRef(-1);

  /* horizontal cases rail */
  const casesTrackRef = useRef<HTMLElement | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);
  const caseIdxRef = useRef<HTMLSpanElement | null>(null);
  const caseRailRef = useRef<HTMLSpanElement | null>(null);
  const caseNumRef = useRef(-1);

  /* cta + hud */
  const ctaGlowRef = useRef<HTMLDivElement | null>(null);
  const hudRef = useRef<HTMLElement | null>(null);
  const hudDotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const hudLabelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const hudActiveRef = useRef(-1);
  const hudShownRef = useRef(-1);
  const hudPaperRef = useRef(-1);
  const sectionsRef = useRef<(HTMLElement | null)[] | null>(null);

  /* The mono readout under the 3D object swaps text per stage; keep the
     strings on a ref so the frame loop never has to touch React. */
  const pathsRef = useRef<string[]>([]);
  pathsRef.current = [t('anatomy.stage1Path'), t('anatomy.stage2Path'), t('anatomy.stage3Path')];

  const onFrame = useCallback(({ y, vh, k, paper, clamp01 }: FrameState) => {
    /* ---- hero layers (x+y offsets, so not plain [data-parallax]) ---- */
    if (k) {
      const g = heroGlowRef.current;
      if (g) g.style.transform = `translate3d(${y * 0.06 * k}px,${y * 0.34 * k}px,0)`;
      const g2 = heroGlow2Ref.current;
      if (g2) g2.style.transform = `translate3d(${-y * 0.05 * k}px,${y * -0.18 * k}px,0)`;
      const ho = heroObjRef.current;
      if (ho) ho.style.transform = `translate(-50%,-50%) translate3d(0,${y * 0.12 * k}px,0)`;
    }

    /* ---- pinned morph: t drives the object and everything around it ---- */
    const track = morphTrackRef.current;
    if (track) {
      const r = track.getBoundingClientRect();
      const span = Math.max(1, r.height - vh);
      const t2 = clamp01(-r.top / span);
      // The object follows the paced progress, not raw scroll, so it settles
      // while you read and moves while you travel between stages.
      const mp = morphProgress(t2);
      morph.current?.setProgress(mp);

      const s2 = mp * 2;
      const i0 = Math.min(1, Math.floor(s2));
      const burst = Math.sin(Math.PI * clamp01(s2 - i0));
      const enter = clamp01(t2 / 0.07);

      /* The entry fade lives on this inner wrapper, never on
         [data-r="morphHolder"]: the <=1040px breakpoint owns the holder's
         opacity and an inline value would beat that rule, flooding the copy. */
      const ms = morphScaleRef.current;
      if (ms) {
        ms.style.transform = `scale(${(0.87 + enter * 0.13 + burst * 0.07).toFixed(4)}) rotate(${(
          burst * 1.5 * (i0 === 0 ? 1 : -1)
        ).toFixed(3)}deg)`;
        ms.style.opacity = (0.12 + enter * 0.88).toFixed(3);
      }
      const mg = morphGridRef.current;
      if (mg && k)
        mg.style.transform = `translate3d(${(t2 - 0.5) * -84 * k}px,0,0) scale(${1 + t2 * 0.13})`;
      const glow = morphGlowRef.current;
      if (glow) glow.style.opacity = ((0.3 + burst * 0.7) * enter).toFixed(3);
      const hz = horizonRef.current;
      if (hz) {
        hz.style.transform = `translate3d(0,${((t2 - 0.5) * 46).toFixed(1)}px,0) scaleX(${(
          0.78 +
          t2 * 0.34
        ).toFixed(3)})`;
        hz.style.opacity = (0.2 * enter + burst * 0.55).toFixed(3);
      }

      const out = pathOutRef.current;
      const stageIdx = Math.max(0, Math.min(2, Math.round(s2)));
      if (stageIdx !== stageIdxRef.current) {
        stageIdxRef.current = stageIdx;
        if (out) out.textContent = pathsRef.current[stageIdx];
      }
      if (out) out.style.opacity = (enter * (1 - burst * 0.9)).toFixed(3);

      for (let i = 0; i < 3; i++) {
        const centre = i * 0.5;
        const o = stageClarity(t2, centre);
        // Drift only once the stage starts leaving its plateau — while it is
        // legible it should sit still, or the eye keeps chasing it.
        const past =
          Math.sign(t2 - centre) * Math.max(0, Math.abs(t2 - centre) - STAGE_HOLD);
        const st = stageRefs.current[i];
        if (st) {
          st.style.opacity = String(o);
          st.style.transform = `translate3d(0,${past * -110 * k}px,0)`;
          st.style.pointerEvents = o > 0.5 ? 'auto' : 'none';
          if (k) {
            st.style.filter = `blur(${((1 - o) * 7).toFixed(2)}px)`;
            const inset = ((1 - o) * 16).toFixed(1);
            st.style.clipPath = `inset(${inset}% 0% ${inset}% 0%)`;
          }
        }
        const bn = numRefs.current[i];
        if (bn) {
          bn.style.opacity = (o * 0.95).toFixed(3);
          bn.style.transform = `translateY(-50%) translate3d(0,${(past * -260 * k).toFixed(
            1
          )}px,0) scale(${(0.9 + o * 0.1).toFixed(3)})`;
        }
        const bar = barRefs.current[i];
        // Each bar fills across the slice of the track its own stage owns, so
        // it is exactly full at the moment the next stage takes over. The old
        // formula divided every bar by a fixed 0.5, which is only correct for
        // the middle stage: stages 1 and 3 are cut in half by the ends of the
        // track, so bar 3 topped out at 50% and never finished.
        if (bar) {
          const lo = Math.max(0, centre - STAGE_SPAN);
          const hi = Math.min(1, centre + STAGE_SPAN);
          bar.style.transform = `scaleX(${clamp01((t2 - lo) / (hi - lo))})`;
        }
        const lab = stepRefs.current[i];
        if (lab) {
          lab.style.opacity = (0.32 + o * 0.68).toFixed(3);
          lab.style.color = o > 0.45 ? 'var(--accent)' : 'var(--fg-mute)';
        }
      }
    }

    /* ---- horizontal cases rail ---- */
    const ct = casesTrackRef.current;
    const rail = railRef.current;
    if (ct && rail) {
      const r = ct.getBoundingClientRect();
      const span = Math.max(1, r.height - vh);
      const t3 = clamp01(-r.top / span);
      const over = Math.max(0, rail.scrollWidth - window.innerWidth + 48);
      rail.style.transform = `translate3d(${-t3 * over}px,0,0)`;
      if (caseRailRef.current) caseRailRef.current.style.transform = `scaleX(${t3})`;
      const n = 1 + Math.min(3, Math.floor(t3 * 3.999));
      if (n !== caseNumRef.current) {
        caseNumRef.current = n;
        if (caseIdxRef.current) caseIdxRef.current.textContent = `0${n}`;
      }
    }

    /* ---- cta glow drift ---- */
    const cg = ctaGlowRef.current;
    if (cg && k && cg.parentElement) {
      const r = cg.parentElement.getBoundingClientRect();
      const t4 = clamp01((vh - r.top) / (vh + r.height));
      cg.style.transform = `translate3d(${(0.5 - t4) * 120 * k}px,${t4 * 90 * k}px,0)`;
    }

    /* ---- section HUD ---- */
    const hud = hudRef.current;
    if (hud) {
      /* visibility rides along so the links are not focusable while hidden;
         it is a discrete property, so it flips at the far end of the fade. */
      const shown = y > vh * 0.5 ? 1 : 0;
      if (shown !== hudShownRef.current) {
        hudShownRef.current = shown;
        hud.style.opacity = shown ? '1' : '0';
        hud.style.visibility = shown ? 'visible' : 'hidden';
      }
      const onPaper = paper > 0.5 ? 1 : 0;
      if (onPaper !== hudPaperRef.current) {
        hudPaperRef.current = onPaper;
        hud.style.setProperty('--om-hud', onPaper ? 'var(--ink-mute)' : 'var(--fg-mute)');
      }
      let secs = sectionsRef.current;
      if (!secs) {
        secs = HUD_IDS.map((id) => document.getElementById(id));
        sectionsRef.current = secs;
      }
      let active = 0;
      for (let i = 0; i < secs.length; i++) {
        const s = secs[i];
        if (s && s.getBoundingClientRect().top <= vh * 0.42) active = i;
      }
      if (active !== hudActiveRef.current) {
        hudActiveRef.current = active;
        for (let i = 0; i < HUD_IDS.length; i++) {
          const on = i === active;
          const dot = hudDotRefs.current[i];
          if (dot) {
            dot.style.opacity = on ? '1' : '.3';
            dot.style.background = on ? 'var(--accent)' : 'var(--om-hud, var(--fg-mute))';
            dot.style.transform = on ? 'scale(1.5)' : 'scale(1)';
            dot.style.boxShadow = on ? '0 0 0 4px rgba(255,112,20,.16)' : 'none';
          }
          const lab = hudLabelRefs.current[i];
          if (lab) lab.style.opacity = on ? '1' : '.3';
        }
      }
    }
  }, []);

  /* Hero headline, word by word. Delays are 55ms apart across all three parts. */
  const heroWords: { w: string; accent: boolean; br: boolean }[] = [];
  t('hero.title1')
    .split(' ')
    .forEach((w, i, a) => heroWords.push({ w, accent: false, br: i === a.length - 1 }));
  t('hero.title2')
    .split(' ')
    .forEach((w) => heroWords.push({ w, accent: false, br: false }));
  t('hero.titleAccent')
    .split(' ')
    .forEach((w) => heroWords.push({ w, accent: true, br: false }));

  const problemWords = `${t('problem.title1')}|${t('problem.title2')}`.split(' ');
  const ctaWords = `${t('cta.title1')}|${t('cta.title2')}`.split(' ');

  /* Accessible names for the HUD dots — the visible label is the index. */
  const hudLabels = [
    tn('home'),
    t('problem.eyebrow'),
    t('anatomy.eyebrow'),
    t('pillars.eyebrow'),
    t('casesPreview.eyebrow'),
    t('proof.eyebrow'),
    t('cta.eyebrow'),
  ];

  /* A word inside a [data-words] scroll-lit heading; "|" marks the line break. */
  const litWord = (raw: string, i: number) => {
    const parts = raw.split('|');
    return (
      <Fragment key={i}>
        {parts.map((p, j) => (
          <Fragment key={j}>
            {j > 0 && <br />}
            <span data-w>{p}</span>
            {j === parts.length - 1 ? ' ' : ''}
          </Fragment>
        ))}
      </Fragment>
    );
  };

  return (
    <MotionShell
      onFrame={onFrame}
      overlay={
        <>
        {/* ====================== right-edge section HUD ====================== */}
        <aside
          data-home-hud
          ref={hudRef}
          style={{
            position: 'fixed',
            right: 26,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 55,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            alignItems: 'flex-end',
            pointerEvents: 'none',
            opacity: 0,
            visibility: 'hidden',
            transition: 'opacity .5s var(--ease), visibility .5s var(--ease)',
          }}
        >
          {HUD_IDS.map((id, i) => (
            <a
              key={id}
              href={`#${id}`}
              aria-label={hudLabels[i]}
              style={{ display: 'flex', alignItems: 'center', gap: 10, pointerEvents: 'auto' }}
            >
              <span
                className="mono"
                aria-hidden
                ref={(el) => {
                  hudLabelRefs.current[i] = el;
                }}
                style={{
                  fontSize: 10,
                  letterSpacing: '.1em',
                  color: 'var(--om-hud, var(--fg-mute))',
                  opacity: 0.35,
                  transition: 'opacity .3s var(--ease), color .3s linear',
                }}
              >
                {`0${i + 1}`}
              </span>
              <span
                aria-hidden
                ref={(el) => {
                  hudDotRefs.current[i] = el;
                }}
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: 'var(--om-hud, var(--fg-mute))',
                  opacity: 0.35,
                  transition: 'all .35s var(--ease)',
                }}
              />
            </a>
          ))}
        </aside>
        </>
      }
    >
      {/* dangerouslySetInnerHTML, not children: React escapes text children of
          <style> on the server (' -> &#x27;, " -> &quot;) but not on the client,
          which is a hydration text mismatch. React then throws away the whole
          server document and re-mounts it — detaching every node useSiteMotion
          had captured, so the entire scroll-motion layer went dead. */}
      <style dangerouslySetInnerHTML={{ __html: PAGE_CSS }} />

      <div className="page home-2026">
        {/* ============================= hero ============================= */}
        <section
          id="top"
          className="hero"
          style={{
            minHeight: '88vh',
            display: 'flex',
            alignItems: 'center',
            padding: '56px 0 104px',
          }}
        >
          <div className="grid-bg" data-parallax="0.16" style={{ willChange: 'transform' }} />
          <div
            className="glow"
            ref={heroGlowRef}
            style={{ top: -260, left: -140, opacity: 0.85, willChange: 'transform' }}
          />
          <div
            ref={heroGlow2Ref}
            aria-hidden
            style={{
              position: 'absolute',
              width: 620,
              height: 620,
              right: -180,
              bottom: -280,
              background: 'radial-gradient(circle,rgba(110,140,255,.10),transparent 62%)',
              filter: 'blur(50px)',
              pointerEvents: 'none',
              willChange: 'transform',
            }}
          />

          <div className="container" style={{ position: 'relative', zIndex: 2, width: '100%' }}>
            <div className="hero-grid">
              <div>
                <div className="pill" data-anim style={{ animation: 'gmFIn .7s var(--ease) both' }}>
                  <span className="dot" />
                  {t('hero.pill')}
                </div>

                <h1 style={{ marginTop: 26 }}>
                  {heroWords.map((hw, i) => (
                    <Fragment key={i}>
                      <span
                        data-anim
                        style={{
                          display: 'inline-block',
                          animation: 'gmWIn .9s var(--ease) both',
                          animationDelay: `${(0.06 + i * 0.055).toFixed(3)}s`,
                          ...(hw.accent ? { color: 'var(--accent)' } : null),
                        }}
                      >
                        {hw.w}
                      </span>
                      {hw.br ? <br /> : ' '}
                    </Fragment>
                  ))}
                </h1>

                <p
                  className="hero-sub lead"
                  data-anim
                  style={{ animation: 'gmFIn .8s var(--ease) .72s both' }}
                >
                  {t('hero.lead')}
                </p>

                <div
                  className="hero-cta"
                  data-anim
                  style={{ animation: 'gmFIn .8s var(--ease) .8s both' }}
                >
                  <span data-mag style={MAG}>
                    <Btn variant="primary" href={`${basePath}/contact`}>
                      {t('hero.ctaPrimary')} <IconArrow size={14} />
                    </Btn>
                  </span>
                  <span data-mag style={MAG}>
                    <Btn variant="ghost" href={`${basePath}/agents`}>
                      {t('hero.ctaGhost')}
                    </Btn>
                  </span>
                </div>

                <div
                  className="hero-meta"
                  data-anim
                  style={{ animation: 'gmFIn .8s var(--ease) .88s both' }}
                >
                  <div className="hero-meta-item">
                    <span className="icon">●</span> {t('hero.meta1')}
                  </div>
                  <div className="hero-meta-item">
                    <span className="icon">●</span> {t('hero.meta2')}
                  </div>
                  <div className="hero-meta-item">
                    <span className="icon">●</span> {t('hero.meta3')}
                  </div>
                </div>
              </div>

              <div
                data-anim
                style={{ position: 'relative', animation: 'gmFIn 1s var(--ease) .4s both' }}
              >
                <div
                  data-heroobj
                  ref={heroObjRef}
                  aria-hidden
                  style={{
                    position: 'absolute',
                    top: '48%',
                    left: '60%',
                    width: '112%',
                    height: '118%',
                    transform: 'translate(-50%,-50%)',
                    zIndex: 0,
                    opacity: 0.7,
                    pointerEvents: 'none',
                  }}
                >
                  <MorphObject variant="ambient" />
                </div>
                <div
                  data-parallax="-0.05"
                  style={{ position: 'relative', zIndex: 2, willChange: 'transform' }}
                >
                  <AgentAnatomy />
                </div>
              </div>
            </div>
          </div>

          <div
            aria-hidden
            style={{
              position: 'absolute',
              left: '50%',
              bottom: 22,
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              zIndex: 3,
            }}
          >
            <span
              className="mono"
              style={{
                fontSize: 10,
                letterSpacing: '.14em',
                textTransform: 'uppercase',
                color: 'var(--fg-mute)',
                opacity: 0.5,
              }}
            >
              Scroll
            </span>
            <span
              data-anim
              style={{
                width: 1,
                height: 26,
                background: 'linear-gradient(180deg,var(--accent),transparent)',
                animation: 'gmCueDrop 2.4s var(--ease) infinite',
              }}
            />
          </div>
        </section>

        {/* =========================== logo bar =========================== */}
        <section className="section" style={{ padding: '8px 0 68px' }}>
          <div className="container" style={{ textAlign: 'center' }}>
            <div data-reveal style={reveal(0, 22)}>
              <Eyebrow>{t('logoBarLabel')}</Eyebrow>
            </div>
            <div data-reveal style={{ marginTop: 26, ...reveal(0.1, 22) }}>
              <LogoBar more={t('logoBarMore')} />
            </div>
          </div>
        </section>

        {/* =========================== probleem =========================== */}
        <Section id="problem">
          <div className="sec-head" data-reveal style={reveal()}>
            <div>
              <Eyebrow>{t('problem.eyebrow')}</Eyebrow>
              <h2 data-words style={{ marginTop: 16 }}>
                {problemWords.map(litWord)}
              </h2>
            </div>
            <div className="sec-head-right">
              <p className="lead">{t('problem.lead')}</p>
            </div>
          </div>
          <div className="ds-grid-3" style={{ marginTop: 38 }}>
            {[1, 2, 3].map((i) => (
              <div
                className="card"
                key={i}
                data-reveal
                data-tilt
                style={{ ...reveal((i - 1) * 0.09, 28), willChange: 'transform' }}
              >
                <div className="tag">{t(`problem.card${i}Tag`)}</div>
                <h3 style={{ marginTop: 16 }}>{t(`problem.card${i}Title`)}</h3>
                <p style={{ marginTop: 12 }}>{t(`problem.card${i}Body`)}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ==================== anatomie — pinned morph ==================== */}
        <section
          id="anatomy"
          ref={morphTrackRef}
          style={{ position: 'relative', height: '420vh' }}
        >
          <div
            style={{
              position: 'sticky',
              top: 0,
              height: '100vh',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <div
              ref={morphGridRef}
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage:
                  'linear-gradient(to right,rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(to bottom,rgba(255,255,255,.03) 1px,transparent 1px)',
                backgroundSize: '96px 96px',
                maskImage: 'radial-gradient(ellipse 70% 70% at 60% 50%,#000 20%,transparent 78%)',
                WebkitMaskImage:
                  'radial-gradient(ellipse 70% 70% at 60% 50%,#000 20%,transparent 78%)',
                pointerEvents: 'none',
                willChange: 'transform',
              }}
            />

            <div
              data-r="bignums"
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 1,
                pointerEvents: 'none',
                fontFamily: 'var(--font-display)',
                fontWeight: 500,
                fontSize: 'clamp(200px,24vw,380px)',
                lineHeight: 1,
                letterSpacing: '-.05em',
              }}
            >
              {['01', '02', '03'].map((n, i) => (
                <span
                  key={n}
                  ref={(el) => {
                    numRefs.current[i] = el;
                  }}
                  style={{
                    position: 'absolute',
                    left: '-2%',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'transparent',
                    WebkitTextStroke: '1.5px rgba(255,255,255,.085)',
                    opacity: i === 0 ? 0.95 : 0,
                    willChange: 'transform,opacity',
                  }}
                >
                  {n}
                </span>
              ))}
            </div>

            <div className="container" style={{ position: 'relative', zIndex: 2, width: '100%' }}>
              <div
                data-morphgrid
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0,.92fr) minmax(0,1.08fr)',
                  gap: 56,
                  alignItems: 'center',
                }}
              >
                <div data-morphcopy>
                  <Eyebrow>{t('anatomy.eyebrow')}</Eyebrow>
                  <h2 style={{ marginTop: 16, fontSize: 'clamp(30px,3.1vw,46px)' }}>
                    {t('anatomy.title')}
                  </h2>

                  <div
                    data-stagewrap
                    style={{ position: 'relative', marginTop: 34, minHeight: 250 }}
                  >
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        ref={(el) => {
                          stageRefs.current[i - 1] = el;
                        }}
                        style={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 14,
                          opacity: i === 1 ? 1 : 0,
                          willChange: 'transform,opacity,filter',
                        }}
                      >
                        <div
                          className="mono"
                          style={{
                            fontSize: 11,
                            letterSpacing: '.1em',
                            textTransform: 'uppercase',
                            color: 'var(--accent)',
                          }}
                        >
                          {t(`anatomy.card${i}Num`)}
                        </div>
                        <h3 style={{ fontSize: 'clamp(22px,2vw,30px)' }}>
                          {t(`anatomy.card${i}Title1`)}{' '}
                          <em style={{ fontStyle: 'normal', color: 'var(--accent)' }}>
                            {t(`anatomy.card${i}Title2`)}
                          </em>
                        </h3>
                        <p style={{ maxWidth: '44ch' }}>{t(`anatomy.card${i}Body`)}</p>
                        <div
                          className="mono"
                          style={{
                            marginTop: 4,
                            fontSize: 12,
                            color: 'var(--fg-mute)',
                            padding: '8px 12px',
                            border: '1px dashed var(--line)',
                            borderRadius: 'var(--r-sm)',
                            display: 'inline-block',
                            width: 'fit-content',
                          }}
                        >
                          {t(`anatomy.stage${i}Path`)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3,1fr)',
                      gap: 14,
                      marginTop: 30,
                    }}
                  >
                    {[1, 2, 3].map((i) => (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <span
                          className="mono"
                          ref={(el) => {
                            stepRefs.current[i - 1] = el;
                          }}
                          style={{
                            fontSize: 10,
                            letterSpacing: '.12em',
                            textTransform: 'uppercase',
                            color: 'var(--fg-mute)',
                            opacity: 0.4,
                            transition: 'opacity .4s linear, color .4s linear',
                          }}
                        >
                          {t(`anatomy.stage${i}Label`)}
                        </span>
                        <span
                          style={{
                            height: 2,
                            background: 'var(--line)',
                            position: 'relative',
                            overflow: 'hidden',
                            borderRadius: 2,
                          }}
                        >
                          <span
                            ref={(el) => {
                              barRefs.current[i - 1] = el;
                            }}
                            style={{
                              position: 'absolute',
                              inset: 0,
                              transformOrigin: 'left',
                              transform: 'scaleX(0)',
                              background: 'var(--accent)',
                            }}
                          />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div data-r="morphHolder" style={{ height: 'min(74vh,620px)', position: 'relative' }}>
                  <div
                    ref={morphGlowRef}
                    aria-hidden
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      width: 520,
                      height: 520,
                      transform: 'translate(-50%,-50%)',
                      background: 'radial-gradient(circle,rgba(255,112,20,.16),transparent 62%)',
                      filter: 'blur(44px)',
                      pointerEvents: 'none',
                    }}
                  />
                  <div
                    ref={morphScaleRef}
                    style={{ position: 'absolute', inset: 0, willChange: 'transform' }}
                  >
                    <MorphObject variant="morph" handleRef={morph} />
                  </div>
                  <div
                    ref={horizonRef}
                    data-chrome
                    aria-hidden
                    style={{
                      position: 'absolute',
                      left: '-8%',
                      right: '-8%',
                      bottom: '13%',
                      height: 1,
                      background:
                        'linear-gradient(90deg,transparent,rgba(255,112,20,.55) 20%,rgba(255,255,255,.28) 50%,rgba(255,112,20,.55) 80%,transparent)',
                      willChange: 'transform,opacity',
                      pointerEvents: 'none',
                    }}
                  />
                  <div
                    ref={pathOutRef}
                    data-chrome
                    className="mono"
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      bottom: '2%',
                      textAlign: 'center',
                      fontSize: 11,
                      letterSpacing: '.14em',
                      textTransform: 'uppercase',
                      color: 'var(--fg-mute)',
                      pointerEvents: 'none',
                      willChange: 'opacity',
                    }}
                  >
                    {t('anatomy.stage1Path')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================ pijlers ============================ */}
        <div data-band="paper">
          <Section id="pillars" light>
            <div className="sec-head" data-reveal style={reveal()}>
              <div>
                <Eyebrow>{t('pillars.eyebrow')}</Eyebrow>
                <h2 style={{ marginTop: 16 }}>{t('pillars.title')}</h2>
              </div>
              <div className="sec-head-right">
                <p className="lead">{t('pillars.lead')}</p>
              </div>
            </div>
            <div className="ds-grid-3" style={{ marginTop: 38 }}>
              <div data-reveal style={reveal(0, 28)}>
                <Link href={`${basePath}/trainingen`} style={{ textDecoration: 'none' }}>
                  <PillarCard
                    tag={t('pillars.p1Tag')}
                    title={t('pillars.p1Title')}
                    desc={t('pillars.p1Desc')}
                    items={t.raw('pillars.p1Items') as string[]}
                  />
                </Link>
              </div>
              <div data-reveal style={reveal(0.09, 28)}>
                <Link href={`${basePath}/agents`} style={{ textDecoration: 'none' }}>
                  <PillarCard
                    tag={t('pillars.p2Tag')}
                    title={t('pillars.p2Title')}
                    desc={t('pillars.p2Desc')}
                    items={t.raw('pillars.p2Items') as string[]}
                  />
                </Link>
              </div>
              <div data-reveal style={reveal(0.18, 28)}>
                <Link href={`${basePath}/trainingen`} style={{ textDecoration: 'none' }}>
                  <PillarCard
                    tag={t('pillars.p3Tag')}
                    title={t('pillars.p3Title')}
                    desc={t('pillars.p3Desc')}
                    items={t.raw('pillars.p3Items') as string[]}
                  />
                </Link>
              </div>
            </div>
          </Section>
        </div>

        {/* ================== cases — horizontal rail ================== */}
        <section
          id="cases-preview"
          ref={casesTrackRef}
          style={{ position: 'relative', height: '300vh' }}
        >
          <div
            style={{
              position: 'sticky',
              top: 0,
              height: '100vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 40,
            }}
          >
            <div
              className="container"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                gap: 32,
                flexWrap: 'wrap',
              }}
            >
              <div>
                <Eyebrow>{t('casesPreview.eyebrow')}</Eyebrow>
                <h2 style={{ marginTop: 16, fontSize: 'clamp(30px,3.1vw,48px)' }}>
                  {t('casesPreview.title')}
                </h2>
              </div>
              <div
                className="mono"
                aria-hidden
                style={{
                  fontSize: 11,
                  letterSpacing: '.1em',
                  textTransform: 'uppercase',
                  color: 'var(--fg-mute)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <span ref={caseIdxRef}>01</span>
                <span
                  style={{ width: 52, height: 1, background: 'var(--line)', position: 'relative' }}
                >
                  <span
                    ref={caseRailRef}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      transformOrigin: 'left',
                      transform: 'scaleX(0)',
                      background: 'var(--accent)',
                    }}
                  />
                </span>
                <span>04</span>
              </div>
            </div>

            <div
              ref={railRef}
              style={{
                display: 'flex',
                gap: 24,
                paddingLeft: 'max(24px, calc((100vw - 1192px) / 2))',
                paddingRight: 24,
                willChange: 'transform',
              }}
            >
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ flex: '0 0 400px', display: 'flex' }}>
                  <CaseCard
                    industry={t(`casesPreview.c${i}Industry`)}
                    title={t(`casesPreview.c${i}Title`)}
                    snippet={t(`casesPreview.c${i}Snippet`)}
                    metric={{
                      num: t(`casesPreview.c${i}MetricNum`),
                      label: t(`casesPreview.c${i}MetricLabel`),
                    }}
                  />
                </div>
              ))}
              <div style={{ flex: '0 0 400px', display: 'flex' }}>
                <div
                  className="card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    width: '100%',
                    background:
                      'linear-gradient(150deg,#17171d 0%,#0d0d11 100%)',
                  }}
                >
                  <div>
                    <div className="tag">04</div>
                    <h3 style={{ marginTop: 16 }}>{t('casesPreview.moreTitle')}</h3>
                    <p style={{ marginTop: 12 }}>{t('casesPreview.moreBody')}</p>
                  </div>
                  <div style={{ marginTop: 24 }}>
                    <span data-mag style={MAG}>
                      <Btn variant="ghost" href={`${basePath}/cases`}>
                        {t('casesPreview.viewAll')} <IconArrow size={14} />
                      </Btn>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================== serac proof ========================== */}
        <div data-band="paper">
          <Section id="proof" light>
            <div className="ds-grid-2" style={{ alignItems: 'center', gap: 76 }}>
              <div data-reveal style={reveal(0, 26)}>
                <Eyebrow>{t('proof.eyebrow')}</Eyebrow>
                <h2 style={{ marginTop: 16 }}>
                  {t('proof.title')}
                  <br />
                  <em style={{ fontStyle: 'normal', color: 'var(--accent)' }}>
                    {t('proof.titleAccent')}
                  </em>
                </h2>
                <p style={{ marginTop: 20, fontSize: 17 }}>{t('proof.body')}</p>
                <div style={{ marginTop: 28, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <span data-mag style={MAG}>
                    <Btn variant="ghost" href="https://github.com/serac-labs/serac">
                      {t('proof.cta')} <IconArrow size={14} />
                    </Btn>
                  </span>
                </div>
              </div>
              <div
                data-reveal
                data-tilt
                style={{ ...reveal(0.12, 26), willChange: 'transform' }}
              >
                <div className="card" style={{ padding: 32 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                      marginBottom: 16,
                    }}
                  >
                    <div>
                      <div className="mono" style={{ fontSize: 11, color: 'var(--ink-mute)' }}>
                        {t('proof.cardOwner')}
                      </div>
                      <h3 style={{ marginTop: 4, fontSize: 24, color: 'var(--ink)' }}>
                        {t('proof.cardRepo')}
                      </h3>
                    </div>
                    <div className="tag">{t('proof.cardLicense')}</div>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--ink-dim)' }}>{t('proof.cardDesc')}</p>
                  <div
                    className="mono"
                    style={{
                      marginTop: 20,
                      display: 'flex',
                      gap: 16,
                      fontSize: 12,
                      color: 'var(--ink-mute)',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span>{t('proof.cardBadge1')}</span>
                    <span>{t('proof.cardBadge2')}</span>
                    <span>{t('proof.cardBadge3')}</span>
                  </div>
                  <div className="divider" style={{ margin: '22px 0 18px' }} />
                  <div
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}
                  >
                    {[1, 2, 3].map((i) => (
                      <Stat
                        key={i}
                        num={t(`casesPreview.c${i}MetricNum`)}
                        label={t(`casesPreview.c${i}MetricLabel`)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Section>
        </div>

        {/* ============================== cta ============================== */}
        <Section id="cta" style={{ paddingBottom: 96 }}>
          <div className="cta-block" data-reveal style={{ opacity: 0, transform: 'translateY(28px)', transition: 'opacity .9s var(--ease), transform .9s var(--ease)' }}>
            <div
              ref={ctaGlowRef}
              aria-hidden
              style={{
                position: 'absolute',
                width: 640,
                height: 640,
                background: 'radial-gradient(circle,rgba(255,112,20,.2),transparent 60%)',
                top: -320,
                right: -200,
                filter: 'blur(40px)',
                pointerEvents: 'none',
                willChange: 'transform',
              }}
            />
            <div className="cta-block-inner">
              <Eyebrow>{t('cta.eyebrow')}</Eyebrow>
              <h2 data-words style={{ marginTop: 18, marginBottom: 24 }}>
                {ctaWords.map(litWord)}
              </h2>
              <p className="lead" style={{ marginTop: 20 }}>
                {t('cta.lead')}
              </p>
              <div className="row">
                <span data-mag style={MAG}>
                  <Btn variant="primary" href={`${basePath}/contact`}>
                    {t('cta.ctaPrimary')} <IconArrow size={14} />
                  </Btn>
                </span>
                <span data-mag style={MAG}>
                  <Btn variant="ghost" href={`${basePath}/about`}>
                    {t('cta.ctaGhost')}
                  </Btn>
                </span>
              </div>
            </div>
          </div>
        </Section>
      </div>

    </MotionShell>
  );
}

export default HomePageView;
