// Claude API Integration for Dynamic Report Generation

interface AssessmentData {
  // Enhanced Agent Readiness (15 questions)
  coreBusiness: string;
  systems: string[];
  highestImpactSystem: string;
  hasApis: string;
  dataAccess: string;
  dataLocation: string;
  processDocumentation: string;
  automationExperience: string;
  agentPlatformPreference: string;
  agentPlatforms: string[];
  mainBlocker: string;
  adoptionSpeed: string;
  costOptimization: string;
  budgetReality: string;
  itMaturity: string;
  // Contact info
  name: string;
  role: string;
  company: string;
  email: string;
  phone: string;
}

interface DynamicReport {
  score: number;
  breakdown: ScoreBreakdown;
  actualScores?: {
    api: number;
    data: number;
    process: number;
    team: number;
  };
  executiveSummary: string;
  scoreBreakdownAnalysis?: string;
  criticalFindings?: string;
  readinessGaps?: string;
  opportunities: string;
  industryBenchmark: string;
  recommendations: string;
  conclusions?: string;
  lockedSections: LockedSection[];
  htmlReport?: string;
}

interface ScoreBreakdown {
  technical: number;
  organizational: number;
  strategic: number;
  breakdown: string;
}

interface LockedSection {
  title: string;
  preview: string;
  unlocksWith: 'expert_assessment';
}

export class DynamicReportGenerator {
  private static readonly CLAUDE_API_KEY = process.env.ANTHROPIC_API_KEY;
  
  static async generateFreemiumReport(assessmentData: AssessmentData): Promise<DynamicReport> {
    try {
      // Pre-process assessment data for better Claude prompting
      const processedData = this.preprocessAssessmentData(assessmentData);
      
      // Calculate comprehensive AI maturity score
      const score = this.calculateAIMaturityScore(assessmentData);
      const breakdown = this.generateScoreBreakdown(assessmentData, score);
      
      // Claude prompt for dynamic content with processed data
      const prompt = this.buildEnhancedClaudePrompt(processedData, score);
      
      // Call Claude API
      const dynamicContent = await this.callClaudeAPI(prompt);
      
      // Validate and clean output quality
      const validatedContent = await this.validateOutput(dynamicContent);
      const cleanedContent = this.cleanReportText(validatedContent, assessmentData);
      
      console.log('✅ Claude content validation completed:', {
        executiveSummary: !!validatedContent.executiveSummary,
        scoreBreakdown: !!validatedContent.scoreBreakdownAnalysis,
        criticalFindings: !!validatedContent.criticalFindings,
        readinessGaps: !!validatedContent.readinessGaps,
        opportunities: !!validatedContent.opportunities,
        industryBenchmark: !!validatedContent.industryBenchmark,
        recommendations: !!validatedContent.recommendations,
        conclusions: !!validatedContent.conclusions
      });
      
      // Generate locked content previews
      const lockedSections = this.generateLockedSections(assessmentData);
      
      // Generate branded HTML report with all sections
      const brandedReport = this.generateEnhancedHTMLReport(cleanedContent, assessmentData, score);
      
      return {
        score,
        breakdown,
        actualScores: {
          api: this.calculateAPIMaturityScore(assessmentData),
          data: this.calculateDataMaturityScore(assessmentData), 
          process: this.calculateProcessMaturityScore(assessmentData),
          team: this.calculateOrganizationReadinessScore(assessmentData)
        },
        executiveSummary: cleanedContent.executiveSummary,
        scoreBreakdownAnalysis: cleanedContent.scoreBreakdownAnalysis,
        criticalFindings: cleanedContent.criticalFindings,
        readinessGaps: cleanedContent.readinessGaps,
        opportunities: cleanedContent.opportunities,
        industryBenchmark: cleanedContent.industryBenchmark,
        recommendations: cleanedContent.recommendations,
        conclusions: cleanedContent.conclusions,
        lockedSections,
        htmlReport: brandedReport
      };
      
    } catch (error) {
      console.error('Report generation error:', error);
      // Fallback to template-based report
      return this.generateFallbackReport(assessmentData);
    }
  }

  private static preprocessAssessmentData(rawData: AssessmentData): any {
    // Clean core business description
    const cleanCoreBusiness = (text: string) => {
      if (!text) return '';
      return text
        .replace(/^(wij|we)\s+/gi, '')  // Remove wij/we from start
        .replace(/\s+(wij|we)\s+/gi, ' ') // Remove wij/we from middle
        .replace(/ons bedrijf/gi, 'het bedrijf')
        .replace(/onze/gi, 'de')
        .trim();
    };

    // Process all text fields
    const processed = {
      ...rawData,
      coreBusiness_raw: rawData.coreBusiness,
      coreBusiness_clean: cleanCoreBusiness(rawData.coreBusiness),
      businessType: this.detectBusinessType(rawData.coreBusiness),
      shortReference: this.createShortReference(rawData.company, rawData.coreBusiness)
    };

    console.log('🔧 Preprocessed business context:', {
      original: rawData.coreBusiness,
      cleaned: processed.coreBusiness_clean,
      type: processed.businessType,
      reference: processed.shortReference
    });

    return processed;
  }

  private static detectBusinessType(description: string): string {
    const lower = description.toLowerCase();
    
    if (lower.includes('consultancy') || lower.includes('advies')) return 'consultancy organisatie';
    if (lower.includes('software') || lower.includes('saas')) return 'software leverancier';
    if (lower.includes('ai') || lower.includes('genai')) return 'AI dienstverlener';
    if (lower.includes('it') || lower.includes('ict')) return 'IT dienstverlener';
    if (lower.includes('logistiek') || lower.includes('transport')) return 'logistieke dienstverlener';
    if (lower.includes('hardware') || lower.includes('apparatuur')) return 'hardware leverancier';
    if (lower.includes('retail') || lower.includes('verkoop')) return 'retail organisatie';
    if (lower.includes('productie') || lower.includes('manufacturing')) return 'productie bedrijf';
    if (lower.includes('finance') || lower.includes('bank')) return 'financiële dienstverlener';
    
    return 'organisatie'; // Default
  }

  private static createShortReference(company: string, coreBusiness: string): string {
    const type = this.detectBusinessType(coreBusiness);
    return `${company} (${type})`;
  }

