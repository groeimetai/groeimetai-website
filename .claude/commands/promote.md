# /promote

Promoot de huidige feature branch naar productie. **Destructief** — schakelt live traffic naar de nieuwe revision. Mag alleen gedraaid worden na expliciete OK van Niels op de preview URL.

## Input

`$ARGUMENTS` — optioneel, branch naam als je niet vanaf de feature branch zelf draait. Default: huidige branch.

## Stappen

1. **Bevestig EXPLICIET met Niels** voor je iets doet:
   - Toon de branch die gepromoot wordt
   - Toon de preview URL die getest is
   - Toon de laatste commit message
   - Vraag letterlijk: *"Bevestig je dat dit naar productie mag? (ja/nee)"*
   - Bij iets anders dan `ja`: STOP. Geen actie.

2. **Verifieer dat de branch klaar is**:
   ```bash
   git fetch origin
   git status
   ```
   Branch moet up-to-date zijn met origin (alles gepushed). Geen uncommitted changes.

3. **Controleer dat main niet voor je uit is gelopen**:
   ```bash
   git fetch origin main
   git log --oneline origin/main..HEAD   # commits op branch die niet op main staan
   git log --oneline HEAD..origin/main   # commits op main die niet op branch staan
   ```
   Als main commits heeft die niet op de branch staan: STOP en meld dit aan Niels. Vraag of hij wil rebasen of mergen — niet zelf besluiten. Een blinde merge kan oude positionering of andermans werk overschrijven.

4. **Merge naar main** (fast-forward bij voorkeur, anders merge commit):
   ```bash
   git checkout main
   git pull --ff-only
   git merge --no-ff <branch-naam> -m "Merge <branch-naam>: <korte beschrijving>"
   git push origin main
   ```

5. **Wacht op Cloud Build van main**:
   ```bash
   gcloud builds list --ongoing --limit=3
   ```
   Tot de build `SUCCESS` toont. Bij `FAILURE`: STOP. Rapporteer de error en de huidige productie-status (oude revision draait nog, geen impact). Niels moet beslissen wat te doen — niet zelf rollback proberen.

6. **Verifieer dat de nieuwe revision healthy is** voor traffic switch:
   ```bash
   gcloud run revisions list \
     --service=groeimetai-app \
     --region=europe-west1 \
     --limit=3
   ```
   De nieuwste revision moet `Active` en `Ready` zijn.

7. **Switch traffic naar 100% nieuwe revision**:
   ```bash
   gcloud run services update-traffic groeimetai-app \
     --region=europe-west1 \
     --to-latest
   ```
   Verifieer:
   ```bash
   gcloud run services describe groeimetai-app \
     --region=europe-west1 \
     --format='value(status.traffic)'
   ```
   100% moet naar de nieuwe revision wijzen.

8. **Verwijder de preview tag** (oude tagged revision blijft anders aan een dode URL hangen):
   ```bash
   gcloud run services update-traffic groeimetai-app \
     --region=europe-west1 \
     --remove-tags=preview-<slug>
   ```

9. **Ruim de branch op**:
   ```bash
   git branch -d <branch-naam>           # lokaal (fails als niet gemerged — safety)
   git push origin --delete <branch-naam> # remote
   ```

10. **Update changelog**: roep `/changelog` aan met een korte beschrijving van wat live ging, of doe het inline:
    - Voeg entry toe aan `logs/changelog/YYYY-MM.md` met datum, type, korte beschrijving, commit SHA op main, en de link naar de live URL (productie).

11. **Rapporteer succesvolle promote**:
    - Commit SHA op main
    - Live URL (productie)
    - Wat er live is gegaan
    - Suggestie om Sentry of analytics te checken voor onverwachte errors in de eerste minuten

## Regels

- **Stap 1 is niet onderhandelbaar.** Geen ja = geen promote.
- **Niet rebasen of force-pushen** zonder Niels' OK. Stap 3 vraagt het expliciet.
- **Bij Cloud Build failure**: STOP. Geen automatische rollback. Niels beslist.
- **Tag opruimen is verplicht** (stap 8) — anders blijven preview URLs aan dode revisions hangen en worden Cloud Run quota's eerder bereikt.
- **Branch verwijderen alleen na succesvolle promote.** Bij twijfel: laat de branch staan.
- **Niet zelf "even snel" een fix-commit doen** tussen merge en traffic switch in. Als er iets stuk is na merge: STOP en meld het.
