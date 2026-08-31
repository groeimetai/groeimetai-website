# design-sync notes — GroeimetAI design system

Repo-specific gotchas for syncing `src/components/ds/` to claude.ai/design.
Read this before re-running the sync.

## What this repo is, from the sync's point of view

- It is a **Next.js app**, not a publishable component library: there is no `dist/`, no build that
  emits an entry, and no `.d.ts` tree. Component discovery therefore cannot come from shipped
  types — every component is pinned explicitly in `cfg.componentSrcMap` (42 entries: 11 named
  components + `LogoMark` + 30 `Icon*`). **Adding a component to `src/components/ds/` will NOT
  show up in a re-sync until it is added to `componentSrcMap`.**
- `cfg.entry` points at `.design-sync/ds-entry.tsx`, a sync-only module that re-exports
  `src/components/ds` unchanged, imports the stylesheet closure, and adds `DsRoot`. It contains no
  component implementations.
- `cfg.pkg` is `@/components/ds` — the repo's real import specifier, so the docs and preview files
  the design agent reads show the import path an engineer would actually write here.
- There is **no Storybook** anywhere in the repo (`cfg.shape: "package"` pins this so detection is
  skipped).

## The `.ds` scoping rule — the single most important thing

Every design-system style is scoped under `.ds` (`src/styles/design-system/base.css`), because the
admin and dashboard pages are shadcn-styled and must not inherit it. Outside a `.ds` element the
components render as unstyled browser defaults.

`cfg.provider` is therefore set to `DsRoot`, exported from `.design-sync/ds-entry.tsx`, which is
just `<div className="ds">{children}</div>` — the same wrapper the app writes inline in
`src/app/[locale]/*/page.tsx`. Every preview card and every design built with this system is
wrapped in it.

(Worth considering separately: the app repeats `<div className="ds">` in ~10 files. Promoting
`DsRoot` into `src/components/ds/` would be a real improvement, but that is an app refactor and
out of scope for the sync.)

## next/link cannot be bundled

`DsLink` imports `next/link`. Next's client Link reads `process.env.__NEXT_*` at module scope, so
bundling it outside a Next build throws `ReferenceError: process is not defined` at load — which
takes down the *entire* `window.GroeimetAI` bundle, not just DsLink. Symptom:
`[BUNDLE_EXPORT] 42/42 not a component on window.GroeimetAI` plus `[RENDER_ERRORS]` on every card.

Fix in place: `.design-sync/tsconfig.sync.json` maps `next/link` to
`.design-sync/shims/next-link.tsx`, a `forwardRef` anchor that renders the same DOM Next produces
for a string href and drops the router-only props. Bundle went 121 KB → 22 KB. This applies to the
shipped bundle *and* the preview cards.

**Gotcha that cost a debugging cycle:** the converter parses that tsconfig with a comment-stripping
regex (`lib/bundle.mjs` `tsconfigPathsPlugin`) that mangles a JSON `"//"` comment KEY into invalid
JSON, silently returns `null`, and disables the paths plugin with no error. Keep
`tsconfig.sync.json` free of `"//"` keys.

## Fonts

The DS references three font variables that Next binds at runtime and that do not exist outside it:

| variable | bound in the app by | shipped here as |
|---|---|---|
| `--font-geist-sans` | `geist/font/sans` on `<body>` | `Geist-Variable.woff2` |
| `--font-geist-mono` | `geist/font/mono` on `<body>` | `GeistMono-Variable.woff2` |
| `--font-display` | `next/font/google` Manrope on `<body>` | `Manrope-latin{,-ext}.woff2` |

`tokens.css` only *references* them, so unbound they make every `font-family` declaration invalid
and the whole DS renders in the browser default serif — a failure nothing downstream would catch.

- `.design-sync/fonts/brand.css` (wired via `cfg.extraFonts`) carries the `@font-face` rules.
- `.design-sync/fonts/bridge.css` (imported last from `ds-entry.tsx`, so it wins over `tokens.css`)
  binds the variables to those families.
