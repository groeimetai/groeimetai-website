import type { BlogPost } from '../../types';
import { NIELS } from '../../types';

export const veiligeAiIntegratiesChecklist: BlogPost = {
  slug: 'veilige-ai-integraties-checklist',
  locale: 'nl',
  title: 'AI integreren in bestaande systemen: de architectuur-keuzes die ertoe doen',
  excerpt:
    'De makkelijke patronen vandaag zijn de technische schuld van morgen. Hier zijn de keuzes die we maken zodat een AI-integratie ook over twee jaar nog meebeweegt.',
  date: '2026-05-01',
  author: NIELS,
  readMinutes: 9,
  category: 'Integrations',
  tags: ['Integraties', 'Architectuur', 'Security', 'API'],
  related: ['llm-security-compliance', 'foundation-models-kiezen', 'servicenow-ai-transformatie'],
  body: `## Het probleem dat we vaak vinden

Een organisatie wil "AI toevoegen" aan een bestaand systeem — CRM, ticketingsysteem, intranet, ERP. Iemand bouwt het snel, vaak met directe API-aanroepen naar OpenAI of Anthropic, en het werkt. Drie maanden later:

- De provider verandert een endpoint
- De kosten lopen anders dan verwacht
- De compliance officer vraagt waar de logs staan
- Een nieuwe use case wil een andere model
- Iemand wil van provider wisselen

Nu blijkt: alles wat snel werd gebouwd, is overal verspreid. Dezelfde provider-specifieke code zit in vier services. Er is geen centrale plek waar je iets verandert.

Dit is geen onvermijdelijk. Het is een ontwerpkeuze die je achteraf duur is.

## De integratie-laag die we standaard bouwen

We maken één laag tussen je bestaande systemen en de LLM-providers. Een dunne service die:

1. Alle LLM-aanroepen doet
2. Provider-keuze configureerbaar maakt
3. Prompts versioneert
4. Resultaten logt
5. Kostenbewaking inbouwt

Dit is geen platform of framework. Geen Kubernetes-cluster. Een paar honderd regels code op een gewone Cloud Run of Lambda. Het punt is niet groot, het punt is *één plek* voor LLM-werk.

## Wat in die laag zit

### Een handvol named prompts

Niet één centrale prompt-database met duizend prompts. Wel: per use case één benoemde prompt, in code, met versienummer. Als marketing-team-mail-opstellen-v3 minder goed werkt dan v2 kun je terug. Als je een prompt wilt vergelijken tussen modellen kun je dat per prompt doen.

### Provider-abstractie

Een interface waar je een prompt instuurt en een antwoord krijgt. Onder water kan dat OpenAI, Anthropic, Azure OpenAI, of een open model zijn. De applicatiecode weet dat niet — en wil dat niet weten.

Dit kost een dag extra om op te zetten. Het bespaart maanden als je later wisselt.

### Logging met de juiste retentie

Elke aanroep logt: timestamp, gebruiker (of pseudoniem), use case, prompt-versie, model, tokens-in, tokens-uit, kosten, latency. Bewaartermijn afgestemd op het type data — niet langer dan nodig.

Dit is geen luxe. Dit is hoe je morgen vragen kunt beantwoorden over wat het systeem doet.

### Kostenmonitoring per use case

Niet één blob "AI-kosten deze maand". Maar: deze use case kost €X per maand, deze andere €Y. Anders heb je geen idee waar te snijden als kosten oplopen.

### Rate limiting per gebruiker

Voorkomt dat één persoon (of één buggy integratie) per ongeluk duizend aanroepen per minuut doet. Een paar regels. Doet een nacht-bug schade van €50 in plaats van €5000.

## Patronen die we vermijden

### Direct vanuit het frontend naar OpenAI

Een API-key in de browser, of een proxy die niet authenticeert, betekent dat iedereen die de pagina opent op jouw rekening kan tikken. Altijd via een server-laag die weet wie er aanroept.

### LLM-aanroepen in een synchroon eindgebruiker-pad

Een LLM-call duurt 1-30 seconden. Als die in het pad van een gebruiker-actie zit, hangt je hele applicatie af van de stabiliteit van een externe provider. Beter: async waar mogelijk, met een fallback voor als het niet beschikbaar is.

### Prompts in YAML-bestanden naast de code

Klinkt schoon, leidt tot prompts die niet meer aansluiten op de code die ze gebruikt. Houd prompts in de code zelf, met types, zodat refactoring ze meeneemt.

### "Eén grote prompt die alles regelt"

10 paragrafen instructies werkt slechter dan 3 paragrafen voor één duidelijke taak. Splits use cases op in aparte prompts. Beter onderhoudbaar, beter te testen.

## Welke beslissingen je vooraf maakt

### Welk model voor welke use case

Niet alles hoeft GPT-4 of Claude Opus. Voor classificatie, eenvoudige extractie en standaard schrijfwerk kun je vaak een goedkoper model gebruiken zonder kwaliteitsverlies. Dit verschilt makkelijk een factor 10 in kosten.

Wij testen per use case vooraf met 2-3 modellen op een eigen evaluatieset. De keuze die uit dat testje komt is bijna nooit "het duurste model".

### Welk model in welke regio

EU-data hoort idealiter bij een EU-endpoint. OpenAI biedt dit, Anthropic biedt dit, Azure heeft EU-regio's. Geen reden om in 2026 nog Amerikaanse endpoints te gebruiken voor EU-persoonsgegevens.

### Hoe stream je antwoorden

Voor user-facing chat: streamen, anders voelt het traag. Voor batch-werk: complete antwoord, want streamen heeft geen meerwaarde en compliceert error-handling.

### Wat doe je bij time-out

LLM-providers hebben af en toe slechte minuten. Heb een retry-strategie (max 2-3 keer, met exponential backoff). Heb een fallback-provider als de primaire echt down is. Heb een nette foutmelding voor de gebruiker als beide niet werken.

## De drie tests die je moet kunnen draaien

### 1. "Wat doet deze prompt vandaag op een week historische input?"

Geen "we hopen dat het werkt". Een evaluatieset met 50-100 voorbeelden waar je verwachte antwoorden hebt. Bij elke prompt-aanpassing draai je de set en checkt de resultaten.

### 2. "Wat als we morgen overstappen van model A naar model B?"

Dezelfde evaluatieset. Geen handmatige check van "nou, het ziet er goed uit". Cijfers.

### 3. "Wat gebeurt er als de provider 30 seconden offline is?"

Een chaos-test. Provider down, time-outs forceren, kijken of de rest van de applicatie nog functioneert. Vaak: nee. Dat is wanneer je weet dat je nog werk hebt.

## Wat dit oplevert

Een goed gebouwde integratie-laag voegt 5-10 dagen werk toe aan een AI-project. Het bespaart maanden gedoe in jaar 2 en 3, wanneer:

- Een nieuw model uitkomt dat beter werkt voor je use case
- Een leverancier zijn prijzen verhoogt
- Compliance vragen begint te stellen
- Je een tweede use case wilt toevoegen die op de eerste lijkt
- Iemand vraagt waarom je AI €X per maand kost

## Samenvatting

AI-integraties die snel zijn gebouwd worden meestal duur over tijd. Een paar architectuur-keuzes vooraf — eén integratie-laag, named prompts, provider-abstractie, kostenbewaking — kosten weinig in week één en geven je de optionaliteit die je later nodig hebt. Het is geen overengineering. Het is normaal goed software-werk, toegepast op een nieuwe categorie integraties.`,
};
