export type SiteLocale = 'nl' | 'en';

type NavItem = {
  label: string;
  href: string;
};

type LinkItem = {
  label: string;
  href: string;
  external?: boolean;
};

type HeroContent = {
  badge: string;
  title: string;
  subtitle: string;
  primaryCta: string;
  primaryHref: string;
  secondaryCta: string;
  secondaryHref: string;
  supporting: string;
};

type SectionIntro = {
  eyebrow?: string;
  title: string;
  body: string;
};

type ProblemPoint = {
  title: string;
  body: string;
};

type Principle = {
  title: string;
  body: string;
};

type ServiceCard = {
  title: string;
  body: string;
  bullets: string[];
};

type AudienceFit = {
  goodFit: string[];
  notFit: string[];
};

type Step = {
  title: string;
  body: string;
};

type ProofCard = {
  title: string;
  body: string;
};

type FinalCta = {
  title: string;
  body: string;
  primaryCta: string;
  primaryHref: string;
  secondaryCta: string;
  secondaryHref: string;
};

type HomeContent = {
  hero: HeroContent;
  problemsIntro: SectionIntro;
  problems: ProblemPoint[];
  principlesIntro: SectionIntro;
  principles: Principle[];
  servicesIntro: SectionIntro;
  services: ServiceCard[];
  audienceIntro: SectionIntro;
  audience: AudienceFit;
  approachIntro: SectionIntro;
  steps: Step[];
  proofIntro: SectionIntro;
  proofs: ProofCard[];
  snowFlowIntro: SectionIntro;
  snowFlowCta: string;
  finalCta: FinalCta;
};

type ServicesPageContent = {
  hero: HeroContent;
  intro: string;
  serviceCards: ServiceCard[];
  processTitle: string;
  process: Step[];
  finalCta: FinalCta;
};

type AboutPageContent = {
  hero: HeroContent;
  intro: string[];
  principlesTitle: string;
  principles: Principle[];
  nielsTitle: string;
  nielsBody: string[];
  credibilityTitle: string;
  credibility: string[];
  finalCta: FinalCta;
};

type SnowFlowPageContent = {
  hero: HeroContent;
  intro: string[];
  pillarsTitle: string;
  pillars: Principle[];
  whyTitle: string;
  why: string[];
  finalCta: FinalCta;
};

type FooterContent = {
  tagline: string;
  emailLabel: string;
  phoneLabel: string;
  locationLabel: string;
  groups: Array<{ title: string; links: LinkItem[] }>;
  bottom: string;
};

type MetadataContent = {
  title: string;
  description: string;
  keywords: string;
};

type SiteContent = {
  localeLabel: string;
  nav: {
    items: NavItem[];
    contactCta: string;
    login: string;
    dashboard: string;
    settings: string;
    logout: string;
  };
  footer: FooterContent;
  home: HomeContent;
  servicesPage: ServicesPageContent;
  aboutPage: AboutPageContent;
  snowFlowPage: SnowFlowPageContent;
  metadata: {
    root: MetadataContent;
    services: MetadataContent;
    about: MetadataContent;
    snowFlow: MetadataContent;
  };
};

