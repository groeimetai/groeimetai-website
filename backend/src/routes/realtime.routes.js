import { Router } from 'express';
import { authenticateUser, requireRole, apiRateLimiter } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { NotificationService } from '../services/notification.service.js';
import { getWebSocket } from '../middleware/websocket.middleware.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * Real-time Settings Routes
 * Server-Sent Events (SSE) for browsers that don't support WebSocket
 */

/**
 * SSE endpoint for real-time settings updates
 */
router.get(
  '/settings/stream',
  authenticateUser,
  apiRateLimiter,
  asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    
    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    });

    // Send initial connection event
    res.write(`data: ${JSON.stringify({
      type: 'connection',
      message: 'Connected to settings stream',
      timestamp: new Date().toISOString(),
    })}\n\n`);

    // Setup heartbeat
    const heartbeat = setInterval(() => {
      res.write(`data: ${JSON.stringify({
        type: 'heartbeat',
        timestamp: new Date().toISOString(),
      })}\n\n`);
    }, 30000);

    // Handle settings updates
    const handleSettingsUpdate = (updateData) => {
      res.write(`data: ${JSON.stringify(updateData)}\n\n`);
    };

    // Register for settings updates
    NotificationService.on(`user:${userId}`, handleSettingsUpdate);

    // Clean up on client disconnect
    req.on('close', () => {
      clearInterval(heartbeat);
      NotificationService.removeListener(`user:${userId}`, handleSettingsUpdate);
      logger.info('SSE connection closed', { userId });
    });

    logger.info('SSE connection established', { userId });
  })
);

/**
 * Get pending real-time updates
 */
router.get(
  '/updates/pending',
  authenticateUser,
  apiRateLimiter,
  asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { lastRetrieved } = req.query;

    const updates = await NotificationService.getPendingUpdates(userId, lastRetrieved);

    res.json({
      success: true,
      data: updates,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * Get WebSocket connection status
 */
router.get(
  '/connection/status',
  authenticateUser,
  apiRateLimiter,
  asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const webSocket = getWebSocket();
    
    const status = {
      websocketAvailable: !!webSocket,
      userConnected: webSocket ? webSocket.isUserConnected(userId) : false,
      connectionCount: webSocket ? webSocket.getUserConnectionCount(userId) : 0,
      timestamp: new Date().toISOString(),
    };

    res.json({
      success: true,
      data: status,
    });
  })
);

/**
 * Get real-time statistics (admin only)
 */
router.get(
  '/stats',
  authenticateUser,
  requireRole('admin'),
  apiRateLimiter,
  asyncHandler(async (req, res) => {
    const webSocket = getWebSocket();
    
    const stats = {
      websocket: webSocket ? webSocket.getStats() : null,
      notifications: await NotificationService.getNotificationStats(req.user.uid),
      timestamp: new Date().toISOString(),
    };

    res.json({
      success: true,
      data: stats,
    });
  })
);

/**
 * Test real-time connection
 */
router.post(
  '/test',
  authenticateUser,
  apiRateLimiter,
  asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { message = 'Test message' } = req.body;

    // Send test notification
    await NotificationService.sendRealtimeNotification(userId, {
      type: 'test',
      title: 'Connection Test',
      message,
    });

    res.json({
      success: true,
      message: 'Test notification sent',
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * Trigger settings sync
 */
router.post(
  '/settings/sync',
  authenticateUser,
  apiRateLimiter,
  asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { lastSync } = req.body;

    const syncData = await SettingsService.getSyncData(userId, lastSync);

    // Emit update if there are changes
    if (syncData.hasChanges) {
      await NotificationService.emitSettingsUpdate(userId, 'sync', syncData.settings);
    }

    res.json({
      success: true,
      data: syncData,
      timestamp: new Date().toISOString(),
    });
  })
);

export default router;