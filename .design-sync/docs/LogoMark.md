---
category: Brand
---

The GroeimetAI mark: a rounded accent-orange tile with the folder-and-node
glyph. Used in the nav, the footer, and anywhere the brand needs to sign
something.

## Props

- `size` — pixel size, default `28`. The glyph is drawn on a 32×32 grid and
  scales cleanly; below 20px the interior detail starts to close up.
- `accent` — tile colour, defaults to `var(--accent)`.
- `ink` — glyph colour, defaults to the near-black `#1a0d05` used on orange.

## Usage

```jsx
<div className="row" style={{ gap: 10 }}>
  <LogoMark size={28} />
  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>GroeimetAI</span>
</div>
```

The mark is always square and never recoloured outside the brand pair. On the
paper surface it keeps the same orange tile — do not invert it.
