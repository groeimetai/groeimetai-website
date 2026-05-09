/* ===== Reusable shared components ===== */

const Eyebrow = ({ children }) => <div className="eyebrow">{children}</div>;

const Btn = ({ children, variant = "primary", href, ...rest }) => {
  const cls = "btn btn-" + variant;
  return href
    ? <a className={cls} href={href} {...rest}>{children}</a>
    : <button className={cls} {...rest}>{children}</button>;
};

const ArrowRight = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 7h10M8 3l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Link = ({ children, onClick, href, mono = true }) => (
  <a className="btn-link" onClick={onClick} href={href || "#"}>
    <span>{children}</span>
    <span className="arrow"><ArrowRight /></span>
  </a>
);

const Section = ({ id, light = false, tight = false, children, style }) => (
  <section id={id} className={"section" + (light ? " light" : "") + (tight ? " tight" : "")} style={style}>
    <div className="container">{children}</div>
  </section>
);

/* Logo bar marquee */
const LogoBar = () => {
  const logos = [
    "Brouwerij 't IJ", "MKB Nederland", "TNO", "Coolblue", "Bever",
    "Schiphol Group", "Achmea", "Rabobank", "Picnic", "Bol",
  ];
  return (
    <div className="marquee">
      <div className="marquee-track">
        {[...logos, ...logos].map((l, i) => (
          <div key={i} className="logo-text">{l}</div>
        ))}
      </div>
    </div>
  );
};

/* Stat block */
const Stat = ({ num, label, suffix }) => (
  <div className="stat">
    <div className="stat-num mono">
      <span>{num}</span>{suffix && <span className="stat-suffix">{suffix}</span>}
    </div>
    <div className="stat-label">{label}</div>
  </div>
);

/* Big number heading */
const Numbered = ({ n, title, children }) => (
  <div className="numbered">
    <div className="numbered-n mono">{n}</div>
    <div className="numbered-body">
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  </div>
);

/* Service / pillar card */
const PillarCard = ({ tag, title, desc, items, onClick }) => (
  <div className="card pillar interactive" onClick={onClick}>
    <div className="pillar-head">
      <span className="tag">{tag}</span>
      <span className="pillar-arrow"><ArrowRight size={16}/></span>
    </div>
    <h3>{title}</h3>
    <p>{desc}</p>
    <ul className="pillar-list">
      {items.map((it, i) => (
        <li key={i}><span className="check mono">→</span>{it}</li>
      ))}
    </ul>
  </div>
);

/* Case card */
const CaseCard = ({ industry, title, snippet, metric }) => (
  <div className="card case interactive">
    <div className="case-meta mono">{industry}</div>
    <h3 className="case-title">{title}</h3>
    <p>{snippet}</p>
    <div className="case-metric">
      <div className="case-metric-num mono">{metric.num}</div>
      <div className="case-metric-label">{metric.label}</div>
    </div>
  </div>
);

/* Reveal on scroll */
const useReveal = () => {
  React.useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add("in");
      });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
};

window.Eyebrow = Eyebrow;
window.Btn = Btn;
window.ArrowRight = ArrowRight;
window.Link = Link;
window.Section = Section;
window.LogoBar = LogoBar;
window.Stat = Stat;
window.Numbered = Numbered;
window.PillarCard = PillarCard;
window.CaseCard = CaseCard;
window.useReveal = useReveal;
