import 'dotenv/config';
import express, { ErrorRequestHandler } from 'express';
import path from 'path';

import authRoutes from './routes/auth';
import resourceRoutes from './routes/resources';
import pointsRoutes from './routes/points';
import aiRoutes from './routes/ai';
import teacherCertRoutes from './routes/teacherCert';
import adminRoutes from './routes/admin';

//import api routes here

// Configuration
import { SERVER_CONFIG } from './config/constants';

// Middleware
import { errorHandler } from './middleware/errorHandler';

const app = express();

/**
 * Static Files
 */
const REACT_BUILD_FOLDER = path.join(__dirname, '..', 'frontend', 'dist');
app.use(
  express.static(REACT_BUILD_FOLDER, {
    setHeaders: (res, path) => {
      // Disable caching for CSS and JS files to ensure changes are reflected immediately
      if (path.endsWith('.css') || path.endsWith('.js')) {
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
    setHeaders: (res, path) => {
      // Disable caching for CSS and JS files in assets folder
      if (path.endsWith('.css') || path.endsWith('.js')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }
    },
  })
);

// API Routes import here
console.log('Environment variables loaded:', {
  DATABASE_URL: process.env.DATABASE_URL ? 'set' : 'not set',
  JWT_SECRET: process.env.JWT_SECRET ? 'set' : 'not set',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? 'set' : 'not set',
});
/**
 * Body Parser Middleware
 * Note: Stripe webhook requires raw body for signature verification
 * Must be configured before JSON parser
 */
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));
app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api/stripe/webhook')) {
    return next();
  }
  return express.json()(req, res, next);
});
/**
 * API Routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/points', pointsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/teacher-cert', teacherCertRoutes);
app.use('/api/admin', adminRoutes);

/**
 * SPA Fallback Route
 * Handles client-side routing for React Router
 * Must be registered after all API routes
 */
app.get('*', (_req, res) => {
  res.sendFile(path.join(REACT_BUILD_FOLDER, 'index.html'));
});

/**
 * Error Handler
 * Must be the last middleware
 */
app.use(errorHandler as ErrorRequestHandler);

/**
 * Start Server
 */
app.listen(SERVER_CONFIG.PORT, () => {
  console.log(`Server ready on port ${SERVER_CONFIG.PORT}`);
});

export default app;
