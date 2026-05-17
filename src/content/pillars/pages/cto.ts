import type { PillarPage } from '../../types';

export const pillarCto: PillarPage = {
  slug: 'voor-cto-tech-leadership',
  locale: 'nl',
  audience: 'cto',
  title: 'AI voor CTOs en tech-leiderschap: een nuchtere routekaart',
  intro:
    'Voor CTOs en tech-leads die AI serieus willen inzetten — zonder zich te laten meeslepen door demo\'s, agent-hype of platform-pitches. Wat werkt in de praktijk, waar je je tijd het beste insteekt, en welke beslissingen je vooraf maakt.',
  date: '2026-05-15',
  keywords: [
    'AI strategie CTO',
    'LLM implementatie',
    'AI architectuur MKB',
    'foundation model keuze',
    'AI governance technisch leiderschap',
    'AI integratie roadmap',
  ],
  ctaHeadline: 'Klinkt dit als hoe je het wilt aanpakken?',
  ctaSubline:
    'Een verkennend gesprek over jullie AI-roadmap kost een uur, kost niets, en geeft je drie concrete vervolgstappen ongeacht of we samenwerken.',
  faqs: [
    {
      question: 'Wat is de juiste eerste AI-investering voor een tech-organisatie?',
      answer:
        'Vrijwel altijd: een gestructureerde rollout van een algemene AI-licentie (Copilot, ChatGPT Enterprise, Claude Team) voor het brede team, plus één of twee custom use cases waar het volume of de specificiteit dit rechtvaardigt. Begin smal en bewijs ROI voor je breder gaat.',
    },
    {
      question: 'Moeten we een eigen LLM trainen?',
      answer:
        'Vrijwel zeker niet. Voor 99% van de organisaties is een combinatie van prompting en RAG voldoende, terwijl het significant goedkoper en flexibeler is dan fine-tuning of training. Fine-tuning overweeg je alleen bij hoog volume voor één specifieke taak waar prompting consequent tegen een plafond loopt.',
    },
    {
      question: 'Hoe voorkomen we vendor lock-in?',
      answer:
        'Bouw een integratie-laag tussen je applicaties en LLM-providers. Houd prompts in je eigen code, niet in de provider-UI. Kies modellen waar je via een gangbare API tegen praat (OpenAI-compatible interface is een de facto standaard). Vermijd "AI-platforms" die op hun eigen lock-in zitten.',
    },
    {
      question: 'Wat is een redelijke jaarlijkse AI-investering voor een MKB-tech-organisatie?',
      answer:
        'In onze ervaring tussen 2-6% van de IT-begroting voor organisaties van 100-500 medewerkers. Daarvan ongeveer een derde licenties, een derde development, een derde adoptie en governance. Veel organisaties onderschatten dat laatste — zonder adoptie-investering blijft de licentie liggen.',
    },
    {
      question: 'Hoe meten we of AI-investeringen renderen?',
      answer:
        'Per use case één of twee meetbare cijfers vooraf vastleggen — doorlooptijd, foutpercentage, throughput — en vergelijken voor en na. Zonder dit is "succes" een gevoel en val je terug op vanity metrics zoals "aantal actieve gebruikers", wat weinig zegt over waarde.',
    },
    {
      question: 'Wat zijn realistische risico\'s?',
      answer:
        'Vier categorieën die echt voorkomen: PII die per ongeluk extern terechtkomt, output die door medewerkers wordt vertrouwd zonder controle, kosten die zonder budget-bewaking oplopen, en vendor lock-in. Geen futuristische scenario\'s — gewoon software-risico\'s die discipline vragen.',
    },
  ],
  body: `## Waar dit over gaat

In 2026 is de vraag voor een CTO niet meer "moeten we iets met AI doen". Die fase is voorbij. De vragen die nu spelen zijn:

- Waar leveren AI-investeringen echt iets op, en hoe scheid ik dat van marketing-claims?
- Welke architectuur-keuzes maak ik nu zodat ik over twee jaar nog kan bijsturen?
- Hoe houd ik kosten, security en compliance onder controle terwijl het team experimenteert?
- Wat doe ik zelf, wat besteed ik uit?

Dit document beantwoordt deze vier vragen vanuit hoe wij praktijktrajecten draaien bij MKB-organisaties en middelgrote enterprises. Geen visionair verhaal. Wel een aanpak die in 2026 werkt.

## De vier soorten AI-investering die ertoe doen

Niet alle AI-investeringen zijn gelijk. We zien vier categorieën, met heel verschillende ROI-profielen.

### 1. Brede AI-licenties

Microsoft 365 Copilot, ChatGPT Enterprise, Claude Team, Gemini in Workspace. Per-gebruiker licenties die je hele team toegang geven tot AI in hun dagelijkse tools.

**Investering**: €15-40 per gebruiker per maand.
**ROI**: 5-30% productiviteit op kantoor-taken, maar alleen met goede adoptie. Zonder adoptie blijft het ongebruikt.
**Risico**: Onderschatten van de adoptie-investering. Veel organisaties hebben licenties zonder gebruik.

### 2. Custom workflow-implementaties

Specifieke use cases waar AI een onderdeel is van een herontworpen werkproces. Bijvoorbeeld: tickets automatisch categoriseren en routeren, offertes opstellen op basis van bullet points, transcripties van klantcalls.

**Investering**: €15-60k per use case voor de bouw, plus onderhoud.
**ROI**: Hoog op de specifieke flow — 30-50% doorlooptijd-reductie, betere consistentie.
**Risico**: Te smal scopen (niet de moeite waard) of te breed scopen (te lang voor het werkt).

### 3. Productiviteit-tooling voor engineering

GitHub Copilot, Cursor, en vergelijkbare AI-aangestuurde dev-tools voor je engineering-team.

**Investering**: €15-40 per developer per maand.
**ROI**: 10-25% productiviteit voor mid-level developers, minder voor senioren (die het selectief gebruiken). Inclusief verbeterde code-kwaliteit voor wie het goed inzet.
**Risico**: Wildgroei van AI-tools binnen het dev-team zonder coördinatie.

### 4. Platform-investeringen

LLM-providers, hosting infrastructuur, ML-infra voor wie het echt nodig heeft.

**Investering**: Sterk afhankelijk van schaal. Voor de meeste MKB: een paar honderd tot een paar duizend euro per maand aan provider-kosten.
**ROI**: Onmisbaar voor categorie 2 maar geen ROI op zichzelf.
**Risico**: Overbouwen — Kubernetes-clusters opzetten waar een Cloud Run-service voldoet.

## De architectuur-keuze die alles bepaalt

Als een CTO hoef je niet alle technische details van AI-integratie te kennen. Maar er is één keuze die je organisatie naar voren of naar achteren plaatst voor jaren:

> Hoe scheid je je applicatie-code van je LLM-provider?

In de praktijk: bouw een interne service-laag — geen platform, gewoon een service — die alle LLM-aanroepen doet. Je applicaties praten met deze laag, deze laag praat met OpenAI / Anthropic / wat-dan-ook.

Dit kost een dag werk extra voor je eerste AI-feature. Het bespaart maanden gedoe over tijdshorizon van jaren:
- Provider wisselen: configuratie-aanpassing in plaats van code-refactor
- Kosten zien per use case: één plek om te loggen
- Compliance-vragen beantwoorden: één plek om uit te leggen
- Nieuwe use cases toevoegen: bouwen op bestaande infrastructuur

Geen Kubernetes nodig. Geen "AI Platform" framework. Een paar honderd regels code, goed onderhouden.

## De drie use case-categorieën en wanneer je elk doet

### Categorie A: Generieke kantoor-productiviteit

Mailtjes schrijven, documenten samenvatten, vergaderingen transcriberen.

**Wanneer**: Voor het hele team, vrijwel direct.
**Hoe**: Licenties (Copilot, ChatGPT Enterprise) plus expliciete adoptie-investering (training, begeleiding, peer learning).
**Wat niet doen**: Custom oplossingen bouwen voor wat in een bestaand pakket al zit. Verspilling.

### Categorie B: Specifieke workflows met hoog volume

Standaard antwoorden op klantvragen genereren, document-extractie, classificatie op grote schaal.

**Wanneer**: Pas als je een specifieke use case hebt met meetbaar volume (minimaal 100 uur/maand inzet) en heldere ROI.
**Hoe**: Custom-build via je interne integratie-laag. Verifieerbare evaluatie-set. Pilot eerst.
**Wat niet doen**: Een "AI-platform" inkopen dat ergens 80% past — je betaalt voor breedte die je niet gebruikt.

### Categorie C: Knowledge-systemen (RAG)

Interne kennis doorzoekbaar maken via natural language. Q&A op documenten, beleid, klantkennis.

**Wanneer**: Bij organisaties met veel documentatie (>50 actieve documenten) waar mensen tijd verliezen aan zoeken.
**Hoe**: RAG-implementatie met aandacht voor permissies, versiebeheer en hybride zoeken.
**Wat niet doen**: Een vector-database vullen zonder goede evaluatie — je krijgt hallucinaties met bronvermelding, wat erger is dan geen systeem.

## Wat je nu moet beslissen, niet later

Vijf beslissingen die je vooraf maakt en die de richting bepalen.

### Beslissing 1: De data-residency-vraag

Welke data mag waar gehost worden? EU-only? Mag US-regio met DPA? Of hybride per use case? Dit moet helder zijn voor je begint, niet als de eerste use case live moet.

Voor de meeste MKB-organisaties: Azure OpenAI of Bedrock in EU-regio is een werkbare standaard, met expliciete uitzonderingen voor specifieke use cases.

### Beslissing 2: De model-strategie

Eén provider voor alles, of best-of-breed per use case? Wij adviseren typisch het tweede: frontier voor complexe taken, mid-tier voor het meeste werk, klein voor classificatie. Provider-abstractie maakt dit haalbaar zonder operationele rompslomp.

### Beslissing 3: Build vs buy per use case

Geen ideologische keuze. Per use case beoordelen:
- Gespecialiseerde product beschikbaar dat past? → kopen
- Generieke productiviteit? → licentie van een grote provider
- Specifiek voor jullie werkflows? → zelf bouwen

### Beslissing 4: Adoptie-eigenaar

Wie is verantwoordelijk voor dat de mensen het ook echt gaan gebruiken? Niet "iedereen" — dan niemand. Vaak: een operations-manager of HR-business-partner, niet de CTO zelf. Zonder iemand met dit als duidelijke taak gaat het mis.

### Beslissing 5: Governance-pagina

Eén pagina (echt één) waar staat wat wel en niet mag met AI in je organisatie. Wie beslist bij twijfel. Hoe meld je incidenten. Geen 60-pagina framework — die leest niemand.

## De fouten die we vaak zien bij tech-leiders

### Fout 1: "We bouwen ons eigen AI-platform"

Tenzij AI je product is: nee. Een goed gebruikte combinatie van Copilot/Cursor + één of twee custom workflows + een dunne integratie-laag is veel effectiever dan een eigen platform met een team eromheen.

### Fout 2: De pilot-purgatory

Een team doet een pilot, het werkt, niemand neemt opschaling op. Twee maanden later is de pilot een vergeten experiment. Voorkomen: bij start van elke pilot vastleggen wie de opschaling trekt als hij slaagt.

### Fout 3: Te weinig nadruk op adoptie

Een licentie is geen adoptie. Een rollout is geen adoptie. Adoptie is gewoonten in dagelijks werk en die ontstaan alleen met expliciete tijd, begeleiding en zichtbaarheid. Reken op 50-100% van de licentiekosten in jaar 1 als adoptie-investering.

### Fout 4: AI-stack als doel in plaats van middel

We zien organisaties die uren besteden aan "agent frameworks" en "vector databases" zonder een use case waar het echt op uitkomt. De vraag is niet wat de stack is — de vraag is welk probleem je oplost.

### Fout 5: Geen kostenbewaking per use case

Een totaalbedrag voor "AI" zegt niets. Per use case zien wat het kost en wat het oplevert is wat je nodig hebt om te sturen. Vooral als een loop-bug ineens €5k in een nacht verbrandt.

## Hoe wij hierbij helpen

Onze rol bij CTOs is meestal niet "vertel ons wat te doen" — die kennis hebben jullie zelf. Het is:

1. **Validatie**: een externe blik op de richting, zonder commerciële belang in wat de uitkomst is.
2. **Use case ontwerp**: voor specifieke workflows een aanpak ontwerpen die past bij de organisatie.
3. **Bouwen waar handig**: de integratie-laag, de eerste paar use cases, het patroon dat het interne team daarna oppakt.
4. **Adoptie-begeleiding**: trainingen en gewoonten zodat investeringen ook rendement opleveren.

Geen full-service uitbesteding. Geen platform-verkoop. Wel partner bij beslissingen die niet vaak terugkomen en die je niet wilt verkeerd hebben.

## Samenvatting

Voor een tech-leider in 2026 zijn de echte vragen helder: welke investeringen leveren wat op, welke architectuur-keuzes blijven jaren staan, hoe combineer je experiment met controle. Het beste startpunt is bijna altijd: brede licentie voor het team, één of twee custom workflows met meetbare ROI, een eenvoudige integratie-laag, en iemand die verantwoordelijk is voor adoptie. Daarna kun je uitbreiden — maar pas als deze basis staat.`,
};
