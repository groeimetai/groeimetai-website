import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// All assessment collection names
const ASSESSMENT_COLLECTIONS = [
  'agent_assessments',
  'data_readiness_assessments',
  'ai_security_assessments',
  'process_automation_assessments',
  'cx_ai_assessments',
  'ai_maturity_assessments',
  'integration_readiness_assessments',
  'roi_calculator_assessments',
];

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

    console.log('🔍 Looking for assessment report:', assessmentId);

    // Search across ALL assessment collections
    for (const collectionName of ASSESSMENT_COLLECTIONS) {
      try {
        // Try querying by leadId (the format from submit route: assessment_xxx_xxx)
        const querySnapshot = await adminDb
          .collection(collectionName)
          .where('leadId', '==', assessmentId)
          .limit(1)
          .get();

        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          const data = doc.data();

          console.log(`✅ Found assessment in ${collectionName}:`, {
            firestoreId: doc.id,
            leadId: data.leadId,
            hasReport: !!data.report,
            status: data.status
          });

          // Return the full report if available
          if (data.report) {
            return NextResponse.json({
              success: true,
              report: data.report,
              reportType: 'full_generated_report',
              assessmentType: data.type || collectionName.replace('_assessments', ''),
              collection: collectionName,
              status: data.status
            });
          }

          // If status is still processing, let the user know
          if (data.status === 'assessment_submitted') {
            return NextResponse.json({
              success: false,
              status: 'processing',
              message: 'Je rapport wordt nog gegenereerd. Dit duurt meestal 2-5 minuten.',
              assessmentType: data.type || collectionName.replace('_assessments', '')
            });
          }

          // If no report but we have raw data, return formatted summary
          const responses = data.responses || data;
          const summaryReport = generateSummaryReport(responses, data);

          return NextResponse.json({
            success: true,
            report: summaryReport,
            reportType: 'summary_from_responses',
            assessmentType: data.type || collectionName.replace('_assessments', ''),
            collection: collectionName
          });
        }
      } catch (collectionError) {
        console.warn(`⚠️ Error querying ${collectionName}:`, collectionError);
      }
    }

    // Also try searching by Firestore document ID directly
    for (const collectionName of ASSESSMENT_COLLECTIONS) {
      try {
        const docSnapshot = await adminDb
          .collection(collectionName)
          .doc(assessmentId)
          .get();

        if (docSnapshot.exists) {
          const data = docSnapshot.data()!;

          console.log(`✅ Found assessment by doc ID in ${collectionName}`);

          if (data.report) {
            return NextResponse.json({
              success: true,
              report: data.report,
              reportType: 'full_generated_report',
              assessmentType: data.type || collectionName.replace('_assessments', ''),
              collection: collectionName
            });
          }

          const responses = data.responses || data;
          const summaryReport = generateSummaryReport(responses, data);

          return NextResponse.json({
            success: true,
            report: summaryReport,
            reportType: 'summary_from_responses',
            assessmentType: data.type || collectionName.replace('_assessments', ''),
            collection: collectionName
          });
        }
      } catch (error) {
        // Document doesn't exist in this collection, continue
      }
    }

    // No report found
    console.log('❌ Assessment not found:', assessmentId);
    return NextResponse.json({
      success: false,
      error: 'Assessment niet gevonden. Het rapport kan nog in verwerking zijn.',
      hint: 'Het duurt meestal 2-5 minuten voordat het rapport klaar is.'
    }, { status: 404 });

  } catch (error) {
    console.error('Get report error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve report' },
      { status: 500 }
    );
  }
}

function generateSummaryReport(responses: any, data: any): string {
  return `
ASSESSMENT SUMMARY REPORT

Bedrijf: ${responses.company || 'N/A'}
Core Business: ${responses.coreBusiness || 'N/A'}

SCORE BREAKDOWN:
- Overall Score: ${data.score || responses.score || 0}/100
- Level: ${data.level || responses.level || 'N/A'}

PRIORITY SYSTEMS:
${responses.systems?.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n') || 'None specified'}

HIGHEST IMPACT: ${responses.highestImpactSystem || 'N/A'}

TECHNICAL READINESS:
- APIs Available: ${responses.hasApis || 'N/A'}
- Data Access: ${responses.dataAccess || 'N/A'}
- Process Documentation: ${responses.processDocumentation || 'N/A'}

BLOCKERS & CHALLENGES:
- Main Blocker: ${responses.mainBlocker || 'N/A'}
- Budget Reality: ${responses.budgetReality || 'N/A'}
- IT Maturity: ${responses.itMaturity || 'N/A'}

PLATFORM PREFERENCES:
- Agent Platform: ${responses.agentPlatformPreference || 'N/A'}
- Specific Platforms: ${responses.agentPlatforms?.join(', ') || 'N/A'}

IMPLEMENTATION TIMELINE:
- Adoption Speed: ${responses.adoptionSpeed || 'N/A'}
- Cost Optimization Focus: ${responses.costOptimization || 'N/A'}
  `.trim();
}
