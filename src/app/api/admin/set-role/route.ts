import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

// POST /api/admin/set-role
// Sets custom claims and Firestore role for a user
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

    // Check if requesting user is admin (check both Firestore and custom claims)
    const requestingUserDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    const requestingUserData = requestingUserDoc.data();
    const isRequestingUserAdmin =
      decodedToken.role === 'admin' ||
      (decodedToken.roles as string[] | undefined)?.includes('admin') ||
      requestingUserData?.role === 'admin';

    if (!isRequestingUserAdmin) {
      return NextResponse.json(
        { error: 'Only admins can set user roles' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: userId and role' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['admin', 'consultant', 'client'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${validRoles.join(', ')}` },
        { status: 400 }
      );
    }

    // Set custom claims on Firebase Auth
    await adminAuth.setCustomUserClaims(userId, {
      role: role,
      roles: [role],
    });

    // Update Firestore user document
    await adminDb.collection('users').doc(userId).update({
      role: role,
      roles: [role],
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: `Role '${role}' set for user ${userId}`,
      data: {
        userId,
        role,
        roles: [role],
      },
    });
  } catch (error) {
    console.error('Error setting user role:', error);
    return NextResponse.json(
      { error: 'Failed to set user role', details: String(error) },
      { status: 500 }
    );
  }
}

// GET /api/admin/set-role?userId=xxx
// Gets current role info for a user
export async function GET(request: NextRequest) {
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

    // Get userId from query params (or use requesting user's id)
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || decodedToken.uid;

    // Get Firebase Auth user info
    const userRecord = await adminAuth.getUser(userId);
    const customClaims = userRecord.customClaims || {};

    // Get Firestore user document
    const userDoc = await adminDb.collection('users').doc(userId).get();
    const firestoreData = userDoc.exists ? userDoc.data() : null;

    return NextResponse.json({
      success: true,
      data: {
        userId,
        email: userRecord.email,
        displayName: userRecord.displayName,
        customClaims: {
          role: customClaims.role || null,
          roles: customClaims.roles || [],
        },
        firestoreRole: firestoreData?.role || null,
        firestoreRoles: firestoreData?.roles || [],
      },
    });
  } catch (error) {
    console.error('Error getting user role:', error);
    return NextResponse.json(
      { error: 'Failed to get user role', details: String(error) },
      { status: 500 }
    );
  }
}
