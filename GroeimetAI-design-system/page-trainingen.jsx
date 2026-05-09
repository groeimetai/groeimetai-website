/* ===== Trainingen page ===== */
const TrainingenPage = ({ go }) => {
  useReveal();
  const trainingen = [
    {
      tag: "01 / Hands-on",
      duration: "1 dag · 6-12 personen · op locatie of remote",
      level: "Voor: teams die zelf gaan bouwen",
      title: "Bouw je eerste agent",
      desc: "Aan het eind van de dag heeft elk team een werkende agent met eigen folder, instructies en één tool. Geen slides over 'de toekomst van werk'.",
      bullets: [
        "Anatomie: folders, instructies, tools",
        "Prompting voor productie (niet voor demo)",
        "Tool calls en wanneer je ze NIET inzet",
        "Hands-on: één werkend prototype per team",
      ],
    },
    {
      tag: "02 / Strategisch",
      duration: "Halve dag · directie + L&D · op locatie",
      level: "Voor: leiders die richting willen geven",
      title: "AI Literacy voor management",
      desc: "Een sessie waarin we het verschil scherp maken tussen wat agents wél en niet kunnen, en welke beslissingen alleen jullie kunnen nemen.",
      bullets: [
        "Wat is een agent — en wat niet",
        "Use-case prioritering op impact + risico",
        "Beleid, governance en menselijke controle",
        "Roadmap voor de komende 6 maanden",
      ],
    },
    {
      tag: "03 / Programma",
      duration: "6 weken · org-breed · hybride",
      level: "Voor: organisaties die schaalbaar willen leren",
      title: "Org-brede AI adoptie",
      desc: "Curriculum voor management én uitvoerend, met dezelfde taal en dezelfde voorbeelden. Je hele organisatie op één lijn.",
      bullets: [
        "Module per rolgroep (sales, ops, finance, etc.)",
        "Wekelijkse hands-on sprints",
        "Use-case incubator met begeleiding",
        "Train-the-trainer voor doorlopende borging",
      ],
    },
  ];

  return (
    <div className="page">
      <div className="page-head">
        <div className="glow"></div>
        <div className="container page-head-inner">
          <div className="crumbs"><span>Diensten</span><span className="sep">/</span><span className="current">Trainingen</span></div>
          <h1>Trainingen die <em style={{color: "var(--accent)", fontStyle:"normal"}}>blijven</em> hangen.</h1>
          <p>Geen 'AI awareness' van twee uur. Wel concrete dagen waarin je team aan het eind iets werkends heeft gebouwd — en snapt hoe het werkt.</p>
        </div>
      </div>

      {/* Training cards */}
      <Section>
        <div className="reveal" style={{display: "grid", gap: 16}}>
          {trainingen.map((t, i) => (
            <div className="training-row" key={i}>
              <div className="training-left">
                <div className="tag">{t.tag}</div>
                <h2 style={{marginTop: 18, fontSize: "clamp(28px, 3.2vw, 40px)"}}>{t.title}</h2>
                <p style={{marginTop: 14, fontSize: 16}}>{t.desc}</p>
                <div className="training-meta mono">
                  <div>{t.duration}</div>
                  <div>{t.level}</div>
                </div>
              </div>
              <div className="training-right">
                <div className="mono" style={{fontSize: 11, color: "var(--fg-mute)", marginBottom: 14, letterSpacing: "0.06em"}}>WAT JE LEERT</div>
                <ul className="training-list">
                  {t.bullets.map((b, j) => (
                    <li key={j}><span className="check mono">→</span>{b}</li>
                  ))}
                </ul>
                <div style={{marginTop: 24}}>
                  <Link onClick={() => go("contact")}>Meer weten over deze training</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* What every training has */}
      <Section light>
        <div className="sec-head reveal">
          <div>
            <Eyebrow>In elke training</Eyebrow>
            <h2 style={{marginTop: 16}}>Niet de standaard 'AI workshop'.</h2>
          </div>
          <div className="sec-head-right">
            <p className="lead">Wat alle trainingen gemeen hebben — los van duur of niveau.</p>
          </div>
        </div>
        <div className="grid-4 reveal">
          {[
            { Glyph: IconWrench,  t: "Hands-on, geen slides", d: "Je werkt met echte tools, op je eigen casus." },
            { Glyph: IconBook,    t: "Naslagwerk dat blijft", d: "Documentatie die je over 6 maanden nog gebruikt." },
            { Glyph: IconCompass, t: "Eigen use-case als rode draad", d: "We bouwen aan iets wat jullie morgen al inzetten." },
            { Glyph: IconUsers,   t: "Niels zelf, niet een trainee", d: "Je krijgt de persoon die het ook bouwt in productie." },
          ].map((f, i) => {
            const G = f.Glyph;
            return (
              <div className="card" key={i} style={{padding: 24, gap: 12, display: "flex", flexDirection: "column"}}>
                <div className="approach-icon" style={{marginBottom: 4}}><G size={22}/></div>
                <h4 style={{fontSize: 16, marginTop: 4}}>{f.t}</h4>
                <p style={{fontSize: 14}}>{f.d}</p>
              </div>
            );
          })}
        </div>
      </Section>

      {/* FAQ */}
      <Section>
        <div className="grid-2" style={{gap: 80}}>
          <div className="reveal">
            <Eyebrow>Veelgestelde vragen</Eyebrow>
            <h2 style={{marginTop: 16}}>Wat klanten vooraf willen weten.</h2>
            <p style={{marginTop: 18, maxWidth: "40ch"}}>Staat je vraag er niet bij? <a onClick={() => go("contact")} style={{color: "var(--accent)", borderBottom: "1px dashed currentColor", paddingBottom: 1, cursor: "pointer"}}>Stel hem direct →</a></p>
          </div>
          <div className="reveal">
            <FAQ items={[
              { q: "Geven jullie ook open trainingen?", a: "Nee. We werken alleen in-company. Een training werkt pas écht als deelnemers met collega's aan eigen use-cases kunnen werken." },
              { q: "Welke modellen gebruiken we?", a: "Afhankelijk van je context. We zijn niet gebonden aan één leverancier en behandelen Anthropic, OpenAI, Google en open source modellen op gelijk niveau." },
              { q: "Wat is het minimum aantal deelnemers?", a: "Voor hands-on trainingen: 6 personen. Voor strategische sessies: vanaf 3, meestal directie + L&D + key stakeholder." },
              { q: "Krijgen we ook iets mee?", a: "Ja. Naast de werkende agent uit de hands-on dag krijg je naslagwerk, templates en een runbook dat je ook over een half jaar nog gebruikt." },
              { q: "Trainen jullie ook in het Engels?", a: "Ja. Standaard NL, op aanvraag in het Engels." },
            ]}/>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section tight>
        <div className="cta-block reveal">
          <div className="cta-block-inner">
            <Eyebrow>Een training plannen?</Eyebrow>
            <h2 style={{marginTop: 18}}>Vertel over je team. We stellen samen<br/>het juiste programma samen.</h2>
            <div className="row">
              <Btn variant="primary" onClick={() => go("contact")}>Plan een gesprek <ArrowRight/></Btn>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
};

const FAQ = ({ items }) => {
  const [open, setOpen] = React.useState(0);
  return (
    <div>
      {items.map((it, i) => (
        <div key={i} className={"faq-item " + (open === i ? "open" : "")}>
          <div className="faq-q" onClick={() => setOpen(open === i ? -1 : i)}>
            <span>{it.q}</span>
            <span className="faq-toggle">+</span>
          </div>
          <div className="faq-a">
            <p>{it.a}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

window.TrainingenPage = TrainingenPage;
