# Tech Stack — GroeimetAI website

Snel-referentie voor wat er onder de motorkap zit. Bij twijfel over conventies: bestaande code lezen wint van deze samenvatting.

## Framework

- **Next.js 14.2** met **App Router primair** in `src/app/`
- **Pages Router legacy** in `src/pages/` — alleen voor routes die nog niet gemigreerd zijn. Bouw nieuwe routes in App Router.
- **TypeScript strict** — alle nieuwe code gettypeerd. `npm run typecheck` voor je pusht.
- **Node 20+** verwacht (zie `Dockerfile`)

## File-organisatie (`src/`)

```
src/
├── app/              # App Router routes (page.tsx, layout.tsx)
├── pages/            # Legacy Pages Router (vermijden voor nieuwe code)
├── components/       # Herbruikbare React components
├── contexts/         # React Context providers
├── hooks/            # Custom React hooks
├── lib/              # Utility functies, clients (firebase, sentry, etc.)
├── services/         # Business logic, externe API calls
├── middleware/       # Next.js middleware modules
├── middleware.ts     # Active middleware entry
├── data/             # Static data, configs
├── translations/     # next-intl copy (nl.json, en.json)
├── i18n/             # next-intl routing setup
├── styles/           # Globals, CSS variables
├── types/            # TypeScript types
└── utils/            # Pure helpers
```

## Internationalization

- **next-intl** — alle copy in `src/translations/{nl,en}.json`
- **Beide talen tegelijk aanpassen.** Een nieuwe key in `nl.json` betekent dezelfde key in `en.json` (anders breekt de build of toont fallback).
- **Routing**: `src/i18n/routing.ts` configureert de locale prefixes
- **Dynamische copy via `useTranslations()`** in client components, `getTranslations()` in server components

## Styling

- **Tailwind CSS 3.4** — config in `tailwind.config.ts`
- **PostCSS** voor processing (`postcss.config.js`)
- Brand tokens in `tailwind.config.ts` (zie `strategy/visual-system.md`)
- **CSS variables** voor dynamische theming (dark mode, brand colors via HSL)
- **`tailwind-merge` + `clsx`** voor conditional classnames

## State management

- **Zustand** voor globale state (`zustand`)
- **React Context** voor scoped state (auth, theme, locale)
- Geen Redux. Geen Recoil. Niet introduceren zonder Niels' OK.

## Backend / data

- **Firebase Auth** — user authentication (`src/lib/firebase/`)
- **Firestore** — database (`firestore.rules`, `firestore.indexes.json`)
- **Firebase Functions** — serverless functions in `functions/` (aparte deploy)
- **Firebase Storage** — file uploads (`storage.rules`)
- **Firebase Admin SDK** — server-side via service account (`FIREBASE_ADMIN_*` env vars)

## AI / LLM integraties

De site bevat zelf AI-features (chatbot, RAG):
- `@anthropic-ai/sdk` — Claude
- `openai` — GPT, embeddings
- `@google/generative-ai` — Gemini
- `@langchain/openai` + `langchain` — LLM orchestration
- `@pinecone-database/pinecone` — vector store voor RAG search
- `next-auth` voor session management rond de chatbot

Bij wijzigingen aan deze features: kijk eerst in `src/services/` en `src/lib/` voor de bestaande clients. Niet een nieuwe LLM client opzetten zonder reden.

## Payments

- **Stripe** — primaire payment provider (subscriptions, one-off)
- **Mollie** — alternatieve provider (`@mollie/api-client`)
- Stripe data ophalen voor debugging gaat via de **Stripe MCP server** (`mcp-servers/stripe/`), niet via een ad-hoc script

## Email

- **Resend** (`resend`) — primaire transactional email
- **Nodemailer + SMTP** als fallback (Gmail SMTP via `niels@groeimetai.io`, verzendt vanaf `info@groeimetai.io` alias)

## Observability

- **Sentry** (`@sentry/nextjs` 9.34) — actief geconfigureerd in:
  - `sentry.client.config.tsx`
  - `sentry.server.config.ts`
  - `sentry.edge.config.ts`
  - DSN en project ID in `.env`
- **Web Vitals** (`web-vitals`) — performance metrics
- **OpenTelemetry** — tracing infrastructuur aanwezig (`@opentelemetry/*`) voor server-side traces

> Note: Niels was niet zeker of Sentry geconfigureerd was — het is dat wel. Voor debugging van productie-issues kun je dus Sentry checken (handmatig via dashboard, geen MCP geïnstalleerd).

## Testing

- **Jest** voor unit tests — `tests/` directory, `jest.config.js`
  - `npm run test` (`--passWithNoTests` flag is gezet, dus het faalt niet bij geen tests)
- **Cypress** voor e2e tests — `cypress/` directory, `cypress.config.ts`
- **Testing Library** voor React component tests
- **Husky** + **lint-staged** voor pre-commit hooks (eslint + prettier)

## Build / dev

```bash
npm run dev          # Next.js dev server (hot reload)
npm run build        # Production build (verplicht voor je pusht)
npm run start        # Production server (na build)
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit --skipLibCheck
npm run test         # Jest
```

## Scripts

`scripts/` bevat Node/TS scripts voor eenmalig of periodiek werk:
- `setup-admin-accounts.js` — admin user setup
- `build-search-index.ts` — search index voor de site
- `generate-content-index.ts` — content index voor RAG

## Deployment

Zie `strategy/deploy-flow.md` voor de volledige flow. Korte versie:

- **GitHub** repo → push triggert **Cloud Build**
- **Cloud Build** (`cloudbuild.yaml`) bouwt Docker image, pusht naar Artifact Registry, deployt naar **Cloud Run**
- **Cloud Run** service: `groeimetai-app` in `europe-west1`
- Env vars zitten in Cloud Run service config (niet in cloudbuild.yaml)
- Branch detection in `cloudbuild.yaml`: `main` → 100% productie traffic, anders → tagged preview revision met `--no-traffic`

## Dependencies — wat NIET toevoegen zonder overleg

- **Geen nieuwe AI SDK** als er al een client is voor dat model
- **Geen nieuwe state management** library
- **Geen nieuwe CSS framework** of styling oplossing
- **Geen UI component library** naast Radix + lucide
- **Geen nieuwe analytics** zonder duidelijke reden — er is al GA, en Sentry voor errors

Als je twijfelt: vraag het Niels.
