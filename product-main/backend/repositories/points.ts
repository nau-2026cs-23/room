import { eq, desc, count } from 'drizzle-orm';
import { db } from '../db';
import { pointTransactions, users } from '../db/schema';

export async function addPointTransaction(
  userId: string,
  action: string,
  delta: number,
  currentBalance: number,
  description: string,
) {
  const newBalance = currentBalance + delta;
  const result = await db.insert(pointTransactions).values({
    userId,
    action,
    delta,
    balance: newBalance,
    description,
  }).returning();

  await db.update(users).set({ points: newBalance, updatedAt: new Date() }).where(eq(users.id, userId));
  return result[0];
}

export async function getUserTransactions(userId: string, page = 1, pageSize = 20) {
  const offset = (page - 1) * pageSize;
  const [rows, totalRows] = await Promise.all([
    db.select().from(pointTransactions).where(eq(pointTransactions.userId, userId)).orderBy(desc(pointTransactions.createdAt)).limit(pageSize).offset(offset),
    db.select({ count: count() }).from(pointTransactions).where(eq(pointTransactions.userId, userId)),
  ]);
  return { transactions: rows, total: totalRows[0]?.count || 0 };
}
