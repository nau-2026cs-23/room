export const SERVER_CONFIG = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
} as const;

export const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

export const JWT_CONFIG = {
  SECRET: JWT_SECRET,
  FALLBACK_SECRET: 'development-jwt-secret',
  EXPIRES_IN: '30d',
} as const;

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid credentials',
  EMAIL_ALREADY_EXISTS: 'Email already registered',
  INVALID_TOKEN: 'Invalid token',
  NO_TOKEN: 'No token provided',
  UNAUTHORIZED: 'Unauthorized access',
} as const;
