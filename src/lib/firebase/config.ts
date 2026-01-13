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

// Check if Firebase credentials are available
function hasFirebaseConfig(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET &&
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  );
}

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Config validity check
const isFirebaseConfigValid = hasFirebaseConfig();

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let analytics: Analytics | null = null;
let performance: FirebasePerformance | null = null;

// Only initialize if config is available (not during build time)
if (hasFirebaseConfig()) {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }

  // Initialize services
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);

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
} else {
  // During build time, these will be undefined but typed as if they exist
  // This is safe because client-side code only runs in the browser with env vars
  app = null as unknown as FirebaseApp;
  auth = null as unknown as Auth;
  db = null as unknown as Firestore;
  storage = null as unknown as FirebaseStorage;

  // Log warning in development
  if (process.env.NODE_ENV === 'development') {
    console.warn('Firebase config not available. Set NEXT_PUBLIC_FIREBASE_* environment variables.');
  }
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
