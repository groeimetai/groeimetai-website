/**
 * Renders the raster brand assets from the vector mark.
 *
 * Everything the site ships as a PNG — the PWA icon set, the Apple touch icon
 * and the two logos the transactional e-mails embed — is generated here from
 * public/logo/*.svg, so the raster files can never drift from the vector mark
 * again. Re-run after any change to the brand:
 *
 *   node scripts/generate-brand-assets.mjs
 *
 * Rendered through headless Chrome rather than a plain SVG rasteriser because
 * the horizontal lockup contains live <text> in Geist: librsvg/sharp would
 * silently substitute a system font and produce an off-brand wordmark. Chrome
 * loads the real Geist Medium from node_modules/geist and renders it exactly as
 * the site does.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const LOGO = join(ROOT, 'public/logo');
const GEIST = join(ROOT, 'node_modules/geist/dist/fonts/geist-sans/Geist-Variable.woff2');

const svg = (name) => readFileSync(join(LOGO, name), 'utf8');
const b64Font = readFileSync(GEIST).toString('base64');

/** width/height are CSS px; the shot is taken at deviceScaleFactor for crispness. */
const TARGETS = [
  // PWA icon set — manifest.json declares `purpose: "maskable any"`, so the
  // tile (art safely inset from the edges) is the correct source, not the bare mark.
  ...[72, 96, 128, 144, 152, 192, 384, 512].map((s) => ({
    out: `public/icons/icon-${s}x${s}.png`,
    svg: 'icon-tile-black.svg',
    w: s,
    h: s,
  })),
  // Apple touch icon (Next file convention picks this up from src/app/).
  { out: 'src/app/apple-icon.png', svg: 'icon-tile-black.svg', w: 180, h: 180 },
  // E-mail: used on light backgrounds, and in two places under
  // `filter: brightness(0) invert(1)` on a dark background — the ink variant
  // reads correctly both ways (it becomes solid white under the filter).
  { out: 'public/GroeimetAi_logo_small.png', svg: 'mark-primary-light.svg', w: 128, h: 128 },
  // E-mail wordmark on light backgrounds. Live <text> — hence Chrome.
  { out: 'public/GroeimetAi_logo_text_black.png', svg: 'lockup-horizontal-light.svg', w: 400, h: 77 },
];

const page_html = (markup, w, h) => `<!doctype html>
<meta charset="utf-8">
<style>
  @font-face {
    font-family: 'Geist';
    src: url(data:font/woff2;base64,${b64Font}) format('woff2');
    font-weight: 100 900;
    font-display: block;
  }
  html, body { margin: 0; padding: 0; background: transparent; }
  svg { display: block; width: ${w}px; height: ${h}px; }
  text, tspan { font-family: 'Geist', sans-serif; }
</style>
${markup}`;

const browser = await puppeteer.launch({ headless: 'new' });
try {
  for (const t of TARGETS) {
    const page = await browser.newPage();
    await page.setViewport({ width: t.w, height: t.h, deviceScaleFactor: 2 });
    await page.setContent(page_html(svg(t.svg), t.w, t.h), { waitUntil: 'load' });
    await page.evaluateHandle('document.fonts.ready');
    const outPath = join(ROOT, t.out);
    mkdirSync(dirname(outPath), { recursive: true });
    await page.screenshot({ path: outPath, omitBackground: true });
    await page.close();
    console.log(`  ${t.out}  ${t.w}x${t.h} (@2x)  <- ${t.svg}`);
  }
} finally {
  await browser.close();
}

if (!existsSync(join(ROOT, 'public/icons/icon-512x512.png'))) {
  throw new Error('icon set was not written');
}
console.log(`\n${TARGETS.length} brand assets generated.`);
