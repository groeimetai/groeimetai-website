/* ===== Cases page ===== */
const CasesPage = ({ go }) => {
  useReveal();
  const cases = [
    {
      industry: "Logistiek · MKB",
      title: "Account-assistent voor sales engineers",
      role: "Bouw + training",
      summary: "Een agent die offerte-aanvragen voorbereidt: leest CRM, oude offertes en de mail-thread. Engineer reviewt en stuurt.",
      stack: ["Sonnet 4", "Custom MCP", "Exact Online", "Slack"],
      outcomes: [
        { num: "−4u", label: "per offerte" },
        { num: "8 wkn", label: "tot productie" },
        { num: "100%", label: "review door mens" },
      ],
      why: "Sales engineers verloren halve dagen aan voorbereiding. We bouwden geen 'AI sales rep' — we bouwden hun eigen kladblok dat al gevuld is.",
    },
    {
      industry: "Open source · Eigen werk",
      title: "Serac: agent-framework voor ServiceNow",
      role: "Eigen product",
      summary: "Onze eigen toolkit voor agents die ServiceNow flows orchestreren. Begonnen als klantwerk, daarna open source gemaakt.",
      stack: ["TypeScript", "ServiceNow REST", "Anthropic SDK", "MIT"],
      outcomes: [
        { num: "OSS", label: "MIT licentie" },
        { num: "GitHub", label: "groeimetai/serac" },
        { num: "v1.x", label: "in productie" },
      ],
      why: "Omdat we vinden dat klanten geen vendor lock-in mogen krijgen op iets wat hun eigen processen automatiseert.",
    },
    {
      industry: "Professional services · 800+ FTE",
      title: "Org-brede AI literacy programma",
      role: "Programma + curriculum",
      summary: "Zes weken. Directie, management én uitvoerend. Eén gedeelde taal, één gedeeld besef van wat agents wel/niet zijn.",
      stack: ["Curriculum", "Use-case incubator", "Train-the-trainer"],
      outcomes: [
        { num: "120", label: "deelnemers" },
        { num: "9", label: "use-cases gevalideerd" },
        { num: "3", label: "agents in productie na 6 mnd" },
      ],
      why: "Niet omdat ze 'iets met AI moesten'. Omdat ze niet wilden dat 12 teams 12 verschillende kanten op gingen.",
    },
    {
      industry: "Industrie · Manufacturing",
      title: "Klacht-triage voor service desk",
      role: "Pilot + overdracht",
      summary: "Een agent die binnenkomende serviceklachten classificeert, urgentie inschat en de juiste engineer toewijst. Mens beslist alsnog.",
      stack: ["Sonnet 4", "Email", "Internal CRM"],
      outcomes: [
        { num: "62%", label: "minder triage-tijd" },
        { num: "0", label: "verkeerde escalaties" },
        { num: "Eigen", label: "team beheert nu" },
      ],
      why: "De service desk verzoop. Niet in klachten, maar in het sorteren ervan. Daar zat de winst.",
    },
  ];

  return (
    <div className="page">
      <div className="page-head">
        <div className="glow"></div>
        <div className="container page-head-inner">
          <div className="crumbs"><span>Werk</span><span className="sep">/</span><span className="current">Cases</span></div>
          <h1>Wat er ontstaat als <em style={{color: "var(--accent)", fontStyle:"normal"}}>teams</em> het zelf doen.</h1>
          <p>Niet de glanzende slide-versie. Wel de eerlijke: wat we bouwden, met welke stack, en waarom het werkte.</p>
        </div>
      </div>

      <Section>
        <div className="cases-stack">
          {cases.map((c, i) => (
            <div className="case-row reveal" key={i}>
              <div className="case-row-meta">
                <div className="case-row-num mono">CASE {String(i+1).padStart(2,"0")}</div>
                <div className="tag" style={{marginTop: 12}}>{c.industry}</div>
                <div className="case-row-role mono">{c.role}</div>
              </div>
              <div className="case-row-body">
                <h2 style={{fontSize: "clamp(28px, 3.2vw, 40px)"}}>{c.title}</h2>
                <p style={{marginTop: 16, fontSize: 17}}>{c.summary}</p>
                <div className="q-block" style={{marginTop: 24}}>
                  <p className="q-block-text" style={{fontSize: 18}}>{c.why}</p>
                </div>
                <div className="case-stack-row">
                  <div className="mono" style={{fontSize: 11, color: "var(--fg-mute)", letterSpacing: "0.06em", marginBottom: 8}}>STACK</div>
                  <div style={{display: "flex", gap: 8, flexWrap: "wrap"}}>
                    {c.stack.map((s, j) => <span key={j} className="stack-pill mono">{s}</span>)}
                  </div>
                </div>
              </div>
              <div className="case-row-results">
                <div className="mono" style={{fontSize: 11, color: "var(--fg-mute)", letterSpacing: "0.06em", marginBottom: 16}}>RESULTAAT</div>
                <div style={{display: "grid", gap: 24}}>
                  {c.outcomes.map((o, j) => (
                    <div key={j}>
                      <div className="mono" style={{fontSize: 32, color: "var(--accent)", letterSpacing: "-0.02em", lineHeight: 1}}>{o.num}</div>
                      <div style={{marginTop: 6, fontSize: 13, color: "var(--fg-dim)"}}>{o.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <Section tight>
        <div className="cta-block reveal">
          <div className="cta-block-inner">
            <Eyebrow>Een use-case in gedachten?</Eyebrow>
            <h2 style={{marginTop: 18}}>De volgende case zou van<br/>jullie kunnen zijn.</h2>
            <div className="row">
              <Btn variant="primary" onClick={() => go("contact")}>Plan een gesprek <ArrowRight/></Btn>
              <Btn variant="ghost" onClick={() => go("agents")}>Lees over onze aanpak</Btn>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
};

window.CasesPage = CasesPage;
