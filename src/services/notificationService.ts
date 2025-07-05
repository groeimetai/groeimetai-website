import { 
  collection, 
  addDoc, 
  serverTimestamp,
  query,
  where,
  getDocs,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Notification } from '@/components/NotificationCenter';

export const notificationService = {
  // Create a new notification
  async create(data: Omit<Notification, 'id' | 'createdAt'>) {
    try {
      const docRef = await addDoc(collection(db, 'notifications'), {
        ...data,
        createdAt: serverTimestamp(),
        read: false
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  // Send notification to user
  async sendToUser(userId: string, notification: {
    type: Notification['type'];
    title: string;
    description: string;
    link?: string;
    priority?: 'low' | 'medium' | 'high';
    actionRequired?: boolean;
  }) {
    return this.create({
      userId,
      ...notification,
      read: false
    });
  },

  // Send notification to all users
  async broadcast(notification: {
    type: Notification['type'];
    title: string;
    description: string;
    link?: string;
    priority?: 'low' | 'medium' | 'high';
  }) {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const promises = usersSnapshot.docs.map(userDoc => 
        this.sendToUser(userDoc.id, notification)
      );
      await Promise.all(promises);
    } catch (error) {
      console.error('Error broadcasting notification:', error);
      throw error;
    }
  },

  // Delete old notifications (older than 30 days)
  async cleanupOld(userId: string) {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('createdAt', '<', thirtyDaysAgo),
        where('read', '==', true)
      );
      
      const snapshot = await getDocs(q);
      const promises = snapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      
      await Promise.all(promises);
    } catch (error) {
      console.error('Error cleaning up notifications:', error);
      throw error;
    }
  },

  // Common notification templates
  templates: {
    newMessage: (fromName: string) => ({
      type: 'message' as const,
      title: 'New Message',
      description: `You have a new message from ${fromName}`,
      priority: 'medium' as const
    }),

    quoteStatusUpdate: (projectName: string, status: string) => ({
      type: 'quote' as const,
      title: 'Quote Status Update',
      description: `Your quote for "${projectName}" has been ${status}`,
      priority: 'high' as const,
      actionRequired: status === 'approved'
    }),

    projectUpdate: (projectName: string, update: string) => ({
      type: 'project' as const,
      title: 'Project Update',
      description: `${projectName}: ${update}`,
      priority: 'medium' as const
    }),

    paymentReminder: (amount: string, dueDate: string) => ({
      type: 'payment' as const,
      title: 'Payment Reminder',
      description: `Payment of ${amount} is due on ${dueDate}`,
      priority: 'high' as const,
      actionRequired: true
    }),

    meetingReminder: (meetingTitle: string, time: string) => ({
      type: 'meeting' as const,
      title: 'Meeting Reminder',
      description: `${meetingTitle} scheduled for ${time}`,
      priority: 'high' as const
    }),

    systemAnnouncement: (message: string) => ({
      type: 'system' as const,
      title: 'System Update',
      description: message,
      priority: 'low' as const
    })
  }
};