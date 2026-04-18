import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { PostgresError } from 'postgres';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code: string = 'APP_ERROR'
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // ¼ÇÂ¼´íÎóÐÅÏ¢
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message
      }
    });
    return;
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map(error => ({
      field: error.path.join('.'),
      message: error.message
    }));

    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation error',
        details: formattedErrors
      }
    });
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid token'
      }
    });
    return;
  }

  // Handle TokenExpiredError
  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      error: {
        code: 'TOKEN_EXPIRED',
        message: 'Token has expired'
      }
    });
    return;
  }

  // Handle Postgres errors
  if (err instanceof PostgresError) {
    switch (err.code) {
      case '23505': // Unique constraint violation
        res.status(409).json({
          success: false,
          error: {
            code: 'DUPLICATE_ERROR',
            message: 'Resource already exists'
          }
        });
        return;
      case '23503': // Foreign key violation
        res.status(400).json({
          success: false,
          error: {
            code: 'FOREIGN_KEY_ERROR',
            message: 'Invalid reference to another resource'
          }
        });
        return;
      default:
        res.status(500).json({
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Database operation failed'
          }
        });
        return;
    }
  }

  // Handle unexpected errors
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred' 
        : err.message
    }
  });
};

// 404 error handler
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = new AppError('Route not found', 404, 'NOT_FOUND');
  next(error);
};