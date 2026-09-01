---
category: Data
---

A single proof point: a large mono figure with an optional suffix and a small uppercase caption
underneath. Stats are always shown as a row of three or four — one on its own has nothing to
compare against.

## Props

- `num` — the figure as a string (`"3"`, `"1 uur"`, `"1225"`, `"0"`). Kept a string on purpose:
  the design system uses non-numeric figures (`"Auto"`, `"Multi"`, `"Headless"`) as often as
  numbers, and Dutch thousands separators stay in your hands.
- `suffix` — the unit, rendered smaller and in accent orange: `"%"`, `"u"`, `"x"`.
- `label` — what the figure measures. One line, sentence case; the CSS uppercases it.

## Usage

```jsx
<div className="ds-grid-3">
  <Stat num="1 uur" label="Per kwartaal in plaats van een hele dag" />
  <Stat num="0" label="Financiële data die het pand verlaat" />
  <Stat num="3" suffix="x" label="Merken bediend door één agent" />
</div>
```

The figures are the strongest claim on a GroeimetAI page, and the brand's whole pitch is that it
does not do hype — so a stat must be traceable to something that actually happened. Real outcomes
live in `src/translations/redesign/nl.json` under `cases.list[].outcomes`. A `"0"` is a legitimate
and frequently used figure here ("0 vendor lock-in", "0 externe data"); never round a claim up to
make a row look neater, and never invent a percentage to fill the third column.
