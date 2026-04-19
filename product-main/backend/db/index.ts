import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';

// Ensure environment variables are loaded
config();

let db: ReturnType<typeof drizzle> | null = null;
let client: ReturnType<typeof postgres> | null = null;

// Database connection with connection pooling
export function initializeDatabase() {
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL is not set. Database operations will be disabled.');
    return null;
  }

  try {
    client = postgres(process.env.DATABASE_URL, {
      ssl: process.env.NODE_ENV === 'production' ? true : { rejectUnauthorized: false },
      max: 10, // Set pool size
      idle_timeout: 20, // Idle connection timeout in seconds
      connect_timeout: 10, // Connection timeout in seconds
    });
    db = drizzle(client);
    console.log('Database connection established successfully');
    return db;
  } catch (error) {
    console.error('Failed to connect to database:', error);
    return null;
  }
}

export function getDatabase() {
  if (!db) {
    return initializeDatabase();
  }
  return db;
}

export function closeDatabase() {
  if (client) {
    client.end();
    console.log('Database connection closed');
  }
}

// Initialize database on module load
initializeDatabase();
