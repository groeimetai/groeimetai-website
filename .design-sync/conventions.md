## How to build with this design system

**Every design must be wrapped in `DsRoot`.** All GroeimetAI styles are scoped under `.ds`
(the wrapper `DsRoot` renders) so they never leak into the app's shadcn-styled admin pages.
Outside it, components render as unstyled browser defaults — no error, just wrong.

```jsx
<DsRoot>
  <Section>…</Section>
  <Section light>…</Section>
</DsRoot>
```

A page is a stack of `Section` bands directly inside `DsRoot`. Never nest a `Section` in a
`Section`. `Section` supplies the vertical rhythm (96px, or 64px with `tight`) and the centred
`container`; `light` flips a band to the warm paper surface and every child — cards, buttons,
body copy — switches to its ink-on-paper treatment automatically.

### The styling idiom: plain CSS classes + custom properties, no Tailwind

There is **no Tailwind in the shipped stylesheet.** Style your own layout glue with these class
names and CSS variables, or with inline styles. Utility classes like `mt-4` or `bg-gray-900`
resolve to nothing here.

| purpose | classes |
|---|---|
| layout | `row` (flex, 12px gap), `spread`, `ds-grid-2`, `ds-grid-3`, `ds-grid-4`, `container`, `divider` |
| section header | `sec-head` + `sec-head-right` (eyebrow + h2 left, `lead` paragraph right) |
| type | `lead` (19px dimmed intro), `mono`, `eyebrow` |
| surfaces | `card`, `card interactive`, `cta-block`, `q-block` |
| lists | `checklist` + `checklist-item` (with an `x` disc child), `steps` + `step`, `faq-item` (+ `open`) + `faq-q`/`faq-a`/`faq-toggle` |
| chips | `pill`, `tag`, `stack-pill` |
| icon tile | `approach-icon` (44px rounded accent tile, expects a 22px icon) |

Colour and type come from custom properties, never from literals:
`--bg` `--bg-elev` `--bg-elev-2` (dark surfaces) · `--paper` `--paper-elev` (light surfaces) ·
`--fg` `--fg-dim` `--fg-mute` (dark-surface text) · `--ink` `--ink-dim` `--ink-mute` (paper text) ·
`--accent` `--accent-hot` `--accent-deep` `--accent-soft` (the orange) · `--line` `--line-strong`
(borders) · `--good` `--warn` · `--font-display` (Manrope, headings) `--font-sans` (Geist, body)
`--font-mono` (Geist Mono, eyebrows/figures/labels) · `--r-sm` `--r-md` `--r-lg` `--r-xl` ·
`--maxw` `--gutter` `--ease`.

Grids collapse below 900px (`ds-grid-3`/`ds-grid-4` → two columns, `ds-grid-2` → one) and to a
single column below 600px. Build for a desktop width and let that happen.

Icons are stroke-only with `stroke="currentColor"`: size them with `size`, colour them by setting
`color` on a parent. There is no colour prop.

### Where the truth lives

Read `_ds/<folder>/styles.css` and the `_ds_bundle.css` it imports before styling anything — the
class list above is a summary, that file is the source. Each component's own `.d.ts` carries its
prop contract and its `.prompt.md` carries usage guidance with real examples.

### Voice

The copy is Dutch and deliberately unhyped: direct, concrete, honest about limits. No
"revolutionair", no "10x". Figures shown in `Stat` are real client outcomes — never invent a
percentage to fill a column, and never invent a client name for `LogoBar`.

```jsx
<DsRoot>
  <Section id="aanpak">
    <div className="sec-head">
      <div>
        <Eyebrow>Approach</Eyebrow>
        <h2 style={{ marginTop: 16 }}>Hoe we het aanpakken</h2>
      </div>
      <div className="sec-head-right">
        <p className="lead">In vier stappen van eerste sessie naar dagelijks gebruik.</p>
      </div>
    </div>
    <div className="ds-grid-3">
      <PillarCard tag="01 / FOLDERS" title="Kennis als folderstructuur"
        desc="Een agent weet wat hij weet doordat zijn kennis netjes in mappen staat."
        items={['Geordend per domein', 'Klantcontext apart', 'Versie-controle in je repo']} />
    </div>
    <div className="row" style={{ marginTop: 32, gap: 12 }}>
      <Btn href="/contact">Plan een kennismaking <IconArrow size={14} /></Btn>
      <Btn variant="ghost">Bekijk de trainingen</Btn>
    </div>
  </Section>
</DsRoot>
```
