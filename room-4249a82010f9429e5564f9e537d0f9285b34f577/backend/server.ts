// import uploadRoutes from './routes/upload';
import authRoutes from './routes/auth';
import resourceRoutes from './routes/resources';
import profileRoutes from './routes/profile';
import classRoutes from './routes/classes';
import adminRoutes from './routes/admin';
import 'dotenv/config';
import express, { ErrorRequestHandler, Request, Response, NextFunction } from 'express';
import path from 'path';
import passport from 'passport';
import cors from 'cors';
import './config/passport';

import { SERVER_CONFIG, CORS_CONFIG, API_CONFIG } from './config/constants';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { checkDatabaseConnection, client as dbClient } from './db';

const app = express();

/**
 * Request Logger Middleware
 */
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

/**
 * CORS Configuration
 */
app.use(cors({
  origin: CORS_CONFIG.ORIGINS,
  credentials: CORS_CONFIG.CREDENTIALS,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

/**
 * Static Files
 */
const REACT_BUILD_FOLDER = path.join(__dirname, '..', 'frontend', 'dist');
app.use(
  express.static(REACT_BUILD_FOLDER, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.css') || filePath.endsWith('.js')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }
    },
  })
);

app.use(
  '/assets',
  express.static(path.join(REACT_BUILD_FOLDER, 'assets'), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.css') || filePath.endsWith('.js')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }
    },
  })
);

/**
 * Body Parsing
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Passport
 */
app.use(passport.initialize());

/**
 * Health Check Endpoint
 */
app.get('/health', async (req: Request, res: Response) => {
  const dbHealth = await checkDatabaseConnection();
  
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Omniflow API',
    version: '1.0.0',
    database: dbHealth ? 'connected' : 'disconnected',
    environment: SERVER_CONFIG.NODE_ENV,
  });
});

/**
 * API Routes
 */
const apiPrefix = `${API_CONFIG.PREFIX}/${API_CONFIG.VERSION}`;
app.use(`${apiPrefix}/auth`, authRoutes);
// app.use(`${apiPrefix}/upload`, uploadRoutes);
app.use(`${apiPrefix}/resources`, resourceRoutes);
app.use(`${apiPrefix}/profile`, profileRoutes);
app.use(`${apiPrefix}/classes`, classRoutes);
app.use(`${apiPrefix}/admin`, adminRoutes);

/**
 * SPA Fallback Route
 */
app.get('*', (_req, res) => {
  res.sendFile(path.join(REACT_BUILD_FOLDER, 'index.html'));
});

/**
 * Error Handlers
 */
app.use(notFoundHandler);
app.use(errorHandler as ErrorRequestHandler);

/**
 * Start Server
 */
let server: ReturnType<typeof app.listen>;

async function startServer() {
  try {
    // Check database connection
    const dbHealth = await checkDatabaseConnection();
    if (!dbHealth) {
      console.warn('Database connection failed. Server will continue to start, but some features may not work.');
    }

    // Start server
    server = app.listen(SERVER_CONFIG.PORT, () => {
      console.log(`? Server ready on port ${SERVER_CONFIG.PORT}`);
      console.log(`? Health check: http://localhost:${SERVER_CONFIG.PORT}/health`);
      console.log(`? Environment: ${SERVER_CONFIG.NODE_ENV}`);
      if (!dbHealth) {
        console.warn('??  Database connection is not available. Some features may not work.');
      }
    });

    // Handle graceful shutdown
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

async function gracefulShutdown() {
  console.log('? Gracefully shutting down server...');
  
  // Close server
  if (server) {
    server.close(() => {
      console.log('? Server closed');
    });
  }

  // Close database connection
  if (dbClient) {
    await dbClient.end();
    console.log('? Database connection closed');
  }

  // Exit process
  process.exit(0);
}

// Start the server
startServer();

export default app;
