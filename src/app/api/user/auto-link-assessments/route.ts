import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { verifyIdToken } from '@/lib/firebase/admin';

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Auto-link assessments for authenticated users
 * This API automatically finds and links assessments based on user authentication
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

    const batch = writeBatch(db);
    let linkedCount = 0;
    let skippedCount = 0;
    const linkedAssessments: any[] = [];

    // Find all assessments with matching email that don't have userId set
    const emailQuery = query(
      collection(db, 'agent_assessments'),
      where('email', '==', userEmail)
    );
    
    const snapshot = await getDocs(emailQuery);
    console.log(`📊 Found ${snapshot.size} assessments for email ${userEmail}`);

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      
      if (!data.userId) {
        // Link this assessment to the user
        const assessmentRef = doc(db, 'agent_assessments', docSnap.id);
        batch.update(assessmentRef, {
          userId: userId,
          autoLinkedAt: new Date(),
          linkingMethod: 'auto_authentication',
          authenticatedEmail: userEmail
        });
        
        linkedAssessments.push({
          id: docSnap.id,
          leadId: data.leadId,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt
        });
        
        linkedCount++;
      } else if (data.userId === userId) {
        // Already properly linked
        skippedCount++;
      } else {
        // Linked to different user - potential issue
        console.warn('⚠️ Assessment linked to different user:', {
          firestoreId: docSnap.id,
          existingUserId: data.userId,
          requestedUserId: userId,
          email: userEmail
        });
        skippedCount++;
      }
    });

    // Create summary link record
    if (linkedCount > 0) {
      const summaryRef = doc(db, 'user_assessment_links', `${userId}_${Date.now()}`);
      batch.set(summaryRef, {
        userId,
        userEmail,
        linkedCount,
        skippedCount,
        linkedAt: new Date(),
        method: 'auto_authentication',
        assessmentIds: linkedAssessments.map(a => a.leadId)
      });
    }

    // Execute all updates
    await batch.commit();

    console.log('✅ Auto-linking completed:', {
      userId,
      userEmail,
      linkedCount,
      skippedCount,
      totalProcessed: snapshot.size
    });

    return NextResponse.json({
      success: true,
      message: `Auto-linked ${linkedCount} assessments to user account`,
      stats: {
        userId,
        userEmail,
        linkedCount,
        skippedCount,
        totalFound: snapshot.size,
        linkedAssessments: linkedAssessments.slice(0, 5) // First 5 for reference
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
 * GET endpoint to preview auto-linkable assessments
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

    const emailQuery = query(
      collection(db, 'agent_assessments'),
      where('email', '==', userEmail)
    );
    
    const snapshot = await getDocs(emailQuery);
    const assessments: any[] = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      assessments.push({
        id: docSnap.id,
        leadId: data.leadId,
        email: data.email,
        userId: data.userId,
        canAutoLink: !data.userId,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        alreadyLinked: !!data.userId
      });
    });

    const canLink = assessments.filter(a => a.canAutoLink);

    return NextResponse.json({
      success: true,
      userEmail,
      stats: {
        total: assessments.length,
        canAutoLink: canLink.length,
        alreadyLinked: assessments.length - canLink.length
      },
      assessments,
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