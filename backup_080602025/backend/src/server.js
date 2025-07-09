import app from './app.js';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { logger } from './utils/logger.js';
import { initializeWebSocket } from './services/websocket.service.js';
import { initializeScheduler } from './services/scheduler.service.js';

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: function (origin, callback) {
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://groeimetai.com',
        'https://www.groeimetai.com',
      ];

      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  },
  path: process.env.WEBSOCKET_PATH || '/socket.io',
  transports: ['websocket', 'polling'],
});

// Initialize WebSocket handlers
initializeWebSocket(io);

// Initialize background job scheduler
initializeScheduler();

// Get port from environment or use default
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  // Give the logger time to write
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Give the logger time to write
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  // Stop accepting new connections
  server.close(() => {
    logger.info('HTTP server closed');
  });

  // Close WebSocket connections
  io.close(() => {
    logger.info('WebSocket server closed');
  });

  // Give ongoing requests 30 seconds to complete
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);

  // Close database connections, etc.
  try {
    // Add cleanup logic here
    logger.info('Cleanup completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during cleanup:', error);
    process.exit(1);
  }
};

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
server.listen(PORT, HOST, () => {
  logger.info(`Server running on http://${HOST}:${PORT}`);
  logger.info(
    `WebSocket server running on ws://${HOST}:${PORT}${process.env.WEBSOCKET_PATH || '/socket.io'}`
  );
  logger.info(`Environment: ${process.env.NODE_ENV}`);
  logger.info(`API Documentation: http://${HOST}:${PORT}/api/v1/docs`);
});

export { server, io };
