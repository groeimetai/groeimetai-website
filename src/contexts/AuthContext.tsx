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
import { logAuthActivity, logErrorActivity } from '@/services/activityLogger';

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

      // Check if email is verified
      if (!credential.user.emailVerified) {
        // Send verification email again
        await sendEmailVerification(credential.user);
        // Sign out the user
        await signOut(auth);
        const error: any = new Error('Email not verified');
        error.code = 'auth/email-not-verified';
        throw error;
      }

      const userData = await createOrUpdateUserDoc(credential.user);
      setUser(userData);

      // Log successful login (wrap in try-catch to prevent permission errors)
      try {
        await logAuthActivity('auth.login', credential.user.uid, credential.user.email || '', {
          method: 'email',
          timestamp: new Date().toISOString(),
        });
      } catch (logError) {
        console.error('Failed to log activity:', logError);
      }
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

      // Log failed login attempt
      await logErrorActivity(
        'auth.login',
        error,
        {
          uid: 'unknown',
          email: email,
          displayName: undefined,
        },
        {
          errorCode: error.code,
          method: 'email',
        }
      );

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

      // Don't send Firebase's default email - we'll send our own custom email
      // await sendEmailVerification(credential.user);
      
      // Send custom verification email via our email service
      try {
        const response = await fetch('/api/auth/send-verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: credential.user.email,
            uid: credential.user.uid,
            lang: userData.language || 'nl',
          }),
        });
        
        if (!response.ok) {
          console.error('Failed to send custom verification email');
        }
      } catch (emailError) {
        console.error('Error sending verification email:', emailError);
      }

      // Create user document
      const newUser = await createOrUpdateUserDoc(credential.user, userData);
      setUser(newUser);

      // Log successful registration (wrap in try-catch to prevent permission errors)
      try {
        await logAuthActivity('auth.register', credential.user.uid, credential.user.email || '', {
          method: 'email',
          emailVerificationSent: true,
          timestamp: new Date().toISOString(),
        });
      } catch (logError) {
        console.error('Failed to log activity:', logError);
      }
    } catch (error: any) {
      setError(error.message);

      // Log failed registration (wrap in try-catch to prevent permission errors)
      try {
        await logErrorActivity(
        'auth.register',
        error,
        {
          uid: 'unknown',
          email: email,
          displayName: userData.displayName,
        },
        {
          errorCode: error.code,
        }
      );

      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      setError(null);

      // Log logout before clearing user state
      if (firebaseUser) {
        await logAuthActivity('auth.logout', firebaseUser.uid, firebaseUser.email || '', {
          timestamp: new Date().toISOString(),
        });
      }

      await signOut(auth);
      setUser(null);
      setFirebaseUser(null);
    } catch (error: any) {
      setError(error.message);

      // Log failed logout
      if (firebaseUser) {
        await logErrorActivity(
          'auth.logout',
          error,
          {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || undefined,
          },
          {
            errorCode: error.code,
          }
        );
      }

      throw error;
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      setError(null);
      
      // Don't use Firebase's default email - send our custom email
      // await sendPasswordResetEmail(auth, email);
      
      // Send custom password reset email via our email service
      const response = await fetch('/api/auth/send-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          lang: user?.language || 'nl',
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send password reset email');
      }

      // Log password reset request (wrap in try-catch to prevent permission errors)
      try {
        await logAuthActivity('auth.password_reset', 'unknown', email, {
          timestamp: new Date().toISOString(),
        });
      } catch (logError) {
        console.error('Failed to log activity:', logError);
      }
    } catch (error: any) {
      setError(error.message);

      // Log failed password reset (wrap in try-catch to prevent permission errors)
      try {
        await logErrorActivity(
          'auth.password_reset',
          error,
        {
          uid: 'unknown',
          email: email,
          displayName: undefined,
        },
        {
          errorCode: error.code,
        }
      );

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

      // Log successful Google login (wrap in try-catch to prevent permission errors)
      try {
        await logAuthActivity('auth.login', credential.user.uid, credential.user.email || '', {
          method: 'google',
          timestamp: new Date().toISOString(),
        });
      } catch (logError) {
        console.error('Failed to log activity:', logError);
      }
    } catch (error: any) {
      setError(error.message);

      // Log failed Google login (wrap in try-catch to prevent permission errors)
      try {
        await logErrorActivity(
        'auth.login',
        error,
        {
          uid: 'unknown',
          email: 'unknown',
          displayName: undefined,
        },
        {
          errorCode: error.code,
          method: 'google',
        }
      );

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

      // Log successful LinkedIn login
      await logAuthActivity('auth.login', credential.user.uid, credential.user.email || '', {
        method: 'linkedin',
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      setError(error.message);

      // Log failed LinkedIn login
      await logErrorActivity(
        'auth.login',
        error,
        {
          uid: 'unknown',
          email: 'unknown',
          displayName: undefined,
        },
        {
          errorCode: error.code,
          method: 'linkedin',
        }
      );

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
      
      // Don't use Firebase's default email - send our custom email
      // await sendEmailVerification(firebaseUser);
      
      // Send custom verification email via our email service
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: firebaseUser.email,
          uid: firebaseUser.uid,
          lang: user?.language || 'nl',
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send verification email');
      }
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
        // Only set user if email is verified (except for social logins which are pre-verified)
        if (
          firebaseUser.emailVerified ||
          firebaseUser.providerData.some(
            (p) => p.providerId === 'google.com' || p.providerId === 'linkedin.com'
          )
        ) {
          const userData = await fetchUserData(firebaseUser.uid);
          if (userData) {
            setUser(userData);
          } else {
            // User exists in Firebase but not in Firestore, create document
            const newUser = await createOrUpdateUserDoc(firebaseUser);
            setUser(newUser);
          }
        } else {
          // User exists but email not verified
          setUser(null);
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
