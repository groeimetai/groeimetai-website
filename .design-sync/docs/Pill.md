---
category: Labels
---

A rounded status chip with a small green dot, used for availability and state
messages near a hero or a form: "Beschikbaar voor Q3 trajecten".

## Props

- `children` — the message. A short sentence, sentence case.
- `withDot` — defaults to `true`. Set `false` when the pill is a neutral label
  rather than a status.

## Usage

```jsx
<Pill>Beschikbaar voor Q3 trajecten</Pill>
<Pill withDot={false}>Nederlands &amp; Engels</Pill>
```

At most one status pill per view. For categorising content use `Tag`; the pill
is about *now*, the tag is about *what*.
