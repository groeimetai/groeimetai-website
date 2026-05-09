/* ===== Contact page ===== */
const ContactPage = ({ go }) => {
  useReveal();
  const [submitted, setSubmitted] = React.useState(false);
  return (
    <div className="page">
      <div className="page-head">
        <div className="glow"></div>
        <div className="container page-head-inner">
          <div className="crumbs"><span>Contact</span><span className="sep">/</span><span className="current">Plan een gesprek</span></div>
          <h1>Eén verkennend gesprek.<br/><em style={{color: "var(--accent)", fontStyle:"normal"}}>Geen sales-funnel.</em></h1>
          <p>30-45 minuten. Je vertelt waar je tegenaan loopt, ik vertel eerlijk of we kunnen helpen — of dat een andere partij beter past.</p>
        </div>
      </div>

      <Section>
        <div className="grid-2" style={{gap: 80, alignItems: "start"}}>
          <div className="reveal">
            <Eyebrow>Direct mailen</Eyebrow>
            <h2 style={{marginTop: 16, fontSize: "clamp(28px, 3vw, 38px)"}}>Of sla het formulier over.</h2>
            <div style={{marginTop: 32, display: "grid", gap: 20}}>
              <a href="mailto:info@groeimetai.io" className="contact-line">
                <div className="contact-line-icon"><IconMail size={18}/></div>
                <div>
                  <div className="mono" style={{fontSize: 11, color: "var(--fg-mute)"}}>EMAIL</div>
                  <div style={{fontSize: 18, marginTop: 4}}>info@groeimetai.io</div>
                </div>
              </a>
              <a href="tel:+31681739018" className="contact-line">
                <div className="contact-line-icon"><IconPhone size={18}/></div>
                <div>
                  <div className="mono" style={{fontSize: 11, color: "var(--fg-mute)"}}>TELEFOON</div>
                  <div style={{fontSize: 18, marginTop: 4}}>+31 6 8173 9018</div>
                </div>
              </a>
              <div className="contact-line" style={{cursor: "default"}}>
                <div className="contact-line-icon"><IconPin size={18}/></div>
                <div>
                  <div className="mono" style={{fontSize: 11, color: "var(--fg-mute)"}}>BASIS</div>
                  <div style={{fontSize: 18, marginTop: 4}}>Nederland · werkt NL & remote</div>
                </div>
              </div>
            </div>

            <div style={{marginTop: 48, padding: 24, background: "var(--bg-elev)", border: "1px solid var(--line)", borderRadius: 12}}>
              <div className="signature" style={{padding: 0, background: "transparent", border: "none", maxWidth: "none"}}>
                <div className="signature-avatar">N</div>
                <div>
                  <div className="signature-name">Je spreekt Niels.</div>
                  <div className="signature-role">Founder · antwoord binnen 24u</div>
                </div>
              </div>
              <p style={{marginTop: 16, fontSize: 14, color: "var(--fg-dim)"}}>Geen tussenpersoon, geen 'we komen er bij je op terug'. Je gesprek is met de persoon die ook het werk doet.</p>
            </div>
          </div>

          <div className="reveal">
            <div className="card" style={{padding: 36}}>
              {!submitted ? (
                <>
                  <div className="mono" style={{fontSize: 11, color: "var(--fg-mute)", letterSpacing: "0.06em", marginBottom: 8}}>FORMULIER</div>
                  <h3 style={{fontSize: 22, marginBottom: 24}}>Vertel kort waar het over gaat.</h3>
                  <form className="contact-form" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
                    <div className="form-row">
                      <div>
                        <label>Naam</label>
                        <input type="text" placeholder="Je naam" required />
                      </div>
                      <div>
                        <label>Organisatie</label>
                        <input type="text" placeholder="Bedrijfsnaam" />
                      </div>
                    </div>
                    <div>
                      <label>Email</label>
                      <input type="email" placeholder="naam@bedrijf.nl" required />
                    </div>
                    <div>
                      <label>Waar gaat het over?</label>
                      <textarea placeholder="Bijv: We willen een agent bouwen voor onze service desk, maar we weten niet waar te beginnen..." required></textarea>
                    </div>
                    <div style={{marginTop: 8}}>
                      <Btn variant="primary">Verstuur bericht <ArrowRight/></Btn>
                    </div>
                  </form>
                </>
              ) : (
                <div style={{padding: "32px 0", textAlign: "center"}}>
                  <div style={{width: 64, height: 64, borderRadius: "50%", background: "rgba(255,90,31,0.12)", color: "var(--accent)", display: "grid", placeItems: "center", margin: "0 auto 24px"}}><IconCheck size={28}/></div>
                  <h3 style={{fontSize: 22, marginBottom: 12}}>Bericht binnen.</h3>
                  <p style={{fontSize: 15, maxWidth: "32ch", margin: "0 auto"}}>Niels reageert persoonlijk binnen 24 uur. Houd je inbox in de gaten.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
};

window.ContactPage = ContactPage;
