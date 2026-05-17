import type { BlogPost } from '../../types';
import { NIELS } from '../../types';

export const aiPilotsDieNooitOpschalen: BlogPost = {
  slug: 'ai-pilots-die-nooit-opschalen',
  locale: 'nl',
  title: 'AI-pilots die nooit opschalen: de zeven redenen die we steeds zien',
  excerpt:
    'Een pilot werkt. Het team is enthousiast. En toch komt er nooit een uitrol. Hier zijn de zeven patronen achter pilot-purgatory — en hoe je ze vermijdt.',
  date: '2026-04-02',
  author: NIELS,
  readMinutes: 8,
  category: 'AI Strategy',
  tags: ['Pilot', 'Schaal', 'Project management', 'Implementatie'],
  related: ['workflow-herontwerp-stappenplan', 'change-management-ai', 'ai-roi-berekenen-zonder-tools'],
  body: `## De situatie

Je organisatie heeft een AI-pilot gedaan. Een team van 5-10 mensen, een specifieke use case, drie tot zes weken. Het werkte. Het team was enthousiast. De pilot-evaluatie was positief.

Dan komt het stiller. Een paar maanden later: de pilot draait nog, maar niemand heeft eraan gewerkt om hem op te schalen. Geen uitrol naar andere teams, geen verbeteringen, geen tweede use case. Hij sterft een rustige dood, of blijft als een geïsoleerd eilandje in de organisatie hangen.

Dit heeft een naam: pilot purgatory. En de redenen waarom het gebeurt zijn voorspelbaarder dan de meeste organisaties zich realiseren.

## Reden 1: Geen sponsor met opschalings-belang

De pilot had iemand die hem wilde, maar die persoon was niet verantwoordelijk voor "AI in de hele organisatie". Toen de pilot klaar was, was er niemand wiens werk het was om de volgende stap te zetten.

Wat helpt: bij de start van een pilot vastleggen wie de opschaling gaat trekken als hij slaagt. Dat is een ander gesprek dan "wie doet de pilot". Vaak een ander persoon.

## Reden 2: De pilot was te schoon

Een pilot in een gecontroleerde omgeving met cherry-picked gebruikers en perfecte data toont dat *iets* kan werken. Het toont niet of het in jullie echte werksituatie werkt.

Tegen de tijd dat opschaling overweegt wordt, blijkt dat de echte omgeving messy is, gebruikers diverser zijn, data slordiger is. Wat in de pilot werkte, werkt nu niet meer goed genoeg.

Wat helpt: zorg dat de pilot zo veel mogelijk lijkt op de échte situatie. Geen vrijwilligers maar een normaal team. Geen aangepaste data maar de standaard. Niet 2 weken in een ideale rust, maar gewone weken met drukte.

## Reden 3: Resultaten niet vergelijkbaar met "voor"

De pilot was positief. Maar als je vraagt hoeveel beter het is dan ervoor, is het antwoord vaag. "Mensen zijn enthousiast." "De output ziet er goed uit." "Het scheelt tijd."

Met dit soort uitkomsten kun je geen organisatie-brede beslissing onderbouwen. Investering versus opbrengst is niet helder.

Wat helpt: voor de pilot starten, één tot drie meetbare cijfers vastleggen. Bij voorkeur cijfers die de organisatie al volgt — doorlooptijden, foutpercentages, throughput. Aan het einde van de pilot heb je dan een vergelijking.

## Reden 4: Opschaling vraagt om infrastructuur die niet bestaat

De pilot draait op een laptop, een ChatGPT-account, een paar handmatige prompts. Voor 10 mensen werkbaar. Voor 100 mensen niet.

Bij opschaling blijkt: er is geen integratie met SSO, er is geen permissie-model, er is geen logging, er is geen budget-bewaking. Het kost zes maanden werk om die er omheen te bouwen — en niemand had dat ingepland.

Wat helpt: bij het ontwerp van de pilot al rekening houden met wat opschaling vraagt. Niet alles bouwen, wel weten wat erbij komt en wie dat gaat doen.

## Reden 5: Het team dat de pilot deed staat niet open voor anderen

De vroege adopters die de pilot deden hebben een eigen versie ontwikkeld die voor hen perfect werkt. Andere teams hebben andere behoeften. De vroege adopters voelen zich niet verantwoordelijk om hun aanpak te generaliseren, en de andere teams ervaren de pilot als "iets van team X".

Wat helpt: de uitkomst van een pilot is niet alleen een werkende oplossing, maar ook een transfer-pakket — voorbeelden, prompts, leerpunten — dat een ander team kan oppakken. Plan dat in, anders gebeurt het niet.

## Reden 6: De business case voor opschaling is anders dan voor de pilot

De pilot was goedkoop (een paar mensen, een paar weken). De ROI was niet ingewikkeld. Voor de organisatiebrede uitrol komen er opeens kosten bij: infra, training voor honderden mensen, ondersteuning, monitoring. De business case wordt herberekend en blijkt veel minder gunstig.

Wat helpt: bij pilot-start ook de schaal-business case maken. Niet "is dit een leuke pilot", maar "als deze pilot werkt, wat investeren we dan en wat verwachten we daarvoor". Anders kom je voor verrassingen te staan.

## Reden 7: Politiek

De pilot werkte in afdeling X. Afdeling Y wil het ook, maar wil het *anders* doen. Afdeling Z heeft een concurrerende leverancier in gedachten. Iemand op directie-niveau heeft een eigen visie.

De pilot blijft in afdeling X hangen omdat opschaling betekent dat er afspraken gemaakt moeten worden tussen afdelingen — en daar zit niemand op te wachten.

Wat helpt: bij pilot-start al een 30-minuten gesprek met de directie of MT over "als dit werkt, wat is dan onze positie op AI-platforms en governance". Niet uitwerken, wel het gesprek voeren. Dat voorkomt de stagnatie later.

## Wat we doen om dit te voorkomen

We beginnen niet aan een pilot zonder vier dingen op tafel:

1. **Wie wordt sponsor van opschaling** als de pilot slaagt? Niet wie *zou kunnen*, maar wie het toezegt.
2. **Welke meetbare cijfers** vergelijken we voor en na?
3. **Welke opschalings-infrastructuur** is nodig, en wie bouwt die?
4. **Welke transfer-pakket** levert het pilot-team op aan andere teams?

Dit zijn geen ingewikkelde vragen. Maar ze worden zelden vooraf gesteld, en achteraf zijn ze veel moeilijker te beantwoorden.

## Wanneer een pilot bewust stoppen

Niet elke pilot moet opschalen. Soms leert een pilot dat de aanpak niet werkt — dat is óók een succes. Wel: leg de leerlessen vast, deel ze breed, en stop expliciet in plaats van de pilot stilletjes te laten doorlopen.

"We hebben dit geprobeerd, het werkte niet, dit hebben we ervan geleerd" is een professioneel resultaat. Een pilot die maandenlang in een halve staat blijft hangen, is dat niet.

## Samenvatting

Pilot purgatory is een voorspelbaar fenomeen. De zeven redenen — geen opschalings-sponsor, te schoon, niet vergelijkbaar, infrastructuur ontbreekt, transfer mislukt, business case verschuift, politiek — zijn allemaal te voorzien bij de start. Voor je een pilot begint: weet hoe hij eindigt. Niet alleen "wat als hij werkt", maar concreet welke stap erna komt, door wie, met welk budget, en op basis van welke metingen.`,
};
