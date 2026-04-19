import { eq, desc, count } from 'drizzle-orm';
import { db } from '../db';
import { comments, insertCommentSchema } from '../db/schema';
import type { InsertComment } from '../db/schema';
import { z } from 'zod';

export async function getCommentsByResource(resourceId: string, page = 1, pageSize = 20) {
  const offset = (page - 1) * pageSize;
  const [rows, totalRows] = await Promise.all([
    db.select().from(comments)
      .where(eq(comments.resourceId, resourceId))
      .orderBy(desc(comments.createdAt))
      .limit(pageSize).offset(offset),
    db.select({ count: count() }).from(comments).where(eq(comments.resourceId, resourceId)),
  ]);
  return { comments: rows, total: totalRows[0]?.count || 0 };
}

export async function createComment(data: {
  resourceId: string;
  userId: string;
  username: string;
  avatarUrl?: string | null;
  isTeacherCertified?: boolean;
  content: string;
  rating: number;
}) {
  const result = await db.insert(comments).values(data as InsertComment).returning();
  return result[0];
}

export async function likeComment(id: string) {
  const existing = await db.select().from(comments).where(eq(comments.id, id)).limit(1);
  if (!existing[0]) return null;
  const result = await db.update(comments).set({ likes: existing[0].likes + 1 }).where(eq(comments.id, id)).returning();
  return result[0];
}
