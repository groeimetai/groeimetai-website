import type { BlogPost } from '../../types';
import { NIELS } from '../../types';

export const ragArchitectuurBestPractices: BlogPost = {
  slug: 'rag-architectuur-best-practices',
  locale: 'nl',
  title: 'RAG in de praktijk: wat we wel en niet doen voor klanten',
  excerpt:
    'Retrieval-augmented generation is een prima patroon. Maar de meeste RAG-implementaties die je in 2026 ziet, zijn te complex voor het probleem dat ze oplossen.',
  date: '2026-04-18',
  author: NIELS,
  readMinutes: 10,
  category: 'Integrations',
  tags: ['RAG', 'LLM', 'Architectuur', 'Search', 'Knowledge management'],
  related: [
    'foundation-models-kiezen',
    'veilige-ai-integraties-checklist',
    'multi-agent-systems-future-automation',
  ],
  body: `## Wat RAG eigenlijk is

RAG ("retrieval-augmented generation") komt erop neer dat je een vraag stelt, een zoek-systeem haalt relevante documenten op, en een LLM beantwoordt de vraag op basis daarvan. Niet meer, niet minder.

Het is de standaardoplossing voor "ik wil chatten met mijn eigen documenten" geworden. En het is goed dat dat een patroon heeft — het werkt. Maar veel teams overbouwen het.

## Wat RAG eigenlijk oplost

Drie dingen:

1. **Het LLM krijgt actuele kennis** die niet in zijn training zat
2. **Antwoorden zijn herleidbaar** naar bronnen, dus controleerbaar
3. **Gevoelige data blijft buiten de training-set** van het model

Dat is waardevol. Maar het lost niet "het LLM kent ons bedrijf" op — het lost op "het LLM kan de juiste documenten erbij pakken op het juiste moment".

## De fout die we het vaakst zien

Teams kiezen een vector-database, embedden alle documenten, sturen alles door GPT-4 en verwachten een productie-systeem. Dan blijkt:

- Het systeem vindt 70% van de tijd het juiste document — maar de overige 30% verzint het antwoorden op verkeerde bronnen
- Niemand weet welke documenten te oud zijn
- De LLM hallucineert nog steeds, alleen nu met "volgens document X" ervoor
- De zoekkwaliteit zakt zodra je meer dan een paar duizend documenten hebt

Dit is geen mislukte RAG. Dit is RAG zonder de saaie maar belangrijke stappen.

## Wat wij wel doen

### 1. Eerst kijken of RAG nodig is

Veel vragen die "RAG" leken bleken op te lossen met:

- Een gewone full-text search met een goede UI
- Een statische FAQ
- Het document gewoon in de system prompt zetten (als het er één is)

We bouwen pas RAG als er meer dan ~50 documenten zijn die regelmatig wijzigen.

### 2. Hybride retrieval

Vector-search alleen mist exacte termen ("artikel 7.2", productcodes, namen). Keyword search alleen mist concepten. Wij combineren beide en gebruiken de scores van allebei.

### 3. Hercanking met een tweede LLM-pass

Top 20 uit retrieval → tweede pass om de top 5 te selecteren die echt relevant zijn voor *deze vraag*. Voegt 100ms latency toe, halveert de hallucinaties.

### 4. Bronvermelding niet als nice-to-have

Elk antwoord toont welk document is gebruikt, met directe link. Niet om compliance te paaien — om de gebruiker te dwingen het antwoord te verifiëren als het ertoe doet.

### 5. Een evaluatieset die niet groeit met de implementatie

50-100 vragen met verwachte antwoorden. We checken bij elke wijziging of de antwoorden nog kloppen. Zonder dit is "het systeem is beter geworden" een gevoel, geen feit.

## Waar het misgaat in productie

### Document-versiebeheer

Iemand update een procedure, het oude document blijft in de vector store, de nieuwe wordt erbij gegooid. Het LLM ziet beide en kiest soms de verkeerde. Oplossing: bij elke document-update niet alleen toevoegen, maar de oude versie expliciet markeren of verwijderen.

### Chunk-grootte vs context

Te kleine chunks (zinnen): te weinig context voor de LLM om de vraag te beantwoorden. Te grote chunks (hele documenten): vector-search wordt onnauwkeurig en je verbruikt veel tokens. Wij testen vooraf met chunks van 400-800 woorden en passen aan op basis van evaluatie.

### Permissies

In veel organisaties mag niet iedereen alles zien. Een RAG-systeem dat dat negeert is een datalek met een chat-interface. We bouwen permissie-filtering altijd ín de retrieval, niet erna.

### Embedding-model versiewissel

Als je het embedding-model upgrade, moet je álles opnieuw embedden. Vergeet dat niet en je krijgt rare zoekresultaten omdat oude en nieuwe embeddings in dezelfde index zitten.

## Wanneer RAG niet de juiste keuze is

- **Het antwoord vereist berekeningen** in plaats van opzoeken — dan wil je tools, geen retrieval.
- **De kennis verandert per uur** — dan wil je een live API-call, geen geïndexeerde kopie.
- **Er zijn maar een paar bronnen** — die zet je in de prompt en je bent klaar.
- **Compliance verbiedt het** — sommige data mag gewoon niet in een vector-index, ook niet als die alleen lokaal staat.

## Voor wie dit overweegt

Een werkende RAG-implementatie voor een MKB-organisatie van 50-500 medewerkers kost tussen €15k en €60k om goed neer te zetten, afhankelijk van de bronnen, de toegangscontrole en het kwaliteitsniveau. Plus onderhoud — RAG is niet "klaar", het is een systeem dat je bijhoudt.

Veel goedkoper als je het zelf overkoepelend kunt onderhouden. Veel duurder als je het in een sector zet waar fouten consequenties hebben.

## Samenvatting

RAG is een goed patroon voor een specifiek probleem: je organisatie heeft veel kennis in documenten, die kennis verandert, en mensen moeten er snel iets uit kunnen halen. Bouw het simpel, test het meedogenloos, en breid alleen uit als de data zegt dat het beter wordt — niet omdat de architectuur "completer" voelt.`,
};
