import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  try {
    // Serve the pre-made HTML template
    const templatePath = path.join(process.cwd(), 'public', 'downloads', 'mcp-guide-template.html');
    
    if (fs.existsSync(templatePath)) {
      const htmlContent = fs.readFileSync(templatePath, 'utf8');
      return new NextResponse(htmlContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': 'inline; filename="GroeimetAI-MCP-Guide.html"',
        },
      });
    } else {
      // Fallback to generated content
      const htmlContent = generateMcpGuideHTML();
      return new NextResponse(htmlContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
        },
      });
    }
  } catch (error) {
    console.error('PDF generation error:', error);
    
    // Final fallback
    const htmlContent = generateMcpGuideHTML();
    return new NextResponse(htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    });
  }
}

async function generateMcpGuidePDF(outputPath: string): Promise<void> {
  // Generate HTML content and write as HTML file for now
  const htmlContent = generateMcpGuideHTML();
  // Write as .html instead of .pdf for now, since we're serving HTML
  const htmlPath = outputPath.replace('.pdf', '.html');
  fs.writeFileSync(htmlPath, htmlContent);
  // Copy to original path for compatibility
  fs.writeFileSync(outputPath, htmlContent);
}

function generateMcpGuideHTML(): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>MCP Guide - GroeimetAI</title>
  <style>
    body { font-family: system-ui, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 40px 20px; }
    h1, h2 { color: #F87315; }
    .header { text-align: center; margin-bottom: 40px; }
    .chapter { margin-bottom: 40px; page-break-inside: avoid; }
    .highlight { background: rgba(248, 115, 21, 0.1); padding: 15px; border-left: 4px solid #F87315; margin: 20px 0; }
    @media print { body { font-size: 12px; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>Van API naar Agent-Ready</h1>
    <h2>De Praktische MCP Guide</h2>
    <p><em>Door GroeimetAI - Agent Infrastructure Specialists</em></p>
  </div>
  
  ${getMcpGuideContent()}
</body>
</html>
  `;
}

function getMcpGuideContent(): string {
  return `
<div class="chapter">
  <h1>Hoofdstuk 1: De Agent Revolutie</h1>
  <p><strong>2025 wordt het jaar van AI agents.</strong> Niet chatbots die vragen beantwoorden, maar autonome systemen die taken uitvoeren, beslissingen nemen, en processen automatiseren.</p>
  
  <div class="highlight">
    <strong>Het probleem:</strong> Jouw APIs zijn gemaakt voor mensen, niet voor agents. Agents "zien" ze niet, begrijpen ze niet, kunnen er niet mee werken.
  </div>
  
  <p>Deze agents hebben één ding nodig: toegang tot jouw bedrijfssystemen. Ze moeten tickets kunnen aanmaken, data kunnen opvragen, workflows kunnen triggeren.</p>
</div>

<div class="chapter">
  <h1>Hoofdstuk 2: Waarom APIs Niet Genoeg Zijn</h1>
  
  <h2>REST APIs - Voor Mensen</h2>
  <ul>
    <li>Handmatige documentatie</li>
    <li>Geen auto-discovery</li>
    <li>Complex authentication</li>
    <li>Per agent custom integratie</li>
  </ul>
  
  <h2>MCP Servers - Voor Agents</h2>
  <ul>
    <li>Self-describing interfaces</li>
    <li>Automatische discovery</li>
    <li>Built-in security</li>
    <li>Universal agent compatibility</li>
  </ul>
  
  <div class="highlight">
    <strong>De kern:</strong> APIs zijn perfect voor wat ze doen. MCP is een extra laag die agents helpt om APIs te ontdekken, begrijpen en gebruiken - automatisch.
  </div>
</div>

<div class="chapter">
  <h1>Hoofdstuk 3: De Business Case</h1>
  
  <h2>Concrete Resultaten</h2>
  <ul>
    <li><strong>70% minder handmatig werk</strong> - Agents nemen routine taken over</li>
    <li><strong>24/7 beschikbaarheid</strong> - Geen wacht- of kantooruren</li>
    <li><strong>85% snellere afhandeling</strong> - Van uren naar minuten</li>
  </ul>
  
  <h2>ROI Voorbeelden</h2>
  <p><strong>Klein MKB (10-50 medewerkers):</strong></p>
  <ul>
    <li>Investering: €5k-15k</li>
    <li>Besparing: €25k-50k/jaar</li>
    <li>Terugverdientijd: 3-6 maanden</li>
  </ul>
  
  <p><strong>Enterprise (250+ medewerkers):</strong></p>
  <ul>
    <li>Investering: €50k-150k</li>
    <li>Besparing: €200k-500k/jaar</li>
    <li>Terugverdientijd: 3-6 maanden</li>
  </ul>
</div>

<div class="chapter">
  <h1>Hoofdstuk 4: Implementatie Roadmap</h1>
  
  <h2>Fase 1: Assessment (Week 1-2)</h2>
  <ul>
    <li>System inventory en API audit</li>
    <li>Use case definitie</li>
    <li>Technical readiness check</li>
    <li>Kosten: €2.500 - €5.000</li>
  </ul>
  
  <h2>Fase 2: Pilot (Week 3-8)</h2>
  <ul>
    <li>MCP wrapper development voor één systeem</li>
    <li>Agent testing en validatie</li>
    <li>Proof of value demonstratie</li>
    <li>Kosten: €15.000 - €35.000</li>
  </ul>
  
  <h2>Fase 3: Scale (Maand 3-6)</h2>
  <ul>
    <li>Multi-system integratie</li>
    <li>Agent orchestration platform</li>
    <li>Complete ecosystem automation</li>
    <li>Kosten: €25.000 - €75.000</li>
  </ul>
</div>

<div class="chapter">
  <h1>Hoofdstuk 5: Security & Compliance</h1>
  
  <h2>Veiligheids Principes</h2>
  <ul>
    <li><strong>Least Privilege Access:</strong> Agents krijgen alleen toegang tot wat ze nodig hebben</li>
    <li><strong>Audit Trails:</strong> Elke agent actie wordt gelogd en traceerbaar</li>
    <li><strong>Token-based Auth:</strong> Geen wachtwoorden, alleen tijdelijke tokens</li>
    <li><strong>Rate Limiting:</strong> Agents kunnen geen systemen overbelasten</li>
  </ul>
  
  <div class="highlight">
    <strong>GDPR & Compliance:</strong> Agent toegang valt onder bestaande data governance. Geen nieuwe privacy risico's, alleen gecontroleerde automatisering.
  </div>
</div>

<div class="chapter">
  <h1>Hoofdstuk 6: Veelvoorkomende Uitdagingen</h1>
  
  <h2>"Onze systemen zijn te oud"</h2>
  <p><strong>Oplossing:</strong> Legacy API wrappers. Elke database, elk systeem kan agent-accessible worden gemaakt.</p>
  
  <h2>"We hebben geen APIs"</h2>
  <p><strong>Oplossing:</strong> API development als eerste stap. Van database naar REST naar MCP.</p>
  
  <h2>"Security concerns"</h2>
  <p><strong>Oplossing:</strong> Start met read-only toegang. Bewijs veiligheid voordat je write access geeft.</p>
  
  <h2>"Te complex voor ons team"</h2>
  <p><strong>Oplossing:</strong> Externe MCP specialists. Focus op je core business, laat experts de agent infrastructure bouwen.</p>
</div>

<div class="chapter">
  <h1>Hoofdstuk 7: Jouw Next Steps</h1>
  
  <h2>Agent Readiness Checklist</h2>
  <p><strong>Technisch:</strong></p>
  <ul>
    <li>System inventory compleet</li>
    <li>API documentatie up-to-date</li>
    <li>Security requirements gedefinieerd</li>
    <li>Pilot use case gekozen</li>
  </ul>
  
  <p><strong>Organisatorisch:</strong></p>
  <ul>
    <li>Stakeholder buy-in</li>
    <li>Budget goedgekeurd</li>
    <li>Team capaciteit vrijgemaakt</li>
    <li>Success metrics gedefinieerd</li>
  </ul>
  
  <h2>Ready om te Starten?</h2>
  <ul>
    <li><strong>Optie 1:</strong> Agent Readiness Assessment (5 min, gratis)</li>
    <li><strong>Optie 2:</strong> Strategisch consult (30 min, gratis)</li>
    <li><strong>Optie 3:</strong> Technical deep-dive (2 uur, €500)</li>
  </ul>
  
  <div class="highlight">
    <p><strong>Contact GroeimetAI:</strong></p>
    <p>📧 info@groeimetai.io<br/>
    📞 +31 (6) 81 739 018<br/>
    🌐 groeimetai.io<br/>
    💻 github.com/GroeimetAI</p>
  </div>
</div>

<footer style="text-align: center; margin-top: 60px; padding-top: 20px; border-top: 1px solid #ccc;">
  <p><em>© 2025 GroeimetAI. Agent Infrastructure Specialists.</em></p>
</footer>

---

## Hoofdstuk 1: De Agent Revolutie

2025 wordt het jaar waarin AI agents mainstream worden. Niet chatbots die vragen beantwoorden, maar autonome systemen die:

✓ Taken uitvoeren zonder menselijke tussenkomst
✓ Beslissingen nemen op basis van bedrijfsregels  
✓ Processen automatiseren van A tot Z
✓ 24/7 beschikbaar zijn voor klanten en collega's

**Het probleem:** Jouw bedrijfssystemen "praten" geen agent-taal.

---

## Hoofdstuk 2: APIs vs Agent Toegang

### Waarom REST APIs Niet Genoeg Zijn

**Voor mensen gemaakt:**
• Handmatige documentatie
• Complex authentication
• Geen standaard discovery
• Per use case custom integratie

**Agents hebben nodig:**
• Automatische interface discovery
• Self-describing endpoints  
• Universeel protocol
• Plug & play connectivity

### MCP: De Missing Link

Model Context Protocol (MCP) is de universele taal tussen APIs en agents. Het wraps jouw bestaande APIs in een agent-vriendelijke interface.

**Voordelen:**
✓ Behoud je bestaande APIs
✓ Geen systeem rebuild nodig
✓ Werkt met alle agent platforms
✓ Veilig en gecontroleerd

---

## Hoofdstuk 3: Business Impact

### Concrete Resultaten van Agent-Ready Systemen

**Klantenservice:**
• 80% van vragen automatisch beantwoord
• Van uren naar seconden response tijd
• 24/7 beschikbaarheid zonder extra personeel

**Operations:**
• 70% minder handmatige data entry
• Automatische cross-system updates
• Real-time proces optimalisatie

**Management:**
• Instant rapportages op verzoek
• Predictive analytics door agents
• Data-driven besluitvorming

### ROI Berekening

**Klein MKB (10-50 medewerkers):**
• Investering: €5k-15k
• Besparing: €25k-50k/jaar
• Terugverdientijd: 3-6 maanden

**Enterprise (250+ medewerkers):**
• Investering: €50k-150k
• Besparing: €200k-500k/jaar  
• Terugverdientijd: 3-6 maanden

---

## Hoofdstuk 4: Implementatie Roadmap

### Fase 1: Assessment (Week 1-2)
1. **System Inventory**
   - Welke systemen heb je?
   - Welke APIs bestaan er?
   - Wat zijn de prioriteiten?

2. **Use Case Definition**
   - Wat willen agents doen?
   - Waar ligt de grootste impact?
   - Welke processen eerst automatiseren?

3. **Technical Readiness**
   - API maturity check
   - Security requirements
   - Integration possibilities

### Fase 2: Pilot (Week 3-8)
1. **Single System Focus**
   - Kies één systeem voor pilot
   - Ontwikkel MCP wrapper
   - Test met échte agents

2. **Proof of Value**
   - Meet time savings
   - Document process improvements
   - Calculate ROI

### Fase 3: Scale (Maand 3-6)
1. **Multi-System Integration**
   - Uitrollen naar andere systemen
   - Cross-system agent workflows
   - Advanced automation scenarios

2. **Agent Orchestration**
   - Multiple agents samenwerken
   - Complex business processes
   - Full ecosystem automation

---

## Hoofdstuk 5: Security Best Practices

### Authentication & Authorization
• **OAuth 2.0 / JWT tokens** voor agent authenticatie
• **Scoped permissions** - agents krijgen minimale access
• **Session management** - tijdelijke toegang tokens
• **Audit logging** - elke agent actie wordt geregistreerd

### Data Protection
• **Encryption in transit** - alle communicatie beveiligd
• **No data storage** - agents slaan geen data lokaal op
• **GDPR compliance** - bestaande data governance van toepassing
• **Rate limiting** - voorkom system overload

### Monitoring & Control
• **Real-time dashboards** - zie wat agents doen
• **Kill switches** - stop agents instant bij problemen  
• **Performance metrics** - monitor system health
• **Usage analytics** - optimaliseer agent toegang

---

## Hoofdstuk 6: Veelvoorkomende Uitdagingen

### "Onze systemen zijn te oud"
**Oplossing:** Legacy API wrappers. Elke database, elk systeem kan agent-accessible worden gemaakt.

### "We hebben geen APIs"
**Oplossing:** API development als eerste stap. Van database naar REST naar MCP.

### "Security concerns"  
**Oplossing:** Start met read-only toegang. Bewijs veiligheid voordat je write access geeft.

### "Te complex voor ons team"
**Oplossing:** Externe MCP specialists. Focus op je core business, laat experts de agent infrastructure bouwen.

---

## Hoofdstuk 7: De Weg Vooruit

### Jouw Agent Readiness Checklist

**Technisch:**
□ System inventory compleet
□ API documentatie up-to-date  
□ Security requirements gedefinieerd
□ Pilot use case gekozen

**Organisatorisch:**
□ Stakeholder buy-in
□ Budget goedgekeurd
□ Team capaciteit vrijgemaakt
□ Success metrics gedefinieerd

**Strategisch:**
□ Agent strategy gedefinieerd
□ Competitive advantage identified
□ Scaling roadmap klaar
□ ROI targets gesteld

### Ready om te Starten?

**Optie 1:** Agent Readiness Assessment (5 min, gratis)
**Optie 2:** Strategisch consult (30 min, gratis)  
**Optie 3:** Technical deep-dive (2 uur, €500)

---

## Over GroeimetAI

Wij zijn de Agent Infrastructure specialists van Nederland. Sinds 2023 helpen we bedrijven voorbereiden op de agent economie.

**Onze expertise:**
• MCP protocol development
• Multi-agent orchestration  
• Legacy system integration
• Enterprise security compliance

**Contact:**
📧 info@groeimetai.io
📞 +31 (6) 81 739 018
🌐 groeimetai.io
💻 github.com/GroeimetAI

---

*© 2025 GroeimetAI. Agent Infrastructure Specialists.*
  `;
}