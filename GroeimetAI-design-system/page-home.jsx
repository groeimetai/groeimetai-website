/* ===== Homepage ===== */
const HomePage = ({ go }) => {
  useReveal();
  return (
    <div className="page">
      {/* HERO */}
      <section className="hero">
        <div className="grid-bg"></div>
        <div className="glow"></div>
        <div className="container">
          <div className="hero-grid">
            <div>
              <div className="pill"><span className="dot"></span>Beschikbaar voor Q3 trajecten</div>
              <h1>
                Een agent is geen<br/>magie. Het is een <em>folder, instructies en tools.</em>
              </h1>
              <p className="hero-sub lead">
                Wij leren teams agents bouwen die ze zelf begrijpen, beheren en aanpassen. Geen black box. Geen lock-in. Geen hype.
              </p>
              <div className="hero-cta">
                <Btn variant="primary" onClick={() => go("contact")}>Plan een verkennend gesprek <ArrowRight/></Btn>
                <Btn variant="ghost" onClick={() => go("agents")}>Zo bouwen wij ze</Btn>
              </div>
              <div className="hero-meta">
                <div className="hero-meta-item"><span className="icon">●</span> 1-op-1 met Niels</div>
                <div className="hero-meta-item"><span className="icon">●</span> Antwoord binnen 24u</div>
                <div className="hero-meta-item"><span className="icon">●</span> NL & remote</div>
              </div>
            </div>
            <div>
              <AgentAnatomy/>
            </div>
          </div>
        </div>
      </section>

      {/* LOGO BAR */}
      <section className="section tight" style={{paddingTop: 24, paddingBottom: 32}}>
        <div className="container">
          <div className="divider-mono">Teams die met ons werken</div>
          <LogoBar/>
        </div>
      </section>

      {/* PROBLEM */}
      <Section id="problem">
        <div className="sec-head reveal">
          <div>
            <Eyebrow>Het echte probleem</Eyebrow>
            <h2 style={{marginTop: 16}}>Veel teams hebben geen AI-probleem.<br/>Ze hebben een focusprobleem.</h2>
          </div>
          <div className="sec-head-right">
            <p className="lead">Pilots zonder vervolg. Tools zonder eigenaar. Demo's die indrukwekkend voelen, maar nooit landen in dagelijks werk. Klinkt bekend?</p>
          </div>
        </div>
        <div className="grid-3 reveal">
          <div className="card">
            <div className="tag">Symptoom 01</div>
            <h3 style={{marginTop: 16}}>Te veel tools, te weinig lijn</h3>
            <p style={{marginTop: 12}}>Iedereen probeert iets anders. Niets landt in een gedeelde manier van werken.</p>
          </div>
          <div className="card">
            <div className="tag">Symptoom 02</div>
            <h3 style={{marginTop: 16}}>Automatisering zonder eigenaar</h3>
            <p style={{marginTop: 12}}>Slimme demo's voelen sterk, maar niemand weet wie ze beheert of wanneer ze fout mogen zitten.</p>
          </div>
          <div className="card">
            <div className="tag">Symptoom 03</div>
            <h3 style={{marginTop: 16}}>Hype vervangt besluitvorming</h3>
            <p style={{marginTop: 12}}>Teams praten over agents, niet over processen, risico's en waar de eerste winst echt zit.</p>
          </div>
        </div>
      </Section>

      {/* WHAT WE DO — pillars (light) */}
      <Section id="pillars" light>
        <div className="sec-head reveal">
          <div>
            <Eyebrow>Drie pijlers</Eyebrow>
            <h2 style={{marginTop: 16}}>Trainen. Bouwen. Borgen.</h2>
          </div>
          <div className="sec-head-right">
            <p className="lead">We gaan niet voor 'transformatie'. We gaan voor teams die zelf agents kunnen bouwen, draaien en bijsturen.</p>
          </div>
        </div>
        <div className="grid-3 reveal">
          <PillarCard
            tag="Pijler 01"
            title="AI Agent trainingen"
            desc="Voor teams die willen begrijpen wat een agent eigenlijk is, en er zelf één willen bouwen die hun werk verlicht."
            items={["1-daagse hands-on workshops","Modellen, prompts, folders en tools","Eigen use-case als rode draad","Naslagwerk dat blijft hangen"]}
            onClick={() => go("trainingen")}
          />
          <PillarCard
            tag="Pijler 02"
            title="Agent implementatie"
            desc="Voor situaties waar een eerste agent moet landen in productie — verbonden met je echte systemen, niet met een demo-database."
            items={["Discovery van use-cases","Bouw met je eigen team erbij","Veilige integraties (Slack, Exact, etc.)","Overdracht en governance"]}
            onClick={() => go("agents")}
          />
          <PillarCard
            tag="Pijler 03"
            title="AI Literacy & adoptie"
            desc="Voor organisaties die management én uitvoering op één lijn willen krijgen, voordat de eerste tool wordt aangeschaft."
            items={["Leiderschapssessies","Org-brede curriculum","Use-case prioritering","Beleid en governance"]}
            onClick={() => go("trainingen")}
          />
        </div>
      </Section>

      {/* THE 3 BUILDING BLOCKS DEEP DIVE */}
      <Section id="anatomy">
        <div className="sec-head reveal">
          <div>
            <Eyebrow>Anatomie van een agent</Eyebrow>
            <h2 style={{marginTop: 16}}>Drie dingen. Niet meer.</h2>
          </div>
          <div className="sec-head-right">
            <p className="lead">Als je dit snapt, snap je elke agent die er straks komt — los van het framework, los van de hype.</p>
          </div>
        </div>
        <div className="approach-grid reveal">
          <div className="approach-card">
            <div className="approach-icon"><IconFolder size={22}/></div>
            <div className="num">01 / Folders</div>
            <h4>Dit is wat de agent <em style={{color: "var(--accent)", fontStyle: "normal"}}>weet</em></h4>
            <p>Jouw documentatie, tone of voice, voorbeelden, beleid. Geen vage trainingsdata — concrete bestanden die jij beheert.</p>
          </div>
          <div className="approach-card">
            <div className="approach-icon"><IconInstructions size={22}/></div>
            <div className="num">02 / Instructies</div>
            <h4>Dit is hoe de agent <em style={{color: "var(--accent)", fontStyle: "normal"}}>denkt</em></h4>
            <p>Eén document met regels, edge cases en doelen. Leesbaar voor mensen, uitvoerbaar door het model.</p>
          </div>
          <div className="approach-card">
            <div className="approach-icon"><IconTool size={22}/></div>
            <div className="num">03 / Tools</div>
            <h4>Dit is wat de agent <em style={{color: "var(--accent)", fontStyle: "normal"}}>kan</em></h4>
            <p>Concrete acties: een mail sturen, een factuur opzoeken, een afspraak boeken. Niets meer dan jij toestaat.</p>
          </div>
        </div>
      </Section>

      {/* QUOTE */}
      <Section id="quote" light tight>
        <div className="grid-2" style={{alignItems: "center", gap: 80}}>
          <div className="bigquote reveal">
            "We dachten dat we agents nodig hadden. Bleek dat we eerst moesten leren wat ze waren. Niels heeft ons in 2 dagen verder geholpen dan een half jaar PowerPoints."
            <div className="bigquote-source">
              <div className="bigquote-avatar">M</div>
              <div>
                <div style={{color: "var(--ink)"}}>Mariska de Boer</div>
                <div>Head of Operations, MKB-tech bedrijf</div>
              </div>
            </div>
          </div>
          <div className="reveal" style={{display: "grid", gap: 32}}>
            <Stat num="200+" label="Mensen getraind" />
            <Stat num="14" label="Agents in productie" />
            <Stat num="0" label="Vendor lock-ins" />
          </div>
        </div>
      </Section>

      {/* CASES PREVIEW */}
      <Section id="cases-preview">
        <div className="sec-head reveal">
          <div>
            <Eyebrow>Recent werk</Eyebrow>
            <h2 style={{marginTop: 16}}>Wat er ontstaat als teams het zelf doen</h2>
          </div>
          <div className="sec-head-right">
            <Link onClick={() => go("cases")}>Alle cases bekijken</Link>
          </div>
        </div>
        <div className="grid-3 reveal">
          <CaseCard
            industry="Logistiek"
            title="Account-assistent voor sales engineers"
            snippet="Een agent die offerte-aanvragen voorbereidt op basis van CRM, mail en historische deals. Engineer kiest, agent typt."
            metric={{ num: "−4u", label: "per offerte" }}
          />
          <CaseCard
            industry="ServiceNow consultancy"
            title="Serac open source toolkit"
            snippet="Onze eigen agent-framework voor ServiceNow flows, gebouwd in productie en daarna open source gemaakt."
            metric={{ num: "OSS", label: "op GitHub" }}
          />
          <CaseCard
            industry="Professional services"
            title="Org-brede AI literacy programma"
            snippet="Van directie tot uitvoerend: in 6 weken één gedeelde manier van denken over AI, agents en risico's."
            metric={{ num: "120", label: "deelnemers" }}
          />
        </div>
      </Section>

      {/* CTA */}
      <Section id="cta" tight>
        <div className="cta-block reveal">
          <div className="cta-block-inner">
            <Eyebrow>Klaar om te beginnen?</Eyebrow>
            <h2 style={{marginTop: 18}}>AI hoeft niet groter.<br/>Het moet duidelijker.</h2>
            <p className="lead" style={{marginTop: 20}}>
              Eén verkennend gesprek. We kijken naar je team, je systemen en je echte vraag. Geen sales-funnel, geen forecast.
            </p>
            <div className="row">
              <Btn variant="primary" onClick={() => go("contact")}>Plan een gesprek <ArrowRight/></Btn>
              <Btn variant="ghost" onClick={() => go("about")}>Maak kennis met Niels</Btn>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
};

window.HomePage = HomePage;
