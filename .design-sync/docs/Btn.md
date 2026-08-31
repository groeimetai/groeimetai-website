---
category: Actions
---

The primary call-to-action of the GroeimetAI design system. Renders a `<button>`,
or an `<a>` as soon as `href` is set — the props are a discriminated union, so
passing `href` gives you the anchor form with all the usual anchor attributes.

## Variants

- `primary` (default) — solid orange (`--accent`), used once per view for the
  main action: "Plan een kennismaking", "Bekijk de trainingen".
- `ghost` — transparent with a `--line-strong` border, for the secondary action
  next to a primary one. Inside `<Section light>` it automatically flips to the
  ink-on-paper treatment; no extra prop needed.

## Usage

```jsx
<div className="row">
  <Btn href="/contact">Plan een kennismaking <IconArrow size={14} /></Btn>
  <Btn variant="ghost" onClick={openDemo}>Bekijk voorbeeld</Btn>
</div>
```

Buttons carry their label as children. An arrow icon after the label is the
house pattern for anything that moves the visitor forward; keep it out of
ghost buttons. `className` is appended to `btn btn-<variant>`, so extra layout
classes are safe. Two primaries side by side is a smell — make one ghost.
