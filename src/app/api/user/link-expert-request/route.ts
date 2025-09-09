import { NextRequest, NextResponse } from 'next/server';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export async function POST(req: NextRequest) {
  try {
    const { userId, requestType, source } = await req.json();
    
    if (!userId || !requestType) {
      return NextResponse.json(
        { error: 'Missing userId or requestType' },
        { status: 400 }
      );
    }

    // Update user document to link expert request
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      expertRequests: arrayUnion({
        id: `expert_${Date.now()}`,
        type: requestType,
        source: source || 'manual_link',
        requestedAt: new Date().toISOString()
      }),
      lastActivityAt: new Date()
    });

    return NextResponse.json({
      success: true,
      message: 'Expert request linked to user account'
    });

  } catch (error) {
    console.error('Error linking expert request:', error);
    return NextResponse.json(
      { error: 'Failed to link expert request to user' },
      { status: 500 }
    );
  }
}