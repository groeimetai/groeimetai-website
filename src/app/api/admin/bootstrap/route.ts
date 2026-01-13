import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

// POST /api/admin/bootstrap
// Bootstrap endpoint to set the first admin user
// Can only be used if there are no existing admins
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);

    // Check if there are any existing admins
    const existingAdminsSnapshot = await adminDb
      .collection('users')
      .where('role', '==', 'admin')
      .limit(1)
      .get();

    if (!existingAdminsSnapshot.empty) {
      return NextResponse.json(
        {
          error: 'Admin users already exist. Use /api/admin/set-role instead.',
          hint: 'Ask an existing admin to set your role.',
        },
        { status: 403 }
      );
    }

    // No admins exist - set the requesting user as admin
    const userId = decodedToken.uid;

    // Set custom claims on Firebase Auth
    await adminAuth.setCustomUserClaims(userId, {
      role: 'admin',
      roles: ['admin'],
    });

    // Update or create Firestore user document
    const userDocRef = adminDb.collection('users').doc(userId);
    const userDoc = await userDocRef.get();

    if (userDoc.exists) {
      await userDocRef.update({
        role: 'admin',
        roles: ['admin'],
        updatedAt: new Date(),
      });
    } else {
      await userDocRef.set({
        uid: userId,
        email: decodedToken.email,
        displayName: decodedToken.name || decodedToken.email?.split('@')[0],
        role: 'admin',
        roles: ['admin'],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      message: 'You have been set as the first admin user!',
      data: {
        userId,
        email: decodedToken.email,
        role: 'admin',
        roles: ['admin'],
      },
      note: 'Please sign out and sign back in for the changes to take effect.',
    });
  } catch (error) {
    console.error('Error bootstrapping admin:', error);
    return NextResponse.json(
      { error: 'Failed to bootstrap admin', details: String(error) },
      { status: 500 }
    );
  }
}

// GET /api/admin/bootstrap
// Check if bootstrap is available (no existing admins)
export async function GET(request: NextRequest) {
  try {
    // Check if there are any existing admins
    const existingAdminsSnapshot = await adminDb
      .collection('users')
      .where('role', '==', 'admin')
      .limit(1)
      .get();

    const hasAdmins = !existingAdminsSnapshot.empty;

    return NextResponse.json({
      success: true,
      data: {
        hasExistingAdmins: hasAdmins,
        bootstrapAvailable: !hasAdmins,
        message: hasAdmins
          ? 'Admin users already exist. Bootstrap is not available.'
          : 'No admin users exist. Bootstrap is available.',
      },
    });
  } catch (error) {
    console.error('Error checking bootstrap status:', error);
    return NextResponse.json(
      { error: 'Failed to check bootstrap status', details: String(error) },
      { status: 500 }
    );
  }
}
