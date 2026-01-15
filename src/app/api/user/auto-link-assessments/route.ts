import { NextRequest, NextResponse } from 'next/server';
import { adminDb, verifyIdToken } from '@/lib/firebase/admin';

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

/**
 * Auto-link assessments for authenticated users
 * This API automatically finds and links assessments based on user authentication
 * Searches across ALL assessment collection types
 */
export async function POST(req: NextRequest) {
  try {
    // Extract authentication from multiple sources
    let userId = null;
    let userEmail = null;

    // Method 1: Authorization header
    const authHeader = req.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const result = await verifyIdToken(token);
        if (result.valid && result.decodedToken) {
          userId = result.decodedToken.uid;
          userEmail = result.decodedToken.email;
        }
      } catch (error) {
        console.warn('⚠️ Authorization header verification failed:', error);
      }
    }

    // Method 2: Request body
    const body = await req.json();
    if (!userId && body.userId) userId = body.userId;
    if (!userEmail && body.userEmail) userEmail = body.userEmail;

    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: 'Authentication required (userId and userEmail needed)' },
        { status: 401 }
      );
    }

    console.log('🔄 Auto-linking assessments for user:', { userId, userEmail });

    const batch = adminDb.batch();
    let linkedCount = 0;
    let skippedCount = 0;
    let totalFound = 0;
    const linkedAssessments: any[] = [];
    const collectionStats: Record<string, { found: number; linked: number }> = {};

    // Search across ALL assessment collections
    for (const collectionName of ASSESSMENT_COLLECTIONS) {
      try {
        const snapshot = await adminDb
          .collection(collectionName)
          .where('email', '==', userEmail)
          .get();

        collectionStats[collectionName] = { found: snapshot.size, linked: 0 };
        totalFound += snapshot.size;

        if (snapshot.size > 0) {
          console.log(`📊 Found ${snapshot.size} assessments in ${collectionName}`);
        }

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();

          if (!data.userId) {
            // Link this assessment to the user
            const assessmentRef = adminDb.collection(collectionName).doc(docSnap.id);
            batch.update(assessmentRef, {
              userId: userId,
              autoLinkedAt: new Date(),
              linkingMethod: 'auto_authentication',
              authenticatedEmail: userEmail
            });

            linkedAssessments.push({
              id: docSnap.id,
              collection: collectionName,
              leadId: data.leadId,
              type: data.type || collectionName.replace('_assessments', ''),
              createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt
            });

            linkedCount++;
            collectionStats[collectionName].linked++;
          } else if (data.userId === userId) {
            // Already properly linked
            skippedCount++;
          } else {
            // Linked to different user - potential issue
            console.warn('⚠️ Assessment linked to different user:', {
              collection: collectionName,
              firestoreId: docSnap.id,
              existingUserId: data.userId,
              requestedUserId: userId,
              email: userEmail
            });
            skippedCount++;
          }
        });
      } catch (collectionError) {
        console.warn(`⚠️ Error querying ${collectionName}:`, collectionError);
      }
    }

    // Create summary link record
    if (linkedCount > 0) {
      const summaryRef = adminDb.collection('user_assessment_links').doc(`${userId}_${Date.now()}`);
      batch.set(summaryRef, {
        userId,
        userEmail,
        linkedCount,
        skippedCount,
        linkedAt: new Date(),
        method: 'auto_authentication',
        assessmentIds: linkedAssessments.map(a => a.leadId),
        collectionStats
      });
    }

    // Execute all updates
    await batch.commit();

    console.log('✅ Auto-linking completed:', {
      userId,
      userEmail,
      linkedCount,
      skippedCount,
      totalFound,
      collectionsSearched: ASSESSMENT_COLLECTIONS.length
    });

    return NextResponse.json({
      success: true,
      message: `Auto-linked ${linkedCount} assessments to user account`,
      stats: {
        userId,
        userEmail,
        linkedCount,
        skippedCount,
        totalFound,
        collectionsSearched: ASSESSMENT_COLLECTIONS.length,
        collectionStats,
        linkedAssessments: linkedAssessments.slice(0, 10) // First 10 for reference
      }
    });

  } catch (error) {
    console.error('❌ Auto-linking failed:', error);
    return NextResponse.json(
      {
        error: 'Auto-linking failed',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to preview auto-linkable assessments across ALL collections
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userEmail = searchParams.get('userEmail');

    if (!userEmail) {
      return NextResponse.json(
        { error: 'userEmail parameter required' },
        { status: 400 }
      );
    }

    const allAssessments: any[] = [];
    const collectionStats: Record<string, number> = {};

    // Search across ALL assessment collections
    for (const collectionName of ASSESSMENT_COLLECTIONS) {
      try {
        const snapshot = await adminDb
          .collection(collectionName)
          .where('email', '==', userEmail)
          .get();

        collectionStats[collectionName] = snapshot.size;

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          allAssessments.push({
            id: docSnap.id,
            collection: collectionName,
            type: data.type || collectionName.replace('_assessments', ''),
            leadId: data.leadId,
            email: data.email,
            userId: data.userId,
            canAutoLink: !data.userId,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
            alreadyLinked: !!data.userId
          });
        });
      } catch (error) {
        console.warn(`⚠️ Error querying ${collectionName}:`, error);
      }
    }

    const canLink = allAssessments.filter(a => a.canAutoLink);

    return NextResponse.json({
      success: true,
      userEmail,
      stats: {
        total: allAssessments.length,
        canAutoLink: canLink.length,
        alreadyLinked: allAssessments.length - canLink.length,
        byCollection: collectionStats
      },
      assessments: allAssessments,
      preview: {
        linkableAssessments: canLink.slice(0, 10)
      }
    });

  } catch (error) {
    console.error('❌ Auto-link preview failed:', error);
    return NextResponse.json(
      { error: 'Preview failed', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
