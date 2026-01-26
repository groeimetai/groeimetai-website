import { NextRequest, NextResponse } from 'next/server';
import { db, collections } from '@/lib/firebase/config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';

// Generate secure random string
function generateSecureKey(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  // Use crypto for secure random generation
  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);

  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }

  return result;
}

// Hash key using SHA-256
async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// POST - Generate new API key
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, permissions, createdBy } = body;

    if (!name || !createdBy) {
      return NextResponse.json(
        { error: 'Name and createdBy are required' },
        { status: 400 }
      );
    }

    // Generate full key with prefix
    const keyBody = generateSecureKey(32);
    const fullKey = `sk-${keyBody}`;
    const keyPrefix = `sk-${keyBody.substring(0, 6)}...`;

    // Hash the key for storage
    const keyHash = await hashKey(fullKey);

    // Create the key document
    const keyId = `key-${Date.now()}`;
    const docRef = doc(collection(db, collections.apiKeys), keyId);

    const apiKeyData = {
      id: keyId,
      name,
      keyPrefix,
      keyHash,
      permissions: permissions || ['read'],
      isActive: true,
      createdAt: serverTimestamp(),
      createdBy,
    };

    await setDoc(docRef, apiKeyData);

    // Return the full key ONLY ONCE
    return NextResponse.json({
      success: true,
      data: {
        id: keyId,
        name,
        keyPrefix,
        permissions: permissions || ['read'],
        isActive: true,
        fullKey, // This is returned ONLY on creation
      },
    });
  } catch (error) {
    console.error('Error generating API key:', error);
    return NextResponse.json(
      { error: 'Failed to generate API key' },
      { status: 500 }
    );
  }
}

// GET - List all API keys
export async function GET() {
  try {
    const q = query(
      collection(db, collections.apiKeys),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);

    const keys = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        keyPrefix: data.keyPrefix,
        permissions: data.permissions,
        isActive: data.isActive,
        lastUsedAt: data.lastUsedAt?.toDate?.() || null,
        createdAt: data.createdAt?.toDate?.() || null,
        createdBy: data.createdBy,
      };
    });

    return NextResponse.json({
      success: true,
      data: keys,
    });
  } catch (error) {
    console.error('Error listing API keys:', error);
    return NextResponse.json(
      { error: 'Failed to list API keys' },
      { status: 500 }
    );
  }
}

// DELETE - Revoke/delete API key
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get('id');
    const permanent = searchParams.get('permanent') === 'true';

    if (!keyId) {
      return NextResponse.json(
        { error: 'Key ID is required' },
        { status: 400 }
      );
    }

    const docRef = doc(collection(db, collections.apiKeys), keyId);

    if (permanent) {
      // Permanently delete the key
      await deleteDoc(docRef);
    } else {
      // Just deactivate (revoke) the key
      await updateDoc(docRef, {
        isActive: false,
      });
    }

    return NextResponse.json({
      success: true,
      message: permanent ? 'API key deleted' : 'API key revoked',
    });
  } catch (error) {
    console.error('Error revoking/deleting API key:', error);
    return NextResponse.json(
      { error: 'Failed to revoke/delete API key' },
      { status: 500 }
    );
  }
}

// PATCH - Update API key (rename, update permissions)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, permissions, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Key ID is required' },
        { status: 400 }
      );
    }

    const docRef = doc(collection(db, collections.apiKeys), id);
    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (permissions !== undefined) updateData.permissions = permissions;
    if (isActive !== undefined) updateData.isActive = isActive;

    await updateDoc(docRef, updateData);

    return NextResponse.json({
      success: true,
      message: 'API key updated',
    });
  } catch (error) {
    console.error('Error updating API key:', error);
    return NextResponse.json(
      { error: 'Failed to update API key' },
      { status: 500 }
    );
  }
}
