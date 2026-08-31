import { ImageResponse } from 'next/og';

// Nodejs runtime, not edge: this site ships as a Next standalone build on Cloud
// Run, so there is no edge runtime at request time. next/og resolves to
// @vercel/og's node build (index.node.js) and ships its own default font, so no
// network fetch and no binary asset in public/ is needed.
export const runtime = 'nodejs';

export const alt = 'GroeimetAI — geen AI-hype, wel teams die er echt beter door werken';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * The only reason this file uses generateImageMetadata: without an id Next
 * serves the image from `/twitter-image?<hash>`, a pathname without a dot,
 * and the next-intl matcher in src/middleware.ts
 * ('/((?!_next|_vercel|.*\\..*).*)') then 307-redirects it to
 * /nl/twitter-image, which 404s. Giving the image the id 'twitter.png' moves it to
 * `/twitter-image/twitter.png?<hash>` — a pathname with a dot, which the matcher
 * skips. Verified locally: without the id the URL redirects, with it the route
 * returns 200 image/png.
 */
export function generateImageMetadata() {
  return [{ id: 'twitter.png', size, alt, contentType }];
}

// Design system tokens (src/styles/design-system/tokens.css)
const BG = '#0a0a0b';
const FG = '#f4f4f1';
const FG_DIM = '#a1a1aa';
const FG_MUTE = '#71717a';
const ACCENT = '#ff5a1f';
const LINE = '#26262d';

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: BG,
          color: FG,
          padding: '72px 80px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', width: 12, height: 44, backgroundColor: ACCENT }} />
          <div style={{ display: 'flex', marginLeft: 20, fontSize: 36, letterSpacing: -0.5 }}>
            GroeimetAI
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 60, lineHeight: 1.15, letterSpacing: -1.5 }}>
            Geen AI-hype.
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 60,
              lineHeight: 1.15,
              letterSpacing: -1.5,
              color: ACCENT,
            }}
          >
            Wel teams die er echt beter door werken.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            borderTop: `1px solid ${LINE}`,
            paddingTop: 28,
          }}
        >
          <div style={{ display: 'flex', fontSize: 24, color: FG_DIM }}>
            AI-training · strategie · adoptiebegeleiding · veilige integraties
          </div>
          <div style={{ display: 'flex', marginTop: 10, fontSize: 22, color: FG_MUTE }}>
            groeimetai.io · Apeldoorn
          </div>
        </div>
      </div>
    ),
    size
  );
}
