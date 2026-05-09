# /changelog

Voeg een entry toe aan `logs/changelog/YYYY-MM.md` voor de meest recente wijziging. Maakt het bestand aan als het nog niet bestaat.

## Input

`$ARGUMENTS` — optioneel, korte beschrijving van wat veranderd is. Als leeg: leid het af uit de laatste commits op de huidige branch (of op main als je daar zit).

## Stappen

1. **Bepaal de huidige context**:
   ```bash
   git branch --show-current
   git log --oneline -5
   ```
   Bewaar: huidige branch, laatste commit SHA, laatste commit message.

2. **Bepaal het type** uit de branch prefix of de commit message:
   - `feat/` of "feat:" → `feature`
   - `copy/` of "copy:" → `copy`
   - `visual/` of "visual:" → `visual`
   - `fix/` of "fix:" → `fix`
   - Anders: vraag aan Niels welk type het is.

3. **Bepaal de beschrijving**:
   - Als `$ARGUMENTS` is meegegeven: gebruik die
   - Anders: gebruik de laatste commit message als basis en vraag of die zo goed is

4. **Haal de preview/productie URL op** (indien van toepassing):
   - Als de branch nog niet is gepromoot: huidige preview URL via `gcloud run services describe groeimetai-app --region=europe-west1 --format=json | jq -r '.status.traffic[]'`
   - Als gepromoot naar main: de productie URL (`https://groeimetai.io` of de Cloud Run service URL)

5. **Bepaal het changelog bestand**:
   - Format: `logs/changelog/YYYY-MM.md` (bv. `logs/changelog/2026-04.md`)
   - Bestaat het niet? Maak het aan met een H1 header: `# Changelog YYYY-MM`

6. **Voeg de entry toe** bovenaan (nieuwste eerst), met dit format:

   ```markdown
   ## YYYY-MM-DD — <type>: <korte beschrijving>

   **Branch**: `<branch-naam>`
   **Commit**: `<sha-7chars>`
   **URL**: <preview of productie URL>

   <1-3 zinnen wat er veranderde en waarom>

   ---
   ```

   Zie `templates/changelog-entry.md` voor het skeleton.

7. **Bevestig de entry** kort aan Niels door het pad terug te geven en de toegevoegde sectie te tonen.

## Regels

- **Eén entry per logisch te onderscheiden wijziging.** Niet twintig commits in één entry proppen — als het twintig commits zijn die samen één feature vormen, één entry. Als het twee losse fixes zijn, twee entries.
- **Nieuwste entries bovenaan** in het maand-bestand.
- **Geen subjectieve adjectieven** ("geweldige nieuwe feature", "slimme refactor"). Beschrijf wat er veranderde, niet hoe goed het is.
- **Maand-bestanden niet samenvoegen.** Eén bestand per maand, ook als de maand maar één entry heeft.
- **De entry is voor toekomstige Niels** (of een andere agent in een nieuwe sessie). Schrijf zo dat iemand zonder context begrijpt wat er gebeurde.