- The Manrope woff2 files were lifted from `.next/static/media/` (next/font self-hosts Google
  fonts) and committed, so the sync does not depend on a Next build having run. Both families are
  SIL OFL. **`--font-display` is Manrope, not Geist** — the `:root` value in `tokens.css` says
  Geist, but the app's `<body>` override wins on the live site, and the bridge reproduces that.

## Known render warns (checked and accepted — a warn NOT in this list is new)

- `[FONT_MISSING] "Inter", "JetBrains Mono"` — these appear only as *fallback* families after Geist
  in the `tokens.css` stacks. Geist ships, so nothing ever renders in them. Not resolvable without
  editing app source.

## Card viewports

The default capture viewport is 900x700, and the DS collapses `.ds-grid-3`/`.ds-grid-4` to two
columns at `max-width: 900px` and to one at `600px` — so a three-up composition renders 2+1 at the
default size and looks broken. `cfg.overrides` gives the compositional components
`cardMode: "column"` with a 1000–1240px viewport. Any new grid-based component needs the same.

## Prop contracts are hand-written — and must stay that way

`ds-bundle/components/<group>/<Name>/<Name>.d.ts` is the API contract the design agent codes
against. Automatic extraction produces **nothing** here: `lib/dts.mjs` resolves its ts-morph entry
as `pkgJson.types ?? pkgJson.typings ?? 'index.d.ts'` relative to the package root, and this repo's
`package.json` (a Next app) declares none of them, so the project has no source file and every
component came out as `{ [key: string]: unknown }` — a contract that tells the agent nothing.

`cfg.dtsPropsFor` therefore carries a hand-written props body for **all 42 components**. It is not
an exception list; it is the whole contract surface.

**When a component's props change in `src/components/ds/`, update `cfg.dtsPropsFor` in the same
commit** — nothing will fail if you don't, the design agent will just code against a stale API.
Do not "fix" this by adding a `types` field to the repo's `package.json`: that field is read by
editors and consumers of the app and would be pointing at a design-sync artefact.

## Layout breakpoints vs. the capture viewport

The capture viewport is **900x700**, and several DS media queries fire at exactly that width — so
what a preview looks like locally is not what it looks like at 1200px on a real page.

| selector | behaviour at the 900px capture viewport |
|---|---|
| `.ds-grid-2` | **always** single column (`max-width: 900px` matches) — never a two-up on a default card |
| `.ds-grid-3` / `.ds-grid-4` | two columns (2+1 for a three-up), one column below 600px |
| `.sec-head` | still two columns — its breakpoint is 800px, not 900px |
| `.ds .nav-links`, `.ds .nav-cta` | **hidden** — a nav preview renders brand-only unless you force `display:flex` inline |

Usable content width inside a default card is roughly **584px** after the harness's 24px body
padding and the `Frame` padding — cap card compositions at `maxWidth: 580`. Note a block
shrink-wraps: `maxWidth` sets a ceiling, it does not stretch a box to the cell edge.

For anything wider, `cfg.overrides.<Name>` takes `{cardMode: 'column'}` (one story per row at full
card width) and optionally `{viewport: 'WxH'}`. 35 of the 42 components carry an override today —
29 of them `cardMode: 'column'` applied straight from `[GRID_OVERFLOW]`'s `suggestedOverride`.
Captures are **not** full-page, so content taller than the declared viewport is clipped: `Stat` at
`1240x420` fits a Section-wrapped row but not a row under an h2 + lead, and `Numbered` at
`1100x620` fits four one-line steps but not four two-line ones.

## Preview conventions that make cards read

- Every cell opens with `const Frame = ({children}) => <div style={{padding:'28px 24px'}}>{children}</div>`.
  `.ds` is only as tall as its content and the card body is white, so an unpadded cell shows a thin
  dark strip floating on white. Cells that render a full `<Section>` already have 96/64px and must
  not be double-wrapped.
