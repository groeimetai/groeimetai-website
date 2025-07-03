import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import middleware
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import { apiRateLimiter } from './middleware/auth.middleware.js';
import { logger } from './utils/logger.js';

// Import routes
import userRoutes from './routes/user.routes.js';
// import authRoutes from './routes/auth.routes.js';
// import consultationRoutes from './routes/consultation.routes.js';
// import quoteRoutes from './routes/quote.routes.js';
// import messageRoutes from './routes/message.routes.js';
// import fileRoutes from './routes/file.routes.js';
// import analyticsRoutes from './routes/analytics.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

// Create Express app
const app = express();

/**
 * Security middleware
 */
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.gemini.com", "wss:"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'", "https://meet.google.com"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

/**
 * CORS configuration
 */
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://groeimetai.com',
      'https://www.groeimetai.com'
    ];
    
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Service-Token'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

/**
 * Body parsing middleware
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * Compression middleware
 */
app.use(compression());

/**
 * Request logging
 */
app.use(morgan('combined', { stream: logger.stream }));

/**
 * Custom request logging
 */
app.use((req, res, next) => {
  req.requestTime = Date.now();
  
  // Log request
  logger.http(`${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  
  // Log response
  res.on('finish', () => {
    const duration = Date.now() - req.requestTime;
    logger.http(`${req.method} ${req.originalUrl} ${res.statusCode}`, {
      duration: `${duration}ms`,
      contentLength: res.get('content-length')
    });
  });
  
  next();
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  });
});

/**
 * API version prefix
 */
const API_PREFIX = '/api/v1';

/**
 * Apply global rate limiting
 */
app.use(API_PREFIX, apiRateLimiter);

/**
 * Mount routes
 */
app.use(`${API_PREFIX}/users`, userRoutes);
// app.use(`${API_PREFIX}/auth`, authRoutes);
// app.use(`${API_PREFIX}/consultations`, consultationRoutes);
// app.use(`${API_PREFIX}/quotes`, quoteRoutes);
// app.use(`${API_PREFIX}/messages`, messageRoutes);
// app.use(`${API_PREFIX}/files`, fileRoutes);
// app.use(`${API_PREFIX}/analytics`, analyticsRoutes);

/**
 * API documentation endpoint
 */
app.get(`${API_PREFIX}/docs`, (req, res) => {
  res.json({
    message: 'API Documentation',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/v1/users/register',
        login: 'POST /api/v1/auth/login',
        logout: 'POST /api/v1/auth/logout',
        refresh: 'POST /api/v1/auth/refresh'
      },
      users: {
        profile: 'GET /api/v1/users/me',
        updateProfile: 'PUT /api/v1/users/me',
        listUsers: 'GET /api/v1/users (admin)',
        getUser: 'GET /api/v1/users/:userId',
        updateUser: 'PUT /api/v1/users/:userId',
        deleteUser: 'DELETE /api/v1/users/:userId'
      },
      consultations: {
        create: 'POST /api/v1/consultations',
        list: 'GET /api/v1/consultations',
        get: 'GET /api/v1/consultations/:id',
        update: 'PUT /api/v1/consultations/:id',
        cancel: 'DELETE /api/v1/consultations/:id'
      },
      // Add more endpoint documentation
    }
  });
});

/**
 * Error handling
 */
app.use(notFoundHandler);
app.use(errorHandler);

export default app;