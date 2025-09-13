import { NextRequest, NextResponse } from 'next/server';

interface QuickCheckData {
  coreBusiness: string;
  systems: string[];
  highestImpactSystem: string;
  hasApis: string;
  dataAccess: string;
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

  // Core Business (20 points) - Business clarity
  const businessScore = data.coreBusiness?.trim().length > 10 ? 20 : data.coreBusiness?.trim().length > 0 ? 10 : 0;
  score += businessScore;

  // Systems (25 points) - Number of systems to agent-fy
  const systemsScore = Math.min(data.systems?.length * 8 || 0, 25);
  score += systemsScore;

  // Highest Impact System (15 points) - Priority focus
  const highestImpactScore = data.highestImpactSystem ? 15 : 0;
  score += highestImpactScore;

  // APIs (25 points) - CRITICAL - Can agents connect to systems?
  const apiScore =
    {
      most: 25, // Agents can connect to most systems
      some: 18, // Limited agent connectivity
      unknown: 8, // Unknown = probably minimal APIs
      none: 0, // Agents can't connect anywhere
    }[data.hasApis] || 0;
  score += apiScore;

  // Data Access (15 points) - Can agents get the data they need?
  const dataScore =
    {
      instant: 15, // Agents can access data immediately
      minutes: 12, // Some friction but accessible
      difficult: 6, // Major data silos block agents
      impossible: 0, // Data not digitized yet
    }[data.dataAccess] || 0;
  score += dataScore;

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
    coreBusiness: data.coreBusiness,
    systemsCount: data.systems?.length || 0,
    highestImpactSystem: data.highestImpactSystem,
    hasApis: data.hasApis,
    dataAccess: data.dataAccess,
    timestamp: new Date().toISOString(),
  });

  // Could save to analytics/leads database here
}
