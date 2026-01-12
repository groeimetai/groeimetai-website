import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  serverTimestamp as firestoreServerTimestamp,
} from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, Analytics, isSupported } from 'firebase/analytics';
import { getPerformance, FirebasePerformance } from 'firebase/performance';

// Firebase configuration
// Use placeholder values during build time to allow static analysis
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'placeholder-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'placeholder.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'placeholder-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'placeholder.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:000000000000:web:placeholder',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-PLACEHOLDER',
};

// Check if real Firebase config is present (not placeholder values)
const isFirebaseConfigValid = !!(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
);

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let analytics: Analytics | null = null;
let performance: FirebasePerformance | null = null;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize services
auth = getAuth(app);
db = getFirestore(app);
storage = getStorage(app);

// Log warning in development if using placeholder config
if (!isFirebaseConfigValid && process.env.NODE_ENV === 'development') {
  console.warn('Firebase config is using placeholder values. Set NEXT_PUBLIC_FIREBASE_* environment variables.');
}

// Initialize Analytics and Performance only on client side
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);

      // Only initialize performance if not disabled
      if (process.env.NEXT_PUBLIC_DISABLE_FIREBASE_PERFORMANCE !== 'true') {
        performance = getPerformance(app);

        // Disable automatic instrumentation to prevent CSS class attribute errors
        if (performance) {
          try {
            (performance as any).dataCollectionEnabled = false;
            (performance as any).instrumentationEnabled = false;
          } catch (error) {
            console.debug('Failed to configure Firebase Performance:', error);
          }
        }
      }
    }
  });
}

// Offline persistence is now enabled by default in newer Firebase versions
// The deprecated enableIndexedDbPersistence method is no longer needed

// Collection names for consistency
export const collections = {
  users: 'users',
  quotes: 'quotes',
  projects: 'projects',
  messages: 'messages',
  notifications: 'notifications',
  consultations: 'consultations',
  documents: 'documents',
  activityLogs: 'activityLogs',
  activities: 'activities',
  invoices: 'invoices',
  payments: 'payments',
  companySettings: 'companySettings',
};

export { app, auth, db, storage, analytics, performance, isFirebaseConfigValid };

// Auth helper functions
export const getCurrentUser = () => auth.currentUser;

export const isAuthenticated = () => !!auth.currentUser;

export const getUserRole = async (): Promise<string | null> => {
  const user = auth.currentUser;
  if (!user) return null;

  const idTokenResult = await user.getIdTokenResult();
  return (idTokenResult.claims.role as string) || null;
};

// Firestore helper functions
export const serverTimestamp = firestoreServerTimestamp;

// Storage helper functions
export const getStorageUrl = (path: string) => {
  return `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${encodeURIComponent(path)}?alt=media`;
};
