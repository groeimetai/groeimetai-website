// Industry-Specific Agent Insights for Claude Report Generation

export interface IndustryInsight {
  sector: string;
  commonUseCases: string[];
  typicalSavings: string;
  implementationFocus: string[];
  averageROI: string;
  timeToValue: string;
}

export class IndustryInsights {
  static readonly SECTOR_INSIGHTS: Record<string, IndustryInsight> = {
    'retail': {
      sector: 'Retail/E-commerce',
      commonUseCases: [
        'Agents kunnen real-time voorraad checken',
        'Automatische order status updates',
        'Retour afhandeling zonder menselijke tussenkomst',
        'Pricing optimalisatie op basis van marktdata'
      ],
      typicalSavings: '45 uur/week customer service',
      implementationFocus: ['Customer service automation', 'Inventory management', 'Order processing'],
      averageROI: '3-4 maanden terugverdientijd',
      timeToValue: '2-4 weken eerste resultaten'
    },
    
    'logistics': {
      sector: 'Logistiek/Transport',
      commonUseCases: [
        'Track & trace automatisering',
        'Route optimalisatie en herplanning', 
        'Delivery slot management',
        'Automatische status communicatie'
      ],
      typicalSavings: '23% efficiency improvement',
      implementationFocus: ['Planning optimization', 'Customer communication', 'Route management'],
      averageROI: '4-6 maanden terugverdientijd',
      timeToValue: '3-6 weken implementatie'
    },

    'financial': {
      sector: 'Financial Services',
      commonUseCases: [
        'KYC documentatie verwerking',
        'Automatische risk assessment',
        'Klantcommunicatie en updates',
        'Regulatory reporting automation'
      ],
      typicalSavings: '60% reduction in manual processing',
      implementationFocus: ['Compliance automation', 'Customer onboarding', 'Risk management'],
      averageROI: '6-9 maanden (compliance overhead)',
      timeToValue: '6-12 weken (security reviews)'
    },

    'healthcare': {
      sector: 'Healthcare',
      commonUseCases: [
        'Patient scheduling optimization',
        'Automatische insurance verificatie',
        'Treatment plan coordination',
        'Administrative task automation'
      ],
      typicalSavings: '30% administrative time reduction',
      implementationFocus: ['Patient experience', 'Administrative efficiency', 'Care coordination'],
      averageROI: '4-6 maanden terugverdientijd',
      timeToValue: '4-8 weken (compliance checks)'
    },

    'manufacturing': {
      sector: 'Manufacturing',
      commonUseCases: [
        'Production planning automation',
        'Quality control reporting',
        'Supplier coordination',
        'Maintenance scheduling'
      ],
      typicalSavings: '15% operational efficiency gain',
      implementationFocus: ['Production optimization', 'Supply chain', 'Quality management'],
      averageROI: '3-5 maanden terugverdientijd',
      timeToValue: '4-6 weken pilot'
    },

    'technology': {
      sector: 'Technology/Software',
      commonUseCases: [
        'Customer support ticket routing',
        'Code deployment automation',
        'User onboarding sequences',
        'Performance monitoring alerts'
      ],
      typicalSavings: '40+ uur/week development time',
      implementationFocus: ['DevOps automation', 'Customer success', 'Internal tools'],
      averageROI: '2-3 maanden terugverdientijd',
      timeToValue: '1-3 weken (developer-friendly)'
    },

    'consulting': {
      sector: 'Consulting',
      commonUseCases: [
        'Project status reporting',
        'Resource allocation optimization', 
        'Client communication automation',
        'Knowledge base queries'
      ],
      typicalSavings: '25% billable hour efficiency',
      implementationFocus: ['Client management', 'Project coordination', 'Knowledge sharing'],
      averageROI: '3-4 maanden terugverdientijd',
      timeToValue: '2-4 weken setup'
    }
  };

  static getIndustryInsight(industry: string): IndustryInsight {
    return this.SECTOR_INSIGHTS[industry.toLowerCase()] || this.getGenericInsight();
  }

  static getGenericInsight(): IndustryInsight {
    return {
      sector: 'General Business',
      commonUseCases: [
        'Customer query automation',
        'Internal process optimization',
        'Data synchronization between systems',
        'Report generation and analysis'
      ],
      typicalSavings: '20-40% efficiency improvement',
      implementationFocus: ['Customer experience', 'Internal efficiency', 'Data management'],
      averageROI: '4-6 maanden terugverdientijd',
      timeToValue: '3-6 weken implementatie'
    };
  }

