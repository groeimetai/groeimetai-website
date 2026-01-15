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

// Map collection names to display types
const COLLECTION_TYPE_MAP: Record<string, string> = {
  'agent_assessments': 'Agent Readiness',
  'data_readiness_assessments': 'Data Readiness',
  'ai_security_assessments': 'AI Security',
  'process_automation_assessments': 'Process Automation',
  'cx_ai_assessments': 'CX AI',
  'ai_maturity_assessments': 'AI Maturity',
  'integration_readiness_assessments': 'Integration Readiness',
  'roi_calculator_assessments': 'ROI Calculator',
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const userEmail = searchParams.get('userEmail');

    console.log('🔍 Enhanced assessment query received:', { userId, userEmail });

    if (!userId && !userEmail) {
      return NextResponse.json(
        { error: 'User ID or email required' },
        { status: 400 }
      );
    }

    const allAssessments: any[] = [];
    const sources: string[] = [];
    const collectionStats: Record<string, { userId: number; email: number }> = {};

    // Search across ALL assessment collections
    for (const collectionName of ASSESSMENT_COLLECTIONS) {
      const collectionAssessments: any[] = [];
      collectionStats[collectionName] = { userId: 0, email: 0 };

      // Method 1: Query by userId if provided
      if (userId) {
        try {
          const userIdSnapshot = await adminDb
            .collection(collectionName)
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();

          collectionStats[collectionName].userId = userIdSnapshot.size;

          userIdSnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            collectionAssessments.push({
              id: docSnap.id,
              collection: collectionName,
              type: data.type || collectionName.replace('_assessments', ''),
              displayType: COLLECTION_TYPE_MAP[collectionName] || collectionName,
              ...data,
              createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
              source: 'userId_match'
            });
          });
        } catch (error) {
          console.warn(`⚠️ UserId query failed for ${collectionName}:`, error);
        }
      }

      // Method 2: Query by email (for assessments not yet linked)
      if (userEmail) {
        try {
          const emailSnapshot = await adminDb
            .collection(collectionName)
            .where('email', '==', userEmail)
            .orderBy('createdAt', 'desc')
            .get();

          collectionStats[collectionName].email = emailSnapshot.size;

          const existingIds = new Set(collectionAssessments.map(a => a.id));

          emailSnapshot.forEach((docSnap) => {
            // Avoid duplicates
            if (!existingIds.has(docSnap.id)) {
              const data = docSnap.data();
              collectionAssessments.push({
                id: docSnap.id,
                collection: collectionName,
                type: data.type || collectionName.replace('_assessments', ''),
                displayType: COLLECTION_TYPE_MAP[collectionName] || collectionName,
                ...data,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
                source: 'email_match',
                needsLinking: !data.userId && userId // Flag assessments that could be linked
              });
            }
          });
        } catch (error) {
          console.warn(`⚠️ Email query failed for ${collectionName}:`, error);
        }
      }

      // Add to all assessments
      allAssessments.push(...collectionAssessments);

      if (collectionAssessments.length > 0) {
        sources.push(`${collectionName}(${collectionAssessments.length})`);
      }
    }

    // Sort all assessments by creation date (most recent first)
    allAssessments.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

    const needsLinking = allAssessments.filter(a => a.needsLinking).length;

    console.log('✅ Enhanced assessment results:', {
      count: allAssessments.length,
      sources: sources.join(', '),
      needsLinking,
      collectionsSearched: ASSESSMENT_COLLECTIONS.length
    });

    return NextResponse.json({
      success: true,
      assessments: allAssessments,
      count: allAssessments.length,
      stats: {
        total: allAssessments.length,
        needsLinking,
        linkedProperly: allAssessments.length - needsLinking,
        sources: sources,
        byCollection: collectionStats
      },
      debug: {
        queriedUserId: userId,
        queriedEmail: userEmail,
        searchMethods: sources,
        collectionsSearched: ASSESSMENT_COLLECTIONS.length,
        foundViaUserId: allAssessments.filter(a => a.source === 'userId_match').length,
        foundViaEmail: allAssessments.filter(a => a.source === 'email_match').length
      }
    });

  } catch (error) {
    console.error('Error getting assessments:', error);
    return NextResponse.json(
      { error: 'Failed to load assessments' },
      { status: 500 }
    );
  }
}
