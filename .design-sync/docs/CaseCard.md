---
category: Cards
---

A client case teaser: industry label on top, the case title, a snippet of what
was done, and one metric pinned to the bottom of the card. Shown in a grid on
the cases overview and as a three-up on the homepage.

## Props

- `industry` — sector or client type in mono caps: `"ZORG"`, `"FINANCIEEL"`.
- `title` — what was achieved, not the client name.
- `snippet` — one or two sentences of context.
- `metric` — `{ num, label }`; the single number this case is remembered by.

## Usage

```jsx
<div className="ds-grid-3">
  <CaseCard
    industry="FINANCIEEL"
    title="Van 3 dagen naar 4 uur maandafsluiting"
    snippet="Het finance-team bouwde zelf de controles die eerst handmatig werden nagelopen."
    metric={{ num: '−85%', label: 'Doorlooptijd afsluiting' }}
  />
</div>
```

Keep the metric honest and specific — a percentage with a baseline beats a
round number without one. Under NDA, describe the sector and drop the name.
