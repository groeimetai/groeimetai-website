import type { BlogPost } from '../../types';
import { NIELS } from '../../types';

export const aiRoiBerekenenZondertools: BlogPost = {
  slug: 'ai-roi-berekenen-zonder-tools',
  locale: 'nl',
  title: 'AI-ROI berekenen zonder calculator-tools: hoe je het op één A4 doet',
  excerpt:
    'ROI-calculators zijn meestal verkoopaanleidingen vermomd als analyse. Hier is een eenvoudige rekenoefening die je in 30 minuten zelf doet.',
  date: '2026-04-12',
  author: NIELS,
  readMinutes: 7,
  category: 'AI Strategy',
  tags: ['ROI', 'Business case', 'Beslissing', 'Investering'],
  related: ['ai-hype-filtreren-beslissers', 'ai-pilots-die-nooit-opschalen', 'copilot-vs-custom'],
  body: `## Waarom de online ROI-calculators meestal nutteloos zijn

De gemiddelde "AI ROI calculator" die je bij een leverancier invult werkt zo: je geeft een aantal gebruikers in, een aantal uren per week, een gemiddeld uurloon, en de calculator vermenigvuldigt dit met een aanname over "10% productiviteitsverbetering". Resultaat: een indrukwekkend getal dat tot drie cijfers achter de komma terug verdient.

Wat ontbreekt: de adoptiegraad (vaak 20-40%), de inwerktijd, de plafondeffecten (niet elk uur is gelijk besparbaar), en de onderhoudskosten. Het is geen analyse, het is een verkooppraatje met cijfers.

Je kunt het beter zelf doen in 30 minuten op één A4.

## De rekenoefening

Vijf cijfers. Geen meer.

### Cijfer 1: Aantal mensen × adoptiegraad

> Hoeveel medewerkers krijgen toegang × welk percentage zal het structureel gebruiken?

Wees realistisch. Adoptiegraad ligt in onze ervaring tussen 30% (zonder begeleiding) en 75% (met goede adoptie-aanpak). Reken niet met 100%.

Voorbeeld: 50 medewerkers, 50% structureel gebruik = 25 actieve gebruikers.

### Cijfer 2: Tijdsbesparing per actieve gebruiker per week

> Hoeveel uur per week per persoon, realistisch?

Niet "AI bespaart 30% van werk". Wat is de concrete tijdsbesparing op concrete taken? Voor kantoorwerk met goed gekozen use cases zit dit typisch in de 1-5 uur per week.

Wees voorzichtig met de "10+ uur per week" claims — die zijn voor specifieke high-volume use cases, niet voor breed gebruik.

Voorbeeld: 3 uur per actieve gebruiker per week.

### Cijfer 3: Kosten per uur (effectief)

> Wat kost een uur van deze medewerker, inclusief lasten?

Niet alleen brutosalaris. Inclusief sociale lasten, bureau-overhead, etc. Voor MKB-organisaties is dit vaak 1.5-1.8x het brutosalaris.

Voorbeeld: gemiddeld €60/uur effectief.

### Cijfer 4: Productieve weken per jaar

> Hoeveel weken werkt iemand daadwerkelijk?

Inclusief vakanties, feestdagen, ziekte. Meestal 42-46 weken per jaar voor fulltime.

Voorbeeld: 44 weken.

### Cijfer 5: Totale kosten per jaar

> Licenties + bouwkosten geamortiseerd + onderhoud + adoptie-investering

Vergeet de adoptie-investering niet. Die is vaak 50-100% van de licentiekosten in het eerste jaar.

Voorbeeld voor Copilot bij 50 gebruikers:
- Licenties: 50 × €25 × 12 = €15.000
- Adoptie-investering eerste jaar: €20.000
- Totaal jaar 1: €35.000

## De berekening

**Bruto besparing per jaar** = Actieve gebruikers × uren/week × €/uur × weken
= 25 × 3 × 60 × 44 = €198.000

**Netto ROI jaar 1** = Bruto besparing - Totale kosten
= €198.000 - €35.000 = €163.000

**Netto ROI jaar 2 en verder** (geen herhaling adoptie-investering)
= €198.000 - €15.000 = €183.000

Looks good. Maar lees verder.

## De correcties die je moet maken

### Correctie 1: Bestede tijd ≠ herinzetbare tijd

Als iemand 3 uur per week minder schrijfwerk heeft, betekent dat niet automatisch 3 uur waarde voor de organisatie. Het hangt af van of die tijd gebruikt wordt voor iets nuttigs. Voor sommige rollen is dat ja (sales doet meer outreach), voor andere is dat onduidelijk.

Wij kortrekken het bedrag met 30-50% om dit op te vangen. In dit voorbeeld: €198.000 → €99.000-138.000.

### Correctie 2: Plafondeffecten

Iemand kan niet alle uren besparen. Een gemiddelde kantoorwerker heeft 3-5 uur "schrijfwerk" per week dat geschikt is voor AI-versnelling. Daarboven raakt het op.

Als je rekent met 5+ uur per persoon, vraag jezelf af of dat echt blijft over een heel jaar.

### Correctie 3: Onderhoud op de lange termijn

De adoptie-investering is geen eenmalige uitgave. Mensen vertrekken, nieuwe komen, het beleid moet onderhouden worden, prompts verouderen. Reken jaarlijks 10-20% van de eerste-jaar adoptie-investering om dit goed te houden.

### Correctie 4: De ondergrens

Welk getal is laag genoeg dat het nog steeds de moeite waard is? Het verschil tussen "200k besparing" en "60k besparing" maakt voor sommige organisaties niet uit (beide rechtvaardigen het) en voor andere wel.

## Het echte vraagstuk

Met de correcties wordt het rekensommetje:

- Bruto besparing: €198.000
- Min 40% voor bestede vs herinzetbare tijd: €119.000
- Min onderhoud op de lange termijn: €115.000
- Min kosten: -€35.000

**Realistische jaar-1 ROI: ~€80.000**

Niet de €163.000 van de eerste berekening. Maar nog steeds positief — een keuze van "ja, doen".

Het verschil tussen €163.000 en €80.000 is geen marketing-truc om je af te poeieren. Het is het verschil tussen een verwachting die teleurstelt en eentje die zichzelf bewijst.

## Wat als de berekening tegenvalt

Soms blijkt na correcties dat de ROI marginaal of negatief is. Mogelijke conclusies:

**De use case is te smal.** Zoek bredere of meer impactvolle toepassingen.

**De adoptiegraad in jouw context is te laag.** Investeer eerst in adoptie-cultuur voor je in tools investeert.

**Het kostenniveau klopt niet.** Een goedkoper alternatief overwegen.

**Het is de moeite niet waard.** Soms is "niet doen" het juiste antwoord, en dat is OK.

## Wat je niet hoeft te berekenen

- "Verhoogde innovatie-capaciteit" — niet te meten, dus niet relevant in deze oefening
- "Beter werkgeversmerk" — speculatief, geen basis voor investering
- "Concurrentievoordeel" — gebruik geen ROI om dit te onderbouwen, doe dat apart

Houd het strikt bij wat je echt kunt meten over zes tot twaalf maanden.

## Samenvatting

ROI van AI bereken je in vijf cijfers: actieve gebruikers, tijdsbesparing, uurkosten, productieve weken, totale kosten. Daarna corrigeer je voor wat de online calculators weglaten: bestede vs herinzetbare tijd, plafondeffecten, langetermijn-onderhoud. Het resultaat is realistischer dan een verkooppraatje en in de meeste gevallen nog steeds positief — alleen op een eerlijker getal.`,
};
