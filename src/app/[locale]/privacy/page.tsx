import { Metadata } from 'next';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Link } from '@/i18n/routing';
import PrintButton from '@/components/privacy/PrintButton';
import {
  Shield,
  Lock,
  Eye,
  UserCheck,
  Globe,
  FileText,
  Mail,
  Phone,
  AlertCircle,
  Database,
  Brain,
  Cookie,
  Scale,
  Users,
  Calendar,
  ShieldCheck,
  FileWarning,
  Building2,
  ExternalLink,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacybeleid - GroeimetAI',
  description:
    'Lees hoe GroeimetAI uw persoonsgegevens beschermt en verwerkt in overeenstemming met de AVG/GDPR.',
  openGraph: {
    title: 'Privacybeleid - GroeimetAI',
    description: 'Uw privacy is onze prioriteit. Lees ons uitgebreide privacybeleid.',
  },
};

const sections = [
  {
    id: 'intro',
    title: '1. Introductie en identiteit verwerkingsverantwoordelijke',
    icon: Shield,
    content: `GroeimetAI ("wij", "ons", "onze" of "GroeimetAI") respecteert uw privacy en is toegewijd aan het beschermen van uw persoonsgegevens. Dit privacybeleid informeert u over hoe wij omgaan met uw persoonsgegevens wanneer u onze website bezoekt, onze AI-diensten gebruikt, en vertelt u over uw privacyrechten en hoe de wet u beschermt.

Dit privacybeleid is van toepassing op alle persoonsgegevens die wij verwerken van onze klanten, leveranciers, partners, websitebezoekers en andere betrokkenen. Wij verwerken persoonsgegevens in overeenstemming met de Algemene Verordening Gegevensbescherming (AVG/GDPR) en andere toepasselijke wet- en regelgeving.

**Identiteit en contactgegevens:**
GroeimetAI
KvK-nummer: 90102304
Vestigingsadres: Apeldoorn, Nederland
Telefoon: +31 (6)81 739 018
E-mail: privacy@groeimetai.io
Website: https://groeimetai.io`,
  },
  {
    id: 'data-protection-officer',
    title: '2. Functionaris voor gegevensbescherming (DPO)',
    icon: ShieldCheck,
    content: `Wij hebben een Functionaris voor Gegevensbescherming aangesteld die toezicht houdt op de naleving van de privacywetgeving binnen onze organisatie.

**Contactgegevens DPO:**
Naam: [DPO Naam]
E-mail: dpo@groeimetai.io
Telefoon: +31 (0)20 123 4568

U kunt contact opnemen met onze DPO voor alle vragen met betrekking tot de verwerking van uw persoonsgegevens en de uitoefening van uw rechten onder de AVG.`,
  },
  {
    id: 'data-collection',
    title: '3. Categorieën persoonsgegevens die wij verzamelen',
    icon: Database,
    content: `Wij verzamelen en verwerken verschillende categorieën persoonsgegevens, afhankelijk van uw interactie met onze diensten:

**3.1 Gegevens die u direct aan ons verstrekt:**
• **Identiteitsgegevens:** Voor- en achternaam, geboortedatum, geslacht
• **Contactgegevens:** E-mailadres, telefoonnummer, postadres, bedrijfsnaam
• **Accountgegevens:** Gebruikersnaam, wachtwoord (versleuteld), accountvoorkeuren
• **Financiële gegevens:** Facturatiegegevens, betalingsinformatie (verwerkt via beveiligde payment processors)
• **Communicatiegegevens:** Inhoud van e-mails, chatberichten, supporttickets
• **Professionele gegevens:** Functietitel, werkervaring, vaardigheden (voor zakelijke klanten)

**3.2 Gegevens die automatisch worden verzameld:**
• **Technische gegevens:** IP-adres, browsertype en -versie, tijdzone-instelling, browser plug-in types en versies, besturingssysteem en platform
• **Gebruiksgegevens:** Informatie over uw bezoek aan onze website, inclusief volledige URL-clickstream, paginaweergaven, paginareactietijden, downloadfouten, duur van bezoeken
• **Locatiegegevens:** Geschatte locatie op basis van IP-adres (land/regio niveau)
• **Cookie-gegevens:** Zie onze [Cookie Policy](/cookies) voor gedetailleerde informatie

**3.3 AI-interactiegegevens:**
• **Prompts en queries:** Vragen en opdrachten die u aan onze AI-systemen stelt
• **AI-gegenereerde content:** Antwoorden en content gegenereerd door onze AI
• **Feedback en correcties:** Uw feedback op AI-output voor verbetering van onze diensten
• **Gebruikspatronen:** Hoe u onze AI-tools gebruikt, frequentie, voorkeuren

**3.4 Gegevens van derden:**
• **Sociale media gegevens:** Als u zich aanmeldt via sociale media accounts
• **Partner gegevens:** Informatie van onze zakelijke partners voor gezamenlijke projecten
• **Openbare bronnen:** Publiek beschikbare bedrijfsinformatie voor B2B-diensten`,
  },
  {
    id: 'legal-basis',
    title: '4. Rechtsgrondslagen voor verwerking (AVG Artikel 6)',
    icon: Scale,
    content: `Wij verwerken uw persoonsgegevens alleen wanneer wij hiervoor een geldige rechtsgrondslag hebben onder Artikel 6 van de AVG:

**4.1 Uitvoering van een overeenkomst (Art. 6(1)(b) AVG):**
• Levering van onze AI-diensten en producten
• Account aanmaken en beheren
• Klantenservice en ondersteuning bieden
• Facturatie en betalingsverwerking

**4.2 Gerechtvaardigd belang (Art. 6(1)(f) AVG):**
• Verbetering van onze AI-modellen en diensten
• Beveiliging en fraudepreventie
• Interne administratie en bedrijfsanalyse
• Direct marketing aan bestaande klanten (met opt-out mogelijkheid)

Bij verwerking op basis van gerechtvaardigd belang voeren wij altijd een belangenafweging uit om te waarborgen dat onze belangen niet zwaarder wegen dan uw belangen of fundamentele rechten en vrijheden.

**4.3 Toestemming (Art. 6(1)(a) AVG):**
• Marketing communicatie naar prospects
• Plaatsing van niet-essentiële cookies
• Deelname aan onderzoeken of beta-tests
• Gebruik van AI-trainingsdata buiten contractuele noodzaak

U kunt uw toestemming te allen tijde intrekken via privacy@groeimetai.io.

**4.4 Wettelijke verplichting (Art. 6(1)(c) AVG):**
• Belastingadministratie en fiscale verplichtingen
• Naleving van gerechtelijke bevelen
• Anti-witwas controles (waar van toepassing)

**4.5 Vitaal belang (Art. 6(1)(d) AVG):**
• In noodsituaties waar bescherming van leven of gezondheid noodzakelijk is`,
  },
  {
    id: 'data-use',
    title: '5. Doeleinden van gegevensverwerking',
    icon: UserCheck,
    content: `Wij gebruiken uw persoonsgegevens voor de volgende specifieke doeleinden:

**5.1 Dienstverlening:**
• Uitvoeren van AI-consulting en implementatieprojecten
• Leveren van SaaS AI-oplossingen
• Personalisatie van AI-output op basis van uw voorkeuren
• Technische ondersteuning en probleemoplossing

**5.2 AI en Machine Learning:**
• Training en verbetering van onze AI-modellen (alleen met expliciete toestemming of geanonimiseerd)
• Kwaliteitscontrole van AI-gegenereerde content
• Onderzoek naar nieuwe AI-toepassingen
• A/B testing en prestatie-optimalisatie

**5.3 Communicatie:**
• Beantwoorden van vragen en verzoeken
• Sturen van service-gerelateerde mededelingen
• Nieuwsbrieven en productaankondigingen (met toestemming)
• Belangrijke updates over privacy of voorwaarden

**5.4 Bedrijfsvoering:**
• Facturatie en financiële administratie
• Risicobeheer en compliance
• Interne audits en kwaliteitscontrole
• Statistische analyse en rapportage

**5.5 Marketing en verkoop:**
• Gepersonaliseerde aanbiedingen (met toestemming)
• Marktonderzoek en klanttevredenheid
• Lead generatie en conversie-optimalisatie
• Retargeting (alleen met cookie-toestemming)

**5.6 Beveiliging:**
• Detectie en preventie van fraude
• Monitoring van systeembeveiliging
• Incident response en forensisch onderzoek
• Toegangscontrole en authenticatie`,
  },
  {
    id: 'ai-specific',
    title: '6. AI-specifieke privacy overwegingen',
    icon: Brain,
    content: `Als AI-dienstverlener hebben wij specifieke verantwoordelijkheden met betrekking tot uw privacy:

**6.1 AI Training en Model Development:**
• Wij gebruiken uw persoonlijke data NIET voor het trainen van onze algemene AI-modellen zonder expliciete toestemming
• Waar mogelijk gebruiken wij synthetic data of volledig geanonimiseerde datasets
• Voor klant-specifieke modellen worden strikte data governance protocollen toegepast
• U heeft het recht om te verzoeken dat uw data niet voor training wordt gebruikt

**6.2 AI Output en Intellectueel Eigendom:**
• AI-gegenereerde content op basis van uw input blijft uw eigendom
• Wij claimen geen rechten op content gegenereerd voor uw specifieke use case
• Metadata over AI-interacties wordt geanonimiseerd opgeslagen voor prestatieverbetering

**6.3 Bias en Fairness:**
• Wij monitoren actief op bias in onze AI-systemen
• Regelmatige audits worden uitgevoerd om discriminatie te voorkomen
• Transparantie over AI-besluitvorming waar mogelijk en relevant

**6.4 Explainable AI:**
• U heeft het recht op uitleg over significante AI-beslissingen
• Wij documenteren de logica achter onze AI-systemen
• Menselijke review is beschikbaar voor kritieke beslissingen

**6.5 Data Minimalisatie in AI:**
• Wij verzamelen alleen data die noodzakelijk is voor de AI-functionaliteit
• Automatische data-expiratie voor niet-essentiële AI-trainingsdata
• Opt-in voor uitgebreide data collection voor verbeterde personalisatie`,
  },
  {
    id: 'data-sharing',
    title: '7. Delen van gegevens met derden',
    icon: Globe,
    content: `Wij delen uw persoonsgegevens alleen onder strikte voorwaarden en waarborgen:

**7.1 Categorieën ontvangers:**

**Dienstverleners (verwerkers):**
• Cloud hosting providers (Google Cloud Platform, met adequaatheidsbesluit)
• Payment processors (Stripe, Mollie - PCI-DSS compliant)
• E-mail service providers (SendGrid - met verwerkersovereenkomst)
• Analytics diensten (Google Analytics met IP-anonimisatie)
• Customer support tools (Intercom - Privacy Shield gecertificeerd)

**Professionele adviseurs:**
• Accountants (alleen voor financiële audits)
• Juridisch adviseurs (onder geheimhoudingsplicht)
• Compliance consultants (voor privacy audits)

**Overheidsinstanties:**
• Belastingdienst (wettelijke verplichting)
• Toezichthouders (Autoriteit Persoonsgegevens)
• Rechtshandhaving (alleen met gerechtelijk bevel)

**7.2 Waarborgen bij delen:**
• Verwerkersovereenkomsten conform Art. 28 AVG
• Geheimhoudingsverklaringen waar toepasselijk
• Data minimalisatie - alleen noodzakelijke gegevens
• Regelmatige audits van derde partijen

**7.3 Internationale doorgifte:**
Zie sectie 8 voor details over internationale gegevensoverdrachten.

**7.4 Wij verkopen NOOIT uw gegevens:**
GroeimetAI verkoopt, verhuurt of least uw persoonsgegevens niet aan derden voor marketing- of andere commerciële doeleinden.`,
  },
  {
    id: 'international-transfers',
    title: '8. Internationale gegevensoverdrachten',
    icon: Globe,
    content: `Sommige van onze dienstverleners zijn gevestigd buiten de Europese Economische Ruimte (EER). Wij zorgen voor passende waarborgen:

**8.1 Overdracht mechanismen:**
• **Adequaatheidsbesluiten:** Waar mogelijk werken wij met landen met een adequaatheidsbesluit (bijv. UK, Zwitserland, Japan)
• **Standard Contractual Clauses (SCCs):** Voor overdrachten naar landen zonder adequaatheidsbesluit gebruiken wij de door de EU goedgekeurde modelcontracten
• **Aanvullende maatregelen:** Encryptie, pseudonimisering, toegangscontroles

**8.2 Specifieke overdrachten:**

**Google Cloud Platform (VS):**
• Basis: Standard Contractual Clauses + aanvullende technische maatregelen
• Data locatie: Primair EU datacenters (Frankfurt, België)
• Encryptie: At-rest en in-transit encryptie

**Firebase/Google Services:**
• Basis: Google's EU Data Protection Terms
• Compliance: ISO 27001, SOC 2/3 certificeringen
• Data residency opties waar beschikbaar

**8.3 Uw rechten bij internationale overdrachten:**
• U kunt een kopie opvragen van de gebruikte waarborgen
• U heeft het recht bezwaar te maken tegen specifieke overdrachten
• Wij informeren u over significante nieuwe internationale overdrachten`,
  },
  {
    id: 'data-security',
    title: '9. Technische en organisatorische beveiligingsmaatregelen',
    icon: Lock,
    content: `Wij implementeren state-of-the-art beveiliging om uw gegevens te beschermen:

**9.1 Technische maatregelen:**
• **Encryptie:** AES-256 voor data at-rest, TLS 1.3 voor data in-transit
• **Access controls:** Multi-factor authenticatie, role-based access control (RBAC)
• **Network security:** Firewalls, intrusion detection systems, DDoS bescherming
• **Application security:** OWASP Top 10 compliance, regelmatige penetratietests
• **Backup en recovery:** Dagelijkse encrypted backups, disaster recovery plan

**9.2 Organisatorische maatregelen:**
• **Personeel:** Achtergrondcontroles, geheimhoudingsverklaringen, privacy training
• **Policies:** Information Security Management System (ISMS)
• **Incident response:** 24/7 security monitoring, incident response team
• **Vendor management:** Security assessments van alle leveranciers
• **Physical security:** Toegangscontrole tot kantoren en serverruimtes

**9.3 AI-specifieke beveiliging:**
• **Model security:** Bescherming tegen adversarial attacks
• **Prompt injection preventie:** Input validatie en sanitization
• **Output filtering:** Preventie van gevoelige data lekkage
• **Audit trails:** Logging van alle AI-interacties

**9.4 Compliance certificeringen:**
• ISO 27001 (gepland voor Q3 2024)
• SOC 2 Type II (in progress)
• NEN 7510 voor healthcare klanten`,
  },
  {
    id: 'data-breach',
    title: '10. Procedures bij datalekken',
    icon: AlertCircle,
    content: `Wij nemen datalekken zeer serieus en hebben uitgebreide procedures:

**10.1 Detectie en response:**
• 24/7 monitoring van beveiligingsincidenten
• Automatische alerts bij verdachte activiteiten
• Incident response team met duidelijke escalatieprocedures

**10.2 Meldingsplicht (Art. 33-34 AVG):**
• **Melding aan AP:** Binnen 72 uur na ontdekking (tenzij geen risico)
• **Melding aan betrokkenen:** Zonder onredelijke vertraging bij hoog risico
• **Inhoud melding:** Aard inbreuk, categorieën betrokkenen/gegevens, gevolgen, genomen maatregelen

**10.3 Documentatie:**
• Alle incidenten worden gedocumenteerd in ons datalekregister
• Oorzaakanalyse en lessons learned voor elk significant incident
• Jaarlijkse review van security incidents

**10.4 Mitigatie maatregelen:**
• Onmiddellijke isolatie van getroffen systemen
• Wachtwoord resets waar nodig
• Versterkte monitoring van getroffen accounts
• Gratis credit monitoring bij significante lekken (waar toepasselijk)

**10.5 Communicatie:**
• Dedicated pagina op website voor incident updates
• Direct contact via e-mail/telefoon voor hoog-risico betrokkenen
• Transparante communicatie over genomen stappen`,
  },
  {
    id: 'retention',
    title: '11. Bewaartermijnen',
    icon: Calendar,
    content: `Wij bewaren uw gegevens niet langer dan noodzakelijk voor de doeleinden waarvoor zij zijn verzameld:

**11.1 Algemene bewaartermijnen:**

**Klantgegevens:**
• Actieve klanten: Gedurende de looptijd van de overeenkomst
• Na beëindiging: 7 jaar (fiscale bewaarplicht)
• Uitgezonderd: Basis contactgegevens voor legitieme belangen

**AI-interactiedata:**
• Prompts en outputs: 90 dagen (tenzij anders overeengekomen)
• Geanonimiseerde trainingsdata: Onbeperkt
• Performance metrics: 2 jaar

**Marketing gegevens:**
• Nieuwsbrief abonnees: Tot uitschrijving + 1 jaar
• Website analytics: 26 maanden
• Marketing automation: Tot intrekking toestemming

**Sollicitatiegegevens:**
• Afgewezen kandidaten: 4 weken na afronding procedure
• Met toestemming: 1 jaar voor toekomstige vacatures

**Support en communicatie:**
• Support tickets: 2 jaar na sluiting
• E-mail correspondentie: 2 jaar
• Chat logs: 90 dagen

**11.2 Uitzonderingen:**
• Langere bewaring bij wettelijke verplichting
• Lopende juridische procedures
• Vitaal belang van betrokkene

**11.3 Data verwijdering:**
• Veilige verwijdering via crypto-shredding
• Cascade delete in alle backup systemen
• Verificatie van complete verwijdering`,
  },
  {
    id: 'your-rights',
    title: '12. Uw rechten onder de AVG',
    icon: FileText,
    content: `Als betrokkene heeft u uitgebreide rechten onder de AVG die wij volledig respecteren:

**12.1 Recht van inzage (Art. 15 AVG):**
• Bevestiging of wij uw gegevens verwerken
• Kopie van uw persoonsgegevens
• Informatie over verwerkingsdoeleinden, categorieën, ontvangers
• **Uitoefenen:** Via privacy@groeimetai.io met kopie ID

**12.2 Recht op rectificatie (Art. 16 AVG):**
• Correctie van onjuiste gegevens
• Aanvulling van onvolledige gegevens
• **Direct mogelijk:** Via uw account dashboard of support

**12.3 Recht op gegevenswissing/"vergetelheid" (Art. 17 AVG):**
• Verwijdering wanneer gegevens niet langer nodig zijn
• Bij intrekking toestemming (en geen andere rechtsgrond)
• Bij onrechtmatige verwerking
• **Let op:** Niet mogelijk bij wettelijke bewaarplichten

**12.4 Recht op beperking verwerking (Art. 18 AVG):**
• Tijdelijke stop op verwerking bij:
  - Betwisting juistheid gegevens
  - Onrechtmatige verwerking
  - Lopende bezwaarprocedure

**12.5 Recht op overdraagbaarheid (Art. 20 AVG):**
• Ontvang uw gegevens in gestructureerd, gangbaar format
• Directe overdracht naar andere dienstverlener waar mogelijk
• **Beschikbaar voor:** Gegevens verstrekt op basis van toestemming/overeenkomst

**12.6 Recht van bezwaar (Art. 21 AVG):**
• Bezwaar tegen verwerking op basis van gerechtvaardigd belang
• Bezwaar tegen direct marketing (altijd gehonoreerd)
• **Gevolg:** Wij stoppen tenzij dwingende gerechtvaardigde gronden

**12.7 Rechten m.b.t. geautomatiseerde besluitvorming (Art. 22 AVG):**
• Recht om niet onderworpen te worden aan volledig geautomatiseerde beslissingen
• Recht op menselijke tussenkomst
• **Bij GroeimetAI:** Altijd menselijke review mogelijk bij AI-beslissingen

**12.8 Intrekken toestemming:**
• U kunt toestemming altijd intrekken
• Geen gevolgen voor rechtmatigheid eerdere verwerking
• **Hoe:** Via account settings of privacy@groeimetai.io

**12.9 Klachtrecht:**
• Bij Autoriteit Persoonsgegevens: www.autoriteitpersoonsgegevens.nl
• Bij uw lokale toezichthouder (EU-breed)
• Wij prefereren eerst zelf uw klacht op te lossen

**12.10 Responstijd:**
• Wij reageren binnen 1 maand op uw verzoek
• Verlenging met 2 maanden mogelijk bij complexe verzoeken
• Kosteloos, tenzij verzoeken kennelijk ongegrond/buitensporig zijn`,
  },
  {
    id: 'children',
    title: '13. Privacy van kinderen',
    icon: Users,
    content: `Wij nemen de bescherming van kinderen zeer serieus:

**13.1 Leeftijdsgrens:**
• Onze diensten zijn niet gericht op personen onder de 16 jaar
• Wij verzamelen niet bewust gegevens van kinderen onder 16 jaar
• Voor B2B educational AI tools: alleen via scholen/instellingen

**13.2 Ouderlijke toestemming:**
• Voor gebruikers 13-16 jaar is ouderlijke toestemming vereist
• Verificatie via e-mail naar ouder/voogd
• Ouders hebben volledige controle over kindergegevens

**13.3 Als wij per ongeluk kindergegevens verzamelen:**
• Onmiddellijke verwijdering na kennisname
• Notificatie aan ouders indien bekend
• Review van onze age-gating mechanismen

**13.4 Educational AI gebruik:**
• Alleen via overeenkomsten met onderwijsinstellingen
• Strikte data minimalisatie
• Geen marketing naar kinderen
• Extra beveiligingsmaatregelen

**13.5 Melden van kindergegevens:**
Als u vermoedt dat wij onbedoeld gegevens van een kind hebben verzameld, neem dan onmiddellijk contact op via privacy@groeimetai.io`,
  },
  {
    id: 'cookies',
    title: '14. Cookies en tracking technologieën',
    icon: Cookie,
    content: `Wij gebruiken cookies en vergelijkbare technologieën voor verschillende doeleinden:

**14.1 Soorten cookies:**

**Essentiële cookies:**
• Sessie management
• Security tokens
• Load balancing
• **Rechtsgrond:** Noodzakelijk voor dienstverlening

**Functionele cookies:**
• Taalvoorkeuren
• UI personalisatie
• Login remember me
• **Rechtsgrond:** Gerechtvaardigd belang

**Analytische cookies:**
• Google Analytics (geanonimiseerd)
• Hotjar (session recordings met consent)
• Custom analytics
• **Rechtsgrond:** Toestemming

**Marketing cookies:**
• Google Ads remarketing
• LinkedIn Insight Tag
• Facebook Pixel
• **Rechtsgrond:** Toestemming

**14.2 Cookie beheer:**
• Cookie banner bij eerste bezoek
• Granulaire cookie voorkeuren
• Withdraw consent anytime
• Cookie-vrije versie website beschikbaar

**14.3 Alternatieve tracking:**
• Server-side analytics waar mogelijk
• Privacy-vriendelijke alternatieven (Plausible)
• Geen fingerprinting technieken

**Voor volledig cookie overzicht, zie onze [Cookie Policy](/cookies)**`,
  },
  {
    id: 'third-party',
    title: '15. Derde partij integraties',
    icon: Building2,
    content: `Transparantie over onze key technology partners:

**15.1 Infrastructure providers:**

**Google Cloud Platform:**
• Services: Compute, Storage, AI/ML APIs
• Data locatie: EU (primair), global failover
• Compliance: GDPR processor terms, ISO 27001
• DPA: cloud.google.com/terms/data-processing-addendum

**Firebase (Google):**
• Services: Authentication, Realtime Database, Hosting
• Privacy: Covered onder Google Cloud DPA
• Data residency: EU-regio geconfigureerd

**15.2 AI/ML Services:**

**OpenAI API:**
• Services: GPT model access
• Data retention: 30 dagen, geen training op klantdata
• Compliance: SOC 2, business associate agreement beschikbaar
• API data processing addendum aanwezig

**Anthropic Claude API:**
• Services: Claude model access
• Zero data retention optie beschikbaar
• Enterprise privacy controls

**15.3 Business tools:**

**Stripe:**
• Services: Payment processing
• PCI-DSS Level 1 compliant
• Geen opslag creditcard data bij GroeimetAI
• EU data processing

**SendGrid:**
• Services: Transactional email
• Data locatie: EU servers
• GDPR compliant met DPA

**15.4 Due diligence:**
• Jaarlijkse privacy review alle vendors
• Data Processing Agreements met alle verwerkers
• Exit strategieën voor vendor lock-in
• Incident notification procedures`,
  },
  {
    id: 'changes',
    title: '16. Wijzigingen in dit privacybeleid',
    icon: FileWarning,
    content: `Wij kunnen dit privacybeleid periodiek bijwerken:

**16.1 Soorten wijzigingen:**

**Kleine wijzigingen:**
• Verduidelijkingen of typefouten
• Contact informatie updates
• Nieuwe examples of uitleg
• **Notificatie:** Update datum op pagina

**Materiële wijzigingen:**
• Nieuwe verwerkingsdoeleinden
• Wijzigingen in gegevensretentie
• Nieuwe derde partij ontvangers
• Wijzigingen in uw rechten
• **Notificatie:** E-mail + website banner + 30 dagen notice

**16.2 Versie controle:**
• Alle versies gearchiveerd en beschikbaar
• Changelog met key wijzigingen
• GitHub repository voor transparantie

**16.3 Uw opties bij wijzigingen:**
• Review periode van 30 dagen
• Mogelijkheid tot bezwaar/vragen
• Opt-out voor specifieke nieuwe verwerkingen
• Account beëindiging zonder boete

**16.4 Communicatie:**
• E-mail naar alle actieve gebruikers
• In-app notificaties
• Blog post bij significante updates
• Social media aankondigingen

**Huidige versie:** 2.0
**Laatst bijgewerkt:** 2 July 2025
**Vorige versie:** [Link naar archief]`,
  },
  {
    id: 'contact',
    title: '17. Contact en klachten',
    icon: Mail,
    content: `Wij staan klaar om al uw privacy-gerelateerde vragen te beantwoorden:

**17.1 Primair contactpunt:**
**Privacy Office GroeimetAI**
E-mail: privacy@groeimetai.io
Telefoon: +31 (6)81 739 018
Responstijd: Binnen 2 werkdagen

**17.2 Data Protection Officer:**
**[DPO Naam]**
E-mail: dpo@groeimetai.io
Telefoon: +31 (0)20 123 4568
Voor: Complexe privacy vragen, rechten uitoefening, klachten

**17.3 Postadres:**
GroeimetAI
T.a.v. Privacy Office
Kweekweg 23
7315AP Apeldoorn
Nederland

**17.4 Klachtenprocedure:**
1. **Interne afhandeling:** Wij streven ernaar alle klachten binnen 30 dagen op te lossen
2. **Escalatie:** Naar onze DPO voor complexe zaken
3. **Mediation:** Wij bieden gratis mediation aan bij geschillen
4. **Externe klacht:** U kunt altijd terecht bij de AP

**17.5 Autoriteit Persoonsgegevens:**
Bezuidenhoutseweg 30
2594 AV Den Haag
Telefoon: 0900 - 2001 201
Website: www.autoriteitpersoonsgegevens.nl

**17.6 Europese toezichthouders:**
Voor grensoverschrijdende klachten: ec.europa.eu/info/law/law-topic/data-protection

**17.7 Brancheorganisaties:**
Wij zijn aangesloten bij:
• NLdigital (branchevereniging digitale economie)
• Dutch AI Coalition
[Klachten kunnen ook daar worden ingediend]`,
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-600/5 dark:from-primary/10 dark:to-purple-600/10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 gradient-text">
              Privacybeleid
            </h1>
            <p className="text-xl text-muted-foreground mb-4">
              Uw privacy is onze prioriteit - Volledig AVG/GDPR compliant
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm text-muted-foreground">
              <span>Versie 2.0</span>
              <span className="hidden sm:block">•</span>
              <span>Laatst bijgewerkt: 2 July 2025</span>
              <span className="hidden sm:block">•</span>
              <span>Geldig vanaf: 2 July 2025</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-8 border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/cookies"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
              >
                <Cookie className="w-4 h-4" />
                <span className="text-sm font-medium">Cookie Policy</span>
              </Link>
              <Link
                href="#your-rights"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span className="text-sm font-medium">Uw Rechten</span>
              </Link>
              <Link
                href="#contact"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span className="text-sm font-medium">Contact DPO</span>
              </Link>
              <a
                href="https://autoriteitpersoonsgegevens.nl"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="text-sm font-medium">AP Website</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Table of Contents */}
            <Card className="p-6 mb-12 bg-card/50 backdrop-blur-sm">
              <h2 className="text-xl font-semibold mb-4">Inhoudsopgave</h2>
              <div className="grid md:grid-cols-2 gap-2">
                {sections.map((section) => (
                  <Link
                    key={section.id}
                    href={`#${section.id}`}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors group"
                  >
                    <section.icon className="w-5 h-5 text-primary mt-0.5 group-hover:scale-110 transition-transform" />
                    <span className="text-sm leading-tight">{section.title}</span>
                  </Link>
                ))}
              </div>
            </Card>

            {/* Privacy Sections */}
            <div className="space-y-16">
              {sections.map((section, index) => (
                <div key={section.id} id={section.id} className="scroll-mt-24">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <section.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-semibold">{section.title}</h2>
                  </div>
                  <div className="prose prose-lg dark:prose-invert max-w-none">
                    <div className="whitespace-pre-line text-muted-foreground leading-relaxed">
                      {section.content.split('\n\n').map((paragraph, pIndex) => {
                        // Check if paragraph contains bullet points
                        if (paragraph.includes('•')) {
                          const [intro, ...bullets] = paragraph.split('\n');
                          return (
                            <div key={pIndex} className="mb-6">
                              {intro && <p className="mb-3">{intro}</p>}
                              <ul className="space-y-2 ml-4">
                                {bullets.map((bullet, bIndex) => {
                                  if (bullet.trim().startsWith('•')) {
                                    const content = bullet.replace('•', '').trim();
                                    const [label, ...rest] = content.split(':');
                                    return (
                                      <li key={bIndex} className="flex items-start">
                                        <span className="text-primary mr-2 mt-1">•</span>
                                        <span>
                                          {rest.length > 0 ? (
                                            <>
                                              <strong>{label}:</strong> {rest.join(':')}
                                            </>
                                          ) : (
                                            content
                                          )}
                                        </span>
                                      </li>
                                    );
                                  }
                                  return null;
                                })}
                              </ul>
                            </div>
                          );
                        }

                        // Handle headers with **
                        const processedParagraph = paragraph.replace(
                          /\*\*(.*?)\*\*/g,
                          '<strong class="text-foreground">$1</strong>'
                        );

                        return (
                          <p
                            key={pIndex}
                            className="mb-6"
                            dangerouslySetInnerHTML={{ __html: processedParagraph }}
                          />
                        );
                      })}
                    </div>
                  </div>
                  {index < sections.length - 1 && <Separator className="mt-12" />}
                </div>
              ))}
            </div>

            {/* Download and Print Options */}
            <Card className="p-8 mt-16 bg-gradient-to-br from-primary/5 to-purple-600/5">
              <h2 className="text-xl font-semibold mb-4">Documentopties</h2>
              <div className="flex flex-wrap gap-4">
                <PrintButton />
                <a
                  href="/privacy-policy-groeimetai.pdf"
                  download
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors"
                >
                  <FileText className="w-5 h-5" />
                  Download als PDF
                </a>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}