  private static cleanReportText(report: any, assessmentData: AssessmentData): any {
    const cleaned = { ...report };
    
    Object.keys(cleaned).forEach(key => {
      if (typeof cleaned[key] === 'string') {
        cleaned[key] = this.cleanTextContent(cleaned[key], assessmentData);
      }
    });
    
    return cleaned;
  }

  private static cleanTextContent(text: string, assessmentData: AssessmentData): string {
    if (!text) return text;
    
    // Check voor letterlijke herhaling van core business
    const coreBusiness = assessmentData.coreBusiness.toLowerCase();
    const escapedCoreBusiness = coreBusiness.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`(die|dat|welke)\\s+${escapedCoreBusiness}`, 'gi');
    
    let cleaned = text;
    
    if (pattern.test(cleaned)) {
      console.warn('⚠️ Report contains literal repetition of core business - cleaning...');
      
      // Auto-fix poging
      cleaned = cleaned.replace(pattern, (match) => {
        const businessType = this.detectBusinessType(assessmentData.coreBusiness);
        return match.replace(new RegExp(coreBusiness, 'gi'), businessType);
      });
    }
    
    // Check voor "wij" in verkeerde context
    const weirdPatterns = [
      /organisatie die wij/gi,
      /bedrijf dat wij/gi,
      /Voor een .+ die wij/gi
    ];
    
    weirdPatterns.forEach(pattern => {
      if (pattern.test(cleaned)) {
        cleaned = cleaned.replace(pattern, (match) => {
          return match.replace(/\swij\s/gi, ' ');
        });
      }
    });
    
    // Fix awkward phrasing
    cleaned = cleaned
      .replace(/Voor een organisatie die die/gi, 'Voor een organisatie die')
      .replace(/\s+die\s+die\s+/gi, ' die ')
      .replace(/van van/gi, 'van')
      .replace(/de de /gi, 'de ')
      .replace(/een een /gi, 'een ');
    
