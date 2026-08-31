---
category: Layout
---

The page rhythm primitive. Every band of a GroeimetAI marketing page is one
`Section`: it supplies the vertical padding (96px, or 64px with `tight`) and
wraps its children in the `container` that caps line length at `--maxw` and
adds the page gutter. Sections are stacked directly under the root; never nest
one inside another.

## Props

- `id` — anchor target for in-page navigation.
- `light` — flips the band to the warm paper surface (`--paper` / `--ink`).
  Cards, buttons and body copy inside it switch to their light treatment
  automatically. Use it to break up a long dark page — roughly every third band.
- `tight` — 64px instead of 96px padding, for a band that belongs with the one
  above it (a logo bar under a hero).
- `style` — escape hatch for a one-off background or offset.

## Usage

```jsx
<Section id="aanpak">
  <div className="sec-head">
    <div>
      <Eyebrow>Approach</Eyebrow>
      <h2 style={{ marginTop: 16 }}>Hoe we het aanpakken</h2>
    </div>
    <div className="sec-head-right">
      <p className="lead">In vier stappen van eerste sessie naar productie-klare agent.</p>
    </div>
  </div>
  {/* content */}
</Section>
```

`sec-head` is the standard two-column section header: eyebrow plus heading on
the left, a `lead` paragraph on the right. On a hero, drop `sec-head` and let
the `h1` and `lead` run full width.
