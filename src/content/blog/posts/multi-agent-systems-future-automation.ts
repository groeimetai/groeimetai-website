import type { BlogPost } from '../../types';
import { NIELS } from '../../types';

export const multiAgentSystemsFutureAutomation: BlogPost = {
  slug: 'multi-agent-systems-future-automation',
  locale: 'nl',
  title: 'Multi-agent systemen: waarom je er waarschijnlijk geen nodig hebt',
  excerpt:
    'Multi-agent klinkt indrukwekkend in een sales deck. In de praktijk lost één goed gebouwde workflow vaak hetzelfde probleem op, met minder breekrisico.',
  date: '2026-04-22',
  author: NIELS,
  readMinutes: 9,
  category: 'AI Strategy',
  tags: ['Multi-agent', 'AI architectuur', 'Workflow', 'Hype-check'],
  related: [
    'ai-pilots-die-nooit-opschalen',
    'foundation-models-kiezen',
    'workflow-herontwerp-stappenplan',
  ],
  body: `## Wat een multi-agent systeem eigenlijk is

Een multi-agent systeem laat meerdere LLM-aangestuurde "agents" met elkaar praten. Eén plant, één voert uit, één controleert. In demos is dat indrukwekkend. In productie betekent het: meer foutmomenten, meer latency, meer kosten, en een veel grotere uitdaging om uit te leggen waarom iets fout ging.

Voor de meeste MKB-organisaties is dat overkill. Voor sommige enterprise-trajecten is het de juiste keuze. Dit artikel helpt je het verschil zien.

## Wanneer multi-agent wél nuttig is

Er zijn drie scenario's waar meerdere agents echt waarde toevoegen:

1. **Werk dat door fundamenteel verschillende rollen heen moet.** Bijvoorbeeld een ontwerp dat een copywriter, een jurist en een operations-rol nodig heeft. Eén model dat al die rollen tegelijk doet, wordt middelmatig in alle drie.
2. **Onderzoek waar je een lange zoektocht moet doen.** Een agent die zoekt, een die samenvat, een die verifieert. Hier is decompositie echt nuttig omdat de uitkomst onbekend is.
3. **Lange autonome processen met heldere checkpoints.** Denk aan code-generatie waar één agent schrijft, één test draait, één terugkoppelt op de tests.

Wat al deze gevallen gemeen hebben: het werk is niet lineair en het model heeft baat bij rolwisselingen die je expliciet maakt.

## Wanneer een gewone workflow beter is

Veel "agentic" use cases zijn eigenlijk pipelines die je beter expliciet bouwt:

- Document binnenkomt
- LLM trekt de relevante velden eruit
- Velden gaan naar een validatieregel
- Geldig resultaat gaat naar het volgende systeem

Dat is geen agent-probleem. Dat is een workflow met één LLM-stap erin. Code, niet AI-magie. Het is sneller, goedkoper en als er iets fout gaat weet je waar je moet kijken.

## De drie problemen die multi-agent in productie veroorzaakt

### 1. Foutdiagnose wordt exponentieel duurder

Bij één LLM-call kun je de prompt en output bekijken en weten wat er gebeurde. Bij drie agents die elkaar berichten sturen heb je een conversatielog van twintig stappen. Een fout op stap 14 herleid je niet meer met logica — je hebt observability tooling, traces en geduld nodig.

Voor een team van vijf mensen met geen full-time AI engineer is dat onhaalbaar.

### 2. Kosten lopen op manieren die niet voorspelbaar zijn

Eén agent doet één call. Multi-agent systemen kunnen makkelijk drie tot tien keer zoveel tokens consumeren per taak, vooral als de agents elkaar feedback geven of hetzelfde document meerdere keren in hun context hebben.

Bij een proof of concept met tien gebruikers merk je dat niet. Bij duizend gebruikers wel.

### 3. Niet-determinisme stapelt op

Eén LLM-call heeft variatie. Tien achter elkaar hebben variatie-tot-de-macht-tien. Je kunt dezelfde input geven en twee verschillende paden door je systeem zien. Voor een chat-bot oké. Voor een proces dat een factuur boekt: niet.

## De vraag die je moet stellen voor je multi-agent overweegt

> Is de complexiteit die ik toevoeg evenredig met de complexiteit van het probleem dat ik oplos?

Als je een formulier wilt invullen op basis van een e-mail: nee. Een functie die een LLM aanroept is genoeg.

Als je een onderzoeksrapport wilt produceren over een onbekend onderwerp met fact-checking: misschien.

Als je hardop het woord "orchestratie" gebruikt voordat je het probleem hebt beschreven: bijna zeker nee.

## Hoe we het bij klanten doen

We beginnen met de simpelste vorm die werkt:

1. **Eén LLM-call.** Werkt dit? Vaak ja. Klaar.
2. **Eén LLM-call met tools.** De LLM mag een paar gedefinieerde functies aanroepen. Dekt 70% van de gevallen.
3. **Workflow met meerdere LLM-stappen.** Expliciete pipeline. Geen agents. Voorspelbaar.
4. **Pas dan: agent-loop.** En zelfs dan: zo klein mogelijk.

De stap naar multi-agent komt zelden. En als hij komt, is het omdat het probleem het rechtvaardigt — niet omdat de tech-stack interessant klinkt.

## Wat dit betekent voor jouw beslissing

Als een leverancier of consultant een multi-agent oplossing voorstelt voor jouw vraag, vraag dan vier dingen:

1. Welke rollen heb je geïdentificeerd en waarom kan één model die niet samen doen?
2. Hoe meet je of de extra complexiteit waarde toevoegt boven de simpelere variant?
3. Wat is het verwachte aantal LLM-calls per gebruikersactie, en wat kost dat per maand?
4. Hoe debug je een fout in een specifieke agent-interactie?

Een goed antwoord op alle vier? Dan kan multi-agent echt zinvol zijn. Vaag antwoord op één van de vier? Dan is het demo-architectuur, niet productie-architectuur.

## Samenvatting

Multi-agent systemen zijn een echt nuttig patroon voor een smalle set problemen. Voor de meeste AI-toepassingen in MKB en middelgrote organisaties is een simpele workflow met één goed geprompte LLM beter: goedkoper, voorspelbaarder, sneller te bouwen, makkelijker uit te leggen.

De vraag is niet *kunnen we agents bouwen*. De vraag is *welk eenvoudig systeem zou dit ook oplossen* — en pas als dat antwoord echt geen is, ga je een stap verder.`,
};
