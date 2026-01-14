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

    // Try to get document by direct ID first
    try {
      const assessmentDoc = await adminDb.collection('agent_assessments').doc(assessmentId).get();

      if (assessmentDoc.exists) {
        const data = assessmentDoc.data()!;
        return NextResponse.json({
          success: true,
          assessment: {
            id: assessmentDoc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt
          }
        });
      }
    } catch (directError) {
      console.log('Direct document fetch failed, trying query...');
    }

    // Fallback: search by leadId field
    const querySnapshot = await adminDb
      .collection('agent_assessments')
      .where('leadId', '==', assessmentId)
      .get();
    
    if (!querySnapshot.empty) {
      const assessmentDoc = querySnapshot.docs[0];
      const data = assessmentDoc.data();
      
      return NextResponse.json({
        success: true,
        assessment: {
          id: assessmentDoc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt
        }
      });
    }

    // Not found
    return NextResponse.json(
      { error: 'Assessment not found' },
      { status: 404 }
    );

  } catch (error) {
    console.error('Error getting assessment by ID:', error);
    return NextResponse.json(
      { 
        error: 'Failed to retrieve assessment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}