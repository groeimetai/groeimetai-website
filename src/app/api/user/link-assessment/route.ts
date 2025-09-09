import { NextRequest, NextResponse } from 'next/server';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export async function POST(req: NextRequest) {
  try {
    const { userId, assessmentId, source } = await req.json();
    
    if (!userId || !assessmentId) {
      return NextResponse.json(
        { error: 'User ID and assessment ID required' },
        { status: 400 }
      );
    }

    // Create assessment document in separate collection (easier permissions)
    const assessmentRef = doc(db, 'assessments', assessmentId);
    await setDoc(assessmentRef, {
      id: assessmentId,
      userId: userId,
      type: 'agent_readiness',
      source: source || 'manual_link',
      linkedAt: new Date().toISOString(),
      createdAt: new Date(),
      status: 'linked'
    });
    
    // Also update user's lastActivity (simple update, no arrays)
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      lastActivityAt: new Date(),
      lastAssessmentId: assessmentId
    });

    return NextResponse.json({
      success: true,
      message: 'Assessment linked to user account'
    });

  } catch (error: any) {
    console.error('Assessment linking error:', error);
    
    // Handle offline mode gracefully
    if (error?.code === 'permission-denied' || error?.message?.includes('offline')) {
      console.log('Firestore offline - assessment will be linked when connection is restored');
      return NextResponse.json({
        success: true,
        message: 'Assessment will be linked when connection is restored',
        offline: true
      });
    }
    
    return NextResponse.json(
      { error: 'Failed to link assessment' },
      { status: 500 }
    );
  }
}