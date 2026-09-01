---
category: Typography
---

The small uppercase mono label that sits above a heading and tells the visitor
which band of the page they are in. Every `Section` on a marketing page opens
with one.

## Usage

```jsx
<Eyebrow>Approach</Eyebrow>
<h2 style={{ marginTop: 16 }}>Hoe we het aanpakken</h2>
```

One to three words, no punctuation. The component uppercases and letterspaces
via CSS, so write it in normal case. Inside `<Section light>` it dims to the
ink-muted tone automatically. Never use it as a standalone label on a card —
that is what `Tag` is for.
