import type { BlogPost } from '../../types';
import { NIELS } from '../../types';

export const aiHypeFiltrerenBeslissers: BlogPost = {
  slug: 'ai-hype-filtreren-beslissers',
  locale: 'nl',
  title: 'AI-hype filteren als beslisser: zeven vragen die de meeste pitches doen sneuvelen',
  excerpt:
    'Een leverancier of consultant pitcht je een AI-traject. Deze zeven vragen scheiden de echte oplossingen van de verkooppraatjes — zonder dat je zelf data scientist hoeft te zijn.',
  date: '2026-04-20',
  author: NIELS,
  readMinutes: 8,
  category: 'AI Strategy',
  tags: ['Beslissing', 'Vendor management', 'Strategie', 'Procurement'],
  related: ['ai-pilots-die-nooit-opschalen', 'copilot-vs-custom', 'ai-roi-berekenen-zonder-tools'],
  body: `## Waarom dit nodig is

Als beslisser krijg je in 2026 wekelijks pitches met "AI" erin. De technische lagen zijn ondoorzichtig voor wie er niet dagelijks mee werkt. De business-kant klinkt overtuigend. En de verkoper heeft een prima verhaal — vaak omdat hij of zij echt gelooft in wat hij verkoopt, niet omdat hij liegt.

Maar je hebt geen tijd om elk verhaal technisch te ontleden. Dit zijn zeven vragen die we vaak zien dat het verschil maken tussen "dit kan echt iets brengen" en "dit is geld in een ronde tafel gooien".

## Vraag 1: Wat is de meting?

> "Hoe gaan we over zes maanden weten of dit gewerkt heeft?"

Goed antwoord: één à twee meetbare cijfers, vooraf gedefinieerd, met een referentiewaarde van de huidige situatie. Bijvoorbeeld: doorlooptijd per ticket gaat van X naar Y, foutmarge daalt van A naar B.

Slecht antwoord: "we monitoren met dashboards" of "we doen quarterly reviews" of "de gebruikers zullen het zien". Dat zijn proces-woorden, geen meting.

Als de leverancier het meetcijfer niet kan benoemen voor je begint, gaat hij dat over zes maanden ook niet kunnen. En "succes" zal dan opnieuw worden gedefinieerd om bij de resultaten te passen.

## Vraag 2: Wat is de waarde-eenheid?

> "Wat verandert er per geval / per klant / per medewerker?"

Goed antwoord: een concrete eenheid waar de business om geeft. Per ticket sneller behandeld. Per offerte minder tijd. Per nieuwe medewerker sneller productief. Dit moet aansluiten op een KPI die jullie al volgen.

Slecht antwoord: "verhoogde productiviteit", "betere klantervaring", "data-gedreven besluitvorming". Mooie woorden, niet meetbaar, niet stuurbaar.

## Vraag 3: Wat als het model fout zit?

> "In welke gevallen geeft de AI een verkeerd antwoord, en wat gebeurt er dan?"

Goed antwoord: een eerlijke erkenning dat AI fouten maakt, plus een concrete beschrijving van welke fouten realistisch zijn (bijvoorbeeld: bij 5% van de gevallen valt iets buiten de getrainde categorieën, daar gaat het door menselijke review). Plus een controle-pad voor het uitzonderingsgeval.

Slecht antwoord: "ons model is X% accuraat" zonder context van wat de fouten betekenen. Of: "we trainen continu bij" als geruststelling.

99% accuraat klinkt indrukwekkend tot je beseft dat je met 10.000 cases per maand 100 fouten hebt. De vraag is niet "wat is de accuratesse", de vraag is "wat gebeurt er met die 100".

## Vraag 4: Welke kennis verlaat onze organisatie?

> "Welke data gaat naar welke externe partij?"

Goed antwoord: een specifieke beschrijving — bijvoorbeeld "tekst van het ticket, geanonimiseerd, naar Azure OpenAI EU regio, geen training, retentie 30 dagen". Inclusief wat *niet* meegaat.

Slecht antwoord: "alles gaat via een veilige API" of "we gebruiken enterprise-tier". Dat zegt niets over welke data en waar.

## Vraag 5: Hoe sluit dit aan op wat we al hebben?

> "Welke systemen werken we mee en hoe? Lock-in risico?"

Goed antwoord: integratie via standaard interfaces (REST, webhooks, bestaande connectors), met een idee van wat het kost om in de toekomst van leverancier te wisselen.

Slecht antwoord: "we worden je AI-platform" of "binnen ons ecosysteem werkt alles naadloos". Dat is vendor lock-in vermomd als feature.

Vraag specifiek: wat als we over twee jaar willen wisselen? Wat duurt dat en wat kost dat?

## Vraag 6: Wie bedient dit, en met welke training?

> "Welke rol in onze organisatie houdt dit draaiend, en wat heeft die persoon nodig?"

Goed antwoord: een realistische beschrijving van de skills die nodig zijn, plus erkenning dat onderhoud nodig is — prompts updaten als de business verandert, evaluaties opnieuw draaien, kosten in de gaten houden.

Slecht antwoord: "het werkt automatisch, zonder onderhoud". Of: "wij doen alles". Het eerste is een leugen, het tweede is afhankelijkheid die je later opbreekt.

## Vraag 7: Wat als we morgen stoppen?

> "Wat gebeurt er met onze data, onze prompts, onze logs als we de samenwerking beëindigen?"

Goed antwoord: een exit-clausule. Je data is exporteerbaar in standaard formaten. Je prompts zijn van jou. Logs blijven bij jou of worden netjes overgedragen.

Slecht antwoord: ontwijken of verwijzen naar "standaard procedures". Dit is precies de vraag die zware leveranciers liever niet beantwoorden. Hoe minder zin ze in deze vraag hebben, hoe belangrijker hij is.

## Wat je met de antwoorden doet

Niet elke vraag hoeft een 10/10 antwoord. Sommige zaken zijn legitiem onzeker (nieuwe technologie, eerste implementatie). Maar je wilt op alle zeven *iets* horen. Twee tot drie vage antwoorden uit zeven is een sterk signaal om door te vragen of weg te lopen.

Belangrijker: de manier waarop iemand reageert op deze vragen vertelt je meer dan de exacte antwoorden. Een eerlijke leverancier zegt "goede vraag, op punt drie zijn we nog niet helemaal scherp, hier is wat we wel weten". Een minder eerlijke leverancier zegt iets dat klinkt alsof het een antwoord is maar dat eigenlijk niet is.

## Wat we leren bij klanten

In begeleidingstrajecten lopen we deze zeven vragen door met elke serieuze AI-leverancier die de klant overweegt. Het is geen lange exercitie — 30 minuten in een sessie. De resultaten zijn vaak verrassend: pitches die op slides indrukwekkend leken vallen bij vraag 3, 4 of 7 uit elkaar.

Niet alle "afvallers" zijn slechte leveranciers. Sommigen passen gewoon niet bij jullie use case. Dat is ook waardevolle informatie.

## Samenvatting

Zeven vragen die elk AI-voorstel moet kunnen beantwoorden: wat meten we, wat is de waarde-eenheid, wat als het fout zit, welke data verlaat de organisatie, hoe sluit het aan op wat we hebben, wie bedient het, wat als we stoppen. Slechte antwoorden op meerdere vragen = teken om door te vragen of door te lopen.`,
};
