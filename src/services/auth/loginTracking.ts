import { doc, updateDoc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export class LoginTrackingService {
  static async updateLastLogin(uid: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      
      // Try to update existing document
      await updateDoc(userRef, {
        lastLogin: serverTimestamp(),
        lastActivityAt: serverTimestamp()
      });
      
    } catch (error) {
      // If document doesn't exist, create it
      try {
        await setDoc(userRef, {
          lastLogin: serverTimestamp(),
          lastActivityAt: serverTimestamp(),
          createdAt: serverTimestamp()
        }, { merge: true });
      } catch (createError) {
        console.error('Error creating user document:', createError);
      }
    }
  }

  static async getLastLogin(uid: string): Promise<Date | null> {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        return userData.lastLogin?.toDate() || null;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting last login:', error);
      return null;
    }
  }

  static async trackActivity(uid: string, activity: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        lastActivityAt: serverTimestamp(),
        [`activities.${activity}`]: serverTimestamp()
      });
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  }
}