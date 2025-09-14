import { NextRequest, NextResponse } from 'next/server';

interface QuickCheckData {
  coreBusiness: string;
  systems: string[];
  highestImpactSystem: string;
  hasApis: string;
  dataAccess: string;
  processDocumentation: string;
  automationExperience: string;
  mainBlocker: string;
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

  // APIs (25 points)
  const apiScore = {
    'most': 25,
    'some': 15,
    'unknown': 8,
    'none': 0
  }[data.hasApis] || 0;
  score += apiScore;

  // Data Access (25 points)
  const dataScore = {
    'instant': 25,
    'minutes': 18,
    'difficult': 8,
    'impossible': 0
  }[data.dataAccess] || 0;
  score += dataScore;

  // Process Documentation (25 points)
  const processScore = {
    'documented': 25,
    'partially': 18,
    'tribal': 8,
    'chaos': 0
  }[data.processDocumentation] || 0;
  score += processScore;

  // Automation Experience (15 points)
  const automationScore = {
    'advanced': 15,
    'basic': 10,
    'trying': 5,
    'none': 0
  }[data.automationExperience] || 0;
  score += automationScore;

  // Main Blocker (10 points) - LOWER score for HARDER blockers
  const blockerScore = {
    'Security/compliance zorgen': 2,
    'Team weerstand tegen verandering': 3,
    'Data is te rommelig/verspreid': 4,
    'Systemen praten niet met elkaar': 5,
    'Technische kennis ontbreekt': 6,
    'Geen idee waar te beginnen': 7,
    'Budget/resources beperkt': 8,
    'Anders': 5
  }[data.mainBlocker] || 0;
  score += blockerScore;

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
    processDocumentation: data.processDocumentation,
    automationExperience: data.automationExperience,
    mainBlocker: data.mainBlocker,
    hasApis: data.hasApis,
    dataAccess: data.dataAccess,
    timestamp: new Date().toISOString(),
  });

  // Could save to analytics/leads database here
}
