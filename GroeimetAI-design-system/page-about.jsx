/* ===== About page ===== */
const AboutPage = ({ go }) => {
  useReveal();
  return (
    <div className="page">
      <div className="page-head">
        <div className="glow"></div>
        <div className="container page-head-inner">
          <div className="crumbs"><span>Over</span><span className="sep">/</span><span className="current">Niels & GroeimetAI</span></div>
          <h1>GroeimetAI is <em style={{color: "var(--accent)", fontStyle:"normal"}}>klein</em>. Met opzet.</h1>
          <p>Eén persoon op de stoel waar het toe doet. Niels van der Werf — bouwer, trainer, gesprekspartner. Geen account manager, geen handover, geen Powerpoint-leger.</p>
        </div>
      </div>

      {/* Niels block */}
      <Section>
        <div className="grid-2" style={{gap: 64, alignItems: "start"}}>
          <div className="reveal">
            <div className="team-portrait" style={{aspectRatio: "3/4"}}>[ portret van Niels ]</div>
          </div>
          <div className="reveal">
            <Eyebrow>Niels van der Werf</Eyebrow>
            <h2 style={{marginTop: 16, fontSize: "clamp(32px, 3.6vw, 48px)"}}>Bouwer eerst,<br/>verkoper niet.</h2>
            <div style={{marginTop: 24, display: "grid", gap: 18, color: "var(--fg-dim)", lineHeight: 1.65, fontSize: 16}}>
              <p>Ik bouw al sinds modellen 'GPT-3' heetten. Eerst voor mezelf, daarna voor klanten. Wat ik in die jaren leerde: de techniek is bijna nooit het probleem. Het zit in <em style={{color: "var(--fg)", fontStyle:"normal"}}>focus</em>, in <em style={{color: "var(--fg)", fontStyle:"normal"}}>eigenaarschap</em>, en in <em style={{color: "var(--fg)", fontStyle:"normal"}}>begrijpen wat je bouwt</em>.</p>
              <p>Daarom is GroeimetAI bewust klein. Geen funnel, geen pipeline. Wel persoonlijk werk met teams die echt iets willen veranderen — en die snappen dat dat tijd kost.</p>
              <p>Naast klantwerk maak ik open source. Serac is daar het meest zichtbare voorbeeld van: een agent-framework voor ServiceNow, dat ik begon voor één klant en daarna onder MIT op GitHub heb gezet. Want als ik klanten geen lock-in beloof, moet ik dat zelf ook waarmaken.</p>
            </div>
            <div style={{marginTop: 32}}>
              <div className="signature">
                <div className="signature-avatar">N</div>
                <div>
                  <div className="signature-name">Niels van der Werf</div>
                  <div className="signature-role">Founder · GroeimetAI</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Beliefs */}
      <Section light>
        <div className="sec-head reveal">
          <div>
            <Eyebrow>Wat we geloven</Eyebrow>
            <h2 style={{marginTop: 16}}>Vijf dingen die we niet veranderen.</h2>
          </div>
          <div className="sec-head-right">
            <p className="lead">Soms zijn we het oneens met een potentiële klant. Dat is okay. Beter vooraf eerlijk dan halverwege ongelukkig.</p>
          </div>
        </div>
        <div style={{marginTop: 32}} className="reveal">
          {[
            { n: "01", t: "Mens beslist, agent ondersteunt", d: "Klantcontact, juridisch, financieel — daar gaat geen agent zelfstandig over. Punt." },
            { n: "02", t: "Geen vendor lock-in als standaard", d: "We bouwen op de meest geschikte stack, niet op de stack waar wij commissie van krijgen (die is er sowieso niet)." },
            { n: "03", t: "Documentatie is geen afterthought", d: "Als jullie het na overdracht niet kunnen lezen, hebben we ons werk niet af." },
            { n: "04", t: "Trainen boven bouwen, waar mogelijk", d: "Als één training jullie zelf de bouwers maakt, is dat altijd te verkiezen boven een opgeleverd product." },
            { n: "05", t: "Klein blijven", d: "We groeien niet voor de groei. We willen scherp blijven, niet schaalbaar." },
          ].map((b, i) => (
            <Numbered n={b.n} title={b.t} key={i}>{b.d}</Numbered>
          ))}
        </div>
      </Section>

      {/* Open source */}
      <Section>
        <div className="grid-2" style={{gap: 64, alignItems: "start"}}>
          <div className="reveal">
            <Eyebrow>Open source</Eyebrow>
            <h2 style={{marginTop: 16}}>Wat we maken,<br/>geven we vaak terug.</h2>
            <p style={{marginTop: 24}} className="lead">
              Niet uit ideologie — uit principe. Als wij klanten beloven: geen lock-in, dan moet wat wij bouwen óók weg te halen zijn.
            </p>
            <div style={{marginTop: 32}}>
              <Btn variant="ghost" href="https://github.com/GroeimetAI" target="_blank">github.com/GroeimetAI <ArrowRight/></Btn>
            </div>
          </div>
          <div className="reveal">
            <div className="card" style={{padding: 32}}>
              <div style={{display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16}}>
                <div>
                  <div className="mono" style={{fontSize: 11, color: "var(--fg-mute)"}}>groeimetai/</div>
                  <h3 style={{marginTop: 4, fontSize: 24}}>serac</h3>
                </div>
                <div className="tag">MIT</div>
              </div>
              <p style={{fontSize: 14}}>Agent framework voor ServiceNow. Orchestreert flows met tool calls, audit log en menselijke approval-stap waar nodig.</p>
              <div style={{marginTop: 20, display: "flex", gap: 16, fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--fg-mute)"}}>
                <span>★ TypeScript</span>
                <span>● MIT</span>
                <span>v1.x</span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section tight>
        <div className="cta-block reveal">
          <div className="cta-block-inner">
            <Eyebrow>Eens praten?</Eyebrow>
            <h2 style={{marginTop: 18}}>Eén gesprek met de persoon<br/>die het werk ook gaat doen.</h2>
            <div className="row">
              <Btn variant="primary" onClick={() => go("contact")}>Plan een gesprek <ArrowRight/></Btn>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
};

window.AboutPage = AboutPage;
