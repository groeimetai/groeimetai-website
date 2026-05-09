/* ===== Brand page — logo + icon system showcase ===== */

const BrandPage = ({ go }) => {
  useReveal();
  const [activeLogo, setActiveLogo] = React.useState("growth");

  const concepts = [
    {
      id: "aurora",
      Comp: Logo_Aurora,
      name: "Aurora",
      tag: "Concept 01",
      idea: "Een gelaagd dial-systeem: drie sectoren (folder, instructions, tools) rond een lichtende agent-kern. Vier visuele lagen — outer ring met notches, sectoren met gradient, donkere kern, en een witte agent-node in het midden.",
      vibe: ["gelaagd", "dial-systeem", "lichtend"],
    },
    {
      id: "strata",
      Comp: Logo_Strata,
      name: "Strata",
      tag: "Concept 02",
      idea: "Drie elementen fysiek gestapeld: een folder als basis, een instructie-tablet schuin daarop, een agent-node bovenop met connectie naar de tablet. Letterlijke architectuur van een agent in 3D.",
      vibe: ["sculpturaal", "3D-stapeling", "architectuur"],
    },
    {
      id: "cypher",
      Comp: Logo_Cypher,
      name: "Cypher G",
      tag: "Concept 03",
      idea: "Een G met diagonale stripe-textuur erin, drie node-stippen langs de G-curve (folder/instructions/tools), en een terminal cursor in het midden. Code-DNA in de G zelf.",
      vibe: ["technisch", "monogram", "code-textuur"],
    },
    {
      id: "bloom",
      Comp: Logo_Bloom,
      name: "Bloom Graph",
      tag: "Concept 04",
      idea: "Drie petalen rond een centrale kern, met botanische guide-cirkels en een organische stam naar beneden. De agent als bloeiend organisme — drie inputs die samen een output vormen.",
      vibe: ["botanisch", "organisch", "graph-bloei"],
    },
    {
      id: "mainframe",
      Comp: Logo_Mainframe,
      name: "Mainframe",
      tag: "Concept 05",
      idea: "Een vette G op een donker grid, met dubbele G-laag voor diepte, drie pixel-blokken onderaan (de bouwstenen) en een knipperende cursor rechtsboven. Brutalist-tech, maar warm door het oranje.",
      vibe: ["brutalist", "terminal", "diepte-laag"],
    },
    {
      id: "origami",
      Comp: Logo_Origami,
      name: "Origami",
      tag: "Concept 06",
      idea: "Een gevouwen folder als 3D origami-construct. Drie gefacetteerde vlakken in licht/midden/donker creëren echte ruimtelijke diepte. Architectonisch, premium, totaal niet bestaand in deze hoek.",
      vibe: ["dimensionaal", "premium", "architectonisch"],
    },
  ];

  const ActiveComp = concepts.find(c => c.id === activeLogo).Comp;
  const activeC = concepts.find(c => c.id === activeLogo);

  const iconSet = [
    { Comp: IconFolder, name: "folder" },
    { Comp: IconInstructions, name: "instructions" },
    { Comp: IconTool, name: "tool" },
    { Comp: IconCompass, name: "compass" },
    { Comp: IconBook, name: "book" },
    { Comp: IconUsers, name: "users" },
    { Comp: IconWrench, name: "wrench" },
    { Comp: IconShield, name: "shield" },
    { Comp: IconGraph, name: "graph" },
    { Comp: IconSpark, name: "spark" },
    { Comp: IconArrow, name: "arrow" },
    { Comp: IconCheck, name: "check" },
    { Comp: IconX, name: "x" },
    { Comp: IconPlus, name: "plus" },
    { Comp: IconMail, name: "mail" },
    { Comp: IconPhone, name: "phone" },
    { Comp: IconPin, name: "pin" },
    { Comp: IconGithub, name: "github" },
    { Comp: IconTerminal, name: "terminal" },
    { Comp: IconCode, name: "code" },
    { Comp: IconClock, name: "clock" },
    { Comp: IconLock, name: "lock" },
    { Comp: IconSettings, name: "settings" },
    { Comp: IconLayers, name: "layers" },
    { Comp: IconTarget, name: "target" },
    { Comp: IconChat, name: "chat" },
    { Comp: IconBolt, name: "bolt" },
    { Comp: IconSearch, name: "search" },
    { Comp: IconNotes, name: "notes" },
    { Comp: IconBracket, name: "bracket" },
  ];

  return (
    <div className="page">
      <div className="page-head">
        <div className="glow"></div>
        <div className="container page-head-inner">
          <div className="crumbs"><span>Brand</span><span className="sep">/</span><span className="current">Logo & icon systeem</span></div>
          <h1>Een eigen <em style={{color: "var(--accent)", fontStyle:"normal"}}>visueel</em> systeem.</h1>
          <p>Zes logo-concepten, één icon-set. Klik een concept en zie het in alle contexten — favoriet leidt straks de hele site.</p>
        </div>
      </div>

      {/* Concept grid */}
      <Section>
        <div className="sec-head reveal">
          <div>
            <Eyebrow>Logo concepten · 6 richtingen</Eyebrow>
            <h2 style={{marginTop: 16}}>Klik om te vergelijken.</h2>
          </div>
          <div className="sec-head-right">
            <p className="lead">Elk concept staat voor een ander gevoel — van organisch en speels tot minimalistisch monogram. Ik geef advies onderaan.</p>
          </div>
        </div>

        <div className="logo-grid reveal">
          {concepts.map(c => {
            const M = c.Comp;
            const active = c.id === activeLogo;
            return (
              <button
                key={c.id}
                className={"logo-tile " + (active ? "is-active" : "")}
                onClick={() => setActiveLogo(c.id)}
              >
                <div className="logo-tile-mark">
                  <M size={96}/>
                </div>
                <div className="logo-tile-meta">
                  <div className="mono" style={{fontSize: 10, color: "var(--fg-mute)", letterSpacing: "0.06em"}}>{c.tag}</div>
                  <div style={{fontSize: 15, marginTop: 4, color: active ? "var(--accent)" : "var(--fg)"}}>{c.name}</div>
                </div>
              </button>
            );
          })}
        </div>
      </Section>

      {/* Active concept showcase */}
      <Section light>
        <div className="sec-head reveal">
          <div>
            <Eyebrow>{activeC.tag} · {activeC.name}</Eyebrow>
            <h2 style={{marginTop: 16}}>{activeC.name}</h2>
          </div>
          <div className="sec-head-right">
            <p className="lead">{activeC.idea}</p>
            <div style={{marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap"}}>
              {activeC.vibe.map((v, i) => <span key={i} className="stack-pill mono" style={{background: "var(--paper-elev)", borderColor: "var(--paper-line)", color: "var(--ink-dim)"}}>{v}</span>)}
            </div>
          </div>
        </div>

        {/* Display contexts */}
        <div className="logo-contexts reveal">
          {/* Big mark on dark */}
          <div className="ctx ctx-big-dark">
            <ActiveComp size={160}/>
            <div className="ctx-label mono">Mark · op donker</div>
          </div>
          {/* Big mark on light */}
          <div className="ctx ctx-big-light">
            <ActiveComp size={160} ink="#f6f3ec"/>
            <div className="ctx-label mono">Mark · op licht</div>
          </div>
          {/* On accent */}
          <div className="ctx ctx-on-accent">
            <ActiveComp size={160} accent="#1a0d05" deep="#1a0d05"/>
            <div className="ctx-label mono" style={{color: "rgba(26,13,5,0.6)"}}>Mark · op accent</div>
          </div>
        </div>

        {/* Lockup variants */}
        <div className="lockup-row reveal" style={{marginTop: 32}}>
          <div className="lockup-cell lockup-dark">
            <div style={{display: "inline-flex", alignItems: "center", gap: 16}}>
              <ActiveComp size={64}/>
              <span style={{fontSize: 28, fontWeight: 500, letterSpacing: "-0.02em", color: "var(--fg)"}}>GroeimetAI</span>
            </div>
            <div className="ctx-label mono">Lockup · donker</div>
          </div>
          <div className="lockup-cell lockup-light">
            <div style={{display: "inline-flex", alignItems: "center", gap: 16}}>
              <ActiveComp size={64} ink="#f6f3ec"/>
              <span style={{fontSize: 28, fontWeight: 500, letterSpacing: "-0.02em", color: "var(--ink)"}}>GroeimetAI</span>
            </div>
            <div className="ctx-label mono">Lockup · licht</div>
          </div>
        </div>

        {/* Sizes */}
        <div className="size-row reveal" style={{marginTop: 32}}>
          <div className="size-row-head mono">SCHAAL</div>
          <div className="size-row-marks">
            <ActiveComp size={16} ink="#f6f3ec"/>
            <ActiveComp size={24} ink="#f6f3ec"/>
            <ActiveComp size={32} ink="#f6f3ec"/>
            <ActiveComp size={48} ink="#f6f3ec"/>
            <ActiveComp size={64} ink="#f6f3ec"/>
            <ActiveComp size={96} ink="#f6f3ec"/>
          </div>
        </div>

        {/* In context: business card */}
        <div className="reveal" style={{marginTop: 64, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24}}>
          {/* Card 1: business card */}
          <div className="bizcard">
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "start"}}>
              <div style={{display: "inline-flex", alignItems: "center", gap: 12}}>
                <ActiveComp size={36}/>
                <span style={{fontSize: 16, fontWeight: 500, letterSpacing: "-0.01em", color: "var(--fg)"}}>GroeimetAI</span>
              </div>
              <div className="mono" style={{fontSize: 9, color: "var(--fg-mute)"}}>v1.0</div>
            </div>
            <div style={{marginTop: "auto"}}>
              <div className="mono" style={{fontSize: 11, color: "var(--accent)", letterSpacing: "0.06em", marginBottom: 4}}>FOUNDER</div>
              <div style={{fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em"}}>Niels van der Werf</div>
              <div className="mono" style={{fontSize: 11, color: "var(--fg-mute)", marginTop: 8}}>info@groeimetai.io · +31 6 8173 9018</div>
            </div>
          </div>
          {/* Card 2: app icon */}
          <div className="appicon-grid">
            <div className="appicon-cell appicon-accent">
              <ActiveComp size={72} accent="#1a0d05" deep="#1a0d05"/>
            </div>
            <div className="appicon-cell appicon-dark">
              <ActiveComp size={72}/>
            </div>
            <div className="appicon-cell appicon-light">
              <ActiveComp size={72} ink="#f6f3ec"/>
            </div>
            <div className="appicon-cell appicon-outline">
              <ActiveComp size={72}/>
            </div>
          </div>
        </div>
      </Section>

      {/* Recommendation */}
      <Section>
        <div className="grid-2 reveal" style={{gap: 64}}>
          <div>
            <Eyebrow>Mijn aanbeveling</Eyebrow>
            <h2 style={{marginTop: 16}}>Concept 01 of 03.<br/>Hier is waarom.</h2>
          </div>
          <div>
            <p style={{fontSize: 16}}><strong style={{color: "var(--fg)"}}>Concept 01 (Aurora)</strong> heeft het meest verhaal: drie sectoren = drie agent-bouwstenen, rond een lichtende agent-kern. Vier visuele lagen geven echt diepte. Werkt schaalbaar.</p>
            <p style={{fontSize: 16, marginTop: 16}}><strong style={{color: "var(--fg)"}}>Concept 06 (Origami)</strong> is het meest premium en architectonisch — gefacetteerde 3D-vlakken creëren echte ruimtelijke diepte. Onderscheidend, geen cliché.</p>
            <p style={{fontSize: 16, marginTop: 16}}><strong style={{color: "var(--fg)"}}>Concept 05 (Mainframe)</strong> als je een vette, brutalistische tech-richting wilt — grid-textuur, dubbele G voor diepte, terminal-cursor, drie pixel-blokken voor de bouwstenen.</p>
            <div style={{marginTop: 32, display: "flex", gap: 12, flexWrap: "wrap"}}>
              <Btn variant="primary" onClick={() => alert("Vertel me welk concept je kiest, dan zet ik het door als hoofdlogo.")}>Kies dit als hoofdlogo</Btn>
              <Btn variant="ghost" onClick={() => go("home")}>Terug naar home</Btn>
            </div>
          </div>
        </div>
      </Section>

      {/* Icon system */}
      <Section light>
        <div className="sec-head reveal">
          <div>
            <Eyebrow>Icon systeem</Eyebrow>
            <h2 style={{marginTop: 16}}>{iconSet.length} iconen.<br/>Eén stroke, één stijl.</h2>
          </div>
          <div className="sec-head-right">
            <p className="lead">Monoline, 1.5px stroke, 24×24 grid. Ontworpen om naadloos naast het logo te leven en alle emoji's op de site te vervangen.</p>
          </div>
        </div>

        <div className="icon-grid reveal">
          {iconSet.map((it, i) => {
            const I = it.Comp;
            return (
              <div className="icon-cell" key={i}>
                <div className="icon-cell-glyph">
                  <I size={28} style={{color: "var(--ink)"}}/>
                </div>
                <div className="mono icon-cell-name">{it.name}</div>
              </div>
            );
          })}
        </div>

        {/* Icon usage examples */}
        <div className="reveal" style={{marginTop: 64}}>
          <div className="mono" style={{fontSize: 11, color: "var(--ink-mute)", letterSpacing: "0.06em", marginBottom: 16}}>VARIATIES PER ICON · folder</div>
          <div style={{display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap"}}>
            {[14, 16, 20, 24, 32, 40, 56].map((s, i) => (
              <div key={i} style={{padding: 16, background: "var(--paper-elev)", border: "1px solid var(--paper-line)", borderRadius: 8, color: "var(--ink)"}}>
                <IconFolder size={s}/>
              </div>
            ))}
            <div style={{padding: 16, background: "var(--accent)", border: "1px solid var(--accent)", borderRadius: 8, color: "#1a0d05"}}>
              <IconFolder size={32}/>
            </div>
            <div style={{padding: 16, background: "var(--ink)", border: "1px solid var(--ink)", borderRadius: 8, color: "var(--accent)"}}>
              <IconFolder size={32}/>
            </div>
          </div>
        </div>
      </Section>

      {/* Color tokens */}
      <Section>
        <div className="sec-head reveal">
          <div>
            <Eyebrow>Kleurpalet</Eyebrow>
            <h2 style={{marginTop: 16}}>Donker, papier, vuur.</h2>
          </div>
          <div className="sec-head-right">
            <p className="lead">Drie families. Donker als hoofdthema, warm-papier voor lichte secties, oranje als accent. Geen extra kleuren tenzij ze betekenis hebben.</p>
          </div>
        </div>
        <div className="reveal swatches">
          {[
            { name: "ink-base",    val: "#0a0a0b", token: "--bg",        label: "Hoofdachtergrond" },
            { name: "ink-elev",    val: "#111114", token: "--bg-elev",   label: "Verhoogd vlak" },
            { name: "ink-line",    val: "#26262d", token: "--line",      label: "Borders" },
            { name: "fg",          val: "#f4f4f1", token: "--fg",        label: "Hoofdtekst" },
            { name: "fg-dim",      val: "#a1a1aa", token: "--fg-dim",    label: "Subtekst" },
            { name: "paper",       val: "#f6f3ec", token: "--paper",     label: "Lichte sectie" },
            { name: "paper-line",  val: "#e5e0d4", token: "--paper-line",label: "Lichte border" },
            { name: "ink",         val: "#18181b", token: "--ink",       label: "Tekst op licht" },
            { name: "accent",      val: "#ff5a1f", token: "--accent",    label: "Hot orange" },
            { name: "accent-deep", val: "#b8340a", token: "--accent-deep",label: "Diep oranje" },
          ].map((s, i) => (
            <div key={i} className="swatch">
              <div className="swatch-chip" style={{background: s.val, border: ["fg", "paper", "paper-line"].includes(s.name) ? "1px solid var(--line)" : "none"}}></div>
              <div className="mono swatch-token">{s.token}</div>
              <div className="mono swatch-val">{s.val}</div>
              <div className="swatch-label">{s.label}</div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
};

window.BrandPage = BrandPage;
