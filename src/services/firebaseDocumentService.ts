import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  addDoc,
  QueryConstraint,
  startAfter,
  DocumentSnapshot,
} from 'firebase/firestore';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  getMetadata,
} from 'firebase/storage';
import { db, storage, auth } from '@/lib/firebase/config';
import { collections } from '@/lib/firebase';
import { logResourceActivity, logErrorActivity } from './activityLogger';

export type DocumentType =
  | 'contract'
  | 'proposal'
  | 'report'
  | 'invoice'
  | 'presentation'
  | 'other';

export interface FirebaseDocument {
  id?: string;
  name: string;
  type: DocumentType;
  size: number; // in bytes
  mimeType: string;
  uploadedAt: any; // Firebase Timestamp
  uploadedBy: {
    uid: string;
    email: string;
    name: string;
  };
  projectId?: string;
  projectName?: string;
  url: string;
  storagePath: string;
  description?: string;
  tags?: string[];
  isArchived?: boolean;
}

export interface UploadProgress {
  progress: number;
  bytesTransferred: number;
  totalBytes: number;
  state: 'running' | 'paused' | 'success' | 'canceled' | 'error';
}

// Helper function to get document type from file
const getDocumentType = (file: File): DocumentType => {
  const mimeType = file.type;
  const fileName = file.name.toLowerCase();

  if (mimeType.includes('pdf') || fileName.endsWith('.pdf')) {
    if (fileName.includes('contract')) return 'contract';
    if (fileName.includes('proposal')) return 'proposal';
    if (fileName.includes('report')) return 'report';
    if (fileName.includes('invoice')) return 'invoice';
  }

  if (
    mimeType.includes('presentation') ||
    fileName.endsWith('.ppt') ||
    fileName.endsWith('.pptx')
  ) {
    return 'presentation';
  }

  return 'other';
};

