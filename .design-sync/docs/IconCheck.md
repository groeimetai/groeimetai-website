---
category: Icons
---

Line icon from the GroeimetAI set. Used for a delivered item in a checklist.

## API

All `Icon*` components share one signature: `(props: SVGProps<SVGSVGElement> & { size?: number })`.
They render a 24×24 `viewBox` SVG with `stroke="currentColor"`, `stroke-width="1.5"`
and the class `icon`, so they take their colour from the surrounding text and
their weight from the design system rather than from props.

- `size` — width and height in pixels, default `20`. House sizes are `14` inside a
  button or link, `16`–`20` inline with body copy, and `28`–`40` as a standalone
  feature icon.
- Everything else is forwarded to the `<svg>`: `className`, `aria-hidden`, `style`, …

## Usage

```jsx
<Btn variant="primary">Plan een kennismaking <IconCheck size={14} /></Btn>

<div style={{ color: 'var(--accent)' }}>
  <IconCheck size={28} />
</div>
```

Set the colour on a parent (or with `style={{ color: … }}`), never with a `fill`
prop — these are stroke icons. Decorative icons should carry `aria-hidden`.