    return cleaned;
  }

  private static buildEnhancedClaudePrompt(data: any, score: number): string {
    const maturityLevel = this.getMaturityLevel(score);
    const businessContext = {
      full: data.coreBusiness_raw || data.coreBusiness,
      cleaned: data.coreBusiness_clean || data.coreBusiness,
      type: data.businessType || 'organisatie',
      shortRef: data.shortReference || data.company
    };
    
    return `
Je bent een MCP Implementation specialist van GroeimetAI die een technisch Agent Readiness rapport schrijft.
Focus op API→MCP conversie mogelijkheden, NIET op algemene digitalisering of business transformation.

ORGANISATIE: ${businessContext.shortRef}
CONTACTPERSOON: ${data.name} (${data.role})
BUSINESS CONTEXT: ${businessContext.type}
API LANDSCAPE: ${data.apiIntegrations || data.systems?.join(', ') || 'Systemen niet gespecificeerd'} 
API DOCUMENTATIE: ${data.apiDocumentation || data.processDocumentation || 'Te bepalen'}
MAIN CHALLENGE: ${data.apiPainPoint || data.mainBlocker}
TIMELINE: ${data.timeline || data.budgetReality}

MCP READINESS SCORE: ${score}/100 (${maturityLevel})

TECHNISCHE ASSESSMENT DATA:
- API Volume: ${data.apiVolume || data.dataAccess}
- API Standards: ${data.apiStandards?.join(', ') || 'REST/standaard'}
- Current Users: ${data.apiUsers || 'Internal'}
- Management: ${data.apiManagement || data.itMaturity}
- Agent Use Case: ${data.agentUseCase || data.costOptimization}
  * "we zijn een X" → "als ${data.businessType}"
  * Verwijder alle "wij/we/ons" uit citaten
  * Maak zinnen grammaticaal correct

- Onzekere antwoorden interpreteren:
  * "Weet nog niet" → "nog te bepalen"
  * "Geen idee" → "nader te onderzoeken"
  * "Anders" → "alternatieve optie"
  * NOOIT deze als letterlijke keuzes behandelen

BEDRIJF PROFIEL:
- Organisatie: ${data.company}
- Contactpersoon: ${data.name} (${data.role})
- Core Business: interpreteer als "${data.businessType}" 
- Sector: ${data.businessType}

AGENT READINESS SCORE: ${score}/100 (${maturityLevel})

EXACTE SCORES:
- API Connectivity: ${this.calculateAPIMaturityScore(data)}/25
- Data Access: ${this.calculateDataMaturityScore(data)}/25
- Process Docs: ${this.calculateProcessMaturityScore(data)}/25
- Team Readiness: ${this.calculateOrganizationReadinessScore(data)}/25

ASSESSMENT CONTEXT (interpreteer professioneel):
1. Business type: ${data.businessType}
2. Prioriteit systemen: ${data.systems.join(', ')}
3. Grootste impact systeem: ${data.highestImpactSystem}
4. API status: ${data.hasApis}
5. Data toegang: ${data.dataAccess}
6. Data locatie: ${data.dataLocation}
7. Process documentatie: ${data.processDocumentation}
8. Automation ervaring: ${data.automationExperience}
9. AI platform voorkeur: ${data.agentPlatformPreference}
10. Hoofdblocker: ${data.mainBlocker}
11. Adoptie snelheid: ${data.adoptionSpeed}
12. Kostenoptimalisatie focus: ${data.costOptimization}
13. Budget realiteit: ${data.budgetReality}
14. IT maturity: ${data.itMaturity}

SCHRIJF TECHNISCH MCP READINESS RAPPORT MET DEZE STRUCTUUR:

[MCP_READINESS_SUMMARY]
[200 woorden technische executive summary - Focus op API→MCP conversie potential]

Start met: "Met ${data.apiIntegrations || data.systems?.length || 'X'} API integraties en ${score}/100 MCP readiness score is ${data.company} technisch ${score >= 70 ? 'klaar voor MCP conversie' : score >= 50 ? 'bijna klaar voor agent access' : 'in voorbereiding voor API→MCP transitie'}.

Hoofdblocker: ${data.apiPainPoint || data.mainBlocker} betekent dat ${score < 50 ? 'significante API-architectuur work nodig' : score < 70 ? 'enkele API gaps eerst opgelost moeten' : 'alleen MCP translation layer nodig'}.

Met MCP kunnen alle APIs binnen ${score >= 70 ? '4-6 weken' : score >= 50 ? '6-10 weken' : '3-6 maanden'} agent-accessible worden."

[API_LANDSCAPE_ANALYSIS]
[250 woorden - Analyseer hun API ecosystem voor MCP compatibility]

JULLIE API ECOSYSTEEM:
- ${data.systems?.join(', ') || 'Systemen'} APIs (beoordeel MCP compatibility)
- ${data.hasApis} = ${this.getAPIStatusLabel(data.hasApis)} 
- Documentatie niveau: ${data.apiDocumentation || data.processDocumentation}
- Data spreiding: ${data.dataLocation || data.dataAccess}

CONVERSIE COMPLEXITEIT: ${score >= 70 ? 'LAAG' : score >= 50 ? 'MEDIUM' : 'HOOG'}
- Geschatte direct converteerbaar: ${score >= 70 ? '85-95%' : score >= 50 ? '60-80%' : '40-60%'}
- Wrapper/adapter layer nodig: ${score >= 70 ? '5-15%' : score >= 50 ? '20-40%' : '40-60%'}
- Geschatte implementatie: ${score >= 70 ? '4-6 weken' : score >= 50 ? '6-10 weken' : '3-6 maanden'}

[MCP_IMPLEMENTATION_ROADMAP]
[300 woorden - Concrete MCP conversie planning]

VAN REST NAAR MCP - Het proces:
[Visual concept: API] → [MCP Server] → [Alle Agents]

Priority Roadmap gebaseerd op ${data.highestImpactSystem || data.systems?.[0]}:

1. ${data.highestImpactSystem || data.systems?.[0]} APIs (Week 1-2)
   - ${data.costOptimization.toLowerCase()} optimization focus
   - Impact: ${score >= 70 ? '60-80% efficiency verbetering' : '40-60% process versnelling'}

2. Secondary Systems (Week 3-4) 
   - ${data.systems?.slice(1,2)?.join(', ') || 'Overige systemen'}
   - Integration met primary APIs

3. Complete Ecosystem (Week 5-6)
   - Full MCP orchestration
   - Agent testing & validation

[TECHNICAL_IMPLEMENTATION_PATH]
[200 woorden - Technische details van API→MCP conversie]

Conversie complexiteit analyse:
- API Documentation: ${data.apiDocumentation || data.processDocumentation} → MCP mapping effort
- Data architecture: ${data.dataLocation || data.dataAccess} → Agent access patterns
- Authentication: ${data.itMaturity} → Security integration
- Management: ${data.apiManagement || data.itMaturity} → Stakeholder coordination

[INVESTMENT_TIMELINE_ANALYSIS] 
[200 woorden - Budget en timeline realistisch voor hun situatie]

Budget context: ${data.budgetReality}
Timeline: ${data.timeline || 'Te bepalen op basis van adoptie snelheid'}
Technical capability: ${data.automationExperience}

Realistische investment voor ${data.company}:
- API discovery & mapping: Week 1
- MCP wrapper development: Week 2-4  
- Agent integration testing: Week 5-6
- Production rollout: Week 7-8

[EXPERT_ASSESSMENT_BRIDGE]
[150 woorden - Wat Expert Assessment toevoegt voor hun API landscape]

DIT RAPPORT = ALGEMENE MCP ANALYSE

Voor ${data.company} specifiek met ${data.systems?.length || 'X'} APIs:
❓ Welke APIs EERST naar MCP converteren voor maximale ROI?
❓ Exacte development effort per API endpoint?  
❓ Security/compliance voor ${data.itMaturity} setup?
❓ Integration roadmap voor ${data.agentPlatformPreference} agents?
❓ Specifieke cost/benefit voor ${data.costOptimization} optimization?

EXPERT ASSESSMENT (€2.500) levert:
✓ API-by-API conversie roadmap met effort estimates
✓ Security assessment voor jullie ${data.itMaturity} environment
✓ Fixed-price implementation quote per API cluster
✓ 90-dagen MCP rollout planning specifiek voor ${data.company}

TONE: Technische MCP specialist, geen algemene digitalisation consultant.
FOCUS: API→MCP conversie expertise, concrete technical implementation.
AVOID: Vage business transformation language, overly general advice.
- Impact voor ${data.businessType}

Data Access: ${this.calculateDataMaturityScore(data)}/25
- Vertaal "${data.dataAccess}" en "${data.dataLocation}"
- Link aan operationele efficiency
- Betekenis voor agents

Process Maturity: ${this.calculateProcessMaturityScore(data)}/25
- "${data.processDocumentation}" impact
- Agent guidance mogelijkheden

Team Readiness: ${this.calculateOrganizationReadinessScore(data)}/25
- "${data.automationExperience}" + "${data.adoptionSpeed}"
- Change capacity voor ${data.businessType}

[CRITICAL_FINDINGS]
[4 bullet points - meest kritieke bevindingen]
- Focus op laagste scores
- Koppel aan "${data.mainBlocker}"
- Specifiek voor ${data.company}
- Geen letterlijke citaten

[READINESS_GAPS]
[150 woorden - Gap analyse]
- Verschil huidige staat vs agent-ready
- "${data.mainBlocker}" als hoofduitdaging
- Missing pieces voor ${data.businessType}
- Concrete gaps, niet algemeen

[AUTOMATION_OPPORTUNITIES]
[180 woorden - Specifieke kansen]
- Focus op "${data.costOptimization}" optimalisatie
- Koppel aan ${data.systems.join(', ')} systemen
- ROI indicaties voor ${data.businessType}
- Budget context: "${data.budgetReality}"

[INDUSTRY_CONTEXT]
[140 woorden - Benchmark]
- ${data.businessType} specifieke vergelijking
- Nederlandse markt context
- Early adopter voorbeelden
- "${data.adoptionSpeed}" in perspectief

[STRATEGIC_RECOMMENDATIONS]
[150 woorden - 3-5 concrete stappen]
- Prioriteer op laagste scores
- Specifiek voor ${data.company}
- Realistisch voor "${data.budgetReality}"
- Geen gedetailleerde planning

[CONCLUSIONS_AND_NEXT_LEVEL]
[200 woorden - Professionele afsluiting]
- Samenvat wat ${data.company} bereikt heeft
- Expert Assessment (€2.500) meerwaarde
- Verschil gratis vs betaald duidelijk
- Call-to-action zonder sales pressure

QUALITY CONTROL CHECKS:
✓ GEEN letterlijke "${data.coreBusiness}" na eerste interpretatie
✓ ALTIJD "${data.company}" of "${data.businessType}" gebruiken
✓ Alle "wij/we" verwijderd uit interpretaties
✓ Grammaticaal correcte zinnen
✓ Professionele, zakelijke toon
✓ Sector-specifieke terminologie
✓ Geen letterlijke antwoord-citaten`;
  }

  private static async callClaudeAPI(prompt: string): Promise<any> {
    try {
      console.log('🤖 Calling Claude API...');
      console.log('API Key configured:', !!this.CLAUDE_API_KEY);
      
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.CLAUDE_API_KEY!,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 3000,
          temperature: 0.3,
          messages: [{ 
            role: 'user', 
            content: prompt 
          }]
        })
      });

      console.log('Claude API response status:', response.status);
      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('🚨 Claude API error:', responseData);
        throw new Error(`Claude API error: ${responseData.error?.message || 'Unknown error'}`);
      }

      console.log('✅ Claude API success - content length:', responseData.content?.[0]?.text?.length || 0);
      
      // Parse structured response
      const content = responseData.content[0].text;
      return this.parseClaudeResponse(content);
      
    } catch (error) {
      console.error('Claude API call failed:', error);
      throw error;
    }
  }

  private static parseClaudeResponse(content: string): any {
    // Parse all sections from Claude response
    const sections = {
      executiveSummary: this.cleanText(this.extractSection(content, 'EXECUTIVE_SUMMARY')),
      scoreBreakdownAnalysis: this.cleanText(this.extractSection(content, 'SCORE_BREAKDOWN_ANALYSIS')),
      criticalFindings: this.cleanText(this.extractSection(content, 'CRITICAL_FINDINGS')),
      readinessGaps: this.cleanText(this.extractSection(content, 'READINESS_GAPS')),
      opportunities: this.cleanText(this.extractSection(content, 'AUTOMATION_OPPORTUNITIES')), 
      industryBenchmark: this.cleanText(this.extractSection(content, 'INDUSTRY_CONTEXT')),
      recommendations: this.cleanText(this.extractSection(content, 'STRATEGIC_RECOMMENDATIONS')),
      conclusions: this.cleanText(this.extractSection(content, 'CONCLUSIONS_AND_NEXT_LEVEL'))
    };

    console.log('📋 Claude sections parsed:', Object.keys(sections).map(key => ({
      [key]: !!(sections as any)[key] && (sections as any)[key] !== 'Content generation failed'
    })));

    return sections;
  }

  private static extractSection(content: string, sectionName: string): string {
    const regex = new RegExp(`\\[${sectionName}\\]\\s*([\\s\\S]*?)(?=\\[|$)`, 'i');
    const match = content.match(regex);
    return match ? match[1].trim() : 'Content generation failed';
  }

  private static cleanText(text: string): string {
    if (!text || text === 'Content generation failed') return text;
    
    return text
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .replace(/\s+\n/g, '\n')
      .replace(/\n\s+/g, '\n')
      .replace(/^\s*[-•]\s*/gm, '• ')
      .trim();
  }

  private static async validateOutput(content: any): Promise<any> {
    const violations = [];
    
    // Check for forbidden content
    const allText = Object.values(content).join(' ');
    
    // Price mentions (except €2.500 for Expert Assessment)
    if (/€\s*\d+(?![\d,]*\s*(?:voor|Expert|Assessment))/i.test(allText)) {
      violations.push('Contains specific pricing');
    }
    
    // Concrete promises
    const forbiddenPhrases = [
      'garanteren', 'zeker weten', 'altijd', 
      'gegarandeerd', '100% zeker', 'nooit falen'
    ];
    
    for (const phrase of forbiddenPhrases) {
      const regex = new RegExp(`\\b${phrase}\\b`, 'i');
      if (regex.test(allText)) {
        violations.push(`Contains forbidden phrase: ${phrase}`);
      }
    }

    if (violations.length > 0) {
      console.warn('⚠️ Content validation warnings:', violations);
    }

    return content;
  }

  // All calculation methods remain the same
  private static calculateAIMaturityScore(data: AssessmentData): number {
    let score = 0;
    score += this.calculateDataMaturityScore(data);
    score += this.calculateAPIMaturityScore(data);
    score += this.calculateProcessMaturityScore(data);
    score += this.calculateOrganizationReadinessScore(data);
    return Math.min(score, 100);
  }

  private static calculateDataMaturityScore(data: AssessmentData): number {
    const dataAccessScore = {
      'instant': 25,
      'minutes': 18,
      'difficult': 8,
      'impossible': 0
    }[data.dataAccess] || 0;
    return dataAccessScore;
  }

  private static calculateAPIMaturityScore(data: AssessmentData): number {
    const apiScore = {
      'most': 25,
      'some': 15,
      'unknown': 8,
      'none': 0
    }[data.hasApis] || 0;
    return apiScore;
  }

  private static calculateProcessMaturityScore(data: AssessmentData): number {
    const processScore = {
      'documented': 25,
      'partially': 18,
      'tribal': 8,
      'chaos': 0
    }[data.processDocumentation] || 0;
    return processScore;
  }

  private static calculateOrganizationReadinessScore(data: AssessmentData): number {
    const automationScore = {
      'advanced': 15,
      'basic': 10,
      'trying': 5,
      'none': 0
    }[data.automationExperience] || 0;
    
    const adoptionScore = {
      'very-fast': 10,
      'reasonable': 7,
      'slow': 4,
      'very-slow': 1
    }[data.adoptionSpeed] || 0;
    
    return automationScore + adoptionScore;
  }

  private static getMaturityLevel(score: number): string {
    if (score >= 90) return 'Agent-Ready (Level 5)';
    if (score >= 70) return 'Integration-Ready (Level 4)';
    if (score >= 50) return 'Digitalization-Ready (Level 3)';
    if (score >= 30) return 'Foundation-Building (Level 2)';
    return 'Pre-Digital (Level 1)';
  }

  private static getAPIStatusLabel(hasApis: string): string {
    const statusMap: Record<string, string> = {
      'yes': 'API infrastructuur aanwezig',
      'partial': 'Gedeeltelijke API dekking',
      'no': 'Geen APIs beschikbaar',
      'unknown': 'API status onbekend',
      'planning': 'API planning fase'
    };
    return statusMap[hasApis?.toLowerCase()] || 'API status te bepalen';
  }

  private static getMaturityDescription(score: number): string {
    if (score >= 90) {
      return 'Jullie organisatie kan binnen weken agents implementeren. APIs bestaan, data is toegankelijk, processen zijn gedocumenteerd.';
    } else if (score >= 70) {
      return '2-3 maanden voorbereiding en je bent er klaar voor. Basis infrastructure bestaat, maar documentatie en integraties moeten worden verfijnd.';
    } else if (score >= 50) {
      return '6-12 maanden modernisering werk. Systemen bestaan maar APIs en data governance moeten worden opgezet.';
    } else if (score >= 30) {
      return '1-2 jaar infrastructure werk nodig. Focus op API development, data strategy en proces digitalisering.';
    } else {
      return 'Start met basis digitalisering. Agents zijn nog 2+ jaar weg. Focus eerst op core systemen en data capture.';
    }
  }

  private static generateEnhancedHTMLReport(content: any, data: AssessmentData, score: number): string {
    const maturityLevel = this.getMaturityLevel(score);
    const currentDate = new Date().toLocaleDateString('nl-NL');
    const validUntil = new Date(Date.now() + 90*24*60*60*1000).toLocaleDateString('nl-NL');
    
    return `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <title>Agent Readiness Assessment - ${data.company}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #2c3e50;
      background: #f8f9fa;
    }
    .header {
      background: linear-gradient(135deg, #F87315 0%, #FF8533 100%);
      color: white;
      padding: 60px 20px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="%23ffffff11" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,133.3C960,128,1056,96,1152,96C1248,96,1344,128,1392,144L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>') no-repeat bottom;
      background-size: cover;
      opacity: 0.1;
    }
    .header-content {
      position: relative;
      z-index: 1;
      max-width: 900px;
      margin: 0 auto;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 20px;
      letter-spacing: -1px;
    }
    .logo span {
      color: #FFE5D9;
    }
    h1 {
      font-size: 36px;
      margin-bottom: 10px;
      font-weight: 300;
      letter-spacing: -0.5px;
    }
    .certificate-badge {
      display: inline-block;
      background: rgba(255,255,255,0.15);
      backdrop-filter: blur(10px);
      padding: 12px 24px;
      border-radius: 50px;
      margin: 20px 0;
      font-weight: 500;
      border: 1px solid rgba(255,255,255,0.2);
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .score-section {
      background: white;
      border-radius: 16px;
      padding: 40px;
      margin: -40px auto 40px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.07), 0 10px 20px rgba(0,0,0,0.04);
      text-align: center;
      position: relative;
      z-index: 10;
    }
    .score-circle {
      width: 160px;
      height: 160px;
      border-radius: 50%;
      background: linear-gradient(135deg, #F87315, #FF8533);
      color: white;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin: 30px auto;
      box-shadow: 0 10px 30px rgba(248, 115, 21, 0.3);
      position: relative;
    }
    .score-circle::after {
      content: '';
      position: absolute;
      width: 180px;
      height: 180px;
      border-radius: 50%;
      border: 2px solid #F87315;
      opacity: 0.2;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0% { transform: scale(1); opacity: 0.2; }
      50% { transform: scale(1.05); opacity: 0.1; }
      100% { transform: scale(1); opacity: 0.2; }
    }
    .score-number {
      font-size: 48px;
      font-weight: bold;
      line-height: 1;
    }
    .score-total {
      font-size: 18px;
      opacity: 0.9;
      margin-top: 5px;
    }
    .maturity-level {
      background: linear-gradient(135deg, #f8f9fa, #ffffff);
      border: 2px solid #F87315;
      padding: 24px;
      border-radius: 12px;
      margin: 30px 0;
    }
    .maturity-level h3 {
      color: #F87315;
      margin-bottom: 10px;
      font-size: 24px;
    }
    .section {
      background: white;
      border-radius: 12px;
      padding: 40px;
      margin-bottom: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .section h2 {
      color: #2c3e50;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #F87315;
      font-size: 28px;
      font-weight: 600;
    }
    .breakdown-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin: 30px 0;
    }
    .breakdown-item {
      background: linear-gradient(135deg, #f8f9fa, #ffffff);
      padding: 24px;
      border-radius: 12px;
      text-align: center;
      border: 2px solid #e9ecef;
      transition: all 0.3s ease;
    }
    .breakdown-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }
    .breakdown-item.high { border-color: #28a745; background: linear-gradient(135deg, #d4edda, #ffffff); }
    .breakdown-item.medium { border-color: #ffc107; background: linear-gradient(135deg, #fff3cd, #ffffff); }
    .breakdown-item.low { border-color: #dc3545; background: linear-gradient(135deg, #f8d7da, #ffffff); }
    .breakdown-score {
      font-size: 28px;
      font-weight: bold;
      color: #F87315;
      margin: 10px 0;
    }
    .breakdown-label {
      font-size: 14px;
      color: #6c757d;
      margin-top: 8px;
    }
    .critical-findings {
      background: linear-gradient(135deg, #fff5f0, #ffffff);
      border-left: 4px solid #F87315;
      padding: 24px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .critical-findings ul {
      list-style: none;
      padding-left: 0;
    }
    .critical-findings li {
      padding: 8px 0;
      padding-left: 28px;
      position: relative;
    }
    .critical-findings li::before {
      content: '⚠️';
      position: absolute;
      left: 0;
    }
    .footer {
      background: linear-gradient(135deg, #2c3e50, #34495e);
      color: white;
      padding: 60px 20px;
      text-align: center;
      margin-top: 60px;
    }
    .groeimetai-badge {
      background: white;
      color: #2c3e50;
      padding: 30px;
      border-radius: 16px;
      margin: 40px auto;
      max-width: 500px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }
    .badge-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 20px;
    }
    .badge-icon {
      font-size: 48px;
      color: #F87315;
    }
    .expert-cta {
      background: linear-gradient(135deg, #F87315, #FF8533);
      color: white;
      padding: 30px;
      border-radius: 12px;
      margin: 40px 0;
      text-align: center;
    }
    .expert-cta h3 {
      font-size: 24px;
      margin-bottom: 10px;
    }
    .expert-cta p {
      margin-bottom: 20px;
      opacity: 0.95;
    }
    .cta-button {
      display: inline-block;
      background: white;
      color: #F87315;
      padding: 12px 30px;
      border-radius: 50px;
      text-decoration: none;
      font-weight: bold;
      transition: transform 0.2s;
    }
    .cta-button:hover {
      transform: translateY(-2px);
    }
    .content-section {
      margin: 20px 0;
      line-height: 1.8;
    }
    .content-section p {
      margin-bottom: 15px;
      color: #4a5568;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-content">
      <div class="logo">🚀 Groeimet<span>AI</span></div>
      <h1>Agent Readiness Assessment Report</h1>
      <div class="certificate-badge">
        🏆 Officieel Agent Readiness Certificaat
      </div>
      <p style="opacity: 0.9; font-size: 18px;">Agent Infrastructure Specialists • Nederland</p>
    </div>
  </div>
  
  <div class="container">
    <div class="score-section">
      <h2 style="color: #2c3e50; margin-bottom: 10px;">${data.company}</h2>
      <p style="color: #6c757d;">
        <strong>Contactpersoon:</strong> ${data.name} ${data.role ? `(${data.role})` : ''}<br>
        <strong>Assessment datum:</strong> ${currentDate}
      </p>
      
      <div class="score-circle">
        <div class="score-number">${score}</div>
        <div class="score-total">/ 100</div>
      </div>
      
      <div class="maturity-level">
        <h3>${maturityLevel}</h3>
        <p style="color: #4a5568; font-size: 18px; margin: 0;">
          ${this.getMaturityDescription(score)}
        </p>
      </div>
    </div>

    <div class="section">
      <h2>📊 Score Breakdown</h2>
      <div class="breakdown-grid">
        <div class="breakdown-item ${this.getScoreClass(this.calculateAPIMaturityScore(data), 25)}">
          <h4>🔗 API Connectivity</h4>
          <div class="breakdown-score">${this.calculateAPIMaturityScore(data)}/25</div>
          <div class="breakdown-label">Systeem integratie</div>
        </div>
        <div class="breakdown-item ${this.getScoreClass(this.calculateDataMaturityScore(data), 25)}">
          <h4>📊 Data Access</h4>
          <div class="breakdown-score">${this.calculateDataMaturityScore(data)}/25</div>
          <div class="breakdown-label">Data toegankelijkheid</div>
        </div>
        <div class="breakdown-item ${this.getScoreClass(this.calculateProcessMaturityScore(data), 25)}">
          <h4>📋 Process Docs</h4>
          <div class="breakdown-score">${this.calculateProcessMaturityScore(data)}/25</div>
          <div class="breakdown-label">Documentatie</div>
        </div>
        <div class="breakdown-item ${this.getScoreClass(this.calculateOrganizationReadinessScore(data), 25)}">
          <h4>🚀 Team Readiness</h4>
          <div class="breakdown-score">${this.calculateOrganizationReadinessScore(data)}/25</div>
          <div class="breakdown-label">Adoption capability</div>
        </div>
      </div>
    </div>

    ${content.executiveSummary && content.executiveSummary !== 'Content generation failed' ? `
    <div class="section">
      <h2>🎯 Executive Summary</h2>
      <div class="content-section">
        ${content.executiveSummary.split('\n').map((p: string) => p ? `<p>${p}</p>` : '').join('')}
      </div>
    </div>` : ''}

    ${content.scoreBreakdownAnalysis && content.scoreBreakdownAnalysis !== 'Content generation failed' ? `
    <div class="section">
      <h2>📊 Gedetailleerde Score Analyse</h2>
      <div class="content-section">
        ${content.scoreBreakdownAnalysis.split('\n').map((p: string) => p ? `<p>${p}</p>` : '').join('')}
      </div>
    </div>` : ''}

    ${content.criticalFindings && content.criticalFindings !== 'Content generation failed' ? `
    <div class="section">
      <h2>🔍 Kritieke Bevindingen</h2>
      <div class="critical-findings">
        ${content.criticalFindings.split('\n').map((line: string) => {
          if (line.startsWith('•') || line.startsWith('-')) {
            return `<li>${line.substring(1).trim()}</li>`;
          }
          return line ? `<p>${line}</p>` : '';
        }).join('')}
      </div>
    </div>` : ''}

    ${content.readinessGaps && content.readinessGaps !== 'Content generation failed' ? `
    <div class="section">
      <h2>🔍 Gap Analysis</h2>
      <div class="content-section">
        ${content.readinessGaps.split('\n').map((p: string) => p ? `<p>${p}</p>` : '').join('')}
      </div>
    </div>` : ''}

    ${content.opportunities && content.opportunities !== 'Content generation failed' ? `
    <div class="section">
      <h2>💡 Automation Opportunities</h2>
      <div class="content-section">
        ${content.opportunities.split('\n').map((p: string) => p ? `<p>${p}</p>` : '').join('')}
      </div>
    </div>` : ''}

    ${content.industryBenchmark && content.industryBenchmark !== 'Content generation failed' ? `
    <div class="section">
      <h2>🏆 Industry Context</h2>
      <div class="content-section">
        ${content.industryBenchmark.split('\n').map((p: string) => p ? `<p>${p}</p>` : '').join('')}
      </div>
    </div>` : ''}

    ${content.recommendations && content.recommendations !== 'Content generation failed' ? `
    <div class="section">
      <h2>📈 Strategic Recommendations</h2>
      <div class="content-section">
        ${content.recommendations.split('\n').map((p: string) => p ? `<p>${p}</p>` : '').join('')}
      </div>
    </div>` : ''}

    ${content.conclusions && content.conclusions !== 'Content generation failed' ? `
    <div class="section">
      <h2>🎯 Conclusies & Volgende Stappen</h2>
      <div class="content-section">
        ${content.conclusions.split('\n').map((p: string) => p ? `<p>${p}</p>` : '').join('')}
      </div>
    </div>` : ''}

    <div class="expert-cta">
      <h3>🚀 Klaar voor de volgende stap?</h3>
      <p>Dit algemene rapport geeft inzicht in jullie agent readiness. Voor een concrete implementatie roadmap, system-specifieke planning en exacte ROI berekening:</p>
      <a href="https://groeimetai.io/expert-assessment" class="cta-button">Upgrade naar Expert Assessment (€2.500)</a>
    </div>
    
    <div class="groeimetai-badge">
      <div class="badge-content">
        <span class="badge-icon">🏆</span>
        <div>
          <div style="font-weight: bold; font-size: 20px; color: #F87315;">GroeimetAI Verified</div>
          <div style="color: #6c757d; margin-top: 5px;">Agent Infrastructure Specialist</div>
          <div style="font-size: 12px; color: #6c757d; margin-top: 10px;">
            Certificate ID: ${Date.now()}_${data.company.replace(/\s/g, '')}<br>
            Geldig tot: ${validUntil}
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <div class="footer">
    <div style="margin-bottom: 20px;">
      <h3 style="font-size: 28px; margin-bottom: 10px;">🚀 GroeimetAI</h3>
      <p style="font-size: 18px; opacity: 0.9;">Agent Infrastructure Specialists</p>
    </div>
    <div style="opacity: 0.7; font-size: 14px;">
      <p>www.groeimetai.io • hello@groeimetai.io</p>
      <p style="margin-top: 10px;">
        Rapport gegenereerd: ${currentDate} • Powered by Claude Sonnet 4<br>
        Voor concrete implementatie planning: Expert Assessment beschikbaar
      </p>
    </div>
  </div>
</body>
</html>`;
  }

  private static getScoreClass(score: number, maxScore: number): string {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 70) return 'high';
    if (percentage >= 40) return 'medium';
    return 'low';
  }

  private static generateScoreBreakdown(data: AssessmentData, totalScore: number): ScoreBreakdown {
    const technical = Math.round(totalScore * 0.4);
    const organizational = Math.round(totalScore * 0.3); 
    const strategic = Math.round(totalScore * 0.3);
    
    return {
      technical,
      organizational, 
      strategic,
      breakdown: `Technical: ${technical}/40, Organizational: ${organizational}/30, Strategic: ${strategic}/30`
    };
  }

  private static generateLockedSections(data: AssessmentData): LockedSection[] {
    return [
      {
        title: 'Detailed ROI Calculation',
        preview: `Potentiële besparing voor ${data.systems.length} systemen`,
        unlocksWith: 'expert_assessment'
      },
      {
        title: 'System-Specific Roadmap',
        preview: `Implementatie plan voor ${data.systems.slice(0,2).join(' en ')}`,
        unlocksWith: 'expert_assessment'
      },
      {
        title: 'Custom Agent Configuration',
        preview: `MCP setup voor jullie specifieke use cases`,
        unlocksWith: 'expert_assessment'
      }
    ];
  }

  private static generateFallbackReport(data: AssessmentData): DynamicReport {
    const score = this.calculateAIMaturityScore(data);
    const breakdown = this.generateScoreBreakdown(data, score);
    
    return {
      score,
      breakdown,
      actualScores: {
        api: this.calculateAPIMaturityScore(data),
        data: this.calculateDataMaturityScore(data), 
        process: this.calculateProcessMaturityScore(data),
        team: this.calculateOrganizationReadinessScore(data)
      },
      executiveSummary: this.generateFallbackExecutiveSummary(data, score),
      scoreBreakdownAnalysis: this.generateFallbackScoreAnalysis(data),
      criticalFindings: this.generateFallbackFindings(data),
      readinessGaps: this.generateFallbackGaps(data),
      opportunities: this.generateFallbackOpportunities(data),
      industryBenchmark: this.generateFallbackBenchmark(data, score),
      recommendations: this.generateFallbackRecommendations(data, score),
      conclusions: this.generateFallbackConclusions(data, score),
      lockedSections: this.generateLockedSections(data),
      htmlReport: ''
    };
  }

  // Fallback methods voor als Claude API faalt
  private static generateFallbackExecutiveSummary(data: AssessmentData, score: number): string {
    const level = this.getMaturityLevel(score);
    const timeline = score >= 70 ? '2-3 maanden' : score >= 50 ? '6-12 maanden' : '12-24 maanden';
    
    return `Met een score van ${score}/100 behoort ${data.company} tot de ${score > 60 ? 'voorlopers' : score > 45 ? 'middenmoot' : 'starters'} in agent readiness binnen de Nederlandse markt. Als ${this.detectBusinessType(data.coreBusiness)} zijn jullie ${level.toLowerCase()} met een geschatte timeline van ${timeline} tot volledige agent deployment.

De assessment toont sterke punten in ${this.getHighestScoringCategory(data)} maar significante aandacht is nodig voor ${this.getLowestScoringCategory(data)}. Met focus op ${data.systems.slice(0,2).join(' en ')} systemen en het aanpakken van "${data.mainBlocker}" als hoofdblocker, is een systematische aanpak naar agent readiness haalbaar.`;
  }

  private static generateFallbackScoreAnalysis(data: AssessmentData): string {
    const scores = {
      api: this.calculateAPIMaturityScore(data),
      dataScore: this.calculateDataMaturityScore(data),
      process: this.calculateProcessMaturityScore(data),
      team: this.calculateOrganizationReadinessScore(data)
    };
    
    return `API Connectivity (${scores.api}/25): ${scores.api >= 20 ? 'Uitstekend - systemen zijn toegankelijk voor agents' : scores.api >= 15 ? 'Goed - meeste systemen hebben APIs' : 'Aandacht nodig - beperkte API dekking'}

Data Access (${scores.dataScore}/25): ${scores.dataScore >= 20 ? 'Sterk - data is direct beschikbaar' : scores.dataScore >= 15 ? 'Redelijk - enige fragmentatie' : 'Kritiek - data silos blokkeren agents'}

Process Documentation (${scores.process}/25): ${scores.process >= 20 ? 'Volledig - agents hebben duidelijke instructies' : scores.process >= 15 ? 'Basis aanwezig - belangrijkste processen gedocumenteerd' : 'Gap - processen niet gedocumenteerd'}

Team Readiness (${scores.team}/25): ${scores.team >= 20 ? 'Klaar - ervaring met automation en snelle adoptie' : scores.team >= 15 ? 'Capability aanwezig - redelijke basis' : 'Development nodig - beperkte automation ervaring'}`;
  }

  private static generateFallbackFindings(data: AssessmentData): string {
    const findings = [];
    
    if (this.calculateAPIMaturityScore(data) < 15) {
      findings.push('• API connectivity is kritieke blocker voor agent deployment');
    }
    if (this.calculateDataMaturityScore(data) < 15) {
      findings.push('• Data toegankelijkheid moet significant verbeterd worden');
    }
    if (this.calculateProcessMaturityScore(data) < 15) {
      findings.push('• Process documentatie is essentieel voor agent guidance');
    }
    findings.push(`• "${data.mainBlocker}" geïdentificeerd als hoofdblocker`);
    
    return findings.join('\n');
  }

  private static generateFallbackGaps(data: AssessmentData): string {
    const lowestScore = Math.min(
      this.calculateAPIMaturityScore(data),
      this.calculateDataMaturityScore(data),
      this.calculateProcessMaturityScore(data),
      this.calculateOrganizationReadinessScore(data)
    );
    
    return `De grootste gap tussen huidige staat en agent-ready status ligt in ${this.getLowestScoringCategory(data)} met een score van ${lowestScore}/25. Dit correleert met jullie aangegeven blocker "${data.mainBlocker}". 

Voor ${data.company} om agent-ready te worden zijn concrete stappen nodig in API development, data consolidatie, en process documentatie. De huidige ${data.itMaturity} IT governance structuur ${data.itMaturity.includes('Interne') ? 'geeft controle over changes' : 'vereist coordinatie met partners'}.`;
  }

  private static generateFallbackOpportunities(data: AssessmentData): string {
    return `Voor ${data.company} liggen significante automation opportunities in het optimaliseren van ${data.costOptimization}. Met focus op ${data.systems.join(', ')} systemen kunnen agents direct impact hebben op deze kostenpost.

Gegeven jullie ${data.automationExperience} automation ervaring en ${data.adoptionSpeed} adoptie snelheid, is een gefaseerde aanpak realistisch. Start met ${data.highestImpactSystem} voor grootste impact, gevolgd door incrementele uitbreiding.

Met een budget realiteit van "${data.budgetReality}" is een pilot-first aanpak aan te raden voor risk mitigation en ROI validatie.`;
  }

  private static generateFallbackBenchmark(data: AssessmentData, score: number): string {
    return `Nederlandse organisaties scoren gemiddeld 35-45/100 op Agent Readiness. ${data.company} scoort ${score}/100, wat ${score > 45 ? 'boven' : 'rond'} het gemiddelde is.

Organisaties in de ${this.detectBusinessType(data.coreBusiness)} sector worstelen typisch met legacy systems en data fragmentatie. Early adopters in jullie sector rapporteren 20-40% efficiency gains binnen 6 maanden na agent deployment.`;
  }

  private static generateFallbackRecommendations(data: AssessmentData, score: number): string {
    const recommendations = [];
    
    if (score < 50) {
      recommendations.push('1. Start met foundation building - focus op API development en data consolidatie');
      recommendations.push('2. Investeer in process documentatie voordat agent deployment begint');
      recommendations.push('3. Build internal automation capability met training en pilot projects');
    } else if (score < 70) {
      recommendations.push('1. Prioriteer systemen met hoogste ROI potential voor agent deployment');
      recommendations.push('2. Start pilot met ' + data.highestImpactSystem + ' voor quick wins');
      recommendations.push('3. Ontwikkel agent governance en security framework');
    } else {
      recommendations.push('1. Begin met agent deployment op ' + data.highestImpactSystem);
      recommendations.push('2. Optimaliseer resterende gaps in parallel met rollout');
      recommendations.push('3. Focus op adoption en change management');
    }
    
    return recommendations.join('\n');
  }

  private static generateFallbackConclusions(data: AssessmentData, score: number): string {
    return `${data.company} heeft een solide basis met een score van ${score}/100. De grootste strength ligt in ${this.getHighestScoringCategory(data)}, terwijl ${this.getLowestScoringCategory(data)} prioriteit vereist.

Voor concrete volgende stappen adviseren wij GroeimetAI's Expert Assessment (€2.500). Dit biedt system-specifieke roadmaps, exacte ROI berekeningen, en een implementation plan aangepast aan jullie "${data.mainBlocker}" challenge.

Het verschil tussen dit algemene rapport en Expert Assessment is specificiteit - van "je hebt APIs nodig" naar "deze 5 endpoints in ServiceNow moeten MCP-enabled worden voor use case X".`;
  }

  private static getHighestScoringCategory(data: AssessmentData): string {
    const scores = [
      { name: 'API connectivity', score: this.calculateAPIMaturityScore(data) },
      { name: 'data toegankelijkheid', score: this.calculateDataMaturityScore(data) },
      { name: 'proces documentatie', score: this.calculateProcessMaturityScore(data) },
      { name: 'team readiness', score: this.calculateOrganizationReadinessScore(data) }
    ];
    scores.sort((a, b) => b.score - a.score);
    return scores[0].name;
  }

  private static getLowestScoringCategory(data: AssessmentData): string {
    const scores = [
      { name: 'API connectivity', score: this.calculateAPIMaturityScore(data) },
      { name: 'data toegankelijkheid', score: this.calculateDataMaturityScore(data) },
      { name: 'proces documentatie', score: this.calculateProcessMaturityScore(data) },
      { name: 'team readiness', score: this.calculateOrganizationReadinessScore(data) }
    ];
    scores.sort((a, b) => a.score - b.score);
    return scores[0].name;
  }
}