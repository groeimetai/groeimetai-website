import type { BlogPost } from '../../types';
import { NIELS } from '../../types';

export const promptEngineeringTeams: BlogPost = {
  slug: 'prompt-engineering-teams',
  locale: 'nl',
  title: 'Prompt engineering voor teams: zes patronen die altijd werken',
  excerpt:
    'Vergeet de prompt-frameworks van LinkedIn. Dit zijn de zes structuren die we elke werkweek terugzien bij teams die echt resultaat halen uit AI.',
  date: '2026-04-25',
  author: NIELS,
  readMinutes: 8,
  category: 'Training',
  tags: ['Prompting', 'AI training', 'Productiviteit', 'Patronen'],
  related: ['ai-training-praktisch-beginnen', 'ai-adoptie-kloof-mkb', 'foundation-models-kiezen'],
  body: `## Wat dit niet is

Geen "100 perfect prompts voor sales". Geen acroniem als nieuwe oplossing. Geen "expert prompt-engineer tips die je productiviteit verdubbelen".

Dit zijn zes structuren die we steeds terugzien bij teams die AI structureel gebruiken. Niet omdat ze fancy zijn — omdat ze het verschil maken tussen middelmatige en bruikbare output.

## Patroon 1: Rol, taak, formaat

De basis. Veel mensen typen meteen hun vraag, en het model raadt naar context en formaat.

Slecht:
> Hoe schrijf ik een goede follow-up mail?

Beter:
> Je bent een accountmanager in B2B-software. Schrijf een follow-up mail na een sales call. De klant heeft interesse, maar wil pricing-details. Drie alinea's. Geen sales-jargon. Sluit af met een concrete vervolgafspraak-suggestie.

Drie dingen toegevoegd: rol (accountmanager), context van de situatie (na sales call met interesse), formaat (drie alinea's, geen jargon, vervolgafspraak). Verschil is direct merkbaar.

## Patroon 2: Voorbeelden voor toon

Modellen pakken toon op uit voorbeelden veel beter dan uit beschrijvingen. "Schrijf zakelijk maar warm" is vaag — een paar voorbeelden zijn helder.

> Schrijf een klantmail in deze stijl:
>
> [Voorbeeld 1 van een mail die je goed vindt]
> [Voorbeeld 2 van een mail die je goed vindt]
>
> Onderwerp: [jouw situatie]

Een team dat dit een paar keer doet bouwt een eigen library van "zo schrijven wij" en het scheelt direct in consistentie.

## Patroon 3: Negatieve instructies

Wat moet de output *niet* zijn, is vaak waardevoller dan wat het wel moet zijn. AI heeft default-neigingen (te formeel, te lang, te enthousiast, drie-deelzinnen overal) die je weghaalt door ze te benoemen.

> Schrijf een interne update over de productlancering.
>
> Vermijd:
> - "We zijn enthousiast om aan te kondigen…"
> - Bullet-lists met drie of vier punten
> - Zinnen die starten met "Bovendien" of "Daarnaast"
> - Smoezerige superlatieven

De output wordt direct natuurlijker. Veel teams melden dit als de grootste single improvement nadat ze het toepassen.

## Patroon 4: Eigen criterium voor "klaar"

In plaats van hopen dat de output goed is, vertel je het model wanneer het zelf weet dat het klaar is.

> Schrijf een productbeschrijving van max 80 woorden voor [product].
>
> De output is klaar als:
> - Een nieuwe klant in 10 seconden begrijpt wat het product doet
> - Er staat één concreet voorbeeld in
> - Er staat geen marketing-jargon in ("revolutionair", "naadloos", "krachtig")

Dit dwingt het model om kwaliteitscontrole in te bouwen voor het oplevert. Resultaat ligt vaak dichter bij wat je nodig hebt.

## Patroon 5: Stap-voor-stap denken voor complexe taken

Voor taken die echt redeneren vragen (categoriseren, beslissen, analyseren), werkt het beter om expliciet te vragen om stappen.

> Beoordeel deze klantmail. Doorloop deze stappen:
> 1. Wat vraagt de klant concreet?
> 2. Welke informatie hebben we wel beschikbaar, welke niet?
> 3. Wat is de juiste eerstvolgende actie?
> 4. Stel de mail voor de actie op.
>
> Toon je werk bij stap 1-3 voor je naar stap 4 gaat.

Het toont je werk maakt het verifieerbaar. Je ziet of de stap-2-analyse klopte, en zo niet zit je niet vast aan een uitkomst gebaseerd op een verkeerde aanname.

## Patroon 6: Iteratie expliciet maken

Zelden krijg je het eerste antwoord goed. Vraag direct om een tweede ronde met specifieke aanwijzingen.

> [Eerste output]
>
> Goed. Twee aanpassingen:
> - De openingsalinea kan korter en directer
> - De tweede alinea heeft een aanname die niet klopt — [...] is anders dan je zegt
>
> Schrijf opnieuw.

De fout is om bij een middelmatige output meteen een hele nieuwe prompt te beginnen. Iteratie binnen dezelfde conversatie is sneller en behoudt context.

## Wat we leren aan teams

In onze trainingen behandelen we deze zes patronen niet abstract. We pakken een echte taak uit het werk van de deelnemer en we passen ze samen toe. Twee uur, en mensen hebben een persoonlijke "prompt-stijl" die past bij hun werk.

Nadat dit eenmaal zit, hebben mensen geen prompt-templates meer nodig. Ze schrijven zelf prompts die werken, omdat ze de patronen herkennen.

## Wat we niet leren

- Acroniemen ("CRAFT", "RTFP", noem maar op). Het lijken kapstokken maar zijn vooral content-marketing.
- Eindeloze prompt-libraries. Hoe meer voorbeelden, hoe minder mensen ze gebruiken. Drie eigen prompts die werken zijn meer waard dan 50 geïmporteerde.
- "Geheime prompts" voor bepaalde modellen. Modellen veranderen — patronen blijven.

## Wat dit een team oplevert

Het verschil tussen iemand die ChatGPT als zoekmachine gebruikt en iemand die het als professioneel hulpmiddel gebruikt zit in deze patronen. Het is geen 2x productiviteit, geen "vervang je copywriter". Het is wel: minder slechte first drafts, minder herwerk, en minder frustratie over "AI snapt me niet".

## Samenvatting

Zes prompt-patronen die we elke werkweek terugzien bij teams die echt nut halen uit AI: rol/taak/formaat duidelijk, voorbeelden voor toon, negatieve instructies, eigen criterium voor "klaar", stap-voor-stap voor complexe taken, en expliciete iteratie. Geen framework nodig — gewoon deze zes gewoontes inslijpen.`,
};
