import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { auth } from '../config/firebase.config.js';
import { logger } from '../utils/logger.js';
import { NotificationService } from '../services/notification.service.js';

/**
 * WebSocket middleware for real-time settings updates
 */
export class WebSocketMiddleware {
  constructor(httpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        credentials: true,
        methods: ["GET", "POST"]
      },
      path: '/socket.io/',
      transports: ['websocket', 'polling']
    });

    this.connectedUsers = new Map();
    this.setupMiddleware();
    this.setupEventHandlers();
    
    logger.info('WebSocket server initialized');
  }

  /**
   * Setup authentication middleware
   */
  setupMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        // Verify Firebase token
        const decodedToken = await auth.verifyIdToken(token);
        socket.userId = decodedToken.uid;
        socket.user = decodedToken;
        
        logger.info('Socket authenticated', { userId: decodedToken.uid, socketId: socket.id });
        next();
      } catch (error) {
        logger.error('Socket authentication failed', error);
        next(new Error('Authentication failed'));
      }
    });
  }

  /**
   * Setup event handlers
   */
  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      this.handleConnection(socket);
    });
  }

  /**
   * Handle new socket connection
   */
  handleConnection(socket) {
    const userId = socket.userId;
    
    // Store connection
    if (!this.connectedUsers.has(userId)) {
      this.connectedUsers.set(userId, new Set());
    }
    this.connectedUsers.get(userId).add(socket);

    // Join user-specific room
    socket.join(`user:${userId}`);
    
    // Register with notification service
    NotificationService.registerConnection(userId, socket);

    logger.info('User connected via WebSocket', { userId, socketId: socket.id });

    // Setup event handlers
    this.setupSocketEvents(socket);

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      this.handleDisconnect(socket, reason);
    });
  }

  /**
   * Setup socket event handlers
   */
  setupSocketEvents(socket) {
    const userId = socket.userId;

    // Settings sync event
    socket.on('settings:sync', async (data) => {
      try {
        const { lastSync } = data;
        const syncData = await SettingsService.getSyncData(userId, lastSync);
        
        socket.emit('settings:sync:response', {
          success: true,
          data: syncData,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        logger.error('Settings sync failed', error, { userId });
        socket.emit('settings:sync:error', {
          success: false,
          error: error.message,
        });
      }
    });

    // Join settings room for real-time updates
    socket.on('settings:subscribe', (categories = []) => {
      if (categories.length === 0) {
        categories = ['profile', 'preferences', 'notifications', 'security', 'privacy', 'advanced'];
      }

      categories.forEach(category => {
        socket.join(`settings:${userId}:${category}`);
      });

      socket.emit('settings:subscribed', { categories });
      logger.info('User subscribed to settings updates', { userId, categories });
    });

    // Leave settings room
    socket.on('settings:unsubscribe', (categories = []) => {
      categories.forEach(category => {
        socket.leave(`settings:${userId}:${category}`);
      });

      socket.emit('settings:unsubscribed', { categories });
      logger.info('User unsubscribed from settings updates', { userId, categories });
    });

    // Notification events
    socket.on('notifications:mark_read', async (notificationId) => {
      try {
        await NotificationService.markAsRead(userId, notificationId);
      } catch (error) {
        logger.error('Failed to mark notification as read', error, { userId, notificationId });
      }
    });

    socket.on('notifications:mark_all_read', async () => {
      try {
        const count = await NotificationService.markAllAsRead(userId);
        socket.emit('notifications:all_read', { count });
      } catch (error) {
        logger.error('Failed to mark all notifications as read', error, { userId });
      }
    });

    // Ping/pong for connection health
    socket.on('ping', () => {
      socket.emit('pong');
    });

    // Settings change acknowledgment
    socket.on('settings:ack', (data) => {
      logger.debug('Settings change acknowledged', { userId, data });
    });
  }

  /**
   * Handle socket disconnect
   */
  handleDisconnect(socket, reason) {
    const userId = socket.userId;
    
    if (this.connectedUsers.has(userId)) {
      this.connectedUsers.get(userId).delete(socket);
      
      if (this.connectedUsers.get(userId).size === 0) {
        this.connectedUsers.delete(userId);
      }
    }

    // Unregister from notification service
    NotificationService.unregisterConnection(userId, socket);
    
    logger.info('User disconnected from WebSocket', { 
      userId, 
      socketId: socket.id, 
      reason 
    });
  }

  /**
   * Emit settings update to user
   */
  emitSettingsUpdate(userId, category, data) {
    const updateData = {
      type: 'settings_update',
      category,
      data,
      timestamp: new Date().toISOString(),
    };

    // Emit to user's settings room
    this.io.to(`settings:${userId}:${category}`).emit('settings:update', updateData);
    
    // Also emit to general user room as fallback
    this.io.to(`user:${userId}`).emit('settings:update', updateData);
    
    logger.debug('Settings update emitted via WebSocket', { userId, category });
  }

  /**
   * Emit notification to user
   */
  emitNotification(userId, notification) {
    this.io.to(`user:${userId}`).emit('notification', notification);
    logger.debug('Notification emitted via WebSocket', { userId, type: notification.type });
  }

  /**
   * Emit security alert to user
   */
  emitSecurityAlert(userId, alertData) {
    const alert = {
      type: 'security_alert',
      ...alertData,
      timestamp: new Date().toISOString(),
    };

    this.io.to(`user:${userId}`).emit('security:alert', alert);
    logger.info('Security alert emitted via WebSocket', { userId, alertType: alertData.alertType });
  }

  /**
   * Get connected users count
   */
  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  /**
   * Get user connection count
   */
  getUserConnectionCount(userId) {
    return this.connectedUsers.has(userId) ? this.connectedUsers.get(userId).size : 0;
  }

  /**
   * Check if user is connected
   */
  isUserConnected(userId) {
    return this.connectedUsers.has(userId) && this.connectedUsers.get(userId).size > 0;
  }

  /**
   * Broadcast to all connected users
   */
  broadcast(event, data) {
    this.io.emit(event, data);
    logger.info('Broadcast sent to all users', { event });
  }

  /**
   * Get WebSocket statistics
   */
  getStats() {
    const totalConnections = Array.from(this.connectedUsers.values())
      .reduce((total, connections) => total + connections.size, 0);

    return {
      connectedUsers: this.connectedUsers.size,
      totalConnections,
      rooms: this.io.sockets.adapter.rooms.size,
    };
  }

  /**
   * Setup periodic connection cleanup
   */
  setupCleanup() {
    setInterval(() => {
      this.cleanupStaleConnections();
    }, 30000); // Every 30 seconds
  }

  /**
   * Clean up stale connections
   */
  cleanupStaleConnections() {
    for (const [userId, connections] of this.connectedUsers.entries()) {
      const activeConnections = new Set();
      
      for (const socket of connections) {
        if (socket.connected) {
          activeConnections.add(socket);
        }
      }
      
      if (activeConnections.size === 0) {
        this.connectedUsers.delete(userId);
      } else if (activeConnections.size < connections.size) {
        this.connectedUsers.set(userId, activeConnections);
      }
    }
  }
}

// Export singleton instance
let webSocketInstance = null;

export const initWebSocket = (httpServer) => {
  if (!webSocketInstance) {
    webSocketInstance = new WebSocketMiddleware(httpServer);
  }
  return webSocketInstance;
};

export const getWebSocket = () => {
  return webSocketInstance;
};