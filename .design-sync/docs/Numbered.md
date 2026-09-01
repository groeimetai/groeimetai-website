---
category: Content
---

One step in a numbered sequence: a mono step number in the left gutter, a
heading and a paragraph on the right, with a hairline separating it from the
next step. Used for process explanations — "in vier stappen van kennismaking
naar dagelijks gebruik".

## Props

- `n` — the step number as a string, zero-padded in the house style: `"01"`.
- `title` — the step in a few words.
- `children` — one or two sentences of body copy (rendered inside a `<p>`).

## Usage

```jsx
<Numbered n="01" title="Kennismaking">
  Een sessie van een uur waarin we jullie werk doornemen en bepalen waar AI echt tijd scheelt.
</Numbered>
<Numbered n="02" title="Pilot met één team">
  Eén afdeling, één use case, vier weken. Aan het eind weet je of het werkt.
</Numbered>
```

Stack them directly as siblings — the borders line up into one list. Three to
five steps; beyond that the sequence stops reading as a sequence.
