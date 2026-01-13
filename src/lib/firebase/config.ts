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

// Firebase configuration - hardcoded (client-side, public keys)
// These are safe to expose - security is handled by Firebase Security Rules
const firebaseConfig = {
  apiKey: "AIzaSyDava1yANafho1-TCfFaWmr5PscZUi1D3E",
  authDomain: "groeimetai-458417.firebaseapp.com",
  databaseURL: "https://groeimetai-458417-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "groeimetai-458417",
  storageBucket: "groeimetai-458417.firebasestorage.app",
  messagingSenderId: "194122035772",
  appId: "1:194122035772:web:2b31d75962fc5f7cfec939",
  measurementId: "G-9PJWBTPMLH",
};

// Config is always valid (hardcoded)
const isFirebaseConfigValid = true;

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let analytics: Analytics | null = null;
let performance: FirebasePerformance | null = null;

// Initialize Firebase
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
