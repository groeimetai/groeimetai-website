export const adminNotificationTemplate = (data: {
  company: string;
  email: string;
  score: number;
  priority: 'high' | 'medium' | 'low';
  reportId: string;
}) => ({
  subject: `[Review Required] MCP Report - ${data.company}`,
  html: `
    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #080D14; color: white; padding: 30px; border-radius: 12px;">
        <h2 style="color: #F87315; margin-bottom: 20px;">Nieuw Assessment Rapport Klaar voor Review</h2>
        
        <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <table style="width: 100%; color: white;">
            <tr>
              <td style="padding: 8px 0;"><strong>Bedrijf:</strong></td>
              <td style="padding: 8px 0;">${data.company}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Contact:</strong></td>
              <td style="padding: 8px 0;">${data.email}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Score:</strong></td>
              <td style="padding: 8px 0;">${data.score}/100</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Prioriteit:</strong></td>
              <td style="padding: 8px 0; text-transform: uppercase;">${data.priority}</td>
            </tr>
          </table>
        </div>

        <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/reports" 
           style="display: inline-block; background: #F87315; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">
          Bekijk in Dashboard
        </a>
      </div>
    </div>
  `,
  text: `
Nieuw assessment rapport klaar voor review:

Bedrijf: ${data.company}
Contact: ${data.email}  
Score: ${data.score}/100
Prioriteit: ${data.priority.toUpperCase()}

Bekijk in dashboard: ${process.env.NEXT_PUBLIC_APP_URL}/admin/reports
  `
});

export const clientReportTemplate = (data: {
  name: string;
  company: string;
  score: number;
  opportunity: string;
  quickWin: string;
  reportUrl: string;
  consultUrl: string;
}) => ({
  subject: 'Jouw MCP Readiness Report is klaar!',
  html: `
    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #080D14; color: white; padding: 30px; border-radius: 12px;">
        <h2 style="color: #F87315; margin-bottom: 20px;">Je persoonlijke Agent Readiness Report is klaar!</h2>
        
        <p style="color: #ffffff; margin-bottom: 20px;">Beste ${data.name},</p>
        
        <div style="background: rgba(248, 115, 21, 0.1); border: 1px solid rgba(248, 115, 21, 0.3); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #F87315; margin-bottom: 15px;">Highlights:</h3>
          <ul style="color: white; margin: 0; padding-left: 20px;">
            <li style="margin-bottom: 8px;">Agent Readiness Score: <strong>${data.score}/100</strong></li>
            <li style="margin-bottom: 8px;">Grootste kans: <strong>${data.opportunity}</strong></li>
            <li style="margin-bottom: 8px;">Quick win: <strong>${data.quickWin}</strong></li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.reportUrl}" 
             style="display: inline-block; background: #F87315; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-right: 15px;">
            📄 Download Report PDF
          </a>
          <a href="${data.consultUrl}" 
             style="display: inline-block; background: transparent; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); font-weight: 600;">
            📅 Plan Gratis Consult
          </a>
        </div>

        <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; margin-top: 30px;">
          <p style="color: rgba(255,255,255,0.7); margin: 0; font-size: 14px;">
            Met vriendelijke groet,<br/>
            <strong style="color: #F87315;">GroeimetAI Team</strong><br/>
            Agent Infrastructure Specialists
          </p>
        </div>
      </div>
    </div>
  `,
  text: `
Beste ${data.name},

Je persoonlijke Agent Readiness Report is klaar!

Highlights:
- Agent Readiness Score: ${data.score}/100
- Grootste kans: ${data.opportunity}
- Quick win: ${data.quickWin}

Download je rapport: ${data.reportUrl}
Plan een gratis consult: ${data.consultUrl}

Met vriendelijke groet,
GroeimetAI Team
Agent Infrastructure Specialists
  `
});

