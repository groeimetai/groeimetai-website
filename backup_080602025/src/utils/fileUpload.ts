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
  projectId?: string
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
    await addDoc(collection(db, 'documents'), {
      uploadedBy: {
        uid: userId,
        name: userName,
        email: userEmail,
      },
      name: file.name,
      type: getDocumentType(file.type),
      size: file.size,
      url: downloadURL,
      storagePath,
      projectId,
      createdAt: serverTimestamp(),
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