export const brandSiteContent: Record<SiteLocale, SiteContent> = {
  nl: {
    localeLabel: 'NL',
    nav: {
      items: [
        { label: 'Diensten', href: '/services' },
        { label: 'Aanpak', href: '/services#aanpak' },
        { label: 'Over Niels', href: '/about' },
        { label: 'Snow-Flow', href: '/snow-flow' },
        { label: 'Contact', href: '/contact' },
      ],
      contactCta: 'Plan een gesprek',
      login: 'Inloggen',
      dashboard: 'Dashboard',
      settings: 'Instellingen',
      logout: 'Uitloggen',
    },
    footer: {
      tagline:
        'GroeimetAI helpt teams AI nuchter, veilig en praktisch inzetten. Training, adoptie, workflowverbetering en integraties waar ze echt iets toevoegen.',
      emailLabel: 'info@groeimetai.io',
      phoneLabel: '+31 6 81739018',
      locationLabel: 'Nederland, werkt in NL en daarbuiten',
      groups: [
        {
          title: 'Navigatie',
          links: [
            { label: 'Home', href: '/' },
            { label: 'Diensten', href: '/services' },
            { label: 'Over Niels', href: '/about' },
            { label: 'Snow-Flow', href: '/snow-flow' },
            { label: 'Contact', href: '/contact' },
          ],
        },
        {
          title: 'Waar we op sturen',
          links: [
            { label: 'Training & workshops', href: '/services#training' },
            { label: 'Strategie & adoptie', href: '/services#strategie' },
            { label: 'Workflow redesign', href: '/services#workflow' },
            { label: 'Veilige integraties', href: '/services#integraties' },
          ],
        },
        {
          title: 'Achter de schermen',
          links: [
            { label: 'Snow-Flow op GitHub', href: 'https://github.com/GroeimetAI/snow-flow', external: true },
            { label: 'Privacy', href: '/privacy' },
            { label: 'Voorwaarden', href: '/terms' },
          ],
        },
      ],
      bottom: 'Geen hype. Geen lock-in als standaard. Wel teams die beter leren werken met AI.',
    },
    home: {
      hero: {
        badge: 'No-bullshit AI voor teams die verder willen dan experimenteren',
        title: 'AI inzetten zonder hype, lock-in of afhankelijkheid.',
        subtitle:
          'GroeimetAI helpt bedrijven hun team zelf waarde te laten creëren met AI. Met sterke foundation models, praktische workflows, training en veilige integraties. We beginnen niet met een tool. We beginnen met wat echt beter moet werken.',
        primaryCta: 'Plan een verkennend gesprek',
        primaryHref: '/contact',
        secondaryCta: 'Bekijk onze aanpak',
        secondaryHref: '/services#aanpak',
        supporting:
          'Voor MKB, dienstverlenende organisaties en teams met losse systemen, veel handmatig werk en weinig duidelijkheid over waar AI nu echt rendement oplevert.',
      },
      problemsIntro: {
        eyebrow: 'Waarom dit vastloopt',
        title: 'Veel organisaties hebben geen AI-probleem. Ze hebben een focusprobleem.',
        body:
          'De meeste teams missen niet nog een tool. Ze missen richting, vaardigheden en een werkbare aanpak. Daardoor ontstaan pilots zonder vervolg, verwarring over privacy en security, en dure software waar niemand structureel beter door werkt.',
      },
      problems: [
        {
          title: 'Te veel tools, te weinig lijn',
          body: 'Iedereen probeert iets anders. Niets landt in een gedeelde manier van werken.',
        },
        {
          title: 'Automatisering zonder eigenaarschap',
          body: 'Slimme demo’s voelen indrukwekkend, maar niemand weet wie ze beheert of wanneer ze fout mogen zitten.',
        },
        {
          title: 'Hype vervangt besluitvorming',
          body: 'Teams praten over agents, maar niet over processen, risico’s en waar de eerste winst echt zit.',
        },
      ],
      principlesIntro: {
        eyebrow: 'Wat wij anders doen',
        title: 'Wij beginnen niet met agents. Wij beginnen met beter werk.',
        body:
          'GroeimetAI positioneert AI niet als vervanging van denken, maar als hefboom voor beter werk. Daarom starten we bij helderheid, vaardigheden en workflowkeuzes. Pas daarna volgt tooling of integratie.',
      },
      principles: [
        {
          title: 'Eerst helderheid',
          body: 'We brengen focus aan: waar zit echte waarde, wat moet je juist niet doen, en wat vraagt dit van je team?',
        },
        {
          title: 'Eerst vaardigheden',
          body: 'We leren mensen werken met de modellen en tools die al beschikbaar zijn, zodat AI geen speeltje van enkelen blijft.',
        },
        {
          title: 'Dan pas implementatie',
          body: 'We bouwen alleen maatwerk, integraties of tooling als dat duurzame winst toevoegt.',
        },
        {
          title: 'Altijd met controle',
          body: 'Menselijke controle, veilige toegang en governance waar nodig zijn geen rem, maar een voorwaarde voor serieuze adoptie.',
        },
      ],
      servicesIntro: {
        eyebrow: 'Diensten',
        title: 'Waar we je concreet mee helpen',
        body:
          'Technische bouwkracht blijft onderdeel van het aanbod, maar niet meer als hoofdverhaal. De hoofdingang is training, adoptie, workflowverbetering en veilige implementatie.',
      },
      services: [
        {
          title: 'AI Training & Workshops',
          body: 'Voor teams die slimmer willen werken met AI, niet afhankelijker.',
          bullets: [
            'Workshops voor management en uitvoering',
            'Werken met sterke foundation models',
            'Prompt- en workflowtraining voor dagelijks werk',
            'Verantwoord gebruik, beleid en risico’s',
          ],
        },
        {
          title: 'AI Strategie & Adoptie',
          body: 'Voor organisaties die focus willen aanbrengen in hun AI-aanpak.',
          bullets: [
            'Use case selectie op impact en haalbaarheid',
            'Adoptieplan per team',
            'Prioritering en roadmap',
            'Governance en besluitvorming',
          ],
        },
        {
          title: 'Workflow Redesign & Implementatie',
          body: 'Voor teams met veel handmatig werk, overdrachten en inefficiënte processen.',
          bullets: [
            'Analyse van bestaande werkprocessen',
            'Herontwerp met AI op de juiste plekken',
            'Pilotbegeleiding en implementatie',
            'Borging in de dagelijkse operatie',
          ],
        },
        {
          title: 'Veilige Integraties & Tooling',
          body: 'Voor situaties waar standaardtools niet genoeg zijn.',
          bullets: [
            'AI-integraties met bestaande systemen',
            'Interne tools of assistenten',
            'Websites en portals met AI-functionaliteit',
            'Maatwerk alleen waar dat duurzaam loont',
          ],
        },
      ],
      audienceIntro: {
        eyebrow: 'Voor wie dit is',
        title: 'Voor teams die klaar zijn met AI als show.',
        body: 'Deze positionering past bij organisaties die serieus willen verbeteren, niet alleen experimenteren.',
      },
      audience: {
        goodFit: [
          'MKB en dienstverleners die AI serieus willen inzetten maar niet weten waar te beginnen',
          'Teams met losse systemen, kenniswerk en veel handmatige overdrachten',
          'Beslissers die genoeg hebben van hype, dure tools en onduidelijke ROI',
          'Organisaties die hun team sterker willen maken in plaats van afhankelijk van een leverancier',
        ],
        notFit: [
          'Bedrijven die vooral een flashy demo of AI-showcase zoeken',
          'Trajecten waarin “een agent voor alles” het uitgangspunt is',
          'Situaties waar een black-box abonnement belangrijker is dan interne adoptie en eigenaarschap',
        ],
      },
      approachIntro: {
        eyebrow: 'Aanpak',
        title: 'Zo maken we AI bruikbaar in je organisatie',
        body: 'Geen groot traject om het traject. Wel een duidelijke volgorde waarin mensen, processen en techniek in balans blijven.',
      },
      steps: [
        {
          title: '1. Verkennen',
          body: 'We kijken naar je team, processen, systemen en doelen. Waar zit frictie? Waar kan AI echt helpen? Waar juist niet?',
        },
        {
          title: '2. Trainen',
          body: 'We brengen management en teams op niveau met concrete werkwijzen en toepasbare voorbeelden.',
        },
        {
          title: '3. Herontwerpen',
          body: 'We verbeteren workflows, rollen en beslismomenten zodat AI werk ondersteunt in plaats van extra chaos te veroorzaken.',
        },
        {
          title: '4. Implementeren',
          body: 'Pas als het logisch is, bouwen we integraties, tooling of maatwerk. Veilig, beheersbaar en gericht op duurzame winst.',
        },
      ],
      proofIntro: {
        eyebrow: 'Geloofwaardigheid',
        title: 'Technisch sterk, maar altijd in dienst van het resultaat.',
        body: 'GroeimetAI moet vertrouwen wekken zonder consultant-fluff. De geloofwaardigheid komt uit scherpte, bouwkracht en openheid over wat wel en niet zinnig is.',
      },
      proofs: [
        {
          title: 'Praktische ervaring',
          body: 'Van websites en interne tools tot AI-workflows en secure integraties. Niet als doel op zich, maar als middel om teams beter te laten werken.',
        },
        {
          title: 'Open source geloofwaardigheid',
          body: 'Met Snow-Flow bouwen we ook aan open infrastructuur. Dat toont technische diepgang zonder het hoofdnarratief te kapen.',
        },
        {
          title: 'Nuchtere aanpak',
          body: 'Geen grootspraak over revoluties. Wel directe taal, scherpe keuzes en duidelijke volgende stappen.',
        },
      ],
      snowFlowIntro: {
        eyebrow: 'Onder de motorkap',
        title: 'Snow-Flow is niet het hoofdverhaal. Wel bewijs dat de technische fundering er is.',
        body: 'Voor de meeste klanten begint het gesprek niet bij infrastructuur. Maar als je verder wilt bouwen zonder lock-in of black boxes, is het relevant dat die diepgang onder de servicekant aanwezig is.',
      },
      snowFlowCta: 'Lees meer over Snow-Flow',
      finalCta: {
        title: 'AI hoeft niet groter. Het moet duidelijker.',
        body: 'Als je wilt dat je team AI echt goed gaat gebruiken, begin dan niet met nog een tool. Begin met focus, vaardigheden en een aanpak die werkt in de praktijk.',
        primaryCta: 'Plan een verkennend gesprek',
        primaryHref: '/contact',
        secondaryCta: 'Bekijk de diensten',
        secondaryHref: '/services',
      },
    },
    servicesPage: {
      hero: {
        badge: 'Van training tot implementatie',
        title: 'Diensten voor organisaties die AI serieus willen inzetten',
        subtitle:
          'Van training en adoptie tot workflowverbetering en veilige implementatie. Praktisch, nuchter en afgestemd op hoe je team echt werkt.',
        primaryCta: 'Bespreek je situatie',
        primaryHref: '/contact',
        secondaryCta: 'Lees onze aanpak',
        secondaryHref: '#aanpak',
        supporting: 'We beginnen niet standaard met bouwen. We beginnen met de vraag: wat moet er in jouw organisatie concreet beter worden?',
      },
      intro:
        'Daaruit volgt welke dienst past. Soms is dat training. Soms procesherontwerp. Soms een veilige integratie of maatwerktool. Maar nooit technologie als los kunstje.',
      serviceCards: [
        {
          title: 'AI Training & Workshops',
          body: 'Voor teams die AI bruikbaar willen maken in hun dagelijkse praktijk.',
          bullets: [
            'Sessie voor management, teamleads en uitvoering',
            'Hands-on werken met sterke foundation models',
            'AI-richtlijnen voor intern gebruik',
            'Praktische toepassing per rol of proces',
          ],
        },
        {
          title: 'AI Strategie & Adoptie',
          body: 'Voor organisaties die focus willen aanbrengen in wat wel en niet zinvol is.',
          bullets: [
            'Use case selectie en prioritering',
            'Adoptiestrategie per team',
            'Roadmap en governance',
            'Besluitvorming over tooling en beleid',
          ],
        },
        {
          title: 'Workflow Redesign & Implementatie',
          body: 'Voor teams waar handmatig werk, overdrachten en losse systemen de groei remmen.',
          bullets: [
            'Analyse van werkstromen',
            'Herontwerp met AI op de juiste momenten',
            'Begeleide pilots en opschaling',
            'Inbedding in bestaand werk',
          ],
        },
        {
          title: 'Veilige Integraties & Tooling',
          body: 'Voor situaties waar standaardsoftware niet ver genoeg komt.',
          bullets: [
            'AI-integraties met bestaande systemen',
            'Interne tools, portalen en assistenten',
            'Webdevelopment en maatwerk waar nodig',
            'Open standaarden en beheersbare architectuur',
          ],
        },
      ],
      processTitle: 'Hoe we werken',
      process: [
        {
          title: 'Eerst begrijpen',
          body: 'Wat gebeurt er nu in het team, waar loopt werk vast en welke rol kan AI daarin realistisch spelen?',
        },
        {
          title: 'Dan trainen en ontwerpen',
          body: 'We verbeteren het werkmodel en geven teams direct toepasbare manieren van werken.',
        },
        {
          title: 'Dan pas bouwen',
          body: 'Wanneer tooling of integratie nodig is, bouwen we gericht en zonder onnodige afhankelijkheid.',
        },
      ],
      finalCta: {
        title: 'Niet elke AI-vraag vraagt om software.',
        body: 'Soms is een workshop de juiste stap. Soms een roadmap. Soms maatwerk. Die volgorde maakt het verschil tussen hype en duurzame waarde.',
        primaryCta: 'Plan een gesprek',
        primaryHref: '/contact',
        secondaryCta: 'Terug naar home',
        secondaryHref: '/',
      },
    },
    aboutPage: {
      hero: {
        badge: 'Persoonlijk merk, technische ruggegraat',
        title: 'Over Niels van der Werf en GroeimetAI',
        subtitle:
          'GroeimetAI is het servicebedrijf van Niels van der Werf. Het combineert strategische scherpte met technische uitvoering, zonder consultancyfluff en zonder developer-jargon als hoofdtaal.',
        primaryCta: 'Plan een gesprek',
        primaryHref: '/contact',
        secondaryCta: 'Bekijk de diensten',
        secondaryHref: '/services',
        supporting: 'Je krijgt geen los advies zonder realiteitszin. Maar ook geen technische oplossing zonder adoptieplan.',
      },
      intro: [
        'Veel bedrijven voelen dat AI impact gaat hebben, maar zien door de tools, claims en meningen niet meer wat echt relevant is.',
        'Daar ligt de rol van GroeimetAI: eerst begrijpen waar AI waarde toevoegt, hoe teams ermee moeten werken en wat er organisatorisch nodig is om dat goed te laten landen.',
        'Daarna bouwen we alleen wat echt nodig is: integraties, interne tools, websites, portals of maatwerk.',
      ],
      principlesTitle: 'Waar GroeimetAI voor staat',
      principles: [
        {
          title: 'Teach a man to fish',
          body: 'Teams moeten beter leren werken met AI, niet afhankelijk worden van één leverancier of tool.',
        },
        {
          title: 'Fundament boven hype',
          body: 'Sterke modellen, goede workflows, datadiscipline en veilige toegang gaan voor glimmende beloftes.',
        },
        {
          title: 'Open standaarden boven lock-in',
          body: 'Waar mogelijk kiezen we voor open, transparante en beheersbare architectuur.',
        },
        {
          title: 'Menselijke controle boven blind automatiseren',
          body: 'AI moet ondersteunen, versnellen en verbeteren, niet denken uitbesteden zonder toezicht.',
        },
      ],
      nielsTitle: 'Waarom dit werkt',
      nielsBody: [
        'Niels van der Werf combineert productdenken, development en AI-implementatie. Daardoor kan GroeimetAI tegelijk scherp adviseren en daadwerkelijk leveren.',
        'Die combinatie maakt het verschil. Klassieke consultancy stopt vaak te vroeg. Pure development start vaak te technisch. GroeimetAI zit precies in het gat daartussen.',
      ],
      credibilityTitle: 'Wat dat commercieel relevant maakt',
      credibility: [
        'Je krijgt advies dat uitvoerbaar is in echte teams',
        'Je krijgt implementatie die snapt wat adoptie vraagt',
        'Je krijgt technische diepgang zonder dat de site of het traject om techniek draait',
      ],
      finalCta: {
        title: 'Zoek je geen AI-goeroe maar een scherpe implementatiepartner?',
        body: 'Dan is het gesprek waarschijnlijk zinvoller dan nog een toolvergelijking of trendrapport.',
        primaryCta: 'Plan een gesprek',
        primaryHref: '/contact',
        secondaryCta: 'Lees over Snow-Flow',
        secondaryHref: '/snow-flow',
      },
    },
    snowFlowPage: {
      hero: {
        badge: 'Open-core infrastructuur en technische geloofwaardigheid',
        title: 'Snow-Flow',
        subtitle:
          'Snow-Flow is het infrastructuur- en productverhaal onder GroeimetAI. Geen hoofdboodschap voor de gemiddelde klant, wel bewijs dat de technische onderlaag stevig genoeg is als je verder wilt bouwen.',
        primaryCta: 'Bekijk Snow-Flow op GitHub',
        primaryHref: 'https://github.com/GroeimetAI/snow-flow',
        secondaryCta: 'Terug naar diensten',
        secondaryHref: '/services',
        supporting: 'Open standaarden, secure enterprise integraties en technische controle zonder lock-in als uitgangspunt.',
      },
      intro: [
        'Snow-Flow laat zien dat de visie van GroeimetAI niet stopt bij workshops en adoptie. Wanneer een organisatie verder moet dan losse prompts en SaaS-tools, is er ook een infrastructuurverhaal onder de motorkap.',
        'Dat maakt Snow-Flow belangrijk als geloofwaardigheidslaag, maar niet als primaire commerciële ingang van de website.',
      ],
      pillarsTitle: 'Waar Snow-Flow voor staat',
      pillars: [
        {
          title: 'Open waar mogelijk',
          body: 'Open-core en open standaarden als tegenwicht tegen gesloten black-box AI-stacks.',
        },
        {
          title: 'Veilig waar nodig',
          body: 'Geschikt voor omgevingen waar governance, toegangscontrole en enterprise security bepalend zijn.',
        },
        {
          title: 'Infrastructuur in dienst van adoptie',
          body: 'Geen developer-project om het developer-project, maar technische onderbouw voor duurzame implementatie.',
        },
      ],
      whyTitle: 'Waarom dit wel zichtbaar moet zijn',
      why: [
        'Het onderstreept dat GroeimetAI geen oppervlakkige trainingspartij is',
        'Het laat zien dat open source en open standaarden onderdeel zijn van de merkfilosofie',
        'Het biedt vertrouwen voor organisaties die weten dat strategie en adoptie uiteindelijk ook technisch stevig moeten landen',
      ],
      finalCta: {
        title: 'Voor de meeste klanten begint het gesprek niet bij Snow-Flow.',
        body: 'Het begint bij betere manieren van werken. Snow-Flow is relevant zodra die verbeteringen technisch stevig neergezet moeten worden.',
        primaryCta: 'Plan een gesprek',
        primaryHref: '/contact',
        secondaryCta: 'Naar home',
        secondaryHref: '/',
      },
    },
    metadata: {
      root: {
        title: 'GroeimetAI | No-bullshit AI voor teams die beter willen werken',
        description:
          'GroeimetAI helpt bedrijven de AI-hype te doorzien en hun team zelf waarde te laten creëren met training, adoptie, workflowverbetering en veilige integraties.',
        keywords:
          'AI training, AI adoptie, AI workshops, AI strategie, workflow verbetering, AI integraties, veilige AI implementatie, MKB AI, Niels van der Werf, GroeimetAI',
      },
      services: {
        title: 'Diensten | AI training, adoptie, workflow redesign en integraties',
        description:
          'Van AI workshops en strategie tot workflow redesign en veilige integraties. GroeimetAI helpt teams AI praktisch en beheersbaar inzetten.',
        keywords:
          'AI workshops, AI training team, AI adoptie, workflow redesign, AI implementatie partner, veilige AI integraties',
      },
      about: {
        title: 'Over Niels van der Werf | GroeimetAI',
        description:
          'Over Niels van der Werf en GroeimetAI: een nuchtere implementatiepartner voor teams die AI praktisch, veilig en zelfstandig willen inzetten.',
        keywords:
          'Niels van der Werf, GroeimetAI, AI implementatiepartner, AI strategie Nederland',
      },
      snowFlow: {
        title: 'Snow-Flow | Open-core infrastructuur onder GroeimetAI',
        description:
          'Snow-Flow is het open-core infrastructuur- en productverhaal onder GroeimetAI, met focus op open standaarden, secure enterprise integraties en technische controle.',
        keywords:
          'Snow-Flow, open-core AI infrastructuur, open standaarden, secure enterprise AI, GroeimetAI',
      },
    },
  },
  en: {
    localeLabel: 'EN',
    nav: {
      items: [
        { label: 'Services', href: '/services' },
        { label: 'Approach', href: '/services#approach' },
        { label: 'About Niels', href: '/about' },
        { label: 'Snow-Flow', href: '/snow-flow' },
        { label: 'Contact', href: '/contact' },
      ],
      contactCta: 'Book a call',
      login: 'Sign in',
      dashboard: 'Dashboard',
      settings: 'Settings',
      logout: 'Sign out',
    },
    footer: {
      tagline:
        'GroeimetAI helps teams use AI in a practical, safe, and grounded way. Training, adoption, workflow improvement, and integrations when they add durable value.',
      emailLabel: 'info@groeimetai.io',
      phoneLabel: '+31 6 81739018',
      locationLabel: 'Based in the Netherlands, working internationally',
      groups: [
        {
          title: 'Navigation',
          links: [
            { label: 'Home', href: '/' },
            { label: 'Services', href: '/services' },
            { label: 'About Niels', href: '/about' },
            { label: 'Snow-Flow', href: '/snow-flow' },
            { label: 'Contact', href: '/contact' },
          ],
        },
        {
          title: 'What we help with',
          links: [
            { label: 'Training & workshops', href: '/services#training' },
            { label: 'Strategy & adoption', href: '/services#strategy' },
            { label: 'Workflow redesign', href: '/services#workflow' },
            { label: 'Safe integrations', href: '/services#integrations' },
          ],
        },
        {
          title: 'Under the hood',
          links: [
            { label: 'Snow-Flow on GitHub', href: 'https://github.com/GroeimetAI/snow-flow', external: true },
            { label: 'Privacy', href: '/privacy' },
            { label: 'Terms', href: '/terms' },
          ],
        },
      ],
      bottom: 'No hype. No default lock-in. Just teams learning how to work better with AI.',
    },
    home: {
      hero: {
        badge: 'No-bullshit AI for teams that want more than experimentation',
        title: 'Use AI without hype, lock-in, or dependency.',
        subtitle:
          'GroeimetAI helps companies let their own teams create value with AI through strong foundation models, practical workflows, training, and safe integrations. We do not start with a tool. We start with what actually needs to work better.',
        primaryCta: 'Book an introductory call',
        primaryHref: '/contact',
        secondaryCta: 'See our approach',
        secondaryHref: '/services#approach',
        supporting:
          'For SMEs, service businesses, and teams with scattered systems, manual work, and too little clarity about where AI really pays off.',
      },
      problemsIntro: {
        eyebrow: 'Why this gets stuck',
        title: 'Most organizations do not have an AI problem. They have a focus problem.',
        body:
          'Most teams do not need another AI tool. They need direction, skills, and a usable way of working. Without that, you get pilots that go nowhere, confusion about privacy and security, and expensive software that never becomes part of real work.',
      },
      problems: [
        {
          title: 'Too many tools, no shared line',
          body: 'Everyone is trying something different. Nothing turns into a repeatable team workflow.',
        },
        {
          title: 'Automation without ownership',
          body: 'Impressive demos sound smart, but nobody knows who owns them or how failure is handled.',
        },
        {
          title: 'Hype replaces decisions',
          body: 'Teams talk about agents before they talk about process design, risk, and where the first gains actually sit.',
        },
      ],
      principlesIntro: {
        eyebrow: 'What we do differently',
        title: 'We do not start with agents. We start with better work.',
        body:
          'GroeimetAI does not frame AI as a replacement for thinking. We treat it as leverage for doing good work better. That means we start with clarity, skills, and workflow choices. Tooling or integration comes after that.',
      },
      principles: [
        {
          title: 'Clarity first',
          body: 'We focus the work: where is the real value, what should you avoid, and what will this ask from your team?',
        },
        {
          title: 'Skills first',
          body: 'We teach people how to work with the models and tools already available so AI does not remain a toy for a few enthusiasts.',
        },
        {
          title: 'Implementation second',
          body: 'We only build custom tooling, integrations, or internal products when they add durable value.',
        },
        {
          title: 'Always with control',
          body: 'Human oversight, safe access, and governance where needed are not blockers. They are what make serious adoption possible.',
        },
      ],
      servicesIntro: {
        eyebrow: 'Services',
        title: 'What we help you with in practice',
        body:
          'Technical delivery is still part of the offer, but it is no longer the headline. The real entry point is training, adoption, workflow improvement, and safe implementation.',
      },
      services: [
        {
          title: 'AI Training & Workshops',
          body: 'For teams that want to work better with AI, not become more dependent on it.',
          bullets: [
            'Sessions for leadership and delivery teams',
            'Working with strong foundation models',
            'Prompt and workflow training for daily work',
            'Responsible use, policy, and risk awareness',
          ],
        },
        {
          title: 'AI Strategy & Adoption',
          body: 'For organizations that need focus in how AI should and should not be used.',
          bullets: [
            'Use-case selection by impact and feasibility',
            'Adoption planning by team',
            'Prioritization and roadmap design',
            'Governance and decision support',
          ],
        },
        {
          title: 'Workflow Redesign & Implementation',
          body: 'For teams with manual work, handoffs, and inefficient processes.',
          bullets: [
            'Analysis of current workflows',
            'Redesign with AI in the right places',
            'Pilot support and implementation',
            'Operational embedding',
          ],
        },
        {
          title: 'Safe Integrations & Tooling',
          body: 'For situations where off-the-shelf tools are not enough.',
          bullets: [
            'AI integrations with existing systems',
            'Internal tools or assistants',
            'Websites and portals with AI functionality',
            'Custom development only where it is sustainable',
          ],
        },
      ],
      audienceIntro: {
        eyebrow: 'Who this is for',
        title: 'For teams that are done with AI as theater.',
        body: 'This positioning fits organizations that want real improvement, not just experimentation.',
      },
      audience: {
        goodFit: [
          'SMEs and service organizations that want to use AI seriously but do not know where to start',
          'Teams with scattered systems, knowledge work, and manual handoffs',
          'Decision-makers tired of hype, expensive tools, and unclear ROI',
          'Organizations that want stronger teams rather than higher vendor dependence',
        ],
        notFit: [
          'Companies mainly looking for a flashy demo or AI showcase',
          'Projects where “an agent for everything” is the starting point',
          'Situations where a black-box subscription matters more than internal adoption and ownership',
        ],
      },
      approachIntro: {
        eyebrow: 'Approach',
        title: 'How we make AI usable inside your organization',
        body: 'No inflated transformation program. Just a clear sequence that keeps people, process, and technology in balance.',
      },
      steps: [
        {
          title: '1. Explore',
          body: 'We look at your team, workflows, systems, and goals. Where is the friction? Where can AI help? Where should it stay out?',
        },
        {
          title: '2. Train',
          body: 'We get leadership and teams to a usable level with concrete methods and real examples.',
        },
        {
          title: '3. Redesign',
          body: 'We improve workflows, roles, and decision points so AI supports work rather than creating more chaos.',
        },
        {
          title: '4. Implement',
          body: 'Only when it makes sense do we build integrations, tooling, or custom software. Safely, transparently, and with durable value in mind.',
        },
      ],
      proofIntro: {
        eyebrow: 'Credibility',
        title: 'Technically strong, but always in service of the outcome.',
        body: 'GroeimetAI should feel credible without consultant fog. Trust comes from sharp thinking, build capability, and clarity about what is and is not worth doing.',
      },
      proofs: [
        {
          title: 'Practical experience',
          body: 'From websites and internal tools to AI workflows and secure integrations. Not as an end in itself, but as a way to help teams work better.',
        },
        {
          title: 'Open-source credibility',
          body: 'With Snow-Flow we also build open infrastructure. That shows technical depth without turning the whole site into a developer story.',
        },
        {
          title: 'Grounded delivery',
          body: 'No dramatic claims about revolutions. Just direct language, sharp choices, and concrete next steps.',
        },
      ],
      snowFlowIntro: {
        eyebrow: 'Under the hood',
        title: 'Snow-Flow is not the main story. It is proof that the technical foundation exists.',
        body: 'Most clients do not start by talking about infrastructure. But if you need to build beyond prompts and SaaS tools without defaulting to lock-in, that depth matters.',
      },
      snowFlowCta: 'Learn about Snow-Flow',
      finalCta: {
        title: 'AI does not need to get bigger. It needs to get clearer.',
        body: 'If you want your team to use AI well, do not start with another tool. Start with focus, skills, and a practical way of working.',
        primaryCta: 'Book an introductory call',
        primaryHref: '/contact',
        secondaryCta: 'See services',
        secondaryHref: '/services',
      },
    },
    servicesPage: {
      hero: {
        badge: 'From training to implementation',
        title: 'Services for organizations that want to use AI seriously',
        subtitle:
          'From training and adoption to workflow improvement and safe implementation. Practical, direct, and shaped around how your team actually works.',
        primaryCta: 'Discuss your situation',
        primaryHref: '/contact',
        secondaryCta: 'See the approach',
        secondaryHref: '#approach',
        supporting: 'We do not default to building software. We start with the question: what needs to work better in your organization?',
      },
      intro:
        'That determines which service fits. Sometimes that is training. Sometimes process redesign. Sometimes a safe integration or a custom tool. But never technology as a disconnected trick.',
      serviceCards: [
        {
          title: 'AI Training & Workshops',
          body: 'For teams that want AI to become useful in daily work.',
          bullets: [
            'Sessions for leadership, team leads, and delivery teams',
            'Hands-on work with strong foundation models',
            'Internal AI usage guidelines',
            'Role-based practical application',
          ],
        },
        {
          title: 'AI Strategy & Adoption',
          body: 'For organizations that need focus on what is and is not worth doing.',
          bullets: [
            'Use-case selection and prioritization',
            'Adoption strategy by team',
            'Roadmap and governance',
            'Tooling and policy decisions',
          ],
        },
        {
          title: 'Workflow Redesign & Implementation',
          body: 'For teams held back by manual work, handoffs, and disconnected systems.',
          bullets: [
            'Workflow analysis',
            'Redesign with AI in the right moments',
            'Guided pilots and rollout',
            'Embedding into existing operations',
          ],
        },
        {
          title: 'Safe Integrations & Tooling',
          body: 'For situations where standard tools do not go far enough.',
          bullets: [
            'AI integrations with existing systems',
            'Internal tools, portals, and assistants',
            'Web development and custom delivery where needed',
            'Open standards and manageable architecture',
          ],
        },
      ],
      processTitle: 'How we work',
      process: [
        {
          title: 'Understand first',
          body: 'What is happening in the team today, where does work get stuck, and what role can AI realistically play?',
        },
        {
          title: 'Train and design second',
          body: 'We improve the operating model and give teams immediately usable ways of working.',
        },
        {
          title: 'Build third',
          body: 'When tooling or integration is needed, we build with focus and without unnecessary dependency.',
        },
      ],
      finalCta: {
        title: 'Not every AI question needs software.',
        body: 'Sometimes the right next step is a workshop. Sometimes a roadmap. Sometimes custom tooling. The order matters.',
        primaryCta: 'Book a call',
        primaryHref: '/contact',
        secondaryCta: 'Back to home',
        secondaryHref: '/',
      },
    },
    aboutPage: {
      hero: {
        badge: 'Personal brand, technical backbone',
        title: 'About Niels van der Werf and GroeimetAI',
        subtitle:
          'GroeimetAI is the service company of Niels van der Werf. It combines strategic clarity with technical execution, without consultancy fog and without leading with developer jargon.',
        primaryCta: 'Book a call',
        primaryHref: '/contact',
        secondaryCta: 'View services',
        secondaryHref: '/services',
        supporting: 'You do not get detached advice with no delivery sense. You also do not get technical delivery with no adoption plan.',
      },
      intro: [
        'Many companies can feel AI matters, but they cannot see through the noise of tools, claims, and opinions to what is actually relevant.',
        'That is where GroeimetAI fits: first understand where AI adds value, how teams should work with it, and what the organization needs to make it stick.',
        'Only then do we build what is truly needed: integrations, internal tools, websites, portals, or custom software.',
      ],
      principlesTitle: 'What GroeimetAI stands for',
      principles: [
        {
          title: 'Teach a man to fish',
          body: 'Teams should learn how to use AI well instead of becoming dependent on one vendor or tool.',
        },
        {
          title: 'Foundation over hype',
          body: 'Strong models, good workflows, data discipline, and safe access come before shiny promises.',
        },
        {
          title: 'Open standards over lock-in',
          body: 'Where possible, we choose open, transparent, and manageable architecture.',
        },
        {
          title: 'Human control over blind automation',
          body: 'AI should support, accelerate, and improve work, not outsource thinking without oversight.',
        },
      ],
      nielsTitle: 'Why this works',
      nielsBody: [
        'Niels van der Werf combines product thinking, development, and AI implementation. That is why GroeimetAI can advise sharply and still deliver for real teams.',
        'That combination matters. Traditional consulting often stops too early. Pure development often starts too technically. GroeimetAI sits in the gap between those two.',
      ],
      credibilityTitle: 'Why that matters commercially',
      credibility: [
        'You get advice that can actually be executed inside real teams',
        'You get implementation that understands what adoption demands',
        'You get technical depth without turning the site or the project into a technology-first story',
      ],
      finalCta: {
        title: 'Looking for a sharp implementation partner instead of an AI guru?',
        body: 'Then a serious conversation is probably more useful than another tool comparison or trend deck.',
        primaryCta: 'Book a call',
        primaryHref: '/contact',
        secondaryCta: 'Read about Snow-Flow',
        secondaryHref: '/snow-flow',
      },
    },
    snowFlowPage: {
      hero: {
        badge: 'Open-core infrastructure and technical credibility',
        title: 'Snow-Flow',
        subtitle:
          'Snow-Flow is the infrastructure and product layer underneath GroeimetAI. It is not the headline for most clients, but it proves the technical foundation is there when you need to build further.',
        primaryCta: 'View Snow-Flow on GitHub',
        primaryHref: 'https://github.com/GroeimetAI/snow-flow',
        secondaryCta: 'Back to services',
        secondaryHref: '/services',
        supporting: 'Open standards, secure enterprise integrations, and technical control without default lock-in.',
      },
      intro: [
        'Snow-Flow shows that the GroeimetAI point of view does not stop at workshops and adoption. When an organization needs to move beyond prompts and SaaS tools, there is infrastructure depth underneath.',
        'That makes Snow-Flow an important credibility layer, but not the primary commercial entry point of the website.',
      ],
      pillarsTitle: 'What Snow-Flow stands for',
      pillars: [
        {
          title: 'Open where possible',
          body: 'Open-core and open standards as an answer to closed black-box AI stacks.',
        },
        {
          title: 'Safe where needed',
          body: 'Built for environments where governance, access control, and enterprise security actually matter.',
        },
        {
          title: 'Infrastructure in service of adoption',
          body: 'Not a developer project for its own sake, but technical support for durable implementation.',
        },
      ],
      whyTitle: 'Why it should still be visible',
      why: [
        'It shows GroeimetAI is not a shallow training-only brand',
        'It proves open source and open standards are part of the brand philosophy',
        'It gives confidence to organizations that know strategy and adoption eventually need a serious technical landing',
      ],
      finalCta: {
        title: 'For most clients, the conversation does not start with Snow-Flow.',
        body: 'It starts with better ways of working. Snow-Flow matters when those improvements need to be implemented on a stronger technical foundation.',
        primaryCta: 'Book a call',
        primaryHref: '/contact',
        secondaryCta: 'Go home',
        secondaryHref: '/',
      },
    },
    metadata: {
      root: {
        title: 'GroeimetAI | No-bullshit AI for teams that want to work better',
        description:
          'GroeimetAI helps companies see through AI hype and create value through training, adoption, workflow improvement, and safe integrations.',
        keywords:
          'AI training, AI adoption, AI workshops, workflow improvement, safe AI implementation, GroeimetAI, Niels van der Werf',
      },
      services: {
        title: 'Services | Training, adoption, workflow redesign, and integrations',
        description:
          'From AI workshops and strategy to workflow redesign and safe integrations. GroeimetAI helps teams use AI in a practical and manageable way.',
        keywords:
          'AI workshops, AI training, AI adoption, workflow redesign, safe integrations, AI implementation partner',
      },
      about: {
        title: 'About Niels van der Werf | GroeimetAI',
        description:
          'About Niels van der Werf and GroeimetAI: a grounded implementation partner for teams that want to use AI practically, safely, and independently.',
        keywords:
          'Niels van der Werf, GroeimetAI, AI implementation partner, AI strategy Netherlands',
      },
      snowFlow: {
        title: 'Snow-Flow | Open-core infrastructure behind GroeimetAI',
        description:
          'Snow-Flow is the open-core infrastructure and product story behind GroeimetAI, focused on open standards, secure enterprise integrations, and technical control.',
        keywords:
          'Snow-Flow, open-core AI infrastructure, open standards, secure enterprise AI, GroeimetAI',
      },
    },
  },
};

export function getBrandSiteContent(locale?: string): SiteContent {
  if (locale === 'en') {
    return brandSiteContent.en;
  }

  return brandSiteContent.nl;
}