export const firebaseDocumentService = {
  // Upload document to Firebase Storage and create Firestore record
  async uploadDocument(
    file: File,
    userId: string,
    userEmail: string,
    userName: string,
    metadata?: {
      projectId?: string;
      projectName?: string;
      description?: string;
      tags?: string[];
      type?: DocumentType;
    },
    onProgress?: (progress: UploadProgress) => void
  ): Promise<FirebaseDocument> {
    try {
      // Create unique file path
      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `documents/${userId}/${timestamp}_${sanitizedFileName}`;

      // Create storage reference
      const storageRef = ref(storage, storagePath);

      // Start upload
      const uploadTask = uploadBytesResumable(storageRef, file);

      // Handle upload progress
      if (onProgress) {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress({
              progress,
              bytesTransferred: snapshot.bytesTransferred,
              totalBytes: snapshot.totalBytes,
              state: snapshot.state as UploadProgress['state'],
            });
          },
          (error) => {
            console.error('Upload error:', error);
            throw error;
          }
        );
      }

      // Wait for upload to complete
      const snapshot = await uploadTask;

      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Create document metadata
      const documentData: FirebaseDocument = {
        name: file.name,
        type: metadata?.type || getDocumentType(file),
        size: file.size,
        mimeType: file.type,
        uploadedAt: serverTimestamp(),
        uploadedBy: {
          uid: userId,
          email: userEmail,
          name: userName,
        },
        projectId: metadata?.projectId,
        projectName: metadata?.projectName,
        url: downloadURL,
        storagePath: storagePath,
        description: metadata?.description,
        tags: metadata?.tags,
        isArchived: false,
      };

      // Add to Firestore
      const docRef = await addDoc(collection(db, collections.documents), documentData);

      const result = {
        ...documentData,
        id: docRef.id,
      };

      // Log activity
      await logResourceActivity(
        'file.upload',
        'file',
        docRef.id,
        file.name,
        {
          uid: userId,
          email: userEmail,
          displayName: userName,
        },
        {
          fileSize: file.size,
          fileType: file.type,
          documentType: result.type,
          projectId: metadata?.projectId,
          projectName: metadata?.projectName,
        }
      );

      return result;
    } catch (error: any) {
      console.error('Error uploading document:', error);
      
      // Log error
      await logErrorActivity(
        'file.upload',
        error,
        {
          uid: userId,
          email: userEmail,
          displayName: userName,
        },
        {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          projectId: metadata?.projectId,
        }
      );
      
      throw error;
    }
  },

  // Get all documents for a user
  async getUserDocuments(
    userId: string,
    filters?: {
      projectId?: string;
      type?: DocumentType;
      isArchived?: boolean;
      searchQuery?: string;
      pageSize?: number;
      lastDoc?: DocumentSnapshot;
    }
  ): Promise<{ documents: FirebaseDocument[]; lastDoc?: DocumentSnapshot }> {
    try {
      const constraints: QueryConstraint[] = [
        where('uploadedBy.uid', '==', userId),
        orderBy('uploadedAt', 'desc'),
      ];

      // Add filters
      if (filters?.projectId) {
        constraints.push(where('projectId', '==', filters.projectId));
      }

      if (filters?.type) {
        constraints.push(where('type', '==', filters.type));
      }

      if (filters?.isArchived !== undefined) {
        constraints.push(where('isArchived', '==', filters.isArchived));
      }

      // Add pagination
      if (filters?.lastDoc) {
        constraints.push(startAfter(filters.lastDoc));
      }

      if (filters?.pageSize) {
        constraints.push(limit(filters.pageSize));
      }

      const q = query(collection(db, collections.documents), ...constraints);
      const querySnapshot = await getDocs(q);

      const documents: FirebaseDocument[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as FirebaseDocument;
        documents.push({
          ...data,
          id: doc.id,
        });
      });

      // Filter by search query if provided (client-side filtering for name)
      let filteredDocuments = documents;
      if (filters?.searchQuery) {
        const searchLower = filters.searchQuery.toLowerCase();
        filteredDocuments = documents.filter(
          (doc) =>
            doc.name.toLowerCase().includes(searchLower) ||
            doc.projectName?.toLowerCase().includes(searchLower) ||
            doc.description?.toLowerCase().includes(searchLower) ||
            doc.tags?.some((tag) => tag.toLowerCase().includes(searchLower))
        );
      }

      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];

      return { documents: filteredDocuments, lastDoc };
    } catch (error) {
      console.error('Error getting user documents:', error);
      throw error;
    }
  },

  // Get single document
  async getDocument(documentId: string): Promise<FirebaseDocument | null> {
    try {
      const docRef = doc(db, collections.documents, documentId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          ...(docSnap.data() as FirebaseDocument),
          id: docSnap.id,
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting document:', error);
      throw error;
    }
  },

  // Download document
  async downloadDocument(documentData: FirebaseDocument): Promise<void> {
    try {
      // Create a temporary anchor element to trigger download
      const a = window.document.createElement('a');
      a.href = documentData.url;
      a.download = documentData.name;
      a.target = '_blank';
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      
      // Log activity
      const currentUser = auth.currentUser;
      if (currentUser) {
        await logResourceActivity(
          'file.download',
          'file',
          documentData.id || '',
          documentData.name,
          {
            uid: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName || undefined,
          },
          {
            fileSize: documentData.size,
            fileType: documentData.mimeType,
            documentType: documentData.type,
            projectId: documentData.projectId,
            projectName: documentData.projectName,
            uploadedBy: documentData.uploadedBy.email,
          }
        );
      }
    } catch (error: any) {
      console.error('Error downloading document:', error);
      
      // Log error
      const currentUser = auth.currentUser;
      if (currentUser) {
        await logErrorActivity(
          'file.download',
          error,
          {
            uid: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName || undefined,
          },
          {
            documentId: documentData.id,
            fileName: documentData.name,
          }
        );
      }
      
      throw error;
    }
  },

  // Delete document
  async deleteDocument(documentId: string, storagePath: string): Promise<void> {
    try {
      // Get document info before deleting
      const docRef = doc(db, collections.documents, documentId);
      const docSnap = await getDoc(docRef);
      const documentData = docSnap.exists() ? { ...docSnap.data(), id: docSnap.id } as FirebaseDocument : null;

      // Delete from Storage
      const storageRef = ref(storage, storagePath);
      await deleteObject(storageRef);

      // Delete from Firestore
      await deleteDoc(doc(db, collections.documents, documentId));
      
      // Log activity if we have document data and current user
      const currentUser = auth.currentUser;
      if (documentData && currentUser) {
        await logResourceActivity(
          'file.delete',
          'file',
          documentId,
          documentData.name,
          {
            uid: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName || undefined,
          },
          {
            fileSize: documentData.size,
            fileType: documentData.mimeType,
            documentType: documentData.type,
            projectId: documentData.projectId,
            projectName: documentData.projectName,
            uploadedBy: documentData.uploadedBy.email,
          }
        );
      }
    } catch (error: any) {
      console.error('Error deleting document:', error);
      
      // Log error
      const currentUser = auth.currentUser;
      if (currentUser) {
        await logErrorActivity(
          'file.delete',
          error,
          {
            uid: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName || undefined,
          },
          {
            documentId,
            storagePath,
          }
        );
      }
      
      throw error;
    }
  },

  // Archive/Unarchive document
  async toggleArchiveDocument(documentId: string, isArchived: boolean): Promise<void> {
    try {
      const docRef = doc(db, collections.documents, documentId);
      await updateDoc(docRef, {
        isArchived: isArchived,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error toggling archive status:', error);
      throw error;
    }
  },

  // Update document metadata
  async updateDocument(
    documentId: string,
    updates: Partial<Pick<FirebaseDocument, 'name' | 'description' | 'tags' | 'type'>>
  ): Promise<void> {
    try {
      const docRef = doc(db, collections.documents, documentId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  },

  // Get storage usage for user
  async getUserStorageUsage(userId: string): Promise<{
    totalBytes: number;
    documentCount: number;
  }> {
    try {
      const q = query(collection(db, collections.documents), where('uploadedBy.uid', '==', userId));

      const querySnapshot = await getDocs(q);

      let totalBytes = 0;
      let documentCount = 0;

      querySnapshot.forEach((doc) => {
        const data = doc.data() as FirebaseDocument;
        totalBytes += data.size || 0;
        documentCount++;
      });

      return { totalBytes, documentCount };
    } catch (error) {
      console.error('Error getting storage usage:', error);
      throw error;
    }
  },
};
