import { db, collections } from '@/lib/firebase/config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { AdminApiKey } from '@/types';

// Helper to generate secure random string
function generateSecureKey(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomValues = new Uint32Array(length);

  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(randomValues);
  } else {
    // Fallback for server-side (less secure, but acceptable for this use case)
    for (let i = 0; i < length; i++) {
      randomValues[i] = Math.floor(Math.random() * chars.length);
    }
  }

  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }

  return result;
}

// Simple hash function (for client-side use)
// In production, you'd want to use a server-side hashing with bcrypt
async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);

  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  // Fallback: simple hash (not cryptographically secure, but works for development)
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    const char = key.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

// Helper to convert timestamps
function convertTimestamps(data: any): any {
  if (!data) return data;

  const result = { ...data };

  if (result.createdAt instanceof Timestamp) {
    result.createdAt = result.createdAt.toDate();
  }
  if (result.lastUsedAt instanceof Timestamp) {
    result.lastUsedAt = result.lastUsedAt.toDate();
  }

  return result;
}

class ApiKeyService {
  private collectionRef = collection(db, collections.apiKeys);

  /**
   * Generate a new API key
   * Returns the FULL key only once - it cannot be retrieved again
   */
  async generateApiKey(
    name: string,
    permissions: string[],
    createdBy: string
  ): Promise<{ key: AdminApiKey; fullKey: string }> {
    try {
      // Generate full key with prefix
      const keyBody = generateSecureKey(32);
      const fullKey = `sk-${keyBody}`;
      const keyPrefix = `sk-${keyBody.substring(0, 6)}...`;

      // Hash the key for storage
      const keyHash = await hashKey(fullKey);

      // Create the key document
      const keyId = `key-${Date.now()}`;
      const docRef = doc(this.collectionRef, keyId);

      const apiKeyData: Omit<AdminApiKey, 'id'> & { id: string } = {
        id: keyId,
        name,
        keyPrefix,
        keyHash,
        permissions,
        isActive: true,
        createdAt: new Date(),
        createdBy,
      };

      await setDoc(docRef, {
        ...apiKeyData,
        createdAt: serverTimestamp(),
      });

      return {
        key: apiKeyData,
        fullKey, // Return full key ONLY ONCE
      };
    } catch (error) {
      console.error('Error generating API key:', error);
      throw error;
    }
  }

  /**
   * List all API keys (returns only prefix, not full key)
   */
  async listApiKeys(): Promise<AdminApiKey[]> {
    try {
      const q = query(
        this.collectionRef,
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => {
        const data = convertTimestamps(doc.data());
        return {
          id: doc.id,
          ...data,
        } as AdminApiKey;
      });
    } catch (error) {
      console.error('Error listing API keys:', error);
      throw error;
    }
  }

  /**
   * Get a single API key by ID
   */
  async getApiKey(keyId: string): Promise<AdminApiKey | null> {
    try {
      const docRef = doc(this.collectionRef, keyId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return convertTimestamps({
        id: docSnap.id,
        ...docSnap.data(),
      }) as AdminApiKey;
    } catch (error) {
      console.error('Error getting API key:', error);
      throw error;
    }
  }

  /**
   * Verify an API key (for API authentication)
   */
  async verifyApiKey(fullKey: string): Promise<AdminApiKey | null> {
    try {
      const keyHash = await hashKey(fullKey);

      const q = query(
        this.collectionRef,
        where('keyHash', '==', keyHash),
        where('isActive', '==', true)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      const data = convertTimestamps(doc.data());

      // Update last used timestamp
      await updateDoc(doc.ref, {
        lastUsedAt: serverTimestamp(),
      });

      return {
        id: doc.id,
        ...data,
      } as AdminApiKey;
    } catch (error) {
      console.error('Error verifying API key:', error);
      return null;
    }
  }

  /**
   * Revoke (deactivate) an API key
   */
  async revokeApiKey(keyId: string): Promise<void> {
    try {
      const docRef = doc(this.collectionRef, keyId);

      await updateDoc(docRef, {
        isActive: false,
      });
    } catch (error) {
      console.error('Error revoking API key:', error);
      throw error;
    }
  }

  /**
   * Permanently delete an API key
   */
  async deleteApiKey(keyId: string): Promise<void> {
    try {
      const docRef = doc(this.collectionRef, keyId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting API key:', error);
      throw error;
    }
  }

  /**
   * Update API key permissions
   */
  async updateApiKeyPermissions(
    keyId: string,
    permissions: string[]
  ): Promise<void> {
    try {
      const docRef = doc(this.collectionRef, keyId);

      await updateDoc(docRef, {
        permissions,
      });
    } catch (error) {
      console.error('Error updating API key permissions:', error);
      throw error;
    }
  }

  /**
   * Rename an API key
   */
  async renameApiKey(keyId: string, name: string): Promise<void> {
    try {
      const docRef = doc(this.collectionRef, keyId);

      await updateDoc(docRef, {
        name,
      });
    } catch (error) {
      console.error('Error renaming API key:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const apiKeyService = new ApiKeyService();
