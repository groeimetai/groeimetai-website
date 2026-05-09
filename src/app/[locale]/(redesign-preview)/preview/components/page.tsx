'use client';

import {
  Btn,
  Eyebrow,
  Section,
  Stat,
  Numbered,
  PillarCard,
  CaseCard,
  LogoBar,
  Pill,
  Tag,
  DsLink,
  LogoMark,
  IconFolder,
  IconInstructions,
  IconTool,
  IconArrow,
  IconMail,
  IconPhone,
  IconPin,
  IconGithub,
  IconCheck,
  IconBolt,
  IconChat,
  IconCode,
  IconTerminal,
  IconBook,
  IconUsers,
  IconShield,
  IconGraph,
  IconSpark,
  IconSearch,
  IconClock,
} from '@/components/ds';

export default function PreviewPage() {
  return (
    <div className="ds">
      <Section>
        <Eyebrow>Design system preview</Eyebrow>
        <h1 style={{ marginTop: 24 }}>
          GroeimetAI — <em style={{ color: 'var(--accent)', fontStyle: 'normal' }}>UI primitives</em>
        </h1>
        <p className="lead" style={{ marginTop: 24 }}>
          QA-harnas voor Fase 0. Alle primitives uit het design system in één oogopslag.
        </p>

        <div className="row" style={{ marginTop: 36, gap: 12 }}>
          <Btn variant="primary">
            Primary action <IconArrow size={14} />
          </Btn>
          <Btn variant="ghost">Ghost action</Btn>
          <DsLink href="#">Tekstlink</DsLink>
        </div>

        <div className="row" style={{ marginTop: 24, gap: 12, flexWrap: 'wrap' }}>
          <Pill>Beschikbaar voor Q3 trajecten</Pill>
          <Tag>FOLDERS</Tag>
          <Tag>INSTRUCTIES</Tag>
          <Tag>TOOLS</Tag>
        </div>
      </Section>

      <Section tight>
        <Eyebrow>Logo bar</Eyebrow>
        <div style={{ marginTop: 32 }}>
          <LogoBar />
        </div>
      </Section>

      <Section>
        <div className="sec-head">
          <div>
            <Eyebrow>Three pillars</Eyebrow>
            <h2 style={{ marginTop: 16 }}>De drie bouwstenen van een agent</h2>
          </div>
          <div className="sec-head-right">
            <p className="lead">
              Elke effectieve agent begint met dezelfde basis: een goed gestructureerde folder, heldere instructies en de
              juiste tools.
            </p>
          </div>
        </div>

        <div className="ds-grid-3">
          <PillarCard
            tag="01 / FOLDERS"
            title="Kennis als folderstructuur"
            desc="Geen vage prompts. Een agent weet wat hij weet doordat zijn kennis netjes in mappen staat."
            items={['Documenten geordend per domein', 'Klantcontext apart van product', 'Versie-controle in je repo']}
          />
          <PillarCard
            tag="02 / INSTRUCTIES"
            title="Een korte, scherpe rolomschrijving"
            desc="Wat mag de agent wel, wat niet, en in welke toon? Eén bestand. Iedereen leesbaar."
            items={['Doel + grenzen', 'Toon en stijl', 'Wanneer terug naar mens']}
          />
          <PillarCard
            tag="03 / TOOLS"
            title="Concrete acties die hij kan uitvoeren"
            desc="API's, scripts en zoekopdrachten — gedefinieerd, gedocumenteerd, en niet meer dan nodig."
            items={['Read- en write-grenzen', 'Audit log per call', 'Tools toevoegen wanneer nodig']}
          />
        </div>
      </Section>

      <Section light>
        <div className="sec-head">
          <div>
            <Eyebrow>Approach</Eyebrow>
            <h2 style={{ marginTop: 16 }}>Hoe we het aanpakken</h2>
          </div>
          <div className="sec-head-right">
            <p className="lead">In vier stappen van eerste sessie naar productie-klare agent.</p>
          </div>
        </div>

        <div className="steps">
          <div className="step">
            <div className="step-n">STAP 01</div>
            <h4>Intake</h4>
            <p>1 sessie. Wat moet de agent kunnen, voor wie, en met welke data?</p>
          </div>
          <div className="step">
            <div className="step-n">STAP 02</div>
            <h4>Folders + instructies</h4>
            <p>We bouwen de basis-structuur en de eerste systemprompt samen met je team.</p>
          </div>
          <div className="step">
            <div className="step-n">STAP 03</div>
            <h4>Tools</h4>
            <p>API's of scripts die de agent nodig heeft, met audit-logging vanaf dag 1.</p>
          </div>
          <div className="step">
            <div className="step-n">STAP 04</div>
            <h4>Iteratie</h4>
            <p>Live testen, bijschaven, en je team weet hoe ze het zelf onderhouden.</p>
          </div>
        </div>
      </Section>

      <Section>
        <Eyebrow>Stats</Eyebrow>
        <div className="ds-grid-3" style={{ marginTop: 32 }}>
          <Stat num="0" label="Prijslijsten" suffix="" />
          <Stat num="3" label="Bouwstenen" suffix="x" />
          <Stat num="100" label="Open en transparant" suffix="%" />
        </div>
      </Section>

      <Section>
        <Eyebrow>Case cards</Eyebrow>
        <div className="ds-grid-3" style={{ marginTop: 32 }}>
          <CaseCard
            industry="FINANCE"
            title="Compliance-agent voor offerte-review"
            snippet="Honderd offertes per week, allemaal langs één agent met scherpe regels. Doorlooptijd van 2 dagen naar 20 minuten."
            metric={{ num: '20×', label: 'sneller' }}
          />
          <CaseCard
            industry="LEGAL"
            title="Contract-extractie zonder hallucinaties"
            snippet="Een folderstructuur per cliënt + tools voor metadata-extractie. Zero false positives na week 2."
            metric={{ num: '0', label: 'fouten in 4 weken' }}
          />
          <CaseCard
            industry="OPS"
            title="Support-agent met audit log"
            snippet="Tier-1 vragen geautomatiseerd, alle escalaties met context naar de juiste persoon."
            metric={{ num: '78%', label: 'first-touch resolved' }}
          />
        </div>
      </Section>

      <Section>
        <Eyebrow>Numbered list</Eyebrow>
        <div style={{ marginTop: 32 }}>
          <Numbered n="01" title="Begin bij de basis">
            Een agent is niet magisch. Het is een folder + instructies + tools. Wie de basis snapt, houdt kosten laag.
          </Numbered>
          <Numbered n="02" title="Gebruik wat je hebt">
            Je documenten staan al ergens. Je tooling werkt al. We bouwen de agent rond wat al bestaat, niet erop bovenop.
          </Numbered>
          <Numbered n="03" title="Houd de regie in huis">
            We trainen je team zodat de agent ook over zes maanden nog past bij wat jullie doen.
          </Numbered>
        </div>
      </Section>

      <Section>
        <Eyebrow>Big quote</Eyebrow>
        <div className="ds-grid-2" style={{ marginTop: 32, alignItems: 'center' }}>
          <div className="bigquote">
            "Het probleem is meestal niet dat je te weinig AI hebt. Het is dat er geen heldere basis is."
          </div>
          <div className="bigquote-source">
            <div className="bigquote-avatar">N</div>
            <div>
              Niels van der Werf
              <br />
              Founder, GroeimetAI
            </div>
          </div>
        </div>
      </Section>

      <Section>
        <Eyebrow>Q-block + Checklist</Eyebrow>
        <div className="ds-grid-2" style={{ marginTop: 32, gap: 48 }}>
          <div className="q-block">
            <p className="q-block-text">"Geen prijs nodig. Wel een goede folderstructuur."</p>
            <div className="q-block-author">— ELKE TEAM-LEAD DIE WE GETRAIND HEBBEN</div>
          </div>
          <div>
            <h3>Wat je niet meer nodig hebt</h3>
            <div className="checklist">
              <div className="checklist-item">
                <div className="x">
                  <IconX />
                </div>
                <div>Een dure SaaS-tool die "AI" in de naam heeft</div>
              </div>
              <div className="checklist-item">
                <div className="x">
                  <IconX />
                </div>
                <div>Vendor lock-in op een propriëtair agent-framework</div>
              </div>
              <div className="checklist-item">
                <div className="x">
                  <IconX />
                </div>
                <div>Een team van 5 mensen om er één werkend te krijgen</div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section>
        <Eyebrow>Signature + Page head</Eyebrow>
        <div style={{ marginTop: 32, display: 'grid', gap: 24 }}>
          <div className="signature">
            <div className="signature-avatar">N</div>
            <div>
              <div className="signature-name">Niels van der Werf</div>
              <div className="signature-role">FOUNDER · GROEIMETAI</div>
            </div>
          </div>
          <div className="crumbs">
            <span>Home</span>
            <span className="sep">/</span>
            <span>Trainingen</span>
            <span className="sep">/</span>
            <span className="current">Workshop</span>
          </div>
        </div>
      </Section>

      <Section>
        <Eyebrow>CTA block</Eyebrow>
        <div className="cta-block" style={{ marginTop: 32 }}>
          <div className="cta-block-inner">
            <Tag>NEXT STEP</Tag>
            <h2 style={{ marginTop: 16 }}>Aan de slag in één sessie</h2>
            <p style={{ maxWidth: 540, marginTop: 16 }}>
              Boek een intake. We kijken één uur naar wat je hebt, en je krijgt een concreet folderplan voor je eerste
              agent — zonder verplichtingen.
            </p>
            <div className="row">
              <Btn variant="primary">
                Plan een intake <IconArrow size={14} />
              </Btn>
              <Btn variant="ghost">Lees hoe we werken</Btn>
            </div>
          </div>
        </div>
      </Section>

      <Section>
        <Eyebrow>Icons</Eyebrow>
        <div
          style={{
            marginTop: 32,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: 12,
          }}
        >
          {[
            { Icon: LogoMark, name: 'LogoMark' },
            { Icon: IconFolder, name: 'Folder' },
            { Icon: IconInstructions, name: 'Instructions' },
            { Icon: IconTool, name: 'Tool' },
            { Icon: IconArrow, name: 'Arrow' },
            { Icon: IconCheck, name: 'Check' },
            { Icon: IconBolt, name: 'Bolt' },
            { Icon: IconChat, name: 'Chat' },
            { Icon: IconCode, name: 'Code' },
            { Icon: IconTerminal, name: 'Terminal' },
            { Icon: IconBook, name: 'Book' },
            { Icon: IconUsers, name: 'Users' },
            { Icon: IconShield, name: 'Shield' },
            { Icon: IconGraph, name: 'Graph' },
            { Icon: IconSpark, name: 'Spark' },
            { Icon: IconSearch, name: 'Search' },
            { Icon: IconClock, name: 'Clock' },
            { Icon: IconMail, name: 'Mail' },
            { Icon: IconPhone, name: 'Phone' },
            { Icon: IconPin, name: 'Pin' },
            { Icon: IconGithub, name: 'Github' },
          ].map(({ Icon, name }) => (
            <div
              key={name}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                padding: 16,
                border: '1px solid var(--line)',
                borderRadius: 8,
                background: 'var(--bg-elev)',
              }}
            >
              <Icon size={24} />
              <div className="mono" style={{ fontSize: 11, color: 'var(--fg-mute)' }}>
                {name}
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function IconX({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M6 6 L18 18" />
      <path d="M18 6 L6 18" />
    </svg>
  );
}
