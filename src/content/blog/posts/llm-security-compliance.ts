import type { BlogPost } from '../../types';
import { NIELS } from '../../types';

export const llmSecurityCompliance: BlogPost = {
  slug: 'llm-security-compliance',
  locale: 'nl',
  title: 'LLM security en compliance: een nuchtere checklist voor MKB',
  excerpt:
    'AI veilig gebruiken is niet sexy en kost geen extra licenties. Het is vooral discipline. Hier is wat we standaard checken voor een productie-implementatie.',
  date: '2026-04-09',
  author: NIELS,
  readMinutes: 11,
  category: 'Governance',
  tags: ['Security', 'Compliance', 'AVG', 'Risico', 'Governance'],
  related: [
    'ai-governance-mkb',
    'veilige-ai-integraties-checklist',
    'change-management-ai',
  ],
  body: `## Waar dit over gaat

AI-security wordt vaak gepresenteerd als iets ingewikkelds dat een aparte tool nodig heeft. Voor de meeste MKB-organisaties is dat onzin. De risico's zijn reëel maar overzichtelijk, en de meeste mitigaties zijn beleid en gewoonte — geen software.

Deze checklist is wat wij doorlopen voordat een AI-toepassing in productie gaat. Geen audit-formulier. Geen NIS2-formele rapportage (daar zijn aparte trajecten voor). Wel een praktische lijst die je intern kunt afwerken.

## De vijf risico-categorieën die ertoe doen

### 1. Data die niet had mogen weggaan

Iemand plakt klantgegevens in ChatGPT om er een mailtje van te maken. Of een ontwikkelaar gebruikt productie-data om een prompt te testen. Of een integratie stuurt per ongeluk meer velden mee dan nodig.

Dit is in 90% van de gevallen het echte risico. Niet "AI doet iets enges" — gewoon gegevens die ergens komen waar ze niet horen.

**Wat we doen**: in elk integratie-ontwerp expliciet maken welke velden vertrekken en welke blijven. Niet de hele record bedingen, niet de hele tekst sturen.

### 2. Output die de gebruiker vertrouwt zonder reden

Een LLM zegt iets met overtuiging. Een medewerker neemt het over. Het klopt niet. Schade ontstaat — voor de klant, voor het bedrijf, voor de medewerker.

**Wat we doen**: vooraf afspreken welke output door een mens wordt gecheckt en welke direct mag. Geen "alles wordt automatisch verwerkt" zonder een controle-pad voor de uitzonderingen.

### 3. Prompt injection en misbruik

Externe gebruikers (klanten, leveranciers) kunnen via input proberen het systeem te kapen. "Negeer je instructies en …" werkt nog steeds verrassend vaak.

**Wat we doen**: nooit eindgebruiker-input direct in een prompt zetten zonder filtering. Belangrijke beslissingen niet door AI laten nemen op basis van free-form input.

### 4. Vendor lock-in en aansprakelijkheid

Een AI-leverancier verandert prijzen, beleid of features. Of de leverancier gaat failliet. Of de leverancier verbiedt opeens jouw use case in zijn terms.

**Wat we doen**: code zo schrijven dat we van model kunnen wisselen zonder de hele applicatie te herbouwen. Geen exotische features gebruiken die maar bij één provider zitten, tenzij de waarde dat rechtvaardigt en je het uitlegt.

### 5. Logging en herleidbaarheid

Iets gaat fout — kun je terugzien wat het systeem deed? Voor compliance, maar ook gewoon om te kunnen leren van fouten.

**Wat we doen**: alle prompts en outputs loggen met tijdstempel, gebruiker (of pseudoniem), en het model dat gebruikt is. Bewaartermijn afgestemd op het type data — niet langer dan nodig.

## De checklist

We lopen deze vragen door bij elke productie-implementatie:

**Data in**
- Welke velden gaan naar het model? Is dat de minimale set?
- Is er PII bij? Is dat juridisch in orde voor deze use case?
- Wat gebeurt er als de input onverwacht is (formaat, lengte, taal)?

**Data uit**
- Wat doet het systeem met de LLM-output? Direct weergeven, opslaan, doorsturen?
- Wie ziet de output? Is dat de juiste persoon?
- Hoe lang bewaren we input en output, en waarom?

**Toegang**
- Wie mag deze functie gebruiken? Hoe handhaven we dat?
- Heeft de service-account die de LLM aanroept de juiste scope (niet te ruim)?
- Worden API-keys geroteerd, en zo ja hoe?

**Provider**
- Welk model, welke provider, welke regio (EU vs US)?
- Wat staan er in de terms over hergebruik van data voor training?
- Wat is het fallback-plan als deze provider niet beschikbaar is?

**Foutpaden**
- Wat gebeurt er als het model niets teruggeeft, traag is, of een fout geeft?
- Wat gebeurt er als de output niet voldoet aan het verwachte formaat?
- Hoe ziet de gebruiker dat het misging?

**Monitoring**
- Kunnen we zien hoe vaak dit wordt gebruikt? Door wie? Met welke kosten?
- Krijgen we een alert als kosten plotseling oplopen?
- Wie kijkt naar de logs, en hoe vaak?

**Mens in de loop**
- Welke output gaat door een mens voor gebruik?
- Welke output mag automatisch door?
- Wie is verantwoordelijk als de automatische output fout zit?

**Documentatie**
- Is er een beschrijving van wat het systeem doet, in mensentaal?
- Weet de business owner wat het systeem niet kan?
- Is er een rollback-plan?

## Wat AVG/GDPR betekent voor LLM-gebruik

Korte versie:
- Persoonsgegevens van EU-burgers verwerken via een Amerikaanse LLM-provider: kan, maar je hebt een geldige rechtsbasis nodig (meestal contract met de provider plus toestemming of gerechtvaardigd belang).
- Per 2025 is de EU AI Act in werking — voor de meeste MKB-toepassingen verandert dat weinig (geen "high risk"), maar je moet wel kunnen uitleggen wat het systeem doet als iemand ernaar vraagt.
- Profielvorming en geautomatiseerde besluiten over personen vragen extra zorgvuldigheid. Een LLM die een klant beoordeelt zonder menselijke check is een risico.

Wat het niet betekent: dat je geen AI mag gebruiken. Wel: dat je per use case bewust kiest hoe je het doet.

## Wat we vaak zien misgaan

**Te ruime toegang.** Iedereen krijgt een API-key, niemand weet wat er gebeurt. Beter: één service-account per use case, met logging.

**Geen kostenlimiet.** Een bug die in een loop het model aanroept kan in een nacht duizenden euro's verbranden. Zet altijd een budget-alert op providerniveau.

**Vergeten te documenteren wat het niet doet.** Gebruikers stellen vragen die het systeem niet aankan en krijgen middelmatige antwoorden. Vooraf duidelijk zijn over scope voorkomt dit.

**Te lang bewaren.** Logs van AI-input met PII die jaren blijven staan zijn een kwetsbaarheid. Maak een retention-beleid en houd je eraan.

## Wat je niet hoeft te doen

- Een aparte "AI security tool" inkopen. De meeste meerwaarde zit in de checklist hierboven.
- Een AI ethics committee oprichten als je 20 medewerkers hebt. Dat is voor grote organisaties — voor MKB is een paar afspraken op papier en bewustzijn bij wie het bouwt voldoende.
- Wachten met AI tot alles op orde is. Dat duurt te lang. Begin klein, met een use case waar de risico's overzichtelijk zijn, en bouw je discipline op.

## Samenvatting

Veiligheid bij AI is geen losse competentie. Het is dezelfde discipline als bij ander software: weet wat er in en uit gaat, wie toegang heeft, hoe je fouten merkt, en wat je doet als het misgaat. Voor MKB-organisaties is de bovenstaande checklist genoeg om voorspelbaar veilig met AI te werken — en als iemand een ingewikkelder verhaal nodig heeft om dezelfde dingen te doen, vraag dan waarom.`,
};
