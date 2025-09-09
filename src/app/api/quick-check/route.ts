import { NextRequest, NextResponse } from 'next/server';

interface QuickCheckData {
  hasApis: string;
  dataAccess: string;
  budgetReality: string;
  mainBlocker: string;
  highestImpact: string;
  email?: string;
  company?: string;
}

export async function POST(req: NextRequest) {
  try {
    const checkData: QuickCheckData = await req.json();

    // Calculate quick score
    const score = calculateQuickScore(checkData);
    const level = getMaturityLevel(score);
    const timeToReady = getTimeToReady(score);

    // Log quick check for analytics (lightweight)
    await logQuickCheck(checkData, score, level);

    return NextResponse.json({
      success: true,
      score,
      level,
      timeToReady,
      message: 'Quick assessment completed',
      nextStep: {
        cta: 'Krijg je volledige roadmap',
        url: '/agent-readiness',
        value: 'Concrete gaps, timeline en stappenplan',
      },
    });
  } catch (error) {
    console.error('Quick check error:', error);
    return NextResponse.json({ error: 'Failed to process quick check' }, { status: 500 });
  }
}

function calculateQuickScore(data: QuickCheckData): number {
  let score = 0;

  // APIs (40 points) - MOST CRITICAL - Can agents connect to systems?
  const apiScore =
    {
      most: 40, // Agents can connect to most systems
      some: 25, // Limited agent connectivity
      unknown: 10, // Unknown = probably minimal APIs
      none: 0, // Agents can't connect anywhere
    }[data.hasApis] || 0;
  score += apiScore;

  // Data Access (25 points) - Can agents get the data they need?
  const dataScore =
    {
      instant: 25, // Agents can access data immediately
      minutes: 18, // Some friction but accessible
      difficult: 8, // Major data silos block agents
      impossible: 0, // Data not digitized yet
    }[data.dataAccess] || 0;
  score += dataScore;

  // Budget Reality (20 points) - Investment capacity
  const budgetScore =
    {
      'EUR100k+ - Enterprise rollout': 20,
      'EUR25-100k - Meerdere systemen': 15,
      'EUR10-25k - Één systeem serieus': 10,
      '< EUR10k - Pilot/experiment': 5,
      'Eerst business case nodig': 2,
    }[data.budgetReality] || 0;
  score += budgetScore;

  // Main Blocker Assessment (10 points) - Reverse scoring (less severe = higher score)
  const blockerScore =
    {
      'Security/compliance zorgen': 10, // Addressable governance
      'Budget/resources beperkt': 8, // Solvable constraint
      'Geen idee waar te beginnen': 6, // Need guidance
      'Technische kennis ontbreekt': 4, // Knowledge gap
      'Systemen praten niet met elkaar': 2, // Complex integration
      'Team weerstand tegen verandering': 3, // Change management challenge
      'Data is te rommelig/verspreid': 1, // Data quality issues
      Anders: 5, // Unknown, middle score
    }[data.mainBlocker] || 0;
  score += blockerScore;

  // Highest Impact System (5 points) - System readiness assessment
  const impactScore =
    {
      'Klantenservice/Helpdesk': 5, // High agent ROI
      'CRM/Sales': 4, // Good automation potential
      'Kennisbank/Documentatie': 4, // Knowledge management
      'ERP/Finance': 3, // Complex but valuable
      'Planning/Logistics': 3, // Operational efficiency
      'HR/Personeelszaken': 3, // Process automation potential
      'Eigen software/Maatwerk': 2, // Depends on implementation
      Anders: 2, // Unknown system
    }[data.highestImpact] || 0;
  score += impactScore;

  return Math.min(score, 100);
}

function getMaturityLevel(score: number): string {
  if (score >= 90) return 'Agent-Ready (Level 5)';
  if (score >= 70) return 'Integration-Ready (Level 4)';
  if (score >= 50) return 'Digitalization-Ready (Level 3)';
  if (score >= 30) return 'Foundation-Building (Level 2)';
  return 'Pre-Digital (Level 1)';
}

function getTimeToReady(score: number): string {
  if (score >= 90) return 'Klaar voor agents binnen weken';
  if (score >= 70) return '2-3 maanden voorbereiding nodig';
  if (score >= 50) return '6-12 maanden modernisering werk';
  if (score >= 30) return '1-2 jaar infrastructure ontwikkeling';
  return 'Begin met digitalisering fundamenten';
}

async function logQuickCheck(data: QuickCheckData, score: number, level: string): Promise<void> {
  // Log for conversion tracking and lead qualification
  console.log('Quick check completed:', {
    score,
    level,
    hasApis: data.hasApis,
    dataAccess: data.dataAccess,
    timestamp: new Date().toISOString(),
  });

  // Could save to analytics/leads database here
}