  static generateClaudePromptWithIndustry(
    assessmentData: any,
    industryInsight: IndustryInsight
  ): string {
    return `
Je bent een Agent Infrastructure expert die een industry-specific assessment rapport schrijft.

BEDRIJFSCONTEXT:
- Core business: ${assessmentData.businessDescription}
- Sector: ${industryInsight.sector}
- Grootte: ${assessmentData.employees} medewerkers
- Customer channels: ${assessmentData.customerChannels?.join(', ')}
- Wekelijkse task uren: ${assessmentData.weeklyHours}
- Hoofdbottleneck: ${assessmentData.mainBottleneck}

TECHNICAL CONTEXT:
- Systemen: ${assessmentData.systems.join(', ')}
- Totaal aantal systemen: ${assessmentData.totalSystems}
- API status: ${assessmentData.hasApis}
- Systeem leeftijd: ${assessmentData.systemAge}
- Huidige automatisering: ${assessmentData.automationLevel}

ORGANIZATIONAL CONTEXT:
- Decision maker: ${assessmentData.decisionMaker}
- Tech adoptie snelheid: ${assessmentData.adoptionSpeed}
- Timeline: ${assessmentData.timeline}
- Barrières: ${assessmentData.barriers}

INDUSTRY BEST PRACTICES:
${industryInsight.commonUseCases.map(useCase => `- ${useCase}`).join('\n')}

Typical savings in ${industryInsight.sector}: ${industryInsight.typicalSavings}

RAPPORT STRUCTUUR:
[EXECUTIVE_SUMMARY - 100 woorden]
Professionele assessment van hun agent readiness met industry context

[INDUSTRY_OPPORTUNITIES - 150 woorden] 
Specifieke agent kansen voor ${industryInsight.sector} sector:
- Gebruik sector examples hierboven
- Reference hun business description
- Mention typical savings voor sector

[TECHNICAL_READINESS - 150 woorden]
Analyse van hun systemen en API maturity:
- ${assessmentData.totalSystems} systemen assessment
- ${assessmentData.systemAge} impact op agent integration
- ${assessmentData.automationLevel} als starting point

[NEXT_STEPS - 100 woorden]
Algemene roadmap voor ${industryInsight.sector}:
- Verwijs naar industry timeline (${industryInsight.timeToValue})
- Suggest logical first steps
- Soft sell expert assessment voor custom deep-dive

TONE: Industry expert, data-backed insights, professional consultant
VERBODEN: Specifieke prijzen, harde beloftes, directe sales pitch
FOCUS: Industry trends, peer benchmarks, strategic insights
    `;
  }

  static getAgentExamplesForBusiness(
    businessDescription: string,
    industry: string,
    mainBottleneck: string
  ): string[] {
    const insight = this.getIndustryInsight(industry);
    const examples = [...insight.commonUseCases];

    // Add business-specific examples based on description
    if (businessDescription.toLowerCase().includes('hardware')) {
      examples.push('Automated inventory tracking', 'Supply chain notifications');
    }
    
    if (businessDescription.toLowerCase().includes('consultancy')) {
      examples.push('Client status updates', 'Resource planning automation');
    }

    if (businessDescription.toLowerCase().includes('software') || businessDescription.toLowerCase().includes('saas')) {
      examples.push('User onboarding automation', 'Support ticket intelligence');
    }

    // Add bottleneck-specific solutions
    if (mainBottleneck === 'response-time') {
      examples.push('24/7 immediate response automation');
    } else if (mainBottleneck === 'data-silos') {
      examples.push('Cross-system data synchronization');
    } else if (mainBottleneck === 'manual-entry') {
      examples.push('Automated data capture and processing');
    }

    return examples.slice(0, 5); // Top 5 most relevant
  }

  static calculateIndustryAdjustedScore(
    baseScore: number,
    industry: string,
    automationLevel: string
  ): { score: number; modifier: string } {
    let modifier = '';
    let adjustedScore = baseScore;

    // Industry-specific adjustments
    if (industry === 'financial' || industry === 'healthcare') {
      adjustedScore -= 10; // Compliance overhead
      modifier = 'Compliance requirements add complexity';
    } else if (industry === 'technology') {
      adjustedScore += 5; // Developer-friendly
      modifier = 'Tech-forward industry advantage';
    }

    // Automation level adjustment
    if (automationLevel === 'advanced') {
      adjustedScore += 10;
      modifier += (modifier ? ', ' : '') + 'Strong automation foundation';
    } else if (automationLevel === 'none') {
      adjustedScore -= 15;
      modifier += (modifier ? ', ' : '') + 'Limited automation experience';
    }

    return {
      score: Math.max(0, Math.min(100, adjustedScore)),
      modifier: modifier || 'Standard implementation path'
    };
  }
}