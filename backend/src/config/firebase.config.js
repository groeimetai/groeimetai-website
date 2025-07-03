import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../../.env') });

/**
 * Initialize Firebase Admin SDK
 */
const initializeFirebase = () => {
  try {
    // Check if Firebase app is already initialized
    if (getApps().length > 0) {
      return getApps()[0];
    }

    // Initialize Firebase Admin SDK with service account
    const app = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
      storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
    });

    console.log('Firebase Admin SDK initialized successfully');
    return app;
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
    throw new Error('Failed to initialize Firebase Admin SDK');
  }
};

// Initialize Firebase
const app = initializeFirebase();

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Firestore settings
db.settings({
  ignoreUndefinedProperties: true,
  timestampsInSnapshots: true,
});

// Collection references
export const collections = {
  users: 'users',
  quotes: 'quotes',
  consultations: 'consultations',
  messages: 'messages',
  appointments: 'appointments',
  payments: 'payments',
  reviews: 'reviews',
  notifications: 'notifications',
};

// Helper functions for Firestore operations
export const FirestoreHelpers = {
  /**
   * Get server timestamp
   */
  serverTimestamp: () => {
    return new Date().toISOString();
  },

  /**
   * Create a document reference
   */
  createDocRef: (collection, docId) => {
    return db.collection(collection).doc(docId);
  },

  /**
   * Batch write helper
   */
  createBatch: () => {
    return db.batch();
  },

  /**
   * Transaction helper
   */
  runTransaction: async (callback) => {
    return db.runTransaction(callback);
  },
};

export default app;
