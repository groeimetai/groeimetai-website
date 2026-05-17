import type { BlogPost } from '../../types';
import { NIELS } from '../../types';

export const servicenowAiTransformatie: BlogPost = {
  slug: 'servicenow-ai-transformatie',
  locale: 'nl',
  title: 'ServiceNow plus AI: waar het echt waarde oplevert (en waar niet)',
  excerpt:
    'ServiceNow heeft zelf AI-features. Externe AI-integraties hebben ook hun plek. Hier is hoe we kiezen wat per use case zinvol is.',
  date: '2026-04-14',
  author: NIELS,
  readMinutes: 8,
  category: 'Integrations',
  tags: ['ServiceNow', 'AI integratie', 'ITSM', 'Workflow', 'Enterprise'],
  related: [
    'workflow-herontwerp-stappenplan',
    'veilige-ai-integraties-checklist',
    'copilot-vs-custom',
  ],
  body: `## De situatie

ServiceNow heeft de afgelopen jaren stevig geïnvesteerd in eigen AI-features: Now Assist, AI Search, Virtual Agent, en sinds 2025 een uitgebreide GenAI-suite. Tegelijkertijd willen veel organisaties AI buiten ServiceNow om gebruiken — eigen modellen, eigen workflows, eigen prompts.

De vraag die we het vaakst krijgen: *waar gebruiken we de native features, en waar bouwen we er omheen?*

## Wat ServiceNow zelf goed doet

Drie dingen waar de native AI prima werkt:

### 1. Ticket-samenvatting voor agents

Een agent opent een lange ticket met tien comments. Now Assist genereert een samenvatting bovenaan. Het werkt, het scheelt tijd. Geen reden om dit zelf te bouwen.

### 2. Knowledge article suggesties

Tijdens het oplossen van een ticket toont ServiceNow relevante knowledge articles op basis van de ticket-context. De integratie met de catalogus zit er al — een eigen oplossing zou diezelfde integratie opnieuw moeten maken.

### 3. Standaard categorisatie en routing

Tickets categoriseren op basis van tekst. Werkt goed genoeg voor de meeste organisaties. Niet de moeite waard om zelf te trainen tenzij je hele specifieke taxonomie hebt.

## Waar je beter buiten ServiceNow om gaat

### 1. Complex redeneren over data uit meerdere systemen

Native AI in ServiceNow heeft toegang tot ServiceNow-data. Zodra je een vraag wilt beantwoorden die ook ERP-, CRM- of factuur-data nodig heeft, kom je vast. Dan wil je een externe AI-laag die meerdere systemen kan bevragen en ServiceNow als één van de bronnen ziet — niet als de poort.

### 2. Modellen op specifieke domeinen

ServiceNow's native modellen zijn algemeen. Als je een specifieke jargon-zware sector hebt (medisch, juridisch, semiconductor) levert een eigen prompt-engineering of finetuned model op een externe LLM betere resultaten dan de native variant.

### 3. Workflow-orchestratie over meerdere systemen

ServiceNow als trigger of als doel, met een externe orchestrator (n8n, Temporal, of een custom service) ertussen die de LLM-calls doet en ServiceNow alleen aanspreekt voor read/write op het juiste moment. Geeft je flexibiliteit zonder dat je in ServiceNow's eigen scripting-laag vastloopt.

### 4. Hogere governance-eisen dan native biedt

Native AI in ServiceNow stuurt prompts naar de Now Assist-stack. Voor sommige organisaties (overheid, financieel) is dat onvoldoende controleerbaar. Een externe AI-laag waar je het model, de hosting en de logging zelf bepaalt geeft meer grip.

## De integratie-keuzes die ertoe doen

Als je extern AI gaat gebruiken met ServiceNow zijn er drie patronen:

**Pull**: Een externe service haalt data uit ServiceNow via de REST API, doet zijn AI-werk, en schrijft het resultaat terug. Werkt voor batchwerk en async processen. Simpel, robuust, makkelijk uit te leggen.

**Push**: ServiceNow stuurt events naar een externe service (via Outbound REST, MID Server of een message queue). De externe service handelt het af en geeft een update. Goed voor real-time use cases zoals automatic ticket-enrichment.

**Inline**: Een script in ServiceNow roept tijdens een transactie een externe AI aan. Snel te bouwen maar fragiel — als de externe service traag of down is, hangt je ServiceNow-werk eraan vast. Alleen doen als de call kort en stabiel is.

We kiezen meestal pull voor structurele use cases en push voor event-driven werk. Inline alleen als het echt niet anders kan.

## De vier vragen die je beantwoordt voor je begint

1. **Wat is de waarde-eenheid?** Eén ticket sneller opgelost? Een hele categorie automatisch afgehandeld? Een rapportage die zelf wordt geschreven? Bepaal dit eerst.
2. **Wie is verantwoordelijk als de AI fout zit?** Een mens die controleert, een fallback-flow, of een proces dat de fout zelfcorrigeert?
3. **Welke data verlaat ServiceNow?** En heb je dat afgestemd met je data protection officer? Voor veel organisaties is dat een blokkade die je beter vooraf adresseert.
4. **Hoe meet je succes?** Aantallen, doorlooptijden, tevredenheid — kies één à twee KPI's vooraf, anders ben je over zes maanden aan het discussiëren over "is dit beter geworden".

## Wat we typisch implementeren

Een ServiceNow + AI-traject bij een MKB-organisatie van 200-1000 medewerkers kost in onze ervaring 4-12 weken werk, afhankelijk van scope. Een typische uitkomst:

- 30-50% reductie in tijd per ticket op de geautomatiseerde categorieën
- Hogere tevredenheid bij agents (geen verschil voor eindgebruikers, want goed gebouwde AI is onzichtbaar)
- Een operationeel team dat zelf prompts kan aanpassen zonder ontwikkelaar

Niet: een platform dat zichzelf oplost. Dat bestaat niet.

## Wat we niet doen

We bouwen geen "AI overal door ServiceNow gestrooid" trajecten. Te veel features die niet samenhangen leveren onderhoudslast op die de winst opeet. We kiezen 1-3 use cases met heldere ROI en doen die goed.

## Samenvatting

ServiceNow's eigen AI is voldoende voor agent-productiviteit en standaard ticket-werk. Externe AI is beter voor cross-systeem-redenering, domeinspecifieke modellen en hogere governance. De integratie-patronen zijn niet ingewikkeld — pull, push, inline — maar de keuze tussen "native" en "extern" maakt het verschil tussen een traject dat opschaalt en eentje dat na zes maanden vastloopt.`,
};