export const reportTemplate = (data: any) => `
# MCP READINESS REPORT
**${data.company}**  
*${new Date().toLocaleDateString('nl-NL')}*

## Executive Summary

- **Overall Agent Readiness Score:** ${data.score}/100
- **Belangrijkste kansen:** ${data.mainOpportunities || 'Multi-agent automation van core business processes'}
- **Quick wins:** ${data.quickWins || 'API documentatie en eerste MCP pilot'}
- **Geschatte ROI:** ${data.estimatedROI || '3-6 maanden terugverdientijd'}

## 1. Huidige Situatie Analyse

### Systeem Inventory
${data.systems.map((system: string) => `- **${system}**: ${getSystemAnalysis(system, data.hasApis)}`).join('\n')}

### Agent Readiness Score Breakdown
- **Technische readiness:** ${Math.round(data.score * 0.25)}/25
- **Organisatorische readiness:** ${Math.round(data.score * 0.25)}/25  
- **Data readiness:** ${Math.round(data.score * 0.25)}/25
- **Security readiness:** ${Math.round(data.score * 0.25)}/25

## 2. Gap Analyse

### Wat ontbreekt voor agent-toegang
${getGapAnalysis(data.barriers, data.systems)}

## 3. Opportunity Matrix

### Quick Wins (Hoge impact, lage effort)
${getQuickWins(data.systems, data.agentGoals)}

### Strategische Projecten (Hoge impact, hoge effort)
${getStrategicProjects(data.systems, data.agentGoals)}

## 4. Aanbevolen Roadmap

### Fase 1: Quick Wins (0-4 weken)
${getPhase1Recommendations(data)}

### Fase 2: Core Implementation (1-3 maanden)
${getPhase2Recommendations(data)}

### Fase 3: Scaling (3-6 maanden)
${getPhase3Recommendations(data)}

## 5. ROI Berekening

- **Tijd besparing:** ${getTimeSavings(data)}/maand
- **Kosten besparing:** ${getCostSavings(data)}/jaar
- **Terugverdientijd:** ${getPaybackPeriod(data)} maanden

## 6. Next Steps

1. **Gratis 30-min consult** - Bespreek rapport en vragen
2. **Assessment verdieping** - Deep-dive technische analyse
3. **Pilot project opties** - Start met hoogste ROI systeem

**Ready om te starten?**  
Plan direct een gratis gesprek: [calendly.com/groeimetai](calendly.com/groeimetai)

---

*Dit rapport is gegenereerd door GroeimetAI Agent Infrastructure specialists. Voor vragen: info@groeimetai.io*
`;

// Helper functions for dynamic content generation
function getSystemAnalysis(system: string, apiStatus: string): string {
  const baseText = apiStatus === 'most' ? 'APIs beschikbaar' : 'API ontwikkeling nodig';
  return `${baseText}, MCP wrapper vereist voor agent toegang`;
}

function getGapAnalysis(barriers: string, systems: string[]): string {
  switch (barriers) {
    case 'technical':
      return 'Technische expertise voor MCP implementatie ontbreekt. Aanbeveling: externe specialisten inschakelen.';
    case 'integration':
      return 'Systemen opereren in silo\'s. Aanbeveling: API-first benadering en centraal MCP platform.';
    case 'starting':
      return 'Strategische planning ontbreekt. Aanbeveling: start met agent readiness assessment en roadmap.';
    case 'resources':
      return 'Beperkte resources. Aanbeveling: gefaseerde aanpak met quick wins eerst.';
    case 'security':
      return 'Compliance zorgen. Aanbeveling: security-first MCP implementatie met audit trails.';
    default:
      return 'Algemene analyse vereist voor specifieke aanbevelingen.';
  }
}

function getQuickWins(systems: string[], goals: string[]): string {
  return `
- API documentatie audit van bestaande systemen
- Proof of concept MCP server voor ${systems[0] || 'hoofdsysteem'}
- Agent toegang tot kennisbank voor ${goals.includes('Klantvragen automatisch beantwoorden') ? 'customer service' : 'interne processen'}
`;
}

function getStrategicProjects(systems: string[], goals: string[]): string {
  return `
- Complete MCP infrastructure voor ${systems.slice(0, 3).join(', ')}
- Multi-agent orchestration platform
- Cross-system data synchronisatie via agents
`;
}

function getPhase1Recommendations(data: any): string {
  return `
- Assessment van ${data.systems[0] || 'prioriteit systeem'} APIs
- MCP protocol evaluatie
- Security & compliance review
- **Kosten:** €2.500 - €5.000
- **Opbrengst:** Duidelijkheid en concrete roadmap
`;
}

function getPhase2Recommendations(data: any): string {
  return `
- MCP server development voor top 2 systemen
- Agent testing en validatie
- Team training en documentatie
- **Kosten:** €15.000 - €35.000
- **Opbrengst:** Werkende agent integraties
`;
}

function getPhase3Recommendations(data: any): string {
  return `
- Multi-agent orchestration implementatie
- Advanced workflow automation
- Performance monitoring en optimalisatie
- **Kosten:** €25.000 - €75.000
- **Opbrengst:** Complete agent ecosysteem
`;
}

function getTimeSavings(data: any): string {
  const employeeCount = data.employees === '250+' ? 1000 : 
                       data.employees === '51-250' ? 150 : 
                       data.employees === '11-50' ? 30 : 10;
  return `${Math.round(employeeCount * 2)} uur`;
}

function getCostSavings(data: any): string {
  const employeeCount = data.employees === '250+' ? 1000 : 
                       data.employees === '51-250' ? 150 : 
                       data.employees === '11-50' ? 30 : 10;
  return `€${Math.round(employeeCount * 50 * 12).toLocaleString()}`;
}

function getPaybackPeriod(data: any): string {
  if (data.timeline === 'asap') return '2-3';
  if (data.timeline === '3months') return '4-6';
  return '6-12';
}