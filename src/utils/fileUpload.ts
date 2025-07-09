import { storage, db } from '@/lib/firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

export interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  storagePath: string;
}

export const uploadFile = async (
  file: File,
  userId: string,
  userName: string,
  userEmail: string,
  projectId?: string,
  projectName?: string
): Promise<FileAttachment> => {
  try {
    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    const storagePath = `uploads/${userId}/${uniqueFileName}`;

    // Upload to Firebase Storage
    const storageRef = ref(storage, storagePath);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    // Create file attachment object
    const fileAttachment: FileAttachment = {
      id: uuidv4(),
      name: file.name,
      size: file.size,
      type: file.type,
      url: downloadURL,
      storagePath,
    };

    // Save to documents collection for /dashboard/documents visibility
    // Using the same structure as firebaseDocumentService
    await addDoc(collection(db, 'documents'), {
      name: file.name,
      type: getDetailedDocumentType(file),
      size: file.size,
      mimeType: file.type,
      uploadedAt: serverTimestamp(),
      uploadedBy: {
        uid: userId,
        email: userEmail,
        name: userName,
      },
      projectId: projectId || null,
      projectName: projectName || null,
      url: downloadURL,
      storagePath,
      description: 'Shared via chat',
      tags: ['chat', 'message-attachment'],
      isArchived: false,
      sharedInMessage: true,
    });

    return fileAttachment;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file');
  }
};

export const getDocumentType = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'document';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'spreadsheet';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'presentation';
  return 'other';
};

// Get document type that matches firebaseDocumentService types
export const getDetailedDocumentType = (file: File): 'contract' | 'proposal' | 'report' | 'invoice' | 'presentation' | 'other' => {
  const mimeType = file.type;
  const fileName = file.name.toLowerCase();

  // Check filename for specific document types
  if (fileName.includes('contract')) return 'contract';
  if (fileName.includes('proposal')) return 'proposal';
  if (fileName.includes('report')) return 'report';
  if (fileName.includes('invoice')) return 'invoice';
  
  // Check for presentation files
  if (
    mimeType.includes('presentation') ||
    fileName.endsWith('.ppt') ||
    fileName.endsWith('.pptx')
  ) {
    return 'presentation';
  }

  return 'other';
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileIcon = (type: string): string => {
  const iconMap: { [key: string]: string } = {
    image: '🖼️',
    video: '🎥',
    pdf: '📄',
    document: '📝',
    spreadsheet: '📊',
    presentation: '📊',
    other: '📎',
  };
  return iconMap[type] || iconMap.other;
};
