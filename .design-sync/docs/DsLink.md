---
category: Actions
---

The tertiary action: a text link with an arrow that slides on hover. Use it
where a button would be too loud — "meer over deze aanpak", a case study link
at the bottom of a card, a footer nav item.

## Props

- `href` — internal path (`/cases`) renders a Next `Link`; an `http(s)` URL
  renders a plain anchor with `target="_blank"` and `rel="noopener noreferrer"`.
  Omit `href` entirely and you get an `<a href="#">` for click-only use.
- `onClick` — handler; works with or without `href`.
- `children` — the label. No arrow in the text: the component adds it.

## Usage

```jsx
<DsLink href="/cases">Bekijk alle cases</DsLink>
<DsLink onClick={() => setOpen(true)}>Lees de volledige aanpak</DsLink>
```

Keep labels short and verb-first. One DsLink per card or per paragraph — a
stack of them reads as a nav, and a nav should be a nav.
