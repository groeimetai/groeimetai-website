/* ===== Agents / Implementatie page ===== */
const AgentsPage = ({ go }) => {
  useReveal();
  return (
    <div className="page">
      <div className="page-head">
        <div className="glow"></div>
        <div className="container page-head-inner">
          <div className="crumbs"><span>Diensten</span><span className="sep">/</span><span className="current">Agent implementatie</span></div>
          <h1>Agents bouwen die <em style={{color: "var(--accent)", fontStyle:"normal"}}>jij</em> begrijpt.</h1>
          <p>Geen black-box demo's. We bouwen samen met je team, op jouw stack, en lichten elke regel toe. Na oplevering kan jij ze zelf aanpassen.</p>
        </div>
      </div>

      {/* The model: folder + instructions + tools */}
      <Section>
        <div className="sec-head reveal">
          <div>
            <Eyebrow>Hoe wij het zien</Eyebrow>
            <h2 style={{marginTop: 16}}>Een agent is geen product.<br/>Het is een werkwijze.</h2>
          </div>
          <div className="sec-head-right">
            <p className="lead">Als je begrijpt waar een agent uit bestaat, kan je hem zelf bouwen, debuggen en uitbreiden. Wij leren je het patroon.</p>
          </div>
        </div>
        <div className="approach-grid reveal">
          <div className="approach-card">
            <div className="approach-icon"><IconFolder size={22}/></div>
            <div className="num">01 / Knowledge folder</div>
            <h4>Wat hij weet</h4>
            <p>Eén folder met markdown-bestanden. Documentatie, beleid, voorbeelden, tone of voice. Versioneerbaar in git, te bewerken door iedereen.</p>
            <div className="mono" style={{fontSize: 11, color: "var(--fg-mute)", marginTop: 8}}>knowledge/*.md, *.json</div>
          </div>
          <div className="approach-card">
            <div className="approach-icon"><IconInstructions size={22}/></div>
            <div className="num">02 / System prompt</div>
            <h4>Hoe hij denkt</h4>
            <p>Eén leesbaar document. Doelen, regels, edge cases en escalatiepaden. Geen YAML-spaghetti, geen flowchart van 47 stappen.</p>
            <div className="mono" style={{fontSize: 11, color: "var(--fg-mute)", marginTop: 8}}>instructions.md</div>
          </div>
          <div className="approach-card">
            <div className="approach-icon"><IconTool size={22}/></div>
            <div className="num">03 / Tool calls</div>
            <h4>Wat hij kan</h4>
            <p>Functies in jouw eigen code. Mail sturen, ticket aanmaken, factuur opzoeken. Met permissions, audit log en menselijke review waar nodig.</p>
            <div className="mono" style={{fontSize: 11, color: "var(--fg-mute)", marginTop: 8}}>tools/*.ts</div>
          </div>
        </div>
      </Section>

      {/* Process */}
      <Section light>
        <div className="sec-head reveal">
          <div>
            <Eyebrow>Aanpak</Eyebrow>
            <h2 style={{marginTop: 16}}>Vier fases. Jouw team is steeds aan boord.</h2>
          </div>
          <div className="sec-head-right">
            <p className="lead">We bouwen niet voor je. We bouwen mét je. Anders heb je over een half jaar nog een tool waar niemand iets van begrijpt.</p>
          </div>
        </div>
        <div className="steps reveal">
          <div className="step">
            <div className="step-n">FASE 01</div>
            <h4>Verkennen</h4>
            <p>We brengen 1-3 use-cases in kaart. Welke past bij een agent, welke is gewoon een script? Wat is de waarde, wat zijn de risico's?</p>
          </div>
          <div className="step">
            <div className="step-n">FASE 02</div>
            <h4>Trainen</h4>
            <p>Het team dat de agent gaat bouwen of beheren krijgt eerst de basis. Folder, instructies, tools — geen magie.</p>
          </div>
          <div className="step">
            <div className="step-n">FASE 03</div>
            <h4>Bouwen</h4>
            <p>Pair-building. Wij sturen, jullie typen. Of andersom. Eerste werkende versie binnen weken, niet kwartalen.</p>
          </div>
          <div className="step">
            <div className="step-n">FASE 04</div>
            <h4>Borgen</h4>
            <p>Overdracht, runbook, monitoring. Wat doe je als hij iets fout zegt? Wie keurt nieuwe versies goed?</p>
          </div>
        </div>
      </Section>

      {/* What we don't do */}
      <Section>
        <div className="grid-2" style={{gap: 80}}>
          <div className="reveal">
            <Eyebrow>Wat we niet doen</Eyebrow>
            <h2 style={{marginTop: 16}}>Eerlijk over de grenzen.</h2>
            <p style={{marginTop: 20}} className="lead">
              We zijn niet voor iedereen. Hier zijn signalen dat je beter een andere partij kan zoeken:
            </p>
          </div>
          <div className="reveal">
            <div className="checklist">
              <div className="checklist-item">
                <span className="x">×</span>
                <div><strong style={{color: "var(--fg)"}}>"Bouw ons een chatbot"</strong> — zonder dat duidelijk is wat hij moet kunnen of wie de eigenaar is.</div>
              </div>
              <div className="checklist-item">
                <span className="x">×</span>
                <div><strong style={{color: "var(--fg)"}}>"We willen alles geautomatiseerd"</strong> — zonder eerst te kijken welk werk waarde heeft om weg te halen.</div>
              </div>
              <div className="checklist-item">
                <span className="x">×</span>
                <div><strong style={{color: "var(--fg)"}}>"Zoek het uit en lever op"</strong> — wij bouwen alleen mét teams. Anders wordt het schaduw-IT.</div>
              </div>
              <div className="checklist-item">
                <span className="x">×</span>
                <div><strong style={{color: "var(--fg)"}}>"Het mag wel een beetje creatief"</strong> — agents in klantcontact horen voorspelbaar te zijn. Punt.</div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section tight>
        <div className="cta-block reveal">
          <div className="cta-block-inner">
            <Eyebrow>Een use-case in gedachten?</Eyebrow>
            <h2 style={{marginTop: 18}}>Vertel waar je tegenaan loopt.<br/>We zeggen eerlijk of een agent past.</h2>
            <div className="row">
              <Btn variant="primary" onClick={() => go("contact")}>Plan een gesprek <ArrowRight/></Btn>
              <Btn variant="ghost" onClick={() => go("cases")}>Bekijk eerdere agents</Btn>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
};

window.AgentsPage = AgentsPage;
