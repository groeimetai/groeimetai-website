# Changelog Entry Template

> Skeleton voor entries in `logs/changelog/YYYY-MM.md`. Wordt gebruikt door `/changelog`. Pas dit niet aan zonder ook `/changelog` aan te passen — ze horen bij elkaar.

```markdown
## YYYY-MM-DD — <type>: <korte beschrijving>

**Branch**: `<branch-naam>`
**Commit**: `<sha-7chars>`
**URL**: <preview of productie URL>

<1-3 zinnen wat er veranderde en waarom. Niet wat je geweldig vond aan de wijziging, maar wat een toekomstige lezer moet weten om de context te begrijpen. Verwijs waar nuttig naar de issue, het ticket, of het gesprek waar de wijziging vandaan kwam.>

---
```

## Type values

- `feature` — nieuwe functionaliteit
- `copy` — tekst-aanpassingen
- `visual` — styling/layout
- `fix` — bugfix

## Voorbeelden

```markdown
## 2026-04-08 — copy: herpositioneer hero naar no-bullshit AI

**Branch**: `copy/hero-repositionering`
**Commit**: `a3f1b9c`
**URL**: https://groeimetai.io

Hero copy aangepast naar de april 2026 positionering ("Geen AI-hype. Wel teams die er beter door werken"). Oude termen "AI implementation partner" en "agent platform" verwijderd uit nl/en translations. CTA blijft naar /contact.

---

## 2026-04-07 — fix: mobiele nav z-index conflict met chatwidget

**Branch**: `fix/mobile-nav-zindex`
**Commit**: `7e2c481`
**URL**: https://groeimetai.io

De mobiele nav viel onder de chat-widget op iPhone safari. Z-index van nav verhoogd van 40 naar 60. Chat widget heeft z-50, dus nav klikt nu correct doorheen.

---
```

## Wat NIET in een entry

- Subjectieve adjectieven ("geweldige nieuwe feature", "elegante refactor")
- Lange technische uitleg — daarvoor is `logs/conversations/`
- Marketing-praat — dit is een ontwikkelingslog, geen release notes voor klanten
- File-by-file diffs — daarvoor is `git log` / `git show`
