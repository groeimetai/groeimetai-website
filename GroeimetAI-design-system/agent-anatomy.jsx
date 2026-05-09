/* ===== AgentAnatomy: interactive folder demo for hero =====
   An agent = Folder (knowledge) + Instructions + Tools.
   Single visual element. No external deps beyond React. */

const AgentAnatomy = () => {
  const [active, setActive] = React.useState("folders");
  const [openFile, setOpenFile] = React.useState(null);

  const tabs = [
    { id: "folders",      label: "Folders",      Glyph: IconFolder,       count: 12 },
    { id: "instructions", label: "Instructies",  Glyph: IconInstructions, count: 1 },
    { id: "tools",        label: "Tools",        Glyph: IconTool,         count: 4 },
  ];

  const folderTree = [
    { name: "knowledge/", type: "dir", open: true, children: [
      { name: "klant-onboarding.md",   type: "file", size: "4.2kb", lang: "md" },
      { name: "tone-of-voice.md",      type: "file", size: "1.1kb", lang: "md" },
      { name: "facturatie-faq.md",     type: "file", size: "8.9kb", lang: "md" },
      { name: "product-specs.json",    type: "file", size: "12kb",  lang: "json" },
    ]},
    { name: "voorbeelden/", type: "dir", open: true, children: [
      { name: "goede-reactie-01.md",   type: "file", size: "2.3kb", lang: "md" },
      { name: "afgewezen-deal.md",     type: "file", size: "1.7kb", lang: "md" },
    ]},
    { name: "context.md", type: "file", size: "0.8kb", lang: "md", root: true },
  ];

  const instructionLines = [
    { type: "comment", text: "// SYSTEM PROMPT — AccountAgent v3" },
    { type: "blank" },
    { type: "text", text: "Jij bent een account-assistent voor sales engineers." },
    { type: "text", text: "Antwoord in NL, kort en concreet. Geen marketing-taal." },
    { type: "blank" },
    { type: "rule", text: "1. Lees altijd eerst de relevante folder uit knowledge/" },
    { type: "rule", text: "2. Twijfel? Vraag door — geen aannames over prijs of scope." },
    { type: "rule", text: "3. Plan-acties altijd via planMeeting() — niet inline beantwoorden." },
    { type: "rule", text: "4. Als de vraag buiten scope valt: escaleer naar Niels." },
    { type: "blank" },
    { type: "comment", text: "// edge cases" },
    { type: "text", text: "Bij vragen over facturatie → tool: lookupInvoice()" },
    { type: "text", text: "Bij offerte-aanvraag → tool: createDraft()" },
  ];

  const tools = [
    { name: "lookupInvoice",  desc: "Haalt openstaande facturen op uit Exact Online.",       params: "(klantId: string)", source: "exact-online" },
    { name: "planMeeting",    desc: "Boekt een slot in Niels' agenda met confirmatie-mail.",  params: "(slot: ISODate, met: string)", source: "google-calendar" },
    { name: "createDraft",    desc: "Genereert een offerte-concept op basis van scope.",       params: "(scope: Scope)", source: "internal" },
    { name: "searchSlack",    desc: "Doorzoekt #klanten kanaal naar eerdere context.",         params: "(query: string)", source: "slack" },
  ];

  return (
    <div className="anatomy">
      <div className="anatomy-chrome">
        <div className="anatomy-dots">
          <span></span><span></span><span></span>
        </div>
        <div className="anatomy-title mono">~/agents/account-assistent</div>
        <div className="anatomy-status mono"><span className="dot"></span>active</div>
      </div>

      <div className="anatomy-tabs">
        {tabs.map(t => {
          const G = t.Glyph;
          return (
            <button
              key={t.id}
              className={"anatomy-tab " + (active === t.id ? "is-active" : "")}
              onClick={() => setActive(t.id)}
            >
              <span className="anatomy-tab-glyph"><G size={15}/></span>
              <span>{t.label}</span>
              <span className="anatomy-tab-count mono">{t.count}</span>
            </button>
          );
        })}
      </div>

      <div className="anatomy-body">
        {active === "folders" && (
          <div className="anatomy-folders">
            <div className="anatomy-tree">
              {folderTree.map((node, i) => (
                <FolderNode key={i} node={node} onOpen={setOpenFile} openFile={openFile} />
              ))}
            </div>
            <div className="anatomy-preview">
              {openFile ? (
                <FilePreview file={openFile} />
              ) : (
                <div className="anatomy-empty">
                  <div className="mono" style={{fontSize: 11, color: "var(--fg-mute)", marginBottom: 12}}>// preview</div>
                  <div style={{color: "var(--fg-dim)", fontSize: 14, lineHeight: 1.6}}>
                    Klik op een bestand links. Dit is wat de agent <em>weet</em>: jouw eigen documentatie, tone of voice, voorbeelden. Geen vage trainingsdata.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {active === "instructions" && (
          <div className="anatomy-instructions">
            <div className="anatomy-lineno mono">
              {instructionLines.map((_, i) => <div key={i}>{(i+1).toString().padStart(2, "0")}</div>)}
            </div>
            <pre className="anatomy-code">
              {instructionLines.map((line, i) => (
                <div key={i} className={"line line-" + line.type}>
                  {line.type === "blank" ? "\u00A0" : line.text}
                </div>
              ))}
            </pre>
          </div>
        )}

        {active === "tools" && (
          <div className="anatomy-tools">
            {tools.map((t, i) => (
              <div className="anatomy-tool" key={i} style={{animationDelay: (i*60)+"ms"}}>
                <div className="anatomy-tool-head">
                  <span className="anatomy-tool-name mono">{t.name}<span className="anatomy-tool-params">{t.params}</span></span>
                  <span className="anatomy-tool-source mono">{t.source}</span>
                </div>
                <div className="anatomy-tool-desc">{t.desc}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="anatomy-foot mono">
        <span>$ agent.invoke()</span>
        <span className="anatomy-foot-spacer">→</span>
        <span style={{color: "var(--accent)"}}>1 antwoord, geen hallucinatie.</span>
      </div>
    </div>
  );
};

const FolderNode = ({ node, depth = 0, onOpen, openFile }) => {
  const [open, setOpen] = React.useState(node.open !== false);
  const isActive = openFile && openFile.name === node.name;
  if (node.type === "dir") {
    return (
      <div className="tree-node">
        <button className="tree-row" onClick={() => setOpen(!open)} style={{paddingLeft: 8 + depth*16}}>
          <span className="tree-caret" style={{transform: open ? "rotate(90deg)" : "none"}}>▸</span>
          <span className="tree-glyph"><IconFolder size={13}/></span>
          <span className="tree-name">{node.name}</span>
        </button>
        {open && (
          <div>
            {node.children.map((c, i) => (
              <FolderNode key={i} node={c} depth={depth+1} onOpen={onOpen} openFile={openFile} />
            ))}
          </div>
        )}
      </div>
    );
  }
  return (
    <button
      className={"tree-row tree-file " + (isActive ? "is-active" : "")}
      onClick={() => onOpen(node)}
      style={{paddingLeft: 8 + depth*16}}
    >
      <span className="tree-caret" style={{visibility: "hidden"}}>▸</span>
      <span className="tree-glyph">{node.lang === "json" ? <span className="mono" style={{fontSize: 10}}>{"{ }"}</span> : <IconNotes size={13}/>}</span>
      <span className="tree-name">{node.name}</span>
      <span className="tree-size mono">{node.size}</span>
    </button>
  );
};

const FilePreview = ({ file }) => {
  const samples = {
    "tone-of-voice.md": [
      "# Tone of Voice",
      "",
      "- Direct. Geen 'wij geloven dat'.",
      "- Nederlands, met Engelse tech-termen waar nodig.",
      "- Voorbeelden boven beweringen.",
      "- Geen emoji's in zakelijke mail.",
    ],
    "klant-onboarding.md": [
      "# Onboarding stappen",
      "",
      "1. Kickoff binnen 5 werkdagen.",
      "2. Workshop met use-case eigenaar.",
      "3. Eerste pilot live binnen 3 weken.",
      "4. Wekelijkse check-ins met team.",
    ],
    "facturatie-faq.md": [
      "# Facturatie FAQ",
      "",
      "## Wanneer wordt er gefactureerd?",
      "Maandelijks achteraf, op de 1e.",
      "",
      "## Welke betaaltermijn?",
      "14 dagen netto.",
    ],
    "product-specs.json": [
      "{",
      "  \"model\": \"sonnet-4\",",
      "  \"context_window\": 200000,",
      "  \"tools\": [\"lookupInvoice\", \"planMeeting\"],",
      "  \"temperature\": 0.2",
      "}",
    ],
    "goede-reactie-01.md": [
      "# Voorbeeld: goede reactie",
      "",
      "Vraag: 'Kunnen we dit ook zonder Microsoft?'",
      "",
      "Antwoord: 'Ja. Standaard draait dit op AWS,",
      "maar we kunnen Azure of self-hosted leveren.",
      "Wat is voor jullie de doorslag?'",
    ],
    "afgewezen-deal.md": [
      "# Waarom we deze deal lieten lopen",
      "",
      "- Scope onhelder na 3 calls.",
      "- Klant wilde 'agent' zonder use case.",
      "- Geen eigenaar binnen org.",
    ],
    "context.md": [
      "# Bedrijfscontext",
      "",
      "GroeimetAI helpt teams AI nuchter inzetten.",
      "Doelgroep: MKB tot enterprise, NL.",
      "Niels van der Werf is contactpersoon.",
    ],
  };
  const lines = samples[file.name] || ["// no preview available"];
  return (
    <div className="file-preview">
      <div className="file-preview-head mono">{file.name}</div>
      <pre className="file-preview-body mono">
        {lines.map((l, i) => (
          <div key={i} className={"fp-line " + (l.startsWith("#") ? "fp-h" : l.startsWith("//") ? "fp-c" : "")}>
            <span className="fp-ln">{(i+1).toString().padStart(2,"0")}</span>
            <span>{l || "\u00A0"}</span>
          </div>
        ))}
      </pre>
    </div>
  );
};

window.AgentAnatomy = AgentAnatomy;
