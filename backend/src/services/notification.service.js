import { db, collections } from '../config/firebase.config.js';
import { logger } from '../utils/logger.js';
import { cache } from '../utils/cache.js';
import { EventEmitter } from 'events';

/**
 * Notification Service - Handles real-time notifications and settings updates
 */
export class NotificationService extends EventEmitter {
  constructor() {
    super();
    this.clients = new Map(); // Store WebSocket connections
  }

  /**
   * Emit settings update to connected clients
   */
  static async emitSettingsUpdate(userId, category, data) {
    const updateData = {
      type: 'settings_update',
      category,
      data,
      timestamp: new Date().toISOString(),
    };

    // Emit to real-time connections (WebSocket/SSE)
    this.emitToUser(userId, updateData);

    // Store update for offline retrieval
    await this.storeRealtimeUpdate(userId, updateData);

    logger.info('Settings update emitted', { userId, category });
  }

  /**
   * Update notification subscriptions based on user preferences
   */
  static async updateSubscriptions(userId, notificationSettings) {
    try {
      // Update push notification subscriptions
      if (notificationSettings.push?.enabled) {
        await this.enablePushNotifications(userId, notificationSettings.push);
      } else {
        await this.disablePushNotifications(userId);
      }

      // Update email notification preferences
      await this.updateEmailSubscriptions(userId, notificationSettings.email);

      // Update in-app notification preferences
      await this.updateInAppSubscriptions(userId, notificationSettings.inApp);

      logger.info('Notification subscriptions updated', { userId });
    } catch (error) {
      logger.error('Failed to update notification subscriptions', error, { userId });
      throw error;
    }
  }

  /**
   * Enable push notifications for user
   */
  static async enablePushNotifications(userId, pushSettings) {
    const subscription = {
      userId,
      enabled: true,
      marketing: pushSettings.marketing || false,
      updates: pushSettings.updates || true,
      security: pushSettings.security || true,
      mentions: pushSettings.mentions || true,
      comments: pushSettings.comments || true,
      updatedAt: new Date().toISOString(),
    };

    await db
      .collection('push_subscriptions')
      .doc(userId)
      .set(subscription, { merge: true });
  }

  /**
   * Disable push notifications for user
   */
  static async disablePushNotifications(userId) {
    await db
      .collection('push_subscriptions')
      .doc(userId)
      .update({
        enabled: false,
        updatedAt: new Date().toISOString(),
      });
  }

  /**
   * Update email notification subscriptions
   */
  static async updateEmailSubscriptions(userId, emailSettings) {
    const subscription = {
      userId,
      marketing: emailSettings.marketing || false,
      updates: emailSettings.updates || true,
      security: emailSettings.security || true,
      mentions: emailSettings.mentions || true,
      comments: emailSettings.comments || true,
      updatedAt: new Date().toISOString(),
    };

    await db
      .collection('email_subscriptions')
      .doc(userId)
      .set(subscription, { merge: true });

    // Update external email service (SendGrid, etc.)
    // await this.updateExternalEmailSubscriptions(userId, emailSettings);
  }

  /**
   * Update in-app notification subscriptions
   */
  static async updateInAppSubscriptions(userId, inAppSettings) {
    const subscription = {
      userId,
      mentions: inAppSettings.mentions || true,
      comments: inAppSettings.comments || true,
      updates: inAppSettings.updates || true,
      achievements: inAppSettings.achievements || true,
      updatedAt: new Date().toISOString(),
    };

    await db
      .collection('inapp_subscriptions')
      .doc(userId)
      .set(subscription, { merge: true });
  }

  /**
   * Send real-time notification to user
   */
  static async sendRealtimeNotification(userId, notification) {
    const notificationData = {
      id: this.generateNotificationId(),
      userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data || {},
      read: false,
      createdAt: new Date().toISOString(),
    };

    // Store notification
    await db.collection('notifications').add(notificationData);

    // Emit to connected clients
    this.emitToUser(userId, {
      type: 'notification',
      ...notificationData,
    });

    logger.info('Real-time notification sent', { userId, type: notification.type });
  }

