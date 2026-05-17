// Industry registry — drives /training/[slug] pages.
// One record per industry. Both NL and EN pages are generated from each record
// via the template. Adding a new industry is one entry here, no new file.

export interface Industry {
  slug: string;
  labelNl: string;
  labelEn: string;
  /** Short description shown in <meta> and intro paragraph. NL. */
  introNl: string;
  introEn: string;
  /** Concrete day-to-day examples where AI saves time in this industry. */
  examplesNl: string[];
  examplesEn: string[];
  /** Things that often go wrong when this industry adopts AI. */
  pitfallsNl: string[];
  pitfallsEn: string[];
  /** Realistic outcomes after a well-run program. */
  outcomesNl: string[];
  outcomesEn: string[];
}

export const industries: Industry[] = [
  {
    slug: 'zorg',
    labelNl: 'de zorg',
    labelEn: 'healthcare',
    introNl:
      'Zorgorganisaties hebben veel administratieve last en weinig ruimte voor experiment. AI-training die werkt in de zorg houdt rekening met privacy, hiërarchie en de heilige status van patiëntcontact.',
    introEn:
      'Healthcare organisations carry a heavy administrative load with little room to experiment. AI training that works in healthcare respects privacy, hierarchy, and the protected status of patient contact.',
    examplesNl: [
      'Gespreksverslagen van consulten omzetten naar gestructureerde dossiernotities',
      'Standaardbrieven aan verzekeraars opstellen op basis van bullets',
      'Inkomende verwijzingen automatisch categoriseren en doorzetten',
      'Klinische literatuur samenvatten voor team-overleg',
    ],
    examplesEn: [
      'Convert consultation notes into structured patient record entries',
      'Draft standard letters to insurers from bullet points',
      'Auto-categorise incoming referrals and route them',
      'Summarise clinical literature for team review',
    ],
    pitfallsNl: [
      'Patiëntdata in publieke AI-tools plakken (overtreedt AVG en interne policy)',
      'AI-output gebruiken zonder professionele eindcheck bij medische beslissingen',
      'Brede uitrol zonder afstemming met privacyfunctionaris',
    ],
    pitfallsEn: [
      'Pasting patient data into public AI tools (violates GDPR and internal policy)',
      'Using AI output without professional sign-off for medical decisions',
      'Wide rollout without aligning with the privacy officer',
    ],
    outcomesNl: [
      '40-60% tijdsbesparing op administratieve taken per zorgverlener',
      'Consistente, complete dossiernotities',
      'Snellere reactie op verzekeraars en doorverwijzingen',
    ],
    outcomesEn: [
      '40-60% reduction in administrative time per clinician',
      'Consistent and complete patient record entries',
      'Faster response to insurers and referrals',
    ],
  },
  {
    slug: 'retail',
    labelNl: 'retail en e-commerce',
    labelEn: 'retail and e-commerce',
    introNl:
      'Retail-teams werken met veel productdata, klantcommunicatie en doorlooptijd-druk. AI-training voor retail richt zich op product-content, klantservice en operationele rapportages.',
    introEn:
      'Retail teams handle large volumes of product data, customer communication and time-sensitive operations. AI training for retail focuses on product content, customer service, and operational reporting.',
    examplesNl: [
      'Productbeschrijvingen genereren in jouw merk-toon op basis van specsheets',
      'Inkomende klantvragen categoriseren en eerste reactie opstellen',
      'Recensies samenvatten voor inkoop en product-verbetering',
      'Operationele weekrapporten genereren uit POS-data',
    ],
    examplesEn: [
      'Generate on-brand product descriptions from spec sheets',
      'Categorise incoming customer queries and draft first responses',
      'Summarise reviews for buying and product improvement',
      'Generate weekly operational reports from POS data',
    ],
    pitfallsNl: [
      'AI-content de webshop op laten gaan zonder check op feitelijke fouten',
      'Klantervaring verschralen door alleen op snelheid te focussen',
      'Productdata-kwaliteit niet eerst op orde brengen voor AI in te zetten',
    ],
    pitfallsEn: [
      'Publishing AI content to the webshop without checking for factual errors',
      'Eroding customer experience by optimising only for speed',
      'Failing to clean up product data before deploying AI',
    ],
    outcomesNl: [
      '5x snellere productbeschrijving-flow met consistentere kwaliteit',
      '30-50% reductie in tijd per klantvraag',
      'Beter zicht op patronen in reviews en serviceverzoeken',
    ],
    outcomesEn: [
      '5x faster product description flow with more consistent quality',
      '30-50% reduction in time per customer query',
      'Better visibility into patterns in reviews and service requests',
    ],
  },
  {
    slug: 'finance',
    labelNl: 'financiële dienstverlening',
    labelEn: 'financial services',
    introNl:
      'Financiële dienstverleners werken in een sector waar compliance en accuratesse de basis zijn. AI-training is hier sterk gekoppeld aan governance, controleerbaarheid en professionele aansprakelijkheid.',
    introEn:
      'Financial services providers operate where compliance and accuracy are foundational. AI training here is tightly coupled to governance, auditability, and professional accountability.',
    examplesNl: [
      'Klantdossiers voorbereiden en risicofactoren signaleren voor adviseurs',
      'Inkomende documenten extraheren en in adviessystemen plaatsen',
      'Standaardrapportages aan toezichthouders opstellen',
      'Vergaderverslagen omzetten naar actiepunten in workflow-tool',
    ],
    examplesEn: [
      'Prepare client dossiers and flag risk factors for advisors',
      'Extract incoming documents and load them into advisory systems',
      'Draft standard reports to regulators',
      'Convert meeting notes into action items in workflow tools',
    ],
    pitfallsNl: [
      'AI gebruiken voor adviesoutput zonder duidelijk menselijk eindbesluit',
      'Persoonsgegevens versturen naar AI-providers zonder DPA op orde',
      'Onvoldoende logging om bij audit te kunnen reconstrueren wat het systeem deed',
    ],
    pitfallsEn: [
      'Using AI for advisory output without a clear human final decision',
      'Sending personal data to AI providers without a DPA in place',
      'Insufficient logging to reconstruct system behavior during audit',
    ],
    outcomesNl: [
      '30-40% meer adviezen per FTE bij gelijke kwaliteit',
      'Volledige audit trail per AI-interactie',
      'Snellere onboarding van nieuwe adviseurs',
    ],
    outcomesEn: [
      '30-40% more advisory output per FTE at equal quality',
      'Complete audit trail per AI interaction',
      'Faster onboarding of new advisors',
    ],
  },
  {
    slug: 'bouw',
    labelNl: 'de bouw en techniek',
    labelEn: 'construction and engineering',
    introNl:
      'Bouw- en techniekorganisaties hebben veel projectadministratie, offerte-werk en kennis verspreid over individuele projectleiders. AI-training helpt om die kennis bruikbaar te maken zonder dat het projectwerk eronder lijdt.',
    introEn:
      'Construction and engineering firms carry heavy project administration, quote work, and knowledge scattered across individual project leaders. AI training helps make that knowledge usable without disrupting project work.',
    examplesNl: [
      'Offertes opstellen op basis van een korte vraagomschrijving',
      'Bestaande projectdocumentatie doorzoeken op vergelijkbare situaties',
      'Werkbon-tekst omzetten naar nette klantrapporten',
      'Inkomende RFP\'s analyseren op risico en passendheid',
    ],
    examplesEn: [
      'Generate quotes from short scope descriptions',
      'Search existing project documentation for comparable situations',
      'Convert work order notes into polished client reports',
      'Analyze incoming RFPs for risk and fit',
    ],
    pitfallsNl: [
      'AI-output op offertes accepteren zonder eindcheck door projectleider',
      'Kennis van senioren niet vastleggen waardoor AI er niet bij kan',
      'Bouw-specifieke termen verwarren met algemene vakwoorden',
    ],
    pitfallsEn: [
      'Accepting AI output on quotes without a project lead\'s sign-off',
      'Failing to capture senior knowledge so AI can access it',
      'Confusing construction-specific terms with general jargon',
    ],
    outcomesNl: [
      '50-70% snellere offerte-flow met betere consistentie',
      'Kennis van senior projectleiders bredere beschikbaar',
      'Professionelere klantcommunicatie zonder extra tijd van uitvoerenden',
    ],
    outcomesEn: [
      '50-70% faster quoting flow with better consistency',
      'Senior project lead knowledge more broadly accessible',
      'More polished client communication without extra time from execution staff',
    ],
  },
  {
    slug: 'logistiek',
    labelNl: 'logistiek en transport',
    labelEn: 'logistics and transport',
    introNl:
      'Logistiek draait om operationele efficiency, communicatie tussen partijen en het managen van uitzonderingen. AI-training in deze sector richt zich op het versnellen van communicatie en het signaleren van patronen.',
    introEn:
      'Logistics revolves around operational efficiency, multi-party communication, and exception handling. AI training in this sector focuses on speeding up communication and surfacing patterns.',
    examplesNl: [
      'Inkomende klachten en wijzigingsverzoeken categoriseren en routeren',
      'Operationele rapportages genereren uit transportdata',
      'Standaard klantcommunicatie automatiseren met menselijke escalatie',
      'Documenten uitpluizen (vrachtbrieven, douaneformulieren) voor systeeminvoer',
    ],
    examplesEn: [
      'Categorise and route incoming complaints and change requests',
      'Generate operational reports from transport data',
      'Automate standard customer communication with human escalation',
      'Extract data from shipping documents and customs forms for system entry',
    ],
    pitfallsNl: [
      'Realtime-besluiten over routing aan AI overlaten zonder fallback',
      'Documentextractie zonder validatie-laag voor onverwachte lay-outs',
      'AI-communicatie laten klinken als robot-tekst voor klanten',
    ],
    pitfallsEn: [
      'Letting AI decide real-time routing without a fallback',
      'Document extraction without validation for unexpected layouts',
      'Making AI customer communication sound robotic',
    ],
    outcomesNl: [
      '40-60% snellere afhandeling van inkomende communicatie',
      'Minder fouten bij document-overname',
      'Eerder signaleren van structurele problemen in routes of klanten',
    ],
    outcomesEn: [
      '40-60% faster handling of incoming communication',
      'Fewer errors in document data entry',
      'Earlier detection of structural issues in routes or accounts',
    ],
  },
  {
    slug: 'accountancy',
    labelNl: 'accountancy en administratiekantoren',
    labelEn: 'accountancy and bookkeeping',
    introNl:
      'Accountancy-kantoren werken in een sector met krimpend personeelsbestand en stijgende eisen. AI-training is hier vooral een productiviteitsvraagstuk gecombineerd met de strikte beroepsverantwoordelijkheid.',
    introEn:
      'Accountancy firms work in a sector with shrinking staff numbers and rising demands. AI training is mostly a productivity question coupled with strict professional accountability.',
    examplesNl: [
      'Inkomende facturen en bonnen categoriseren en in boekhouding plaatsen',
      'Standaard adviesbrieven en jaarrekeningnotities opstellen',
      'Klantvragen over fiscaal beleid van eerstelijns reactie voorzien',
      'Inkomende mails van klanten samenvatten voor de partner',
    ],
    examplesEn: [
      'Categorise incoming invoices and receipts and load them into bookkeeping',
      'Draft standard advisory letters and annual report notes',
      'Provide first-line responses to client questions on tax policy',
      'Summarise incoming client emails for partners',
    ],
    pitfallsNl: [
      'AI-output voor klanten zonder vakinhoudelijke check de deur uit laten gaan',
      'Specifieke fiscale jurisprudentie aan AI overlaten — modellen weten dat onvolledig',
      'Klantdata in publieke tools plakken in tijdsnood',
    ],
    pitfallsEn: [
      'Sending AI output to clients without professional review',
      'Trusting AI on specific tax case law — models know that incompletely',
      'Pasting client data into public tools under time pressure',
    ],
    outcomesNl: [
      '40-60% snellere doorlooptijd op standaard boekhoudwerk',
      'Meer ruimte voor advieswerk per medewerker',
      'Betere consistentie van klantcommunicatie tussen junioren en senioren',
    ],
    outcomesEn: [
      '40-60% faster turnaround on standard bookkeeping work',
      'More room for advisory work per employee',
      'More consistent client communication between juniors and seniors',
    ],
  },
  {
    slug: 'juridisch',
    labelNl: 'de juridische sector',
    labelEn: 'the legal sector',
    introNl:
      'Juridische dienstverleners werken met grote tekstvolumes en strenge professionele eisen. AI-training in deze sector heeft een directe ROI maar vraagt zorgvuldige inrichting rond aansprakelijkheid en vertrouwelijkheid.',
    introEn:
      'Legal services providers handle large text volumes with strict professional standards. AI training in this sector has direct ROI but requires careful design around liability and confidentiality.',
    examplesNl: [
      'Inkomende stukken samenvatten met verwijzing naar de bron-passages',
      'Standaardcontracten opstellen op basis van een korte vraagomschrijving',
      'Bestaande dossiers doorzoeken op vergelijkbare zaken',
      'Vergaderverslagen met cliënten omzetten naar actie-overzicht',
    ],
    examplesEn: [
      'Summarise incoming documents with references to source passages',
      'Draft standard contracts from short scope descriptions',
      'Search existing case files for comparable matters',
      'Convert client meeting notes into action overviews',
    ],
    pitfallsNl: [
      'Juridisch advies door AI zonder advocaat-eindcheck',
      'Vertrouwelijke cliëntdata in publieke tools — schending beroepsregels',
      'Hallucinerende AI op jurisprudentie zonder bron-validatie',
    ],
    pitfallsEn: [
      'Legal advice from AI without an attorney\'s sign-off',
      'Confidential client data in public tools — breach of professional rules',
      'Hallucinated AI on case law without source validation',
    ],
    outcomesNl: [
      '30-50% snellere doorlooptijd op dossiervoorbereiding',
      'Consistentere standaarddocumenten over kantoor heen',
      'Meer juridisch denkwerk per gefactureerd uur',
    ],
    outcomesEn: [
      '30-50% faster turnaround on case preparation',
      'More consistent standard documents across the firm',
      'More legal thinking work per billable hour',
    ],
  },
  {
    slug: 'onderwijs',
    labelNl: 'het onderwijs',
    labelEn: 'education',
    introNl:
      'Onderwijsinstellingen worstelen met groeiende administratielast naast hun kerntaak. AI-training in onderwijs richt zich op het ontlasten van docenten en onderwijsondersteuners zonder de pedagogische kant te verstoren.',
    introEn:
      'Educational institutions struggle with growing administrative load alongside their core teaching mission. AI training in education focuses on relieving teachers and support staff without disrupting pedagogy.',
    examplesNl: [
      'Lesstof samenvatten of toegankelijker maken voor verschillende niveaus',
      'Feedback op werkstukken voorbereiden — docent doet de eindbeoordeling',
      'Administratieve communicatie aan ouders en studenten opstellen',
      'Inkomende vragen via mail of LMS automatisch routeren',
    ],
    examplesEn: [
      'Summarise course content or adapt for different levels',
      'Prepare feedback on assignments — teacher does final grading',
      'Draft administrative communication to parents and students',
      'Auto-route incoming questions via email or LMS',
    ],
    pitfallsNl: [
      'AI gebruiken voor eindbeoordelingen van studenten zonder docentbesluit',
      'Privacy van leerlinggegevens onvoldoende afschermen',
      'AI inzetten op pedagogiek waar persoonlijk contact telt',
    ],
    pitfallsEn: [
      'Using AI for final grading without teacher decision',
      'Insufficiently protecting student data privacy',
      'Deploying AI in pedagogy where personal contact matters',
    ],
    outcomesNl: [
      '30-50% reductie in administratieve taken voor docenten',
      'Snellere feedback-cycli voor studenten',
      'Meer tijd voor lesinhoud en persoonlijke begeleiding',
    ],
    outcomesEn: [
      '30-50% reduction in administrative tasks for teachers',
      'Faster feedback cycles for students',
      'More time for teaching content and personal guidance',
    ],
  },
  {
    slug: 'vastgoed',
    labelNl: 'de vastgoedsector',
    labelEn: 'real estate',
    introNl:
      'Makelaars, vastgoedbeheerders en projectontwikkelaars werken met veel klantcommunicatie en documentwerk. AI-training in vastgoed focust op het versnellen van de standaardstromen zodat er meer tijd is voor de transactie zelf.',
    introEn:
      'Real estate agents, property managers and developers handle heavy client communication and document work. AI training in real estate focuses on accelerating standard flows so more time goes to the transaction itself.',
    examplesNl: [
      'Objectomschrijvingen genereren op basis van specs en foto-tags',
      'Inkomende interesse-mails categoriseren en eerste reactie opstellen',
      'Standaardcontracten en aanvullende documenten samenstellen',
      'Onderhoudsmeldingen routeren naar de juiste partij',
    ],
    examplesEn: [
      'Generate property descriptions from specs and photo tags',
      'Categorise incoming interest emails and draft first responses',
      'Compose standard contracts and supporting documents',
      'Route maintenance requests to the right party',
    ],
    pitfallsNl: [
      'Te enthousiaste of fact-vrije AI-objectteksten online zetten',
      'Klanten antwoorden geven zonder controle op feitelijke beschikbaarheid',
      'AI-systeem niet aansluiten op je CRM zodat status onbekend blijft',
    ],
    pitfallsEn: [
      'Publishing overly enthusiastic or factually unchecked AI listings',
      'Responding to clients without verifying actual availability',
      'Failing to integrate AI with your CRM so status stays unclear',
    ],
    outcomesNl: [
      '3-5x snellere objectomschrijving-flow',
      '40-60% tijdsbesparing op eerstelijns klantcommunicatie',
      'Consistentere klantervaring tussen verschillende makelaars',
    ],
    outcomesEn: [
      '3-5x faster property description flow',
      '40-60% time savings on first-line client communication',
      'More consistent client experience across different agents',
    ],
  },
  {
    slug: 'maakindustrie',
    labelNl: 'de maakindustrie',
    labelEn: 'manufacturing',
    introNl:
      'Maakbedrijven combineren operationele complexiteit met veel productdocumentatie en klantcommunicatie. AI-training richt zich op kantoor- en kwaliteitsprocessen waar AI direct waarde levert, zonder direct in productieprocessen te raken.',
    introEn:
      'Manufacturing companies combine operational complexity with extensive product documentation and customer communication. AI training focuses on office and quality processes where AI delivers direct value, without immediately touching production processes.',
    examplesNl: [
      'Technische documentatie omzetten naar klantvriendelijke handleidingen',
      'Inkomende klachten categoriseren en eerste analyse opstellen',
      'RFQ-aanvragen analyseren op haalbaarheid en passendheid',
      'Kwaliteitsrapportages samenstellen uit meet- en testdata',
    ],
    examplesEn: [
      'Convert technical documentation into customer-friendly manuals',
      'Categorise incoming complaints and draft first analyses',
      'Analyse RFQs for feasibility and fit',
      'Compose quality reports from measurement and test data',
    ],
    pitfallsNl: [
      'AI inzetten op productieparameters zonder engineer-eindcheck',
      'Veiligheidsdocumentatie laten herschrijven door AI zonder review',
      'Vertrouwelijke productkennis in publieke tools verwerken',
    ],
    pitfallsEn: [
      'Deploying AI on production parameters without engineer sign-off',
      'Having AI rewrite safety documentation without review',
      'Processing confidential product knowledge in public tools',
    ],
    outcomesNl: [
      '40-60% snellere doorlooptijd op RFQ-analyses',
      'Betere consistentie van klantdocumentatie',
      'Sneller signaleren van structurele kwaliteitspatronen',
    ],
    outcomesEn: [
      '40-60% faster turnaround on RFQ analyses',
      'Better consistency of customer documentation',
      'Faster detection of structural quality patterns',
    ],
  },
  {
    slug: 'overheid',
    labelNl: 'de overheid en publieke sector',
    labelEn: 'government and public sector',
    introNl:
      'Overheidsorganisaties werken in een omgeving van strenge regelgeving, publieke verantwoording en politieke gevoeligheid. AI-training houdt rekening met transparantie-eisen en zorgvuldige communicatie naar burgers.',
    introEn:
      'Government organisations operate in an environment of strict regulation, public accountability and political sensitivity. AI training accommodates transparency requirements and careful communication to citizens.',
    examplesNl: [
      'Beleidsstukken samenvatten voor interne afstemming',
      'Standaardbrieven aan burgers opstellen op basis van bullets',
      'Inkomende vragen van burgers en bedrijven categoriseren',
      'Vergaderverslagen omzetten naar actiepunten en besluiten',
    ],
    examplesEn: [
      'Summarise policy documents for internal alignment',
      'Draft standard letters to citizens from bullet points',
      'Categorise incoming questions from citizens and businesses',
      'Convert meeting notes into action items and decisions',
    ],
    pitfallsNl: [
      'AI gebruiken in beslissingen over individuele burgers zonder menselijke check',
      'Persoonsgegevens versturen naar AI-providers buiten EU-context',
      'AI-output gebruiken zonder dat het traceerbaar is voor publieke verantwoording',
    ],
    pitfallsEn: [
      'Using AI in decisions about individual citizens without human review',
      'Sending personal data to AI providers outside an EU context',
      'Using AI output without traceability for public accountability',
    ],
    outcomesNl: [
      '30-50% snellere doorlooptijd op standaardcommunicatie',
      'Consistentere brieven en besluitvoorbereiding',
      'Volledige audit trail per AI-interactie',
    ],
    outcomesEn: [
      '30-50% faster turnaround on standard communication',
      'More consistent letters and decision preparation',
      'Complete audit trail per AI interaction',
    ],
  },
  {
    slug: 'horeca',
    labelNl: 'horeca en hospitality',
    labelEn: 'hospitality',
    introNl:
      'Horeca-organisaties werken met krappe marges en hoge afhankelijkheid van direct klantcontact. AI-training richt zich op de backoffice — niet op het serveren zelf, wel op alles eromheen.',
    introEn:
      'Hospitality organisations work with tight margins and heavy reliance on direct customer contact. AI training focuses on back-office work — not service itself, but everything around it.',
    examplesNl: [
      'Menu-beschrijvingen en marketing-content genereren in jouw stijl',
      'Inkomende reserverings- en groepsaanvragen automatisch beantwoorden',
      'Recensies samenvatten en signalen voor verbetering oppikken',
      'Personeelsroosters voorbereiden uit beschikbaarheid en historische data',
    ],
    examplesEn: [
      'Generate menu descriptions and marketing content in your voice',
      'Auto-respond to incoming reservations and group enquiries',
      'Summarise reviews and pick up improvement signals',
      'Prepare staff schedules from availability and historical data',
    ],
    pitfallsNl: [
      'AI laten reageren op klachten zonder menselijke escalatie',
      'Menu-content publiceren zonder controle op allergie- of dieetinformatie',
      'Reserveringssystemen te complex maken — gasten willen simpelheid',
    ],
    pitfallsEn: [
      'Letting AI respond to complaints without human escalation',
      'Publishing menu content without checking allergen or dietary info',
      'Making reservation systems too complex — guests want simplicity',
    ],
    outcomesNl: [
      '50-70% reductie in tijd op administratie en reserveringsbeheer',
      'Sneller reageren op aanvragen leidt tot meer conversie',
      'Beter zicht op gastfeedback en gerichte verbeteringen',
    ],
    outcomesEn: [
      '50-70% reduction in time on admin and reservation management',
      'Faster response to enquiries drives more conversion',
      'Better visibility into guest feedback and targeted improvements',
    ],
  },
  {
    slug: 'marketing',
    labelNl: 'marketingbureaus',
    labelEn: 'marketing agencies',
    introNl:
      'Marketingbureaus werken met veel klanten, veel content en hoge urgentie. AI-training in deze sector is een productiviteitsvermenigvuldiger — mits goed ingericht zodat de creatieve kwaliteit niet inzakt.',
    introEn:
      'Marketing agencies juggle many clients, lots of content and high urgency. AI training in this sector is a productivity multiplier — provided it\'s set up so creative quality holds up.',
    examplesNl: [
      'Eerste versies van campagne-content genereren in de toon van elk merk',
      'Brief-analyses opstellen uit klantgesprekken',
      'Social media planningen vullen op basis van merkrichtlijnen',
      'Concurrentie- en marktanalyses voorbereiden voor strategen',
    ],
    examplesEn: [
      'Generate first drafts of campaign content in each brand voice',
      'Compose brief analyses from client meetings',
      'Fill social media schedules from brand guidelines',
      'Prepare competitive and market analyses for strategists',
    ],
    pitfallsNl: [
      'AI-content publiceren zonder dat een copywriter het maakt naar het merkniveau',
      'Verschillende merkidentiteiten verwarren door één centrale AI-stack',
      'Klanten verkopen dat AI alles doet terwijl de strateeg het verschil maakt',
    ],
    pitfallsEn: [
      'Publishing AI content without a copywriter raising it to brand level',
      'Mixing up different brand identities through one centralised AI stack',
      'Selling clients on "AI does everything" while the strategist makes the difference',
    ],
    outcomesNl: [
      '50-80% snellere doorlooptijd op standaard content-types',
      'Meer tijd voor strategiewerk per accountmanager',
      'Consistentere uitwerking van merkrichtlijnen over campagnes heen',
    ],
    outcomesEn: [
      '50-80% faster turnaround on standard content types',
      'More strategy time per account manager',
      'More consistent execution of brand guidelines across campaigns',
    ],
  },
  {
    slug: 'media',
    labelNl: 'mediabedrijven en uitgevers',
    labelEn: 'media companies and publishers',
    introNl:
      'Media-organisaties werken met grote tekstvolumes en redactionele kwaliteit als handelsmerk. AI-training is hier een gevoelig onderwerp — productiviteit ja, geloofwaardigheid niet inruilen.',
    introEn:
      'Media organisations operate with large text volumes and editorial quality as their trademark. AI training is a sensitive topic here — productivity yes, credibility not to be traded away.',
    examplesNl: [
      'Inkomende persberichten samenvatten voor redactionele triage',
      'Archief-content doorzoekbaar maken voor journalisten',
      'Transcripties van interviews omzetten naar nette quotes',
      'Inkomende reacties en e-mails categoriseren voor redactie',
    ],
    examplesEn: [
      'Summarise incoming press releases for editorial triage',
      'Make archive content searchable for journalists',
      'Convert interview transcripts into clean quotes',
      'Categorise incoming responses and emails for the newsroom',
    ],
    pitfallsNl: [
      'AI-content publiceren als journalistiek werk zonder transparantie',
      'Bronvermelding verwateren door AI-tussenstappen',
      'Originaliteit van de redactie laten verdunnen door AI-leuning',
    ],
    pitfallsEn: [
      'Publishing AI content as journalism without transparency',
      'Diluting attribution through AI intermediate steps',
      'Letting editorial originality erode through AI leaning',
    ],
    outcomesNl: [
      '40-60% snellere triage van inkomende content',
      'Beter doorzoekbaar archief voor onderzoeksjournalistiek',
      'Behoud van redactionele kwaliteit met efficiëntere processen',
    ],
    outcomesEn: [
      '40-60% faster triage of incoming content',
      'Better searchable archive for investigative journalism',
      'Maintain editorial quality with more efficient processes',
    ],
  },
  {
    slug: 'recruitment',
    labelNl: 'recruitment en HR-dienstverlening',
    labelEn: 'recruitment and HR services',
    introNl:
      'Recruitment- en HR-bureaus werken met grote tekstvolumes en directe impact op carrières. AI-training versnelt het standaardwerk en geeft recruiters meer tijd voor de menselijke kant van het vak.',
    introEn:
      'Recruitment and HR services agencies work with large text volumes and direct impact on careers. AI training accelerates standard work and gives recruiters more time for the human side of the job.',
    examplesNl: [
      'CV-screening voor de eerste match-check (geen finale beslissing)',
      'Vacaturetekst genereren op basis van een functieprofiel',
      'Inkomende sollicitaties categoriseren en eerste reactie opstellen',
      'Klantgesprekken samenvatten naar zoekprofiel en actielijst',
    ],
    examplesEn: [
      'CV screening for an initial fit check (no final decision)',
      'Generate vacancy text from a job profile',
      'Categorise incoming applications and draft first responses',
      'Summarise client meetings into search profile and action list',
    ],
    pitfallsNl: [
      'AI laten beslissen over kandidaten zonder menselijke check (juridisch risico)',
      'Bias-risico\'s in selectie-AI onderschatten',
      'Persoonsgegevens van kandidaten in publieke tools verwerken',
    ],
    pitfallsEn: [
      'Letting AI decide on candidates without human review (legal risk)',
      'Underestimating bias risks in selection AI',
      'Processing candidate personal data in public tools',
    ],
    outcomesNl: [
      '50-70% snellere doorlooptijd op CV-shortlists',
      'Recruiters hebben meer tijd voor kandidaat- en klantgesprekken',
      'Consistentere vacatureteksten over het bureau heen',
    ],
    outcomesEn: [
      '50-70% faster CV shortlists',
      'Recruiters have more time for candidate and client conversations',
      'More consistent vacancy text across the agency',
    ],
  },
  {
    slug: 'verzekering',
    labelNl: 'verzekeraars',
    labelEn: 'insurers',
    introNl:
      'Verzekeraars combineren grote volumes met strenge compliance-eisen. AI-training richt zich op claims-afhandeling, polisbeheer en klantcommunicatie, altijd met menselijke verantwoording op de eindbeslissing.',
    introEn:
      'Insurers combine large volumes with strict compliance requirements. AI training focuses on claims handling, policy administration and customer communication, always with human accountability on final decisions.',
    examplesNl: [
      'Inkomende claims categoriseren en relevante polisinformatie ophalen',
      'Standaardbrieven en kennisgevingen aan polishouders opstellen',
      'Documenten bij claims uitpluizen (rapporten, facturen, foto\'s)',
      'Klantvragen over polisvoorwaarden voorzien van eerstelijns reactie',
    ],
    examplesEn: [
      'Categorise incoming claims and retrieve relevant policy information',
      'Draft standard letters and notices to policyholders',
      'Extract documents tied to claims (reports, invoices, photos)',
      'Provide first-line responses to policy queries',
    ],
    pitfallsNl: [
      'Claims afwijzen op basis van AI zonder menselijke eindbeslissing',
      'AI-output gebruiken zonder audit trail voor toezichthouders',
      'Persoonsgegevens onvoldoende afschermen bij externe AI-providers',
    ],
    pitfallsEn: [
      'Rejecting claims based on AI without human final decision',
      'Using AI output without audit trail for regulators',
      'Insufficiently protecting personal data with external AI providers',
    ],
    outcomesNl: [
      '40-60% snellere doorlooptijd op standaard claims',
      'Consistentere klantcommunicatie',
      'Behoud van professionele eindverantwoording op alle beslissingen',
    ],
    outcomesEn: [
      '40-60% faster turnaround on standard claims',
      'More consistent customer communication',
      'Retained professional accountability on all decisions',
    ],
  },
  {
    slug: 'non-profit',
    labelNl: 'non-profitorganisaties en goede doelen',
    labelEn: 'non-profits and charities',
    introNl:
      'Non-profitorganisaties hebben krappe middelen en veel werk dat door vrijwilligers gedaan moet worden. AI-training helpt om met dezelfde mensen meer voor de doelgroep te bereiken.',
    introEn:
      'Non-profits operate with tight resources and lots of work falling on volunteers. AI training helps the same people accomplish more for the cause.',
    examplesNl: [
      'Donateurscommunicatie genereren op basis van campagne-input',
      'Subsidieaanvragen voorbereiden uit bullets en bestaande documenten',
      'Vrijwilliger-onboarding-content op maat maken voor verschillende rollen',
      'Inkomende vragen van begunstigden categoriseren en routeren',
    ],
    examplesEn: [
      'Generate donor communication from campaign input',
      'Prepare grant applications from bullets and existing documents',
      'Tailor volunteer onboarding content for different roles',
      'Categorise incoming questions from beneficiaries and route them',
    ],
    pitfallsNl: [
      'Te enthousiaste of niet-onderbouwde claims in donateurscommunicatie',
      'Onvoldoende controle op AI-content waardoor missie-boodschap vertroebelt',
      'Vrijwilligers zonder training te veel laten leunen op AI',
    ],
    pitfallsEn: [
      'Overly enthusiastic or unsupported claims in donor communication',
      'Insufficient control over AI content, blurring the mission message',
      'Letting volunteers lean too heavily on AI without training',
    ],
    outcomesNl: [
      '50-70% snellere doorlooptijd op donateurs- en subsidiecommunicatie',
      'Meer tijd voor het werk waar je voor opgericht bent',
      'Consistentere boodschap richting alle stakeholders',
    ],
    outcomesEn: [
      '50-70% faster turnaround on donor and grant communication',
      'More time for the work the organisation was founded for',
      'More consistent message to all stakeholders',
    ],
  },
  {
    slug: 'energie',
    labelNl: 'energie- en utility-bedrijven',
    labelEn: 'energy and utility companies',
    introNl:
      'Energie- en utility-bedrijven werken met grote klantbestanden, technische infrastructuur en toezichthouderseisen. AI-training richt zich op klantcommunicatie en operationele rapportages, met zorgvuldige scheiding van de technische operations zelf.',
    introEn:
      'Energy and utility companies operate with large customer bases, technical infrastructure and regulatory oversight. AI training focuses on customer communication and operational reporting, with careful separation from technical operations themselves.',
    examplesNl: [
      'Inkomende klantvragen over rekeningen en contracten categoriseren',
      'Standaardcommunicatie over storingen en planning genereren',
      'Operationele rapportages voor management uit meetdata',
      'Subsidie- en vergunningsdocumentatie voorbereiden',
    ],
    examplesEn: [
      'Categorise incoming customer questions about bills and contracts',
      'Generate standard communication about outages and planning',
      'Operational reports for management from measurement data',
      'Prepare subsidy and permit documentation',
    ],
    pitfallsNl: [
      'AI inzetten op realtime-operations (grid-management) zonder fallback',
      'Klantsturing op tarieven door AI zonder transparantie',
      'Onvoldoende beveiliging rondom kritieke infrastructuur-systemen',
    ],
    pitfallsEn: [
      'Deploying AI on real-time operations (grid management) without fallback',
      'Customer steering on tariffs by AI without transparency',
      'Insufficient security around critical infrastructure systems',
    ],
    outcomesNl: [
      '40-60% snellere afhandeling van standaard klantcommunicatie',
      'Consistentere rapportages aan toezichthouders',
      'Behoud van menselijke verantwoording op kritieke beslissingen',
    ],
    outcomesEn: [
      '40-60% faster handling of standard customer communication',
      'More consistent regulatory reporting',
      'Retained human accountability on critical decisions',
    ],
  },
  {
    slug: 'consultancy',
    labelNl: 'consultancybureaus',
    labelEn: 'consultancies',
    introNl:
      'Consultancybureaus werken met veel klant-specifieke documentatie en strakke deadlines. AI-training is een directe productiviteitsvermenigvuldiger zolang de strategische denkkracht en klantrelatie niet wordt uitgehold.',
    introEn:
      'Consultancies work with heavy client-specific documentation and tight deadlines. AI training is a direct productivity multiplier as long as strategic thinking and client relationships aren\'t eroded.',
    examplesNl: [
      'Inkomende klantmateriaal samenvatten voor analyse-voorbereiding',
      'Standaardonderdelen van rapporten (executive summary, appendix) genereren',
      'Workshops voorbereiden uit klantintake en eigen kennisbank',
      'Inkomende RFP\'s analyseren op match en kansgrootte',
    ],
    examplesEn: [
      'Summarise incoming client material for analysis prep',
      'Generate standard report sections (executive summary, appendix)',
      'Prepare workshops from client intake and internal knowledge base',
      'Analyse incoming RFPs for fit and opportunity size',
    ],
    pitfallsNl: [
      'AI-content publiceren als consultancy-werk zonder eigen denkkracht erop',
      'Klantvertrouwen ondermijnen door zichtbaar generieke AI-output',
      'Senior consultants vervangen door junior + AI — kwaliteit zakt',
    ],
    pitfallsEn: [
      'Publishing AI content as consultancy work without your own thinking',
      'Eroding client trust through visibly generic AI output',
      'Replacing senior consultants with junior + AI — quality drops',
    ],
    outcomesNl: [
      '40-60% snellere doorlooptijd op standaard rapportonderdelen',
      'Meer tijd voor strategie en relatiewerk per consultant',
      'Betere kwaliteit van voorbereiding voor klantsessies',
    ],
    outcomesEn: [
      '40-60% faster turnaround on standard report sections',
      'More strategy and relationship time per consultant',
      'Better preparation quality for client sessions',
    ],
  },
  {
    slug: 'it-dienstverlening',
    labelNl: 'IT-dienstverleners en software-bureaus',
    labelEn: 'IT services and software firms',
    introNl:
      'IT-dienstverleners zijn vaak vroege gebruikers van AI maar lopen tegen specifieke valkuilen aan: te veel parallel experimenteren, te weinig oog voor adoptie buiten engineering, en het verwarren van technische mogelijkheid met klant-waarde.',
    introEn:
      'IT services firms are often early AI users but run into specific pitfalls: experimenting in too many parallel directions, too little eye for adoption beyond engineering, and confusing technical possibility with client value.',
    examplesNl: [
      'Codereviews en eerste implementatie-suggesties versnellen met AI-tools',
      'Klantvraag-documenten omzetten naar technisch ontwerp-eerste-versie',
      'Standaard documentatie en onboarding-materiaal genereren',
      'Inkomende support-tickets categoriseren en eerste reactie opstellen',
    ],
    examplesEn: [
      'Accelerate code reviews and initial implementation suggestions with AI tools',
      'Convert client requirement documents into first-draft technical designs',
      'Generate standard documentation and onboarding materials',
      'Categorise incoming support tickets and draft first responses',
    ],
    pitfallsNl: [
      'Te veel verschillende AI-tools tegelijk gebruiken zonder coördinatie',
      'AI-generated code accepteren zonder review — kwaliteit zakt over tijd',
      'Klanten beloven dat AI de oplossing is, terwijl de werkelijke waarde in mensenwerk zit',
    ],
    pitfallsEn: [
      'Using too many different AI tools in parallel without coordination',
      'Accepting AI-generated code without review — quality drops over time',
      'Promising clients that AI is the solution while real value sits in human work',
    ],
    outcomesNl: [
      '20-40% productiviteitswinst op standaard ontwikkelwerk',
      'Snellere onboarding van nieuwe medewerkers via betere documentatie',
      'Helderder onderscheid tussen waar AI-werk wel en niet past in jullie dienstverlening',
    ],
    outcomesEn: [
      '20-40% productivity gain on standard development work',
      'Faster new-hire onboarding via better documentation',
      'Sharper distinction between where AI work fits and doesn\'t in your services',
    ],
  },
];
