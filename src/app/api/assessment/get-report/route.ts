import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const assessmentId = searchParams.get('assessmentId');

    if (!assessmentId) {
      return NextResponse.json(
        { error: 'Assessment ID required' },
        { status: 400 }
      );
    }

    // Try to get the full report from Firestore
    try {
      const querySnapshot = await adminDb
        .collection('agent_assessments')
        .where('id', '==', assessmentId)
        .get();

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        
        // Return the full report if available
        if (data.report) {
          return NextResponse.json({
            success: true,
            report: data.report,
            reportType: 'full_generated_report'
          });
        }
        
        // If no report but we have raw data, return formatted summary
        if (data.responses) {
          const summaryReport = `
ASSESSMENT SUMMARY REPORT

Bedrijf: ${data.responses.company || 'N/A'}
Core Business: ${data.responses.coreBusiness || 'N/A'}

SCORE BREAKDOWN:
- Overall Score: ${data.score || 0}/100
- Level: ${data.level || 'N/A'}

PRIORITY SYSTEMS:
${data.responses.systems?.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n') || 'None specified'}

HIGHEST IMPACT: ${data.responses.highestImpactSystem || 'N/A'}

TECHNICAL READINESS:
- APIs Available: ${data.responses.hasApis || 'N/A'}
- Data Access: ${data.responses.dataAccess || 'N/A'}
- Process Documentation: ${data.responses.processDocumentation || 'N/A'}

BLOCKERS & CHALLENGES:
- Main Blocker: ${data.responses.mainBlocker || 'N/A'}
- Budget Reality: ${data.responses.budgetReality || 'N/A'}
- IT Maturity: ${data.responses.itMaturity || 'N/A'}

PLATFORM PREFERENCES:
- Agent Platform: ${data.responses.agentPlatformPreference || 'N/A'}
- Specific Platforms: ${data.responses.agentPlatforms?.join(', ') || 'N/A'}

IMPLEMENTATION TIMELINE:
- Adoption Speed: ${data.responses.adoptionSpeed || 'N/A'}
- Cost Optimization Focus: ${data.responses.costOptimization || 'N/A'}
          `;
          
          return NextResponse.json({
            success: true,
            report: summaryReport,
            reportType: 'summary_from_responses'
          });
        }
      }
    } catch (firestoreError) {
      console.error('Firestore error:', firestoreError);
    }

    // No report found
    return NextResponse.json({
      success: false,
      error: 'No report found for this assessment'
    }, { status: 404 });

  } catch (error) {
    console.error('Get report error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve report' },
      { status: 500 }
    );
  }
}