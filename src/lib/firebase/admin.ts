import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// Global variables to store initialized services
let initialized = false;
let auth: ReturnType<typeof getAuth> | null = null;
let db: ReturnType<typeof getFirestore> | null = null;
let storage: ReturnType<typeof getStorage> | null = null;

// Initialize Firebase Admin SDK lazily
function initializeAdmin() {
  if (initialized) return;

  // Check if we're in a build environment
  const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';
  if (isBuildTime) {
    console.log('Skipping Firebase Admin initialization during build');
    return;
  }

  // Check if required environment variables are present
  if (
    !process.env.FIREBASE_PROJECT_ID ||
    !process.env.FIREBASE_CLIENT_EMAIL ||
    !process.env.FIREBASE_PRIVATE_KEY
  ) {
    console.warn('Firebase Admin environment variables not found');
    return;
  }

  try {
    // Handle private key - support various formats from different environments
    let privateKey = process.env.FIREBASE_PRIVATE_KEY || '';

    // Remove surrounding quotes if present (common in Cloud Run/Docker)
    if ((privateKey.startsWith('"') && privateKey.endsWith('"')) ||
        (privateKey.startsWith("'") && privateKey.endsWith("'"))) {
      privateKey = privateKey.slice(1, -1);
    }

    // Replace literal \n strings with actual newlines
    // This handles: \\n, \n as string literals
    privateKey = privateKey.replace(/\\n/g, '\n');

    // Log for debugging (first 50 chars only)
    console.log('Firebase Admin: Private key starts with:', privateKey.substring(0, 50));

    const serviceAccount: ServiceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    };

    if (!getApps().length) {
      initializeApp({
        credential: cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
    }

    // Initialize services
    auth = getAuth();
    db = getFirestore();
    storage = getStorage();
    initialized = true;
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
  }
}

// Export admin services with lazy initialization
export const adminAuth = new Proxy({} as ReturnType<typeof getAuth>, {
  get(target, prop) {
    initializeAdmin();
    if (!auth) {
      throw new Error('Firebase Admin Auth not initialized');
    }
    return auth[prop as keyof typeof auth];
  },
});

export const adminDb = new Proxy({} as ReturnType<typeof getFirestore>, {
  get(target, prop) {
    initializeAdmin();
    if (!db) {
      throw new Error('Firebase Admin Firestore not initialized');
    }
    return db[prop as keyof typeof db];
  },
});

export const adminStorage = new Proxy({} as ReturnType<typeof getStorage>, {
  get(target, prop) {
    initializeAdmin();
    if (!storage) {
      throw new Error('Firebase Admin Storage not initialized');
    }
    return storage[prop as keyof typeof storage];
  },
});

// Helper functions for custom claims
export const setCustomUserClaims = async (uid: string, claims: Record<string, any>) => {
  initializeAdmin();
  if (!auth) {
    throw new Error('Firebase Admin not initialized');
  }
  await auth.setCustomUserClaims(uid, claims);
};

export const getUserClaims = async (uid: string) => {
  initializeAdmin();
  if (!auth) {
    throw new Error('Firebase Admin not initialized');
  }
  const user = await auth.getUser(uid);
  return user.customClaims || {};
};

// Helper function to verify ID token
export const verifyIdToken = async (idToken: string) => {
  try {
    initializeAdmin();
    if (!auth) {
      throw new Error('Firebase Admin not initialized');
    }
    const decodedToken = await auth.verifyIdToken(idToken);
    return { valid: true, decodedToken };
  } catch (error) {
    return { valid: false, error };
  }
};

// Helper function to create custom token
export const createCustomToken = async (uid: string, additionalClaims?: Record<string, any>) => {
  initializeAdmin();
  if (!auth) {
    throw new Error('Firebase Admin not initialized');
  }
  return await auth.createCustomToken(uid, additionalClaims);
};

// Export FieldValue for array operations etc.
export { FieldValue };

// Firestore helpers
export const serverTimestamp = () => FieldValue.serverTimestamp();

export const deleteField = () => FieldValue.delete();

export const arrayUnion = (...elements: any[]) => FieldValue.arrayUnion(...elements);

export const arrayRemove = (...elements: any[]) => FieldValue.arrayRemove(...elements);

export const increment = (n: number) => FieldValue.increment(n);

// Batch operations helper
export const batchWrite = async (operations: Array<() => Promise<any>>) => {
  initializeAdmin();
  if (!db) {
    throw new Error('Firebase Admin not initialized');
  }
  const batch = db.batch();

  for (const operation of operations) {
    await operation();
  }

  return batch.commit();
};

// Transaction helper
export const runTransaction = async <T>(
  updateFunction: (transaction: FirebaseFirestore.Transaction) => Promise<T>
): Promise<T> => {
  initializeAdmin();
  if (!db) {
    throw new Error('Firebase Admin not initialized');
  }
  return db.runTransaction(updateFunction);
};
