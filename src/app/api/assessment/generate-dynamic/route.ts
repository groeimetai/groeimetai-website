import { NextRequest, NextResponse } from 'next/server';
import { DynamicReportGenerator } from '@/services/ai/reportGeneration';
import { doc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export async function POST(req: NextRequest) {
  let assessmentData = null;

  try {
    const { assessmentId, assessmentData: data } = await req.json();
    assessmentData = data;
    
    if (!assessmentId || !assessmentData) {
      return NextResponse.json(
        { error: 'Assessment ID and data required' },
        { status: 400 }
      );
    }

    // Generate dynamic report with Claude Sonnet 4
    const dynamicReport = await DynamicReportGenerator.generateFreemiumReport(assessmentData);
    
    // Store report in Firestore
    await addDoc(collection(db, 'reports'), {
      assessmentId,
      userId: assessmentData.userId,
      type: 'freemium',
      ...dynamicReport,
      createdAt: serverTimestamp(),
      status: 'generated'
    });

    // Calculate and store lead score
    const leadScore = await calculateLeadScore(assessmentData, dynamicReport.score);
    
    // Store lead scoring data
    await addDoc(collection(db, 'lead_scores'), {
      userId: assessmentData.userId,
      assessmentId,
      score: leadScore.score,
      priority: leadScore.priority,
      factors: leadScore.factors,
      agentReadinessScore: dynamicReport.score,
      createdAt: serverTimestamp()
    });

    // Initialize automated upsell sequence
    await initializeUpsellSequence(assessmentData.userId, assessmentId, dynamicReport.score, leadScore);

    return NextResponse.json({
      success: true,
      report: dynamicReport,
      leadScore: leadScore.score,
      message: 'Dynamic report generated successfully'
    });

  } catch (error) {
    console.error('Dynamic report generation error:', error);
    
    // Fallback to simple report
    const fallbackReport = await generateFallbackReport(assessmentData);
    
    return NextResponse.json({
      success: true,
      report: fallbackReport,
      leadScore: 'cold',
      message: 'Fallback report generated',
      warning: 'Dynamic generation failed'
    });
  }
}

async function calculateLeadScore(assessmentData: any, readinessScore: number): Promise<any> {
  let score = 0;
  const factors = [];

  // Company size scoring
  if (assessmentData.employees === '250+') {
    score += 30;
    factors.push('Enterprise size');
  } else if (assessmentData.employees === '51-250') {
    score += 20;
    factors.push('Mid-market');
  } else {
    score += 10;
    factors.push('SMB');
  }

  // Budget scoring
  if (assessmentData.budget?.includes('€100k+')) {
    score += 25;
    factors.push('High budget');
  } else if (assessmentData.budget?.includes('€25-100k')) {
    score += 15;
    factors.push('Medium budget');
  }

  // Timeline urgency
  if (assessmentData.timeline === 'ASAP - we lopen achter') {
    score += 20;
    factors.push('Urgent timeline');
  } else if (assessmentData.timeline === 'Binnen 3 maanden') {
    score += 15;
    factors.push('Near-term');
  }

  // Agent readiness bonus
  if (readinessScore > 70) {
    score += 10;
    factors.push('High readiness');
  }

  // Determine lead quality
  let leadQuality: 'hot' | 'warm' | 'cold';
  let priority: 'high' | 'medium' | 'low';

  if (score >= 70) {
    leadQuality = 'hot';
    priority = 'high';
  } else if (score >= 40) {
    leadQuality = 'warm';
    priority = 'medium';
  } else {
    leadQuality = 'cold';
    priority = 'low';
  }

  return { score: leadQuality, priority, factors };
}

async function initializeUpsellSequence(
  userId: string,
  assessmentId: string, 
  readinessScore: number,
  leadScore: any
): Promise<void> {
  // Create upsell campaign
  const campaign = {
    userId,
    assessmentId,
    agentReadinessScore: readinessScore,
    leadScore: leadScore.score,
    leadFactors: leadScore.factors,
    stage: 'freemium_delivered',
    abTestVariant: Math.random() > 0.5 ? 'A' : 'B', // Simple A/B test
    createdAt: serverTimestamp(),
    status: 'active'
  };

  await addDoc(collection(db, 'upsell_campaigns'), campaign);

  // Set dashboard locks
  const lockedSections = generateLockedSections(leadScore.score);
  await addDoc(collection(db, 'dashboard_locks'), {
    userId,
    sections: lockedSections,
    leadScore: leadScore.score,
    createdAt: serverTimestamp()
  });

  // Schedule first email
  await addDoc(collection(db, 'scheduled_emails'), {
    userId,
    template: leadScore.score === 'hot' ? 'report_ready_hot' : 'report_ready_standard',
    scheduledFor: new Date(),
    status: 'pending',
    campaignId: assessmentId
  });
}

function generateLockedSections(leadScore: string): any[] {
  const baseLocks = [
    {
      section: 'detailed_roi',
      title: 'Detailed ROI Calculation',
      preview: 'Potentiële besparing: €••,•••/jaar',
      urgency: leadScore === 'hot' ? 'high' : 'medium'
    },
    {
      section: 'custom_roadmap', 
      title: 'Custom Implementation Plan',
      preview: '90-dagen roadmap naar agent-ready',
      urgency: leadScore === 'hot' ? 'high' : 'medium'
    }
  ];

  if (leadScore === 'hot') {
    baseLocks.push({
      section: 'priority_support',
      title: 'Priority Expert Call',
      preview: '48-uur expert call guarantee',
      urgency: 'high'
    });
  }

  return baseLocks;
}

async function generateFallbackReport(assessmentData: any): Promise<any> {
  const score = Math.min(
    (assessmentData.systems?.length || 0) * 10 + 
    (assessmentData.timeline === 'ASAP - we lopen achter' ? 20 : 10) +
    20, // Base score
    100
  );

  return {
    score,
    breakdown: {
      technical: Math.round(score * 0.4),
      organizational: Math.round(score * 0.3),
      strategic: Math.round(score * 0.3)
    },
    executiveSummary: 'Assessment completed successfully. Multiple opportunities identified for agent infrastructure improvement.',
    opportunities: 'Based on your systems and goals, significant automation potential exists.',
    industryBenchmark: 'Your score aligns with similar companies in transformation phase.',
    nextSteps: 'Consider expert assessment for detailed implementation planning.',
    lockedSections: []
  };
}