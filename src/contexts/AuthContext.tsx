'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  updateProfile,
  sendEmailVerification,
  getMultiFactorResolver,
  MultiFactorError,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { User, UserRole } from '@/types';
import { isAdminEmail } from '@/lib/constants/adminEmails';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithLinkedIn: () => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user data from Firestore
  const fetchUserData = async (uid: string): Promise<User | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data() as User;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  // Create or update user document in Firestore
  const createOrUpdateUserDoc = async (
    firebaseUser: FirebaseUser,
    additionalData?: Partial<User>
  ): Promise<User> => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    const now = new Date();

    if (!userSnap.exists()) {
      // Create new user document
      // Prepare user data, removing undefined values
      const userData: any = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName || '',
        firstName: additionalData?.firstName || '',
        lastName: additionalData?.lastName || '',
        accountType: additionalData?.accountType || 'customer',
        company: additionalData?.company || '',
        jobTitle: additionalData?.jobTitle || '',
        title: additionalData?.jobTitle || '',
        phoneNumber: additionalData?.phoneNumber || '',
        role: (isAdminEmail(firebaseUser.email!) ? 'admin' : 'client') as UserRole,
        permissions: [],
        isActive: true,
        isVerified: firebaseUser.emailVerified,
        preferences: {
          language: 'en',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          notifications: {
            email: true,
            push: true,
            sms: false,
            inApp: true,
          },
          theme: 'system',
        },
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
        lastActivityAt: now,
        stats: {
          projectsCount: 0,
          consultationsCount: 0,
          messagesCount: 0,
          totalSpent: 0,
        },
        ...additionalData,
      };

      // Add optional fields only if they have values
      if (firebaseUser.photoURL) {
        userData.photoURL = firebaseUser.photoURL;
      }
      if (firebaseUser.phoneNumber) {
        userData.phoneNumber = firebaseUser.phoneNumber;
      }
      if (additionalData?.phoneNumber) {
        userData.phoneNumber = additionalData.phoneNumber;
      }

      const newUser: User = userData;

      await setDoc(userRef, newUser);
      return newUser;
    } else {
      // Update existing user, filter out undefined values
      const updateData: any = {
        lastLoginAt: now,
        lastActivityAt: now,
        isVerified: firebaseUser.emailVerified,
      };

      // Add additional data, filtering out undefined values
      if (additionalData) {
        Object.keys(additionalData).forEach((key) => {
          if (additionalData[key as keyof typeof additionalData] !== undefined) {
            updateData[key] = additionalData[key as keyof typeof additionalData];
          }
        });
      }

      await updateDoc(userRef, updateData);

      return (await getDoc(userRef)).data() as User;
    }
  };

  // Login with email and password
  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const userData = await createOrUpdateUserDoc(credential.user);
      setUser(userData);
    } catch (error: any) {
      // Check if error requires multi-factor authentication
      if (error.code === 'auth/multi-factor-auth-required') {
        // Return the resolver for the login page to handle
        const mfaError = error as MultiFactorError;
        const resolver = getMultiFactorResolver(auth, mfaError);
        throw {
          code: 'auth/multi-factor-auth-required',
          resolver,
          message: 'Multi-factor authentication required',
        };
      }
      setError(error.message);
      throw error;
    }
  };

  // Register new user
  const register = async (email: string, password: string, userData: Partial<User>) => {
    try {
      setError(null);
      const credential = await createUserWithEmailAndPassword(auth, email, password);

      // Update display name if provided
      if (userData.displayName) {
        await updateProfile(credential.user, {
          displayName: userData.displayName,
        });
      }

      // Send verification email
      await sendEmailVerification(credential.user);

      // Create user document
      const newUser = await createOrUpdateUserDoc(credential.user, userData);
      setUser(newUser);
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      setUser(null);
      setFirebaseUser(null);
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  // Login with Google
  const loginWithGoogle = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');

      const credential = await signInWithPopup(auth, provider);
      const userData = await createOrUpdateUserDoc(credential.user, {
        displayName: credential.user.displayName || undefined,
        photoURL: credential.user.photoURL || undefined,
      });
      setUser(userData);
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  // Login with LinkedIn
  const loginWithLinkedIn = async () => {
    try {
      setError(null);
      const provider = new OAuthProvider('linkedin.com');
      provider.addScope('r_liteprofile');
      provider.addScope('r_emailaddress');

      const credential = await signInWithPopup(auth, provider);
      const userData = await createOrUpdateUserDoc(credential.user, {
        displayName: credential.user.displayName || undefined,
        photoURL: credential.user.photoURL || undefined,
      });
      setUser(userData);
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  // Update user profile
  const updateUserProfile = async (data: Partial<User>) => {
    try {
      setError(null);
      if (!firebaseUser) throw new Error('No authenticated user');

      const userRef = doc(db, 'users', firebaseUser.uid);
      await updateDoc(userRef, {
        ...data,
        updatedAt: new Date(),
      });

      // Update local state
      if (user) {
        setUser({ ...user, ...data });
      }
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  // Send verification email
  const sendVerificationEmail = async () => {
    try {
      setError(null);
      if (!firebaseUser) throw new Error('No authenticated user');
      await sendEmailVerification(firebaseUser);
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    try {
      if (!firebaseUser) return;
      const userData = await fetchUserData(firebaseUser.uid);
      if (userData) {
        setUser(userData);
      }
    } catch (error: any) {
      console.error('Error refreshing user:', error);
    }
  };

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        const userData = await fetchUserData(firebaseUser.uid);
        if (userData) {
          setUser(userData);
        } else {
          // User exists in Firebase but not in Firestore, create document
          const newUser = await createOrUpdateUserDoc(firebaseUser);
          setUser(newUser);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    error,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    resetPassword,
    loginWithGoogle,
    loginWithLinkedIn,
    updateUserProfile,
    sendVerificationEmail,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
