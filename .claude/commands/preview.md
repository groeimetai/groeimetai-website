# /preview

Standalone preview deploy van de huidige branch. Gebruik dit als je extra commits hebt toegevoegd aan een branch die al een keer via `/feature` is gepushed, of als je handmatig een branch wil deployen zonder de hele feature-flow.

## Stappen

1. **Verifieer dat je niet op main zit**:
   ```bash
   git branch --show-current
   ```
   Als je op `main` bent: STOP. Vertel Niels dat preview op main niet bestaat (main = productie). Vraag of hij een branch wil maken eerst.

2. **Check uncommitted changes**:
   ```bash
   git status --short
   ```
   Als er uncommitted changes zijn: vraag aan Niels of die mee moeten in de preview. Zo ja: vraag een commit message en commit (`git add <files>` + `git commit -m`). Zo nee: stop.

3. **Lokale validatie** (blocking):
   ```bash
   npm run typecheck && npm run build
   ```
   Faalt dit: fix het of meld het aan Niels. Pushen met een falende build is verspilling.

4. **Push de branch**:
   ```bash
   git push -u origin $(git branch --show-current)
   ```
   Cloud Build picks dit op via de branch-trigger en deployt automatisch met `--tag=preview-<slug> --no-traffic` (zie `cloudbuild.yaml`).

5. **Wacht op Cloud Build**:
   ```bash
   gcloud builds list --ongoing --limit=3
   ```
   Tot de relevante build `SUCCESS` toont. Bij `FAILURE`: haal de logs op:
   ```bash
   gcloud builds log <build-id>
   ```
   en rapporteer de error aan Niels.

6. **Haal de preview URL op**:
   ```bash
   gcloud run services describe groeimetai-app \
     --region=europe-west1 \
     --format=json | jq -r '.status.traffic[] | select(.tag=="preview-<slug>") | .url'
   ```
   Vervang `<slug>` door de branch-naam (zonder `feat/`/`copy/`/etc. prefix — Cloud Build maakt de tag op basis van de slug-component).

7. **Rapporteer**:
   - Branch + commit SHA
   - Preview URL
   - Wat Niels concreet moet checken
   - Wat de next step is (`/promote` na OK, of doorgaan met meer commits)

## Regels

- **Nooit op main draaien.** Stap 1 is verplicht.
- **Lokale build blocking** (stap 3). Geen verspilde Cloud Build minutes.
- **Bij build failure**: haal logs op en rapporteer, niet stilletjes opnieuw proberen.
- **Geen traffic switch hier.** Dit is alleen preview. Promotie is `/promote`.