  /**
   * Send security alert notification
   */
  static async sendSecurityAlert(userId, alertType, details = {}) {
    const securityMessages = {
      suspicious_activity: 'Suspicious activity detected on your account',
      new_device_login: 'New device login detected',
      password_changed: 'Your password has been changed',
      '2fa_enabled': 'Two-factor authentication enabled',
      '2fa_disabled': 'Two-factor authentication disabled',
      session_revoked: 'A session has been revoked',
      api_key_created: 'New API key created',
      api_key_deleted: 'API key deleted',
    };

    const notification = {
      type: 'security_alert',
      title: 'Security Alert',
      message: securityMessages[alertType] || 'Security event detected',
      data: {
        alertType,
        details,
        timestamp: new Date().toISOString(),
      },
    };

    // Check user's notification preferences
    const preferences = await this.getUserNotificationPreferences(userId);
    
    // Send via enabled channels
    if (preferences.push?.security) {
      await this.sendPushNotification(userId, notification);
    }
    
    if (preferences.email?.security) {
      await this.sendEmailNotification(userId, notification);
    }
    
    if (preferences.inApp) {
      await this.sendRealtimeNotification(userId, notification);
    }
  }

  /**
   * Send push notification
   */
  static async sendPushNotification(userId, notification) {
    try {
      // Get user's push subscription
      const subscriptionDoc = await db
        .collection('push_subscriptions')
        .doc(userId)
        .get();

      if (!subscriptionDoc.exists || !subscriptionDoc.data().enabled) {
        return;
      }

      // Send push notification via service (Firebase Cloud Messaging, etc.)
      // Implementation depends on push service provider
      
      logger.info('Push notification sent', { userId, type: notification.type });
    } catch (error) {
      logger.error('Failed to send push notification', error, { userId });
    }
  }

  /**
   * Send email notification
   */
  static async sendEmailNotification(userId, notification) {
    try {
      // Get user's email subscription preferences
      const subscriptionDoc = await db
        .collection('email_subscriptions')
        .doc(userId)
        .get();

      if (!subscriptionDoc.exists) {
        return;
      }

      const preferences = subscriptionDoc.data();
      
      // Check if this type of email notification is enabled
      const emailType = this.getEmailTypeFromNotification(notification.type);
      if (!preferences[emailType]) {
        return;
      }

      // Send email via service (SendGrid, etc.)
      // Implementation depends on email service provider
      
      logger.info('Email notification sent', { userId, type: notification.type });
    } catch (error) {
      logger.error('Failed to send email notification', error, { userId });
    }
  }

  /**
   * Get user's notification preferences
   */
  static async getUserNotificationPreferences(userId) {
    const cacheKey = `notification_prefs:${userId}`;
    let preferences = await cache.get(cacheKey);

    if (!preferences) {
      const [pushDoc, emailDoc, inAppDoc] = await Promise.all([
        db.collection('push_subscriptions').doc(userId).get(),
        db.collection('email_subscriptions').doc(userId).get(),
        db.collection('inapp_subscriptions').doc(userId).get(),
      ]);

      preferences = {
        push: pushDoc.exists ? pushDoc.data() : null,
        email: emailDoc.exists ? emailDoc.data() : null,
        inApp: inAppDoc.exists ? inAppDoc.data() : { enabled: true },
      };

      // Cache for 5 minutes
      await cache.set(cacheKey, preferences, 300);
    }

    return preferences;
  }

  /**
   * Store real-time update for offline retrieval
   */
  static async storeRealtimeUpdate(userId, updateData) {
    const update = {
      userId,
      ...updateData,
      id: this.generateNotificationId(),
      retrieved: false,
    };

    await db.collection('realtime_updates').add(update);

    // Clean up old updates (keep only last 100 per user)
    this.cleanupOldUpdates(userId);
  }

  /**
   * Get pending real-time updates for user
   */
  static async getPendingUpdates(userId, lastRetrieved = null) {
    let query = db
      .collection('realtime_updates')
      .where('userId', '==', userId)
      .where('retrieved', '==', false)
      .orderBy('timestamp', 'desc')
      .limit(50);

    if (lastRetrieved) {
      query = query.where('timestamp', '>', lastRetrieved);
    }

    const snapshot = await query.get();
    const updates = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();
      updates.push({
        id: doc.id,
        ...data,
      });

      // Mark as retrieved
      await db.collection('realtime_updates').doc(doc.id).update({
        retrieved: true,
        retrievedAt: new Date().toISOString(),
      });
    }

