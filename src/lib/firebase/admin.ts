import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// Initialize Firebase Admin SDK
const serviceAccount: ServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID!,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')!,
};

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

// Export admin services
export const adminAuth = getAuth();
export const adminDb = getFirestore();
export const adminStorage = getStorage();

// Helper functions for custom claims
export const setCustomUserClaims = async (uid: string, claims: Record<string, any>) => {
  await adminAuth.setCustomUserClaims(uid, claims);
};

export const getUserClaims = async (uid: string) => {
  const user = await adminAuth.getUser(uid);
  return user.customClaims || {};
};

// Helper function to verify ID token
export const verifyIdToken = async (idToken: string) => {
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return { valid: true, decodedToken };
  } catch (error) {
    return { valid: false, error };
  }
};

// Helper function to create custom token
export const createCustomToken = async (uid: string, additionalClaims?: Record<string, any>) => {
  return await adminAuth.createCustomToken(uid, additionalClaims);
};

// Firestore helpers
export const serverTimestamp = () => FieldValue.serverTimestamp();

export const deleteField = () => FieldValue.delete();

export const arrayUnion = (...elements: any[]) => FieldValue.arrayUnion(...elements);

export const arrayRemove = (...elements: any[]) => FieldValue.arrayRemove(...elements);

export const increment = (n: number) => FieldValue.increment(n);

// Batch operations helper
export const batchWrite = async (operations: Array<() => Promise<any>>) => {
  const batch = adminDb.batch();

  for (const operation of operations) {
    await operation();
  }

  return batch.commit();
};

// Transaction helper
export const runTransaction = async <T>(
  updateFunction: (transaction: FirebaseFirestore.Transaction) => Promise<T>
): Promise<T> => {
  return adminDb.runTransaction(updateFunction);
};
