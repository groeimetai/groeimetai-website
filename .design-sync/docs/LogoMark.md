---
category: Brand
---

The GroeimetAI mark: open square brackets around a folder. The brackets are never closed — the box
is open, you can see in. The folder is what is inside. One accent colour, used once, and only on the
inside.

## Props

- `size` — pixel size, default 28. Below 24px switch to `compact`.
- `bracket` — bracket colour, defaults to `currentColor` so the mark inherits the surrounding text
  colour. That is why it needs no light/dark variant prop: on the dark surface it comes out
  `--fg`, on paper `--ink`.
- `folder` — folder colour, defaults to `var(--accent)`. This is the one place the accent appears;
  never put the orange on the outside.
- `compact` — heavier brackets and a larger folder, drawn so the tab survives down to 14px.
- `title` — sets `role="img"` and an accessible name. Without it the mark is `aria-hidden`, which is
  what you want next to the wordmark.

## Usage

```jsx
<div className="row" style={{ gap: 10 }}>
  <LogoMark size={28} />
  <Wordmark />
</div>

<LogoMark size={16} compact title="GroeimetAI" />
```

Rendered as inline SVG on purpose — an `<img>` cannot see the page's CSS custom properties, which is
exactly why the previous wordmark rendered black-on-black in the nav.

Clear space on all sides is one bracket arm (≈30% of the mark height). Never close the brackets,
rotate, stretch, outline, or recolour the folder outside the accent family.
