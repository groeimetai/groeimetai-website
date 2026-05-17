import type { BlogPost } from '../../types';
import { NIELS } from '../../types';

export const copilotVsCustom: BlogPost = {
  slug: 'copilot-vs-custom',
  locale: 'nl',
  title: 'Copilot of zelf bouwen: een eerlijke vergelijking voor MKB',
  excerpt:
    'Microsoft Copilot of een eigen oplossing? De meeste vergelijkingen zijn marketing. Hier is hoe wij het overwegen voor klanten — met de echte kosten en valkuilen.',
  date: '2026-04-16',
  author: NIELS,
  readMinutes: 9,
  category: 'AI Strategy',
  tags: ['Copilot', 'Build vs buy', 'AI strategie', 'Beslissing'],
  related: ['ai-hype-filtreren-beslissers', 'ai-adoptie-kloof-mkb', 'foundation-models-kiezen'],
  body: `## De situatie

Je organisatie wil AI inzetten. Microsoft heeft Copilot in alle Office-licenties geduwd. Google heeft Gemini in Workspace. Tegelijkertijd zie je consultants die "een eigen AI-oplossing op maat" pitchen. Hoe kies je?

De meeste artikelen die je hierover leest zijn:
- Geschreven door Microsoft-partners (Copilot is altijd het antwoord)
- Geschreven door AI-builders (custom is altijd beter)
- Geschreven door consultancies die het frame "het hangt af van uw context" gebruiken om door te kunnen factureren

Dit artikel probeert eerlijk te zijn. We bouwen beide soorten projecten en hebben geen voorkeur — alleen voor wat past.

## Wat Copilot wel goed doet

### Snel uitrolbaar

Licenties worden geactiveerd, mensen kunnen direct beginnen. Geen ontwikkeltraject, geen integratie-werk, geen DevOps. Voor "we willen iets met AI binnen een maand" is dit moeilijk te verslaan.

### Goed geïntegreerd met de office-werkflows

In Word, Excel, Outlook, Teams. Documenten samenvatten, mails opstellen, vergaderingen samenvatten. Geen context-wissel naar een ander venster. Dit verlaagt de drempel enorm.

### Compliance leunt op Microsoft

Voor organisaties die al op Microsoft 365 zitten en daar tenant-controls op hebben, valt Copilot binnen dezelfde compliance-perimeter. Geen aparte vendor risk assessment nodig.

### Prijs per gebruiker is voorspelbaar

€20-30 per gebruiker per maand. Geen verrassingen.

## Wat Copilot niet goed doet

### Werkt slecht met data buiten Microsoft

Heb je je klantdata in een ander CRM, je documenten in Google Drive, je tickets in ServiceNow? Copilot kan daar matig of niet bij. De claim "Copilot kent uw bedrijf" werkt vooral als uw bedrijf al volledig op Microsoft 365 met SharePoint draait — voor de meeste MKB-organisaties is dat niet zo.

### Geen controle over prompts en gedrag

Een Copilot-feature heeft een vaste prompt onder water. Je kunt het gedrag niet bijsturen. Werkt de "samenvatting van vergadering" feature niet zoals jouw team wil? Dat is dan zo.

### Use cases zijn generiek

Copilot is goed voor generieke kantoor-taken. Branchespecifieke workflows (bv. radiologie-rapportages, juridische akten, technische installatie-rapporten) past niet — daar wil je een eigen oplossing of een gespecialiseerd product.

### Adoptie is niet automatisch

Een Copilot-licentie betekent niet dat mensen het gebruiken. Veel organisaties hebben licenties zonder adoptie. Zie ons artikel over de adoptiekloof.

## Wat een custom oplossing wel goed doet

### Past op je specifieke werkflows

Een eigen oplossing kan precies de vraag oplossen die jouw team heeft. Geen brede feature die toevallig past — een gerichte oplossing die exact past.

### Werkt met je eigen systemen

Je CRM, je ERP, je ticketingsysteem. De oplossing kan precies de data ophalen die nodig is, in de juiste vorm, met de juiste rechten.

### Voorspelbaar gedrag

Jij bepaalt de prompts. Jij bepaalt de modelkeuze. Jij bepaalt wat er logt. Als iets niet werkt, kun je het aanpassen.

### Schaalbaar op kosten

Voor specifieke high-volume use cases (duizenden tickets per dag, miljoenen documenten) zijn custom oplossingen vaak goedkoper dan per-gebruiker licenties — je betaalt voor compute, niet voor zitplaatsen.

## Wat een custom oplossing niet goed doet

### Bouwtijd

Een eerste werkende versie kost in onze ervaring 4-12 weken, afhankelijk van scope. Dat is niet "snel beginnen".

### Vereist intern ownership

Iemand moet het bedienen. Prompts updaten. Logs in de gaten houden. Een organisatie zonder iemand met die capaciteit gaat dit niet duurzaam draaien.

### Onderhoud

Modellen veranderen, providers veranderen, je business verandert. Een custom oplossing vraagt structurele aandacht — niet veel, maar wel iets.

### Risico op overinvestering

Als je niet goed scopet, bouw je iets duurs dat nauwelijks gebruikt wordt. Zie artikel over pilots die niet opschalen.

## De keuze in de praktijk

We adviseren meestal **eerst Copilot** (of Gemini, of ChatGPT Enterprise) **voor het brede team**, plus **één of twee custom oplossingen** voor de plekken waar het echt waarde toevoegt.

### Wanneer Copilot eerst

- Je team werkt voor 60-80% in Office of Workspace
- De use cases zijn generieke kantoorwerk-taken
- Je hebt geen interne AI-engineering capability
- Snelheid is belangrijker dan optimaliteit
- Het budget is "een paar tientjes per gebruiker per maand"

### Wanneer custom eerst

- Een specifieke workflow met meetbare ROI (bv. 100+ uur per maand aan repetitief werk)
- Branchespecifieke kennis nodig
- Data zit niet primair in Microsoft 365
- Compliance- of governance-eisen waar Copilot niet aan voldoet
- Volume zo hoog dat per-gebruiker licenties niet schalen

## De fout die we vaak zien

Organisaties kiezen óf Copilot voor alles, óf custom voor alles. Beide zijn meestal verkeerd.

Copilot voor alles betekent: brede tool, geen optimalisatie waar het ertoe doet. De use cases waar veel tijd verloren gaat krijgen geen specifieke aandacht.

Custom voor alles betekent: te grote investering, te lang voor het brede team iets ziet, ontwikkelingsmoeheid bij iedereen die wacht op "ons AI-platform".

Een goede mix is: Copilot voor het brede gebruik, een of twee custom oplossingen voor de hotspots, geen "alles op één leverancier".

## Wat het echt kost

**Copilot voor 100 gebruikers**: €2.000-3.000 per maand. Plus adoptie-investering (training, begeleiding) van €15-30k eenmalig om er echt waarde uit te halen.

**Een custom oplossing voor één specifieke workflow**: €15-60k bouwkosten, plus €200-2000 per maand aan model- en hostingkosten, afhankelijk van volume.

Beide zijn investeringen. Geen wins die zichzelf in maand één terugverdienen. Wel beide investeringen met heldere ROI als je ze goed inzet.

## Samenvatting

Copilot en custom zijn geen tegenpolen — ze lossen verschillende problemen op. Copilot is voor brede, generieke AI-ondersteuning op je kantoor-werkstroom. Custom is voor specifieke workflows met hoge volumes of complexe vereisten. De meeste organisaties hebben beide nodig, in verschillende verhoudingen. Pas op voor leveranciers die zeggen dat één van beide altijd het antwoord is.`,
};