- **Icons get exactly two cells**: `Sizes` (16/24/32/48 in a fixed-height centring box with mono px
  captions, the 48px one in `var(--accent)`) and `InContext` (the icon doing its real job in a
  composition). A single glyph captures as an effectively blank PNG and gets flagged.
- Reach for the shipped classes before inventing chrome: `.approach-icon` (44px accent tile, expects
  a 22px glyph), `.contact-line` + `.contact-line-icon` (40px tile in a bordered row),
  `.checklist-item .x` (22px disc — pass `size={12}`), `.faq-toggle` (26px — `size={13}`),
  `.stack-pill`, `.cta-block`, `.q-block`, `.card` + `.spread` + `.divider`.
- `.faq-a` is `max-height: 0` unless its `.faq-item` also carries `.open`, so a static FAQ preview
  needs one item opened by hand or every answer is invisible.
- `Tag` uppercases in CSS — write tag copy in sentence case.
- Icon colour is inherited (`stroke="currentColor"`); there is no colour prop. Wrap in
  `<span style={{color:'var(--accent)'}}>`.
- The capture clock is pinned to **2024-05-15**, so dated copy in a cell stays stable across runs.

## Content integrity rules for previews

These cards are browsed by people and imitated by the design agent, so anything in them can end up
on a real page.

