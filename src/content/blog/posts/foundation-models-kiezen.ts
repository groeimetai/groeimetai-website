import type { BlogPost } from '../../types';
import { NIELS } from '../../types';

export const foundationModelsKiezen: BlogPost = {
  slug: 'foundation-models-kiezen',
  locale: 'nl',
  title: 'Welk foundation model kies je in 2026? Een nuchtere kijk',
  excerpt:
    'GPT, Claude, Gemini, Mistral, Llama. De keuze lijkt complex maar valt in de praktijk uiteen in een paar simpele afwegingen. Hier zijn ze.',
  date: '2026-03-28',
  author: NIELS,
  readMinutes: 8,
  category: 'AI Strategy',
  tags: ['Foundation models', 'LLM', 'Vendor keuze', 'Architectuur'],
  related: ['veilige-ai-integraties-checklist', 'copilot-vs-custom', 'llm-security-compliance'],
  body: `## Waarom dit niet zo moeilijk is als het lijkt

Lees twee artikelen over "welk LLM is het beste in 2026" en je krijgt twee verschillende antwoorden, allebei stellig. Lees benchmarks en je ziet dat verschillende modellen leiden in verschillende categorieën. Lees marketing en je hoort dat elk model "de beste is voor enterprise".

Voor de meeste praktische use cases is de keuze veel kleiner dan dit doet voorkomen. Dit artikel breekt het terug naar de echte afwegingen.

## De drie groepen modellen die ertoe doen

In 2026 zijn er feitelijk drie categorieën:

### 1. Frontier closed models

OpenAI GPT-4-class, Anthropic Claude Opus/Sonnet, Google Gemini Pro. Topkwaliteit voor algemene taken, betaalbaar maar niet goedkoop, gehost bij de provider.

### 2. Open weight models

Llama 3 (Meta), Mistral, Qwen, en hun varianten. Je kunt ze zelf hosten of via providers als Together, Fireworks, AWS Bedrock. Voor de meeste taken vergelijkbaar in kwaliteit met de tweede tier van de closed models.

### 3. Specialised / smaller models

Voor specifieke taken (embedding, classificatie, code-completion, transcriptie) zijn vaak smallere of taakspecifieke modellen die efficiënter zijn dan een algemeen frontier-model.

## De vraag die je in 2026 als eerste stelt

> Heb ik echt een frontier-model nodig?

Voor 60-70% van de zakelijke LLM-toepassingen die wij bouwen is het antwoord nee. Tekst classificeren, gestructureerde data extraheren, e-mails samenvatten, standaard antwoorden opstellen — dit kan een Sonnet-class model, een Gemini Flash, of een goed gehoste Llama 70B prima.

Frontier-modellen wil je voor:
- Echt complexe reasoning over lange context
- Code-generatie waar het verschil tussen werkend en niet-werkend op de kwaliteit zit
- Onderzoek-taken waar het samenvoegen van veel bronnen voor matters

Voor de meeste workflow-AI heb je dat niet nodig.

## De vier echte afwegingen

### Afweging 1: Kosten per gebruik

Tussen het duurste en goedkoopste model voor een vergelijkbare taak zit makkelijk een factor 10-50 in kosten per token. Voor een use case met hoog volume is dit de meest impactvolle keuze.

Reken het uit voordat je begint: hoeveel tokens-in en tokens-uit per call, hoeveel calls per maand, vermenigvuldig. Dat is je echte ROI-vraagstuk.

### Afweging 2: Hosting en data-residency

Closed providers bieden EU-regio's (Azure OpenAI Europe, Claude via AWS Bedrock EU, Google in EU regio's). Dit is meestal voldoende voor AVG.

Voor strengere eisen (overheid, sommige financiële instellingen): open weight modellen zelf hosten of bij een EU-only provider afnemen. Dit is technisch goed te doen, kostelijker dan een API-call.

### Afweging 3: Bedrijfsspecifieke kennis

Geen van de basis-modellen "kennen" jouw organisatie. Je geeft de kennis mee via context (RAG, system prompt) of, in zeldzame gevallen, fine-tuning.

Fine-tunen op closed models kan bij OpenAI en Anthropic. Bij open weight modellen kun je verder gaan. Voor de meeste organisaties is fine-tuning niet de juiste investering — een goede RAG is meestal goedkoper en flexibeler.

### Afweging 4: Vendor risico

Wat als je gekozen provider:
- Zijn prijzen verdubbelt
- Je use case in nieuwe terms verbiedt
- Een outage heeft
- Wordt overgenomen of failliet gaat

Hier komt provider-abstractie binnen. Bouw je integratie zo dat je een ander model kunt inhangen zonder de hele applicatie te herbouwen. Dit kost ~1 dag extra werk en geeft je optionaliteit.

## Het selectie-proces dat we volgen

Voor elke nieuwe use case:

### Stap 1: Definieer "goed genoeg"

Niet "het beste model". Wat is goed genoeg voor *deze* taak? Een classifier die 92% accuraat is, is misschien al voldoende. Een schrijfassistent die acceptabele drafts produceert is genoeg — je verwacht toch een mens-edit.

### Stap 2: Test 3 modellen op een eigen evaluatieset

50-100 representatieve voorbeelden uit je echte data. Pak drie kandidaten — vaak één frontier (GPT-4 of Claude Opus), één mid-tier (Sonnet, Gemini Flash, Llama 70B), één goedkoop (Haiku, Gemini Nano, Llama 8B).

Draai de set op elke. Vergelijk de uitkomsten — niet alleen op accuratesse, ook op kwaliteit van de output.

### Stap 3: Kies de goedkoopste die voldoet

Niet de beste. De goedkoopste die je "goed genoeg" haalt. Als Sonnet hetzelfde resultaat geeft als Opus voor jouw use case, kies Sonnet — bespaart je een factor 5 in kosten.

### Stap 4: Bouw met provider-abstractie

Zodat als over een halfjaar een beter goedkoper model uitkomt, je kunt wisselen zonder te herbouwen.

## De fout die we vaak zien

Organisaties kiezen één model voor alles. "We doen alles op GPT-4" of "we doen alles op Claude". Vanuit operationeel oogpunt logisch — één provider, één contract — maar je laat veel geld liggen.

In 2026 hebben de meeste klanten van ons 3-5 modellen tegelijk in gebruik:
- Frontier voor de complexe taken (10-20% van het volume)
- Mid-tier voor de meeste workflows (60-70% van het volume)
- Klein/goedkoop voor classificatie en routing (10-20% van het volume)

Dit klinkt complex maar is het niet als je een goede integratie-laag hebt. Het verschil in maandelijkse kosten tussen "alles op frontier" en "juiste model per use case" is vaak een factor 3-5.

## Wat we verwachten voor 2026

Een paar trends die de keuze beïnvloeden:

- Mid-tier modellen worden steeds beter. Veel taken die in 2024 een frontier-model nodig hadden, gaan in 2026 prima met mid-tier.
- Open weight modellen worden volwassen — voor organisaties met technische capaciteit is dit een serieuze optie.
- Specialized smallere modellen voor specifieke taken (embedding, classificatie, OCR) worden goedkoper en beter.
- Vendor pricing-druk neemt toe — concurrentie tussen providers leidt tot dalende kosten per token.

Wat dit betekent: in 2026 is het nog belangrijker om provider-abstractie te hebben, omdat de markt continu beweegt.

## Wat je niet hoeft te doen

- Een eigen LLM trainen. Voor 99% van organisaties zinloos.
- Continu modellen wisselen voor marginale verbetering. Kies, build, evaluate elke 6 maanden.
- Modellen vergelijken op generieke benchmarks. Test op *jouw* data, voor *jouw* use case.

## Samenvatting

In 2026 valt foundation-model-keuze uiteen in vier afwegingen: kosten per gebruik, hosting en data-residency, bedrijfsspecifieke kennis, en vendor risico. De meeste organisaties hoeven niet altijd het frontier-model — een mid-tier model met goede prompts en eventueel RAG werkt voor 60-70% van de use cases. Combineer meerdere modellen voor verschillende taken, met een integratie-laag die je laat wisselen zonder pijn.`,
};
