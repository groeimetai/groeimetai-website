import type { BlogPost } from '../../types';
import { NIELS } from '../../types';

export const aiGovernanceMkb: BlogPost = {
  slug: 'ai-governance-mkb',
  locale: 'nl',
  title: 'AI-governance voor MKB: één pagina, geen comité',
  excerpt:
    'AI-governance hoeft geen werkgroep, charter of jaarrapport te zijn. Voor MKB is één duidelijke pagina meer waard dan een framework.',
  date: '2026-04-28',
  author: NIELS,
  readMinutes: 7,
  category: 'Governance',
  tags: ['Governance', 'AVG', 'Beleid', 'Risico'],
  related: ['llm-security-compliance', 'veilige-ai-integraties-checklist', 'change-management-ai'],
  body: `## Wat AI-governance niet moet zijn voor een MKB-organisatie

Een commissie van vijf mensen die maandelijks vergadert. Een framework met 12 categorieën en 60 sub-vragen. Een jaarlijkse audit. Een dashboard met groene en rode bolletjes dat niemand bekijkt.

Dat is wat governance wordt als je het van grote consultancies overneemt zonder de context. Voor een organisatie van 30 tot 500 mensen is dit overdreven en ineffectief — je creëert ruis zonder dat de echte risico's beter gemanaged worden.

## Wat het wel moet zijn

Eén pagina. Echt één pagina. Die beantwoordt:

1. **Wat mag wel en wat mag niet** met AI in onze organisatie?
2. **Wie beslist** als er twijfel is?
3. **Hoe melden we** als er iets misgaat of als iemand een grenssituatie ziet?

Meer is mooi. Niets meer dan dit is wettelijk verplicht voor de meeste organisaties. En dit kun je in een middag schrijven en in een week op alle relevante plekken communiceren.

## De inhoud van die ene pagina

### 1. Wat is duidelijk OK

Voorbeelden:
- E-mails en documenten herschrijven (zonder klantnamen)
- Vergaderingen samenvatten op basis van eigen notities
- Marketing-content opstellen
- Code-suggesties accepteren of afwijzen
- Reageren op standaard klantvragen (met een mens als laatste check)

### 2. Wat is duidelijk niet OK

Voorbeelden:
- Klant-PII (namen, geboortedata, BSN's) in publieke AI-tools plakken
- Medische, juridische of financiële adviezen door AI alleen geven aan klanten
- Beslissingen over personen (afwijzen sollicitant, opzeggen klant) door AI laten nemen zonder menselijke check
- Productie-data gebruiken om prompts te testen

### 3. Wat is grijs gebied en bij wie kom je dan

Niet alles past in OK of niet-OK. Voor de grijze gevallen: één persoon die je benadert. De CTO, de operations manager, of een ander aanspreekpunt dat de capability heeft om snel iets te zeggen.

De grijze gevallen helpen je trouwens je beleid bij te slijpen. Houd ze bij, en als je dezelfde vraag drie keer krijgt is dat een teken dat de pagina geüpdatet moet.

### 4. Hoe melden we incidenten

Korte route. Een formulier, een vast e-mailadres, of een Slack-kanaal. Geen drempel om "iets vreemds heb ik zien gebeuren" te melden. De alternatieve cultuur — "ik zag iets maar wist niet of het belangrijk was" — is veel duurder.

## Wat je expliciet niet hoeft te doen

### Geen AI ethics board

Tenzij je in een gereguleerde sector zit (financieel toezicht, medisch, overheid) en > 1000 medewerkers hebt: een formeel ethics board is overkill. Je krijgt formele procedures voor wat informeel beter werkt.

### Geen jaarlijkse impact assessment

De EU AI Act vereist dat voor specifieke high-risk systemen — geen voor algemene AI-gebruik in je organisatie. Lees de wet liever zelf dan een consultant in te huren die je angst maakt.

### Geen aparte AI-classificatie van alle data

Je bestaande data-classificatie (vertrouwelijk, intern, publiek) werkt prima. Voeg toe: vertrouwelijke data gaat niet naar externe AI. Klaar.

### Geen apart AI-trainingsprogramma

AI-bewustzijn integreer je in de onboarding en de jaarlijkse security-training. Vijf minuten. Niet een aparte cursus die niemand af maakt.

## De drie scenario's die ertoe doen

In ons werk komen drie scenario's verreweg het vaakst voor:

**Scenario 1: Medewerker plakt klantgegevens in ChatGPT**
Beleid: dat mag niet (zie pagina). Detectie: praktisch lastig. Beste mitigatie: bewustzijn vooraf + een interne ChatGPT-toegang waar het wél mag (Azure OpenAI of vergelijkbaar met data-controles).

**Scenario 2: AI-output gaat de deur uit zonder check**
Beleid: voor klant-facing output is altijd een mens als laatste check verantwoordelijk. Detectie: proces-controle, geen tooling. Beste mitigatie: ontwerp processen zo dat AI nooit de laatste hand heeft op externe communicatie.

**Scenario 3: Iemand bouwt zelf iets met AI dat impact heeft**
Beleid: nieuwe AI-toepassingen die klantdata raken vragen om een korte review (1 uur). Detectie: cultuur, niet politie. Beste mitigatie: een laagdrempelig kanaal om iets te laten reviewen, met snelle reactie.

## Hoe je het levend houdt

Een pagina die in een wiki staat en niemand leest is geen governance. Wel werkt:

- Bij elke kwartaalreview: één agendapunt over AI-incidenten en wat we ervan leren
- In de jaarlijkse security-training: 5 minuten over de pagina
- Bij elke nieuwe AI-toepassing: pagina checken voor je begint
- Eén keer per jaar: een halve dag om de pagina te updaten op basis van wat je hebt geleerd

Dat is het. Geen platform, geen rapport, geen dashboard.

## Waar dit niet voor werkt

Grote organisaties (1000+ medewerkers, meerdere afdelingen, hoge regulatoire druk). Die hebben echte governance-structuren nodig, en daar is een aparte categorie consultants voor.

Maar voor de meeste organisaties die "iets met governance" willen doen omdat ze AI gebruiken: één pagina, helder, gehandhaafd. Dat is in de praktijk effectiever dan een complex framework dat niemand gebruikt.

## Samenvatting

Effectieve AI-governance voor MKB is een korte, duidelijke pagina die zegt wat wel mag, wat niet mag, bij wie je heen gaat bij twijfel, en hoe je incidenten meldt. Plus een vast moment om ervan te leren. Het is geen werkgroep, framework of audit. Het is een afspraak die mensen kennen en gebruiken.`,
};