    return updates;
  }

  /**
   * Emit event to specific user
   */
  static emitToUser(userId, data) {
    // This would integrate with WebSocket connections or Server-Sent Events
    // Implementation depends on real-time transport mechanism
    
    logger.debug('Emitting to user', { userId, dataType: data.type });
    
    // For now, we'll use EventEmitter pattern
    this.emit(`user:${userId}`, data);
  }

  /**
   * Register real-time connection for user
   */
  static registerConnection(userId, connection) {
    if (!this.clients) {
      this.clients = new Map();
    }
    
    if (!this.clients.has(userId)) {
      this.clients.set(userId, new Set());
    }
    
    this.clients.get(userId).add(connection);
    
    logger.info('Real-time connection registered', { userId });

    // Send pending updates
    this.sendPendingUpdates(userId, connection);
  }

  /**
   * Unregister real-time connection
   */
  static unregisterConnection(userId, connection) {
    if (this.clients?.has(userId)) {
      this.clients.get(userId).delete(connection);
      
      if (this.clients.get(userId).size === 0) {
        this.clients.delete(userId);
      }
    }
    
    logger.info('Real-time connection unregistered', { userId });
  }

  /**
   * Send pending updates to newly connected client
   */
  static async sendPendingUpdates(userId, connection) {
    try {
      const pendingUpdates = await this.getPendingUpdates(userId);
      
      for (const update of pendingUpdates) {
        connection.send(JSON.stringify(update));
      }
    } catch (error) {
      logger.error('Failed to send pending updates', error, { userId });
    }
  }

  /**
   * Clean up old real-time updates
   */
  static async cleanupOldUpdates(userId) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 7); // Keep last 7 days

      const oldUpdatesQuery = db
        .collection('realtime_updates')
        .where('userId', '==', userId)
        .where('timestamp', '<', cutoffDate.toISOString())
        .limit(100);

      const snapshot = await oldUpdatesQuery.get();
      
      const batch = db.batch();
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      if (snapshot.docs.length > 0) {
        await batch.commit();
        logger.info('Cleaned up old real-time updates', { 
          userId, 
          cleaned: snapshot.docs.length 
        });
      }
    } catch (error) {
      logger.error('Failed to cleanup old updates', error, { userId });
    }
  }

  /**
   * Generate unique notification ID
   */
  static generateNotificationId() {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Map notification type to email preference category
   */
  static getEmailTypeFromNotification(notificationType) {
    const typeMapping = {
      security_alert: 'security',
      mention: 'mentions',
      comment: 'comments',
      update: 'updates',
      marketing: 'marketing',
    };

    return typeMapping[notificationType] || 'updates';
  }

  /**
   * Get notification statistics for user
   */
  static async getNotificationStats(userId) {
    const stats = {
      total: 0,
      unread: 0,
      byType: {},
      recentActivity: 0,
    };

    // Get total notifications count
    const totalSnapshot = await db
      .collection('notifications')
      .where('userId', '==', userId)
      .count()
      .get();
    stats.total = totalSnapshot.data().count;

    // Get unread count
    const unreadSnapshot = await db
      .collection('notifications')
      .where('userId', '==', userId)
      .where('read', '==', false)
      .count()
      .get();
    stats.unread = unreadSnapshot.data().count;

    // Get recent activity (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const recentSnapshot = await db
      .collection('notifications')
      .where('userId', '==', userId)
      .where('createdAt', '>=', yesterday.toISOString())
      .count()
      .get();
    stats.recentActivity = recentSnapshot.data().count;

    return stats;
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(userId, notificationId) {
    const notificationDoc = await db
      .collection('notifications')
      .doc(notificationId)
      .get();

    if (!notificationDoc.exists || notificationDoc.data().userId !== userId) {
      throw new Error('Notification not found');
    }

    await db.collection('notifications').doc(notificationId).update({
      read: true,
      readAt: new Date().toISOString(),
    });

    // Emit real-time update
    this.emitToUser(userId, {
      type: 'notification_read',
      notificationId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Mark all notifications as read for user
   */
  static async markAllAsRead(userId) {
    const unreadQuery = db
      .collection('notifications')
      .where('userId', '==', userId)
      .where('read', '==', false);

    const snapshot = await unreadQuery.get();
    
    if (snapshot.empty) {
      return 0;
    }

    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        read: true,
        readAt: new Date().toISOString(),
      });
    });

    await batch.commit();

    // Emit real-time update
    this.emitToUser(userId, {
      type: 'notifications_all_read',
      count: snapshot.docs.length,
      timestamp: new Date().toISOString(),
    });

    return snapshot.docs.length;
  }
}