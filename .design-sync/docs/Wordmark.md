---
category: Brand
---

"Groeimet" in the foreground colour, "AI" in the accent — the two-part colouring the brand has always
used, but as live text so it inherits the loaded Geist instead of depending on a font being available
inside an SVG.

## Props

- `size` — font size in px, default 21.5 (the size used in the horizontal lockup).
- `color` — colour of "Groeimet". "AI" is always `var(--accent)` and is not configurable.

## Usage

```jsx
<Wordmark size={17} />
```

Set in `--font-display` at weight 500 with `-0.02em` letter-spacing. For print, outline the type
first — the SVG lockups in the brand pack carry live `<text>`.
