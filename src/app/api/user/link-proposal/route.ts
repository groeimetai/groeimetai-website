import { NextRequest, NextResponse } from 'next/server';
import { adminDb, FieldValue } from '@/lib/firebase/admin';

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
    await adminDb.collection('users').doc(userId).update({
      proposals: FieldValue.arrayUnion({
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
