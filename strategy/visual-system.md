# Visual System — GroeimetAI website

Bron: `tailwind.config.ts` en `src/styles/`. Dit document beschrijft het bestaande systeem; aanpassingen aan tokens vereisen Niels' OK.

## Brand colors

| Token | Hex | Gebruik |
|-------|-----|---------|
| `brand` / `orange` | `#FF6600` | Primary CTA, accents, links die actie suggereren |
| `brandAccent` / `green` | `#125312` | Secondary CTA, succes states, contrast op oranje |
| `black` | `#000000` | Backgrounds (donkere secties), zware tekst |
| `white` | `#FFFFFF` | Backgrounds (lichte secties), tekst op donker |

Volledige schaal staat in `tailwind.config.ts`:
- `brand`/`orange` heeft `50` (lichtst, `#FFAA66`) tot `900` (donkerst, `#4D1F00`)
- `brandAccent`/`green` heeft `50` tot `900`
- `neutral` is een grijsschaal van `50` (`#FFFFFF`) tot `900` (`#000000`)

## Regels voor kleurgebruik

1. **Geen losse hex codes in components.** Altijd via Tailwind klassen (`bg-brand`, `text-brandAccent`, `border-neutral-300`).
2. **Eén primary CTA per scherm** in `bg-brand`. Te veel oranje verwart de aandacht.
3. **Hover states**: meestal één stap donkerder (`bg-brand-300` op `bg-brand` button).
4. **Geen kleur-only feedback.** Een succes-state mag groen zijn, maar moet ook een icoon of tekst hebben (a11y).
5. **`brand` en `brandAccent` zijn legacy compatibility tokens.** Voor nieuwe code mag je `orange-*` en `green-*` direct gebruiken — ze wijzen naar dezelfde hex codes.

## Typografie

- `font-sans` → `var(--font-body)` met system-ui fallback. Voor lopende tekst.
- `font-display` → `var(--font-display)` met system-ui fallback. Voor headers en hero copy.

CSS variabelen voor de fonts worden in `src/app/layout.tsx` gezet (next/font). Voeg geen nieuwe fonts toe zonder Niels te vragen.

## Spacing en container

- Container is centered met `2rem` padding en max-width `1400px` op `2xl`
- Volg standaard Tailwind spacing scale (`p-4`, `gap-8`, etc.)
- Geen magic numbers in arbitrary values (`w-[437px]`) — als je iets nodig hebt dat niet in de scale past, overweeg of het echt nodig is

## Components

De site gebruikt **Radix UI primitives** (`@radix-ui/react-*`) als basis voor accessible interactieve componenten:
- Dialog, Alert Dialog, Dropdown Menu, Popover, Tabs, Accordion, Switch, Toast, Tooltip

Plus **shadcn-style** wrappers in `src/components/ui/` (typisch). Gebruik bestaande componenten — bouw geen nieuwe Button, Modal of Dropdown vanaf nul tenzij Niels het expliciet vraagt.

Andere libraries die in gebruik zijn:
- `framer-motion` voor animaties (gebruik `motion.div`, niet eigen requestAnimationFrame loops)
- `lucide-react` voor iconen (`<Search />`, `<ChevronRight />`)
- `react-icons` als fallback voor brand iconen
- `tailwind-merge` + `clsx` voor conditional classnames (`cn(...)` helper)

## Animaties

`tailwind.config.ts` definieert custom animaties:
- `animate-pulse-slow` — 4s pulse
- `animate-float` — 6s float
- `animate-agent-move`, `animate-memory-pulse`, `animate-connection-flow` — agent-thema decoraties (let op: gerelateerd aan oude positionering, gebruik terughoudend op nieuwe pagina's)

Voor nieuwe animaties: gebruik framer-motion. Geen losse keyframes in CSS tenzij het echt simpel is.

## Dark mode

`darkMode: ['class']` in tailwind config — geactiveerd via `class="dark"` op `<html>`. Veel kleuren zijn al in `hsl(var(--*))` formaat zodat ze in dark mode kunnen kantelen. Bij nieuwe componenten: test in beide modes.

## Quality check vóór visual changes

- [ ] Geen losse hex codes — alleen Tailwind tokens?
- [ ] Geen arbitrary values (`w-[437px]`) zonder reden?
- [ ] Werkt het in dark mode?
- [ ] Bestaat er al een component dat ik kan hergebruiken?
- [ ] A11y: voldoende contrast, geen kleur-only feedback?
- [ ] Mobile breakpoint getest?
