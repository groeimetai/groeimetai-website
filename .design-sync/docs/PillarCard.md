---
category: Cards
---

A clickable card for one of a set of three or four parallel propositions —
the "pillars" pattern used on the homepage and the service pages. Composed of
a mono `tag` in the header, an arrow that lights up on hover, a title, one
paragraph of body copy, and a checklist of concrete deliverables.

## Props

- `tag` — short mono label, numbered in the house style: `"01 / FOLDERS"`.
- `title` — one line, sentence case, no period.
- `desc` — one or two sentences. What it is, in plain language.
- `items` — three to five short phrases. Concrete deliverables, not benefits.
- `onClick` — optional; the whole card is the click target.

## Usage

```jsx
<div className="ds-grid-3">
  <PillarCard
    tag="01 / FOLDERS"
    title="Kennis als folderstructuur"
    desc="Geen vage prompts. Een agent weet wat hij weet doordat zijn kennis netjes in mappen staat."
    items={['Documenten geordend per domein', 'Klantcontext apart van product', 'Versie-controle in je repo']}
    onClick={() => router.push('/agents')}
  />
  {/* two more */}
</div>
```

Always place these in a `ds-grid-3` (or `ds-grid-2`/`ds-grid-4`) — the card has
a `min-height` of 320px and is designed to sit next to siblings of equal weight.
A single PillarCard on its own reads as a mistake; use a plain `card` instead.
