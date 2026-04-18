// 类型定义
interface ServerConfig {
  PORT: string | number;
  NODE_ENV: string;
}

interface JWTConfig {
  SECRET: string;
  EXPIRES_IN: string;
}

interface AuthErrors {
  UNAUTHORIZED: string;
  INVALID_CREDENTIALS: string;
  EMAIL_ALREADY_EXISTS: string;
  USER_NOT_FOUND: string;
  TOKEN_EXPIRED: string;
}

interface CorsConfig {
  ORIGINS: string[];
  CREDENTIALS: boolean;
}

export const SERVER_CONFIG: ServerConfig = {
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',
};

export const JWT_CONFIG: JWTConfig = {
  SECRET: process.env.JWT_SECRET || 'fallback_jwt_secret_change_in_production',
  EXPIRES_IN: '7d',
};

export const AUTH_ERRORS: AuthErrors = {
  UNAUTHORIZED: 'Unauthorized - please log in',
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_ALREADY_EXISTS: 'An account with this email already exists',
  USER_NOT_FOUND: 'User not found',
  TOKEN_EXPIRED: 'Session expired - please log in again',
};

export const CORS_CONFIG: CorsConfig = {
  ORIGINS: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
  CREDENTIALS: true,
};

export const API_CONFIG = {
  PREFIX: '/api',
  VERSION: 'v1',
};
