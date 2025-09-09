import { NextRequest, NextResponse } from 'next/server';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export async function POST(req: NextRequest) {
  try {
    const { userId, proposalId, source } = await req.json();
    
    if (!userId || !proposalId) {
      return NextResponse.json(
        { error: 'Missing userId or proposalId' },
        { status: 400 }
      );
    }

    // Update user document to link implementation proposal
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      proposals: arrayUnion({
        id: proposalId,
        type: 'implementation_proposal',
        source: source || 'manual_link',
        linkedAt: new Date().toISOString()
      }),
      lastActivityAt: new Date()
    });

    return NextResponse.json({
      success: true,
      message: 'Implementation proposal linked to user account'
    });

  } catch (error) {
    console.error('Error linking proposal:', error);
    return NextResponse.json(
      { error: 'Failed to link proposal to user' },
      { status: 500 }
    );
  }
}