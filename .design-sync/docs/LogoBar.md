---
category: Brand
---

The social-proof row: client names set as large wordmarks separated by mono dots. No image logos —
the brand uses type, so a new client is one string, not an SVG hunt.

## Props

- `logos` — array of client names. Defaults to the current set
  (`ABN AMRO`, `NS`, `DIM Haarlem`, `NovaSkin`).
- `more` — optional dimmed mono tail for the work that can't be named. Production uses the
  translated string `home.logoBarMore`, currently `"+ en andere"`.

## Usage

```jsx
<Section tight>
  <div style={{ textAlign: 'center' }}>
    <Eyebrow>Eerder gewerkt voor</Eyebrow>
    <div style={{ marginTop: 28 }}>
      <LogoBar more="+ en andere" />
    </div>
  </div>
</Section>
```

Belongs in a `tight` section directly under the hero. Four to six *short* names — the names scale
with the viewport (`clamp(20px, 2.4vw, 28px)`), so six long ones wrap and strand a separator dot at
the end of the first line. **Only ever pass real client names**; this row is a factual claim about
who the company has worked for.

Known limitation: the component pins `color: var(--fg)` inline on each name, so it renders
near-white and unreadable inside `<Section light>`. Keep it on the dark surface until that is fixed
in `src/components/ds/LogoBar.tsx`.
