import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { getAnalytics, Analytics, isSupported } from 'firebase/analytics';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  getMetadata,
  FirebaseStorage,
} from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let analytics: Analytics | null = null;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

auth = getAuth(app);
db = getFirestore(app);
storage = getStorage(app);

// Initialize Analytics only on client-side
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

// Collection names
export const collections = {
  users: 'users',
  quotes: 'quotes',
  projects: 'projects',
  messages: 'messages',
  notifications: 'notifications',
  consultations: 'consultations',
  documents: 'documents',
  activityLogs: 'activityLogs',
  invoices: 'invoices',
  payments: 'payments',
};

// User profile interface
export interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  company: string;
  jobTitle?: string;
  phone?: string;
  role: 'customer' | 'admin';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
  hasCompletedOnboarding: boolean;
  preferences?: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    language: string;
  };
}

// Quote interface
export interface Quote {
  id?: string;
  userId: string;
  userEmail: string;
  fullName: string;
  company: string;
  jobTitle?: string;
  phone?: string;
  projectName: string;
  services: string[];
  projectDescription: string;
  budget: string;
  timeline: string;
  additionalRequirements?: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isNewAccount: boolean;
  accountType: 'account' | 'guest';
}

// Auth functions
export const authFunctions = {
  // Sign up new user
  async signUp(email: string, password: string, userData: Partial<UserProfile>) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user profile in Firestore
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        fullName: userData.fullName || '',
        company: userData.company || '',
        jobTitle: userData.jobTitle,
        phone: userData.phone,
        role: 'customer',
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
        isActive: true,
        hasCompletedOnboarding: false,
        preferences: {
          emailNotifications: true,
          smsNotifications: false,
          language: 'en',
        },
      };

      await setDoc(doc(db, collections.users, user.uid), userProfile);

      return { user, userProfile };
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  },

  // Sign in existing user
  async signIn(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get user profile from Firestore
      const userDoc = await getDoc(doc(db, collections.users, user.uid));
      const userProfile = userDoc.data() as UserProfile;

      return { user, userProfile };
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  },

  // Sign out
  async signOut() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  },

  // Reset password
  async resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  },

  // Get current user
  getCurrentUser(): User | null {
    return auth.currentUser;
  },

  // Listen to auth state changes
  onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  },
};

// Quote functions
export const quoteFunctions = {
  // Submit quote
  async submitQuote(quoteData: Omit<Quote, 'id' | 'createdAt' | 'updatedAt' | 'status'>) {
    try {
      const quote: Quote = {
        ...quoteData,
        status: 'pending',
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
      };

      const docRef = await setDoc(doc(collection(db, collections.quotes)), quote);

      // Send notification email (implement this on backend)

      return docRef;
    } catch (error) {
      console.error('Error submitting quote:', error);
      throw error;
    }
  },

  // Get user's quotes
  async getUserQuotes(userId: string) {
    try {
      // Implement query to get user's quotes
      // This would typically use a query with where clause
      return [];
    } catch (error) {
      console.error('Error getting user quotes:', error);
      throw error;
    }
  },
};

// User profile functions
export const userFunctions = {
  // Update user profile
  async updateProfile(userId: string, updates: Partial<UserProfile>) {
    try {
      await updateDoc(doc(db, collections.users, userId), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  // Get user profile
  async getProfile(userId: string) {
    try {
      const userDoc = await getDoc(doc(db, collections.users, userId));
      return userDoc.data() as UserProfile;
    } catch (error) {
      console.error('Error getting profile:', error);
      throw error;
    }
  },
};

export { app, auth, db, storage, analytics };
