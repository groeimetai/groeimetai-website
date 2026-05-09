# /feature

Start een nieuwe wijziging aan de site (feature, copy-fix, visuele tweak of bugfix). Maakt een aparte branch, implementeert, pusht, en geeft de getagde Cloud Run preview URL terug zodat Niels end-to-end kan testen voor merge.

## Input

`$ARGUMENTS` — beschrijving van wat er moet gebeuren. Voorbeelden:
- `voeg een testimonials sectie toe op de homepage`
- `pas de hero copy aan om de nieuwe positionering te volgen`
- `de mobiele nav heeft een z-index probleem`
- `verander de oranje knoppen op de pricing pagina naar de accent groene kleur`

## Stappen

1. **Lees context** voor je iets doet:
   - `CLAUDE.md` — voor positionering, tone en werkregels
   - `strategy/deploy-flow.md` — voor de exacte git/gcloud commands
   - `strategy/voice-and-tone.md` als de wijziging copy bevat
   - `strategy/visual-system.md` als de wijziging visueel is
   - `strategy/tech-stack.md` als je iets bouwt dat raakt aan Firebase, Sentry, of next-intl

2. **Bepaal het type wijziging** uit `$ARGUMENTS` — kies één:
   - `feat/` — nieuwe functionaliteit
   - `copy/` — alleen tekst-aanpassingen
   - `visual/` — alleen styling/layout
   - `fix/` — bugfix

3. **Stel een plan voor** aan Niels voor je code raakt:
   - Welke files je gaat aanpassen
   - Welke aanpak (waarom deze, niet een andere)
   - Of het binnen `src/translations/{nl,en}.json` valt of in components
   - Geschatte impact (één component, meerdere routes, etc.)
   - Wacht op `ja` of inhoudelijke feedback. Niet doorgaan zonder OK.

4. **Maak een branch** vanaf een schone `main`:
   ```bash
   git checkout main && git pull --ff-only
   git checkout -b <type>/<korte-slug>
   ```
   Slug is kebab-case en beschrijft het probleem (`copy/hero-repositionering`, `feat/testimonials-homepage`).

5. **Implementeer de wijziging**:
   - Voor copy: pas zowel `src/translations/nl.json` als `src/translations/en.json` aan. Gebruik dezelfde key-structuur.
   - Voor visueel: gebruik bestaande Tailwind tokens uit `tailwind.config.ts` (`brand`, `brandAccent`, `neutral`). Geen losse hex codes.
   - Voor features: volg de bestaande structuur in `src/app/` (App Router) of `src/components/`.
   - Quality check on the fly: spelling in copy, tone matcht de positionering, geen oude termen als "AI implementation partner" of "agent-ready".

6. **Lokale validatie** vóór commit (blocking):
   ```bash
   npm run typecheck
   npm run lint
   npm run build
   ```
   Als één van deze faalt: fix het. Niet pushen met een falende lokale build — Cloud Build gaat dezelfde fout geven en je bent 5+ minuten kwijt.

7. **Commit en push**:
   ```bash
   git add <specifieke files>          # niet git add .
   git commit -m "<type>: <korte beschrijving>"
   git push -u origin <branch-naam>
   ```
   Commit-messages zijn imperatief en kort (`copy: herpositioneer hero naar no-bullshit AI`).

8. **Wacht op Cloud Build** en haal de preview URL op:
   ```bash
   gcloud builds list --ongoing --limit=1
   ```
   Wacht tot de build `SUCCESS` is (kan 3-7 min duren). Daarna:
   ```bash
   gcloud run services describe groeimetai-app \
     --region=europe-west1 \
     --format='value(status.traffic[?tag=preview-<branch-slug>].url)'
   ```
   De preview URL heeft het format `https://preview-<slug>---groeimetai-app-<hash>.europe-west1.run.app`.

9. **Rapporteer aan Niels**:
   - Branch naam
   - Commit SHA
   - Preview URL (klikbaar)
   - Wat er getest moet worden (concreet: "test de hero copy in nl en en, en check of de CTA nog naar /contact gaat")
   - Volgende stap: Niels test → na OK draait hij `/promote`

## Regels

- **Nooit direct op main werken.** Stap 4 is verplicht.
- **Geen `git add .`** — voeg expliciet de bedoelde files toe. Voorkomt accidentele commits van `.env`, lokale build artefacten, of files die niet in scope zijn.
- **Plan vóór code**, niet andersom. Stap 3 mag je niet overslaan.
- **Lokale build is blocking.** Zie stap 6.
- **Niet zelf mergen naar main.** Dat is `/promote` en gebeurt alleen na Niels' OK.
- **Bij twijfel over scope**: stop, vraag, scaffold geen guess.
