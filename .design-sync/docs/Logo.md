---
category: Brand
---

Mark plus wordmark, locked up. Use this rather than composing the two by hand, so the gap ratio stays
right: 0.4× the mark height horizontally, 0.35× stacked.

## Props

- `size` — mark size in px, default 32. The wordmark and the gap scale from it.
- `stacked` — wordmark under the mark, both centred, instead of beside it.
- `compact` — force the compact mark; set automatically below 24px.
- `color` — passed to the wordmark; the mark inherits it through `currentColor`.

## Usage

```jsx
<Logo size={32} />
<Logo size={40} stacked />
```

Minimum 96px wide for the horizontal lockup. On photos or busy grounds use the tile version from the
brand pack instead.
