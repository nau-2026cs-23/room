import { eq } from 'drizzle-orm';
import { getDatabase } from '../db';
import { users, insertUserSchema } from '../db/schema';
import type { InsertUser } from '../db/schema';
import { z } from 'zod';

export async function findUserByEmail(email: string) {
  const db = getDatabase();
  if (!db) return null;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0] || null;
}

export async function findUserById(id: string) {
  const db = getDatabase();
  if (!db) return null;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0] || null;
}

export async function createUser(data: z.infer<typeof insertUserSchema>) {
  const db = getDatabase();
  if (!db) throw new Error('Database connection failed');
  const result = await db.insert(users).values(data as InsertUser).returning();
  return result[0];
}

export async function updateUserPoints(userId: string, newPoints: number) {
  const db = getDatabase();
  if (!db) throw new Error('Database connection failed');
  await db.update(users).set({ points: newPoints, updatedAt: new Date() }).where(eq(users.id, userId));
}

export async function updateUserCheckIn(userId: string, consecutive: number) {
  const db = getDatabase();
  if (!db) throw new Error('Database connection failed');
  await db.update(users).set({
    lastCheckIn: new Date(),
    consecutiveCheckIn: consecutive,
    updatedAt: new Date(),
  }).where(eq(users.id, userId));
}

export async function updateUserCertStatus(userId: string, status: string, certified: boolean) {
  const db = getDatabase();
  if (!db) throw new Error('Database connection failed');
  await db.update(users).set({
    teacherCertStatus: status,
    isTeacherCertified: certified,
    updatedAt: new Date(),
  }).where(eq(users.id, userId));
}

export async function getAllUsers(limit = 50, offset = 0) {
  const db = getDatabase();
  if (!db) return [];
  return db.select().from(users).limit(limit).offset(offset);
}
