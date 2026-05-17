import type { BlogPost } from '../../types';
import { NIELS } from '../../types';

export const workflowHerontwerpStappenplan: BlogPost = {
  slug: 'workflow-herontwerp-stappenplan',
  locale: 'nl',
  title: 'Workflow-herontwerp met AI: het stappenplan dat werkt',
  excerpt:
    'AI in een bestaand proces stoppen is meestal verspilling. AI als aanleiding gebruiken om het proces te herontwerpen levert echte winst op. Zo doen we dat.',
  date: '2026-05-05',
  author: NIELS,
  readMinutes: 9,
  category: 'Workflow',
  tags: ['Workflow', 'Procesherontwerp', 'Automatisering', 'Productiviteit'],
  related: [
    'ai-pilots-die-nooit-opschalen',
    'servicenow-ai-transformatie',
    'copilot-vs-custom',
  ],
  body: `## Wat fout gaat als je AI op een bestaand proces plakt

Je hebt een proces met tien stappen, gegroeid over jaren, met workarounds voor problemen die niemand meer onthoudt. Iemand zegt "laten we hier AI op zetten" — en je voegt een AI-stap toe op stap 4. Mooi gebouwd. Werkt technisch.

Maar het proces zelf is niet veranderd. De negen andere stappen zijn nog steeds suboptimaal. De winst is marginaal. En vaak verstopt de AI-laag waar de echte rommel zit, omdat de output "moderner" oogt.

Dit is de helft van de AI-implementaties die we tegenkomen.

## Wat in plaats daarvan werkt

Vóór de AI-stap zet je een herontwerp-stap. Je vraagt: *als ik dit proces vandaag opnieuw zou ontwerpen, met de capaciteiten die we nu hebben, hoe zou het er dan uitzien?*

Dat is geen platte automatisering. Het is herontwerp.

## Het stappenplan

### Stap 1: Het huidige proces beschrijven zoals het écht is

Niet zoals het in het procedurehandboek staat. Zoals het werkelijk verloopt — inclusief de workarounds, de Excel-tussenstappen, het mailtje aan Marian die altijd weet waar dat bestand is.

We doen dit in een sessie van twee uur per proces, met drie tot vijf mensen die het proces dagelijks uitvoeren. Niet de managers — de uitvoerenden. Dit kost meer tijd dan veel teams verwachten en is altijd het meest informatieve deel.

### Stap 2: De waarde-eenheid benoemen

Wat is de uitkomst van dit proces, waar de klant of het bedrijf voor betaalt? Een offerte die wordt verstuurd? Een ticket dat is opgelost? Een rapport dat is geleverd?

Dit lijkt triviaal. Het is dat niet. Veel teams hebben processen die uitkomsten produceren waar niemand om vraagt. Die wil je niet automatiseren — die wil je stoppen.

### Stap 3: De drie soorten werk onderscheiden

Binnen elk proces zit drie soorten werk:

1. **Wrijving** — gegevens overtypen, formaten omzetten, hetzelfde antwoord twee keer geven. Pure overhead. Eerste kandidaat voor AI of automatisering.
2. **Beslissing** — keuze maken op basis van situatie. AI kan helpen voorbereiden of opties beschrijven, maar de keuze ligt bij een mens.
3. **Waarde-werk** — denkwerk, contact met de klant, oplossen van iets unieks. Hier blijft het werk waar het hoort.

De fout is om alles in categorie 1 te schuiven. Je verliest dan precies wat je werk onderscheidend maakt.

### Stap 4: Het herontwerp

Niet "AI vervangt stap 4". Maar: gegeven dat we nu de drie soorten werk kennen, hoe ziet het kortste pad eruit van trigger naar waarde-eenheid?

Vaak komt er een proces uit met minder stappen. Soms valt een hele tussenrol weg, niet omdat de persoon vervangen wordt door AI, maar omdat de tussenstap niet meer nodig is in het nieuwe ontwerp.

### Stap 5: Pas dan: tools kiezen

Welke tool het beste past hangt af van het herontwerp, niet andersom. Soms is dat een Copilot-licentie. Soms een custom integratie. Soms gewoon een formulier met een paar regels logica erachter, geen AI in zicht.

Dat is OK. Niet elk proces hoeft AI te bevatten.

### Stap 6: Pilot met een kleine populatie

Eén team, drie tot zes weken. Niet de hele organisatie tegelijk. We willen leren of het werkt — als het niet werkt, willen we dat ontdekken voor we honderden mensen erop hebben gezet.

### Stap 7: Meting tegen het oude proces

Vooraf vastgelegd: wat zijn de twee à drie cijfers waar we naar kijken? Doorlooptijd? Aantal fouten? Klanttevredenheid? Tijd per uitkomst?

Zonder vergelijking is "het voelt beter" je enige bewijs. Daar valt geen besluit op te nemen.

### Stap 8: Uitrollen of bijstellen

Werkte het? Uitrol naar de volgende teams, met de geleerde lessen uit de pilot. Werkte het niet? Niet doorzetten — herontwerpen of stoppen. Een mislukte pilot doorzetten "omdat we al investeerden" is hoe je AI-implementaties krijgt die jaren onder de norm presteren.

## Wat in de praktijk vaak verrast

**De grootste winst zit zelden in de stap waar je AI op verwacht had.** Vaak komt de winst uit het verwijderen van stappen, niet uit het versnellen ervan.

**De pilot-fase legt onverwachte problemen bloot.** Een proces dat in theorie 5 stappen heeft, blijkt 12 micro-stappen te bevatten die niemand in scope had. Beter ontdekken in week 4 dan in maand 6.

**Mensen reageren anders dan je verwacht.** Sommigen omarmen het herontwerp, anderen zien het als bedreiging. Beide redenen zijn legitiem en je moet ze allebei behandelen.

**De tooling-keuze is bijna nooit het moeilijke deel.** Als het ontwerp goed is, is de bouw vaak rechttoe rechtaan.

## Wanneer je dit niet moet doen

Een proces dat alleen door één persoon wordt uitgevoerd, één keer per maand, en goed werkt zoals het is. Niet alles hoeft geoptimaliseerd. Wij beginnen alleen herontwerptrajecten als de business case helder is — minimaal 100 uur per maand aan inzet en een meetbare uitkomst.

## Wat dit oplevert

Een goed herontwerptraject bij een proces waar 5-20 mensen op werken, levert in onze ervaring 25-50% reductie in doorlooptijd op, vaak met betere kwaliteit (minder fouten, consistenter resultaat). Dat is significant, maar geen "10x-verbetering" — vermijd leveranciers die dat claimen.

## Samenvatting

AI op een oud proces plakken levert marginale winst op. Een proces herontwerpen met AI als één van de bouwstenen levert echte winst op. Het verschil zit in de stap waar de meeste teams overslaan: eerst kijken, beschrijven, en het proces zelf opnieuw inrichten — pas daarna de tools kiezen.`,
};
