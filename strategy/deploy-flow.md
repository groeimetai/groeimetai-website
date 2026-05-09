# Deploy Flow — GroeimetAI website

End-to-end documentatie van hoe een wijziging van branch naar productie komt. Dit document is de bron van waarheid voor `/feature`, `/preview` en `/promote`.

## Architectuur

```
[lokaal]                    [GitHub]                  [Cloud Build]              [Cloud Run]
                                                                                  groeimetai-app
git push branch ─────────► branch-trigger ───────► build + deploy ────►  ┌──────────────────────┐
                                                   (--tag=preview-X      │ live  : revision-N   │
                                                    --no-traffic)        │ preview-X: revision-X │
                                                                          └──────────────────────┘
git push main   ─────────► main-trigger   ───────► build + deploy ────►  ┌──────────────────────┐
                                                   (100% traffic via      │ live  : revision-N+1 │
                                                    --to-latest)          │ (preview-X opgeruimd)│
                                                                          └──────────────────────┘
```

Eén Cloud Run service. Twee Cloud Build triggers (één voor `main`, één voor non-main branches). Het verschil zit in hoe `cloudbuild.yaml` deployt op basis van de `BRANCH_NAME` substitution.

## Branch naming conventie

Prefix per type wijziging — gebruikt door `cloudbuild.yaml` en `/changelog`:

| Prefix | Type | Voorbeeld |
|--------|------|-----------|
| `feat/` | Nieuwe functionaliteit | `feat/testimonials-homepage` |
| `copy/` | Tekst-aanpassingen | `copy/hero-repositionering` |
| `visual/` | Styling/layout | `visual/cta-button-accent` |
| `fix/` | Bugfix | `fix/mobile-nav-zindex` |

Slug na de prefix is kebab-case en kort genoeg voor een Cloud Run tag (max 63 chars totaal voor de tag, dus laat de slug onder ~50 chars).

## De flow

### Stap 1 — branch maken

```bash
git checkout main
git pull --ff-only
git checkout -b copy/hero-repositionering
```

### Stap 2 — wijziging maken + lokaal valideren

Zie `strategy/voice-and-tone.md` voor copy, `strategy/visual-system.md` voor styling, `strategy/tech-stack.md` voor code.

```bash
npm run typecheck
npm run lint
npm run build
```

Alle drie moeten slagen voor je pusht. Falende lokale build = verspilde Cloud Build minuten.

### Stap 3 — pushen

```bash
git add src/translations/nl.json src/translations/en.json
git commit -m "copy: herpositioneer hero naar no-bullshit AI"
git push -u origin copy/hero-repositionering
```

Cloud Build picks dit op via de branch-trigger. Build neemt 3-7 minuten.

### Stap 4 — preview deploy detecteren

```bash
gcloud builds list --ongoing --limit=3
```

Wacht tot de build met `SHORT_SHA` matchend op je commit `SUCCESS` toont.

```bash
gcloud builds describe <build-id> --format='value(status)'
```

Bij `FAILURE`:
```bash
gcloud builds log <build-id>
```

### Stap 5 — preview URL ophalen

```bash
gcloud run services describe groeimetai-app \
  --region=europe-west1 \
  --format=json | jq -r '.status.traffic[]'
```

De entry met `tag: preview-<slug>` heeft een `url` veld zoals:
```
https://preview-hero-repositionering---groeimetai-app-abc123.europe-west1.run.app
```

### Stap 6 — testen

Niels test op de preview URL. **End-to-end** — niet alleen "kijken of het goed staat", maar ook klikken, formulieren invullen, locale switchen.

### Stap 7 — promote

Na Niels' OK:

```bash
# Merge naar main
git checkout main
git pull --ff-only
git merge --no-ff copy/hero-repositionering -m "Merge copy/hero-repositionering"
git push origin main

# Cloud Build deployt main automatisch met 100% traffic via cloudbuild.yaml
gcloud builds list --ongoing --limit=3   # wacht op SUCCESS

# Verifieer traffic
gcloud run services describe groeimetai-app \
  --region=europe-west1 \
  --format='value(status.traffic)'
```

Als de main-build de traffic switch al doet via `--to-latest` in `cloudbuild.yaml`, hoef je dat niet handmatig te doen. Anders:

```bash
gcloud run services update-traffic groeimetai-app \
  --region=europe-west1 \
  --to-latest
```

### Stap 8 — preview tag opruimen

```bash
gcloud run services update-traffic groeimetai-app \
  --region=europe-west1 \
  --remove-tags=preview-hero-repositionering
```

### Stap 9 — branch verwijderen

```bash
git branch -d copy/hero-repositionering
git push origin --delete copy/hero-repositionering
```

### Stap 10 — changelog

```bash
# Via /changelog command, of handmatig:
# entry toevoegen aan logs/changelog/YYYY-MM.md
```

## Cloud Build trigger configuratie

Voor de preview-flow zijn **twee triggers** nodig in de GCP console (of via `gcloud beta builds triggers create`):

### Trigger 1: main → productie
- **Event**: Push to a branch
- **Branch regex**: `^main$`
- **Build config**: `cloudbuild.yaml`
- **Substitutions**: geen extra (gebruikt `$BRANCH_NAME` automatisch)

### Trigger 2: feature branches → preview
- **Event**: Push to a branch
- **Branch regex**: `^(feat|copy|visual|fix)/.+$`
- **Build config**: `cloudbuild.yaml`
- **Substitutions**: geen extra

`cloudbuild.yaml` detecteert zelf via `$BRANCH_NAME` welke deploy-mode (productie vs preview-tag) gedraaid moet worden.

> **Eenmalige actie voor Niels**: check in GCP Console → Cloud Build → Triggers of beide triggers bestaan. Zo niet: aanmaken via Console (sneller dan CLI voor first-time setup).

## Veelvoorkomende fouten

| Fout | Oorzaak | Fix |
|------|---------|-----|
| Build faalt op `npm run build` | Lokale build niet gedraaid voor push | Lokaal fixen, opnieuw pushen |
| Preview URL niet gevonden | Cloud Build nog bezig of trigger ontbreekt | `gcloud builds list --ongoing`, of trigger-config checken |
| Tagged revision toont oude content | Cache, of verkeerde revision | Hard refresh, of `gcloud run revisions list` checken |
| Traffic switch faalt | IAM permissions ontbreken | Service account heeft `run.admin` nodig |
| `git push` faalt op pre-commit | Husky/lint-staged faalt op een file | Lokaal `npm run lint --fix`, opnieuw committen |

## Wat NIET doen

- **Geen `git push --force`** op main of een gedeelde branch
- **Geen direct werk op main**. Altijd via een branch.
- **Geen handmatige `gcloud run deploy`** vanaf je laptop. Het hele punt van Cloud Build is dat alle deploys reproducibel uit de repo komen.
- **Geen secrets in `cloudbuild.yaml`**. Env vars zitten in de Cloud Run service config.
- **Geen "even snel" hotfix direct op main** zonder branch + preview. Als de site echt down is: revert de laatste commit op main en push, dat is sneller dan een hotfix-flow.