- **Never invent client names.** The only real ones are `ABN AMRO`, `NS`, `DIM Haarlem`, `NovaSkin`
  (the component's own `DEFAULT_LOGOS`). A first pass at `LogoBar` added two plausible-looking Dutch
  company names to demonstrate the density bound; they were removed. The unnamed-client tail is the
  production string `home.logoBarMore` = `"+ en andere"`, not an invented NDA count.
- **Never invent metrics.** A first pass at `Stat` and `Section` carried "82% blijft de tooling
  gebruiken", "4u tijdwinst per week" and similar. Real figures live in
  `src/translations/redesign/nl.json` under `cases.list[].outcomes` and are now used verbatim.
  This matters more here than in most design systems: the brand's entire pitch is "geen hype".
- **Use `src/translations/redesign/nl.json` for copy, not `src/translations/nl.json`.** The latter
  is pre-repositioning (April 2026) and off-tone — agent/MCP-first framing instead of
  training/adoption.
- `src/app/[locale]/(redesign-preview)/preview/components/page.tsx` is the repo's own showcase and
  the best composition source, but note it defines a **local `IconX`** at the bottom that shadows
  the DS export — a 12px stroke-width-2 copy. Import `IconX` from `@/components/ds` instead.

## Findings in the design system itself (not preview problems)

Surfaced while making every component render. These are real gaps for the team to decide on; the
previews document around them rather than papering over them.

1. **`LogoBar` is unusable on `<Section light>`.** It pins `color: var(--fg)` inline per name, so on
   the paper surface the names are near-white on cream. Fix would be to inherit `color` in
   `src/components/ds/LogoBar.tsx`. No light cell was authored for it.
2. **`Pill` and `Tag` have no `.section.light` overrides.** `base.css` scopes them to dark tokens
   only, so both render dark-surface values on a paper band. `CaseCard`, `Stat` and `Numbered` all
   do have light overrides — these two are the gap. No light cells authored for them.
3. **Some classes are not `.ds`-scoped.** `.approach-card`, `.approach-icon`, `.contact-line`,
   `.checklist*`, `.faq-*`, `.q-block*`, `.cta-block*` and `.stack-pill` are global in
   `components.css` / `pages.css`, unlike `.ds .card`, `.ds .row` and the rest. They work, but they
   can leak into the shadcn-styled admin and dashboard pages — the exact thing the `.ds` scoping
   was introduced to prevent.
4. **`IconArrow` defaults to `size={14}`; every other icon defaults to `20`.** Deliberate (it is the
   in-button arrow) but worth knowing — a bare `<IconArrow />` is smaller than a bare `<IconCheck />`.
5. **Small-size legibility.** `IconSpark` (thin four-point star), `IconWrench` (reads a bit like a
   paperclip) and `IconBracket` (collapses toward `{ }`) are the weakest at 16px. A property of the
   shipped SVG paths, not of the previews.
6. **`IconBracket` has no usage anywhere in `src/`**, and `IconNotes` has exactly one. Their
   `InContext` cells are authored from the documented purpose rather than ported from production.
7. `.numbered-body h3` caps at `22ch`, so the production title "Geen vendor lock-in als standaard"
   breaks mid-word as "lock-/in". `.stat-label` is uppercase mono and does not wrap gracefully past
   roughly 18 characters in a three-up.

## What is in `.design-sync/` (all of it is committed except `.cache/`)

| path | what it is |
|---|---|
| `config.json` | the whole sync config. `componentSrcMap` (42 pins), `dtsPropsFor` (42 contracts), `overrides` (35 card layouts), `projectId` |
| `ds-entry.tsx` | sync-only entry: re-exports `src/components/ds`, imports the stylesheet closure, defines `DsRoot` |
| `tsconfig.sync.json` | resolution only — the `@/*` alias plus the `next/link` swap. Not used by `next build`, `tsc` or the editor |
| `shims/next-link.tsx` | router-free anchor standing in for `next/link` |
| `fonts/` | `brand.css` (@font-face, via `cfg.extraFonts`), `bridge.css` (binds the font variables, imported by the entry), and four committed woff2 files |
| `docs/` | one `.md` per component → becomes its `.prompt.md`. Frontmatter `category` sets the group. The 30 icon docs were generated from a name→purpose table; the 12 component docs are hand-written |
| `previews/` | one `.tsx` per component, hand-authored. Named exports are the card cells |
| `conventions.md` | prepended to the generated README and inlined into the design agent's system prompt (`cfg.readmeHeader`) |
| `.cache/` | gitignored machine state: grades, remote anchor, upload manifests |

Groups in the Design System pane come only from doc frontmatter: actions, brand, cards, content,
data, icons, labels, layout, typography.

## Re-sync risks — what can silently go stale

- **`componentSrcMap` is a hand-maintained list.** New components in `src/components/ds/` are
  invisible to the sync until added; renamed or deleted ones fail the build with a missing path.
- **The Manrope woff2 files are pinned copies.** If the app switches its display font (or
  next/font's subsetting changes), `fonts/brand.css` and `fonts/bridge.css` will keep shipping the
  old face while the live site moves on. Re-check them whenever `src/app/layout.tsx` font wiring
  changes.
- **The `next/link` shim tracks Next's DOM output.** A major Next upgrade that changes what Link
  renders would make the shim drift from production. It is only used for the design bundle, so the
  blast radius is previews and generated designs, never the site.
- **`.design-sync/ds-entry.tsx` hardcodes the stylesheet path** `../src/styles/design-system/index.css`.
  Moving or renaming that barrel breaks the build loudly (good), but adding a new stylesheet to the
  DS that is not `@import`ed from `index.css` would ship silently missing styles (bad).
- **Tailwind is not in the shipped closure.** The DS itself uses plain CSS classes, so this is
  correct today — but if DS components ever start using Tailwind utilities, designs built in
  claude.ai/design will render them unstyled.
- The bundle is built from `src/` directly (esbuild, no repo build step), so it always reflects the
  working tree — including uncommitted changes. Sync from a clean checkout when it matters.
- **`conventions.md` names ~30 classes and ~29 custom properties.** They were all verified against
  the built CSS at sync time. If the DS renames a token or drops a class, the header keeps claiming
  it exists and the design agent will write vocabulary that resolves to nothing. Re-run the
  validation (grep each name against `ds-bundle/_ds_bundle.css`) on every re-sync — the skill's
  conventions step does this automatically when the file already exists.
- **`cfg.overrides` viewports were tuned against the current copy.** Longer copy in a preview can
  push content past the declared height and get silently clipped (captures are not full-page).
