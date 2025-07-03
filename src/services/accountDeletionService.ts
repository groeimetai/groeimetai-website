import { auth, db, storage } from '@/lib/firebase/config';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';
import { 
  ref, 
  listAll, 
  deleteObject 
} from 'firebase/storage';
import { 
  EmailAuthProvider, 
  reauthenticateWithCredential, 
  deleteUser 
} from 'firebase/auth';

interface DeletionProgress {
  status: string;
  percentage: number;
}

interface DeletionResult {
  success: boolean;
  error?: string;
}

export class AccountDeletionService {
  /**
   * Re-authenticate user before deletion
   */
  static async reauthenticate(email: string, password: string): Promise<boolean> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user found');

      const credential = EmailAuthProvider.credential(email, password);
      await reauthenticateWithCredential(user, credential);
      return true;
    } catch (error) {
      console.error('Re-authentication failed:', error);
      throw new Error('Invalid password. Please try again.');
    }
  }

  /**
   * Delete all user documents from Firestore
   */
  private static async deleteFirestoreData(
    userId: string, 
    onProgress?: (progress: DeletionProgress) => void
  ): Promise<void> {
    try {
      // Collections to delete
      const collections = [
        'users',
        'userSettings',
        'documents',
        'projects',
        'meetings',
        'notifications',
        'activityLogs',
        'billing'
      ];

      let deletedCount = 0;
      const totalCollections = collections.length;

      for (const collectionName of collections) {
        onProgress?.({
          status: `Deleting ${collectionName}...`,
          percentage: Math.round((deletedCount / totalCollections) * 50) // 50% for Firestore
        });

        try {
          if (collectionName === 'users' || collectionName === 'userSettings' || collectionName === 'billing') {
            // Direct document deletion
            const docRef = doc(db, collectionName, userId);
            await deleteDoc(docRef);
          } else {
            // Query and delete documents where userId matches
            const q = query(
              collection(db, collectionName),
              where('userId', '==', userId)
            );
            const querySnapshot = await getDocs(q);
            
            const deletePromises = querySnapshot.docs.map(doc => 
              deleteDoc(doc.ref)
            );
            await Promise.all(deletePromises);
          }
        } catch (error) {
          console.error(`Error deleting ${collectionName}:`, error);
          // Continue with other collections even if one fails
        }

        deletedCount++;
      }

    } catch (error) {
      console.error('Error deleting Firestore data:', error);
      throw new Error('Failed to delete account data');
    }
  }

  /**
   * Delete all user files from Firebase Storage
   */
  private static async deleteStorageData(
    userId: string,
    onProgress?: (progress: DeletionProgress) => void
  ): Promise<void> {
    try {
      // Storage paths to clean
      const storagePaths = [
        `documents/${userId}`,
        `avatars/${userId}`,
        `uploads/${userId}`,
        `projects/${userId}`
      ];

      let deletedPaths = 0;
      const totalPaths = storagePaths.length;

      for (const path of storagePaths) {
        onProgress?.({
          status: `Deleting files from ${path}...`,
          percentage: 50 + Math.round((deletedPaths / totalPaths) * 40) // 40% for Storage
        });

        try {
          const folderRef = ref(storage, path);
          const fileList = await listAll(folderRef);

          // Delete all files in the folder
          const deletePromises = fileList.items.map(item => 
            deleteObject(item)
          );
          await Promise.all(deletePromises);

          // Recursively delete subfolders
          for (const prefix of fileList.prefixes) {
            const subfolderList = await listAll(prefix);
            const subfolderDeletes = subfolderList.items.map(item => 
              deleteObject(item)
            );
            await Promise.all(subfolderDeletes);
          }
        } catch (error) {
          console.error(`Error deleting storage path ${path}:`, error);
          // Continue with other paths even if one fails
        }

        deletedPaths++;
      }

      // Also check for avatar files with timestamp pattern
      try {
        const avatarRef = ref(storage, 'avatars');
        const avatarList = await listAll(avatarRef);
        
        // Filter and delete files that start with userId
        const userAvatars = avatarList.items.filter(item => 
          item.name.startsWith(`${userId}-`)
        );
        
        const avatarDeletes = userAvatars.map(item => deleteObject(item));
        await Promise.all(avatarDeletes);
      } catch (error) {
        console.error('Error deleting avatar files:', error);
      }

    } catch (error) {
      console.error('Error deleting Storage data:', error);
      throw new Error('Failed to delete user files');
    }
  }

  /**
   * Delete the Firebase Auth account
   */
  private static async deleteAuthAccount(): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user found');

      await deleteUser(user);
    } catch (error) {
      console.error('Error deleting auth account:', error);
      throw new Error('Failed to delete authentication account');
    }
  }

  /**
   * Main method to delete entire account
   */
  static async deleteAccount(
    email: string,
    password: string,
    onProgress?: (progress: DeletionProgress) => void
  ): Promise<DeletionResult> {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, error: 'No authenticated user found' };
      }

      // Step 1: Re-authenticate
      onProgress?.({ status: 'Verifying credentials...', percentage: 10 });
      await this.reauthenticate(email, password);

      // Step 2: Delete Firestore data
      onProgress?.({ status: 'Deleting account data...', percentage: 20 });
      await this.deleteFirestoreData(user.uid, onProgress);

      // Step 3: Delete Storage data
      onProgress?.({ status: 'Deleting files...', percentage: 60 });
      await this.deleteStorageData(user.uid, onProgress);

      // Step 4: Delete Auth account (must be last)
      onProgress?.({ status: 'Finalizing account deletion...', percentage: 90 });
      await this.deleteAuthAccount();

      onProgress?.({ status: 'Account deleted successfully', percentage: 100 });
      
      return { success: true };
    } catch (error: any) {
      console.error('Account deletion failed:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to delete account' 
      };
    }
  }

  /**
   * Get a summary of what will be deleted
   */
  static async getDataSummary(userId: string): Promise<{
    documentCount: number;
    projectCount: number;
    meetingCount: number;
    storageUsed: number;
  }> {
    try {
      let documentCount = 0;
      let projectCount = 0;
      let meetingCount = 0;
      let storageUsed = 0;

      // Count documents
      const documentsQuery = query(
        collection(db, 'documents'),
        where('userId', '==', userId)
      );
      const documentsSnapshot = await getDocs(documentsQuery);
      documentCount = documentsSnapshot.size;

      // Count projects
      const projectsQuery = query(
        collection(db, 'projects'),
        where('userId', '==', userId)
      );
      const projectsSnapshot = await getDocs(projectsQuery);
      projectCount = projectsSnapshot.size;

      // Count meetings
      const meetingsQuery = query(
        collection(db, 'meetings'),
        where('userId', '==', userId)
      );
      const meetingsSnapshot = await getDocs(meetingsQuery);
      meetingCount = meetingsSnapshot.size;

      // Calculate storage used (approximate)
      documentsSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.size) {
          storageUsed += data.size;
        }
      });

      return {
        documentCount,
        projectCount,
        meetingCount,
        storageUsed
      };
    } catch (error) {
      console.error('Error getting data summary:', error);
      return {
        documentCount: 0,
        projectCount: 0,
        meetingCount: 0,
        storageUsed: 0
      };
    }
  }
}

export const accountDeletionService = AccountDeletionService;