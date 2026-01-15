import { NextRequest, NextResponse } from 'next/server';
import { adminDb, FieldValue } from '@/lib/firebase/admin';

export async function POST(req: NextRequest) {
  try {
    const { userId, intakeId, source } = await req.json();

    if (!userId || !intakeId) {
      return NextResponse.json(
        { error: 'Missing userId or intakeId' },
        { status: 400 }
      );
    }

    // Update user document to link pilot intake
    await adminDb.collection('users').doc(userId).update({
      pilotIntakes: FieldValue.arrayUnion({
        id: intakeId,
        type: 'pilot_intake',
        source: source || 'manual_link',
        linkedAt: new Date().toISOString()
      }),
      lastActivityAt: new Date()
    });

    return NextResponse.json({
      success: true,
      message: 'Pilot intake linked to user account'
    });

  } catch (error) {
    console.error('Error linking pilot intake:', error);
    return NextResponse.json(
      { error: 'Failed to link pilot intake to user' },
      { status: 500 }
    );
  }
}
