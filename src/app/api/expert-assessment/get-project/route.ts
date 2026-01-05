import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  try {
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    // Get user's Expert Assessment project
    const q = query(
      collection(db, 'expert_assessments'), 
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const assessmentDoc = querySnapshot.docs[0];
      const assessmentData = assessmentDoc.data();
      
      return NextResponse.json({
        success: true,
        assessment: {
          id: assessmentDoc.id,
          ...assessmentData
        }
      });
    } else {
      return NextResponse.json({
        success: true,
        assessment: null
      });
    }

  } catch (error) {
    console.error('Error getting Expert Assessment project:', error);
    
    // Better error details for debugging
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      userId,
      collection: 'expert_assessments'
    };
    
    console.error('Expert Assessment API Error Details:', errorDetails);
    
    return NextResponse.json(
      { 
        error: 'Failed to load assessment project',
        success: false,
        assessment: null,
        debug: process.env.NODE_ENV === 'development' ? errorDetails : undefined
      },
      { status: 500 }
    );
  }
}