import { db } from '../db';
import { resources, reviews, favorites, downloads, pointsTransactions, users, InsertResource, insertResourceSchema } from '../db/schema';
import { eq, and, desc, ilike, or, sql } from 'drizzle-orm';
import { z } from 'zod';

type CreateResourceInput = z.infer<typeof insertResourceSchema>;

export class ResourceRepository {
  async create(data: CreateResourceInput) {
    const [resource] = await db
      .insert(resources)
      .values(data as InsertResource)
      .returning();
    return resource;
  }

  async findAll(filters?: {
    category?: string;
    subject?: string;
    stage?: string;
    resourceType?: string;
    status?: string;
    search?: string;
    sortBy?: string;
    classId?: string;
  }) {
    let query = db.select().from(resources).$dynamic();
    const conditions = [];

    if (filters?.status) {
      conditions.push(eq(resources.status, filters.status));
    } else {
      conditions.push(eq(resources.status, 'approved'));
    }
    if (filters?.category) conditions.push(eq(resources.category, filters.category));
    if (filters?.subject) conditions.push(eq(resources.subject, filters.subject));
    if (filters?.stage) conditions.push(eq(resources.stage, filters.stage));
    if (filters?.resourceType) conditions.push(eq(resources.resourceType, filters.resourceType));
    if (filters?.classId) conditions.push(eq(resources.classId, filters.classId));
    if (filters?.search) {
      conditions.push(
        or(
          ilike(resources.title, `%${filters.search}%`),
          ilike(resources.description, `%${filters.search}%`),
          ilike(resources.subject, `%${filters.search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    if (filters?.sortBy === 'downloads') {
      query = query.orderBy(desc(resources.downloadCount));
    } else {
      query = query.orderBy(desc(resources.createdAt));
    }

    return await query;
  }

  async findById(id: string) {
    const [resource] = await db.select().from(resources).where(eq(resources.id, id));
    return resource;
  }

  async findByUploaderId(uploaderId: string) {
    return await db.select().from(resources).where(eq(resources.uploaderId, uploaderId)).orderBy(desc(resources.createdAt));
  }

  async findPending() {
    return await db.select().from(resources).where(eq(resources.status, 'pending')).orderBy(resources.createdAt);
  }

  async updateStatus(id: string, status: string, rejectReason?: string) {
    const [resource] = await db
      .update(resources)
      .set({ status, rejectReason: rejectReason || null, updatedAt: new Date() })
      .where(eq(resources.id, id))
      .returning();
    return resource;
  }

  async incrementDownload(id: string) {
    await db
      .update(resources)
      .set({ downloadCount: sql`${resources.downloadCount} + 1`, updatedAt: new Date() })
      .where(eq(resources.id, id));
  }

  async delete(id: string) {
    const result = await db.delete(resources).where(eq(resources.id, id)).returning();
    return result.length > 0;
  }

  async getStats() {
    const total = await db.select({ count: sql<number>`count(*)` }).from(resources).where(eq(resources.status, 'approved'));
    const pending = await db.select({ count: sql<number>`count(*)` }).from(resources).where(eq(resources.status, 'pending'));
    return { total: Number(total[0]?.count || 0), pending: Number(pending[0]?.count || 0) };
  }
}

export class ReviewRepository {
  async create(data: { resourceId: string; userId: string; userName: string; rating: number; content?: string }) {
    const [review] = await db.insert(reviews).values(data).returning();
    return review;
  }

  async findByResourceId(resourceId: string) {
    return await db.select().from(reviews).where(eq(reviews.resourceId, resourceId)).orderBy(desc(reviews.createdAt));
  }

  async getAverageRating(resourceId: string) {
    const result = await db
      .select({ avg: sql<number>`avg(${reviews.rating})`, count: sql<number>`count(*)` })
      .from(reviews)
      .where(eq(reviews.resourceId, resourceId));
    return { avg: Number(result[0]?.avg || 0), count: Number(result[0]?.count || 0) };
  }

  async findByUserId(userId: string) {
    return await db.select().from(reviews).where(eq(reviews.userId, userId));
  }
}

export class FavoriteRepository {
  async add(userId: string, resourceId: string, folderName: string = '默认收藏夹') {
    const existing = await db.select().from(favorites).where(and(eq(favorites.userId, userId), eq(favorites.resourceId, resourceId)));
    if (existing.length > 0) return existing[0];
    const [fav] = await db.insert(favorites).values({ userId, resourceId, folderName }).returning();
    return fav;
  }

  async remove(userId: string, resourceId: string) {
    const result = await db.delete(favorites).where(and(eq(favorites.userId, userId), eq(favorites.resourceId, resourceId))).returning();
    return result.length > 0;
  }

  async findByUserId(userId: string) {
    return await db.select().from(favorites).where(eq(favorites.userId, userId)).orderBy(desc(favorites.createdAt));
  }

  async isFavorited(userId: string, resourceId: string) {
    const result = await db.select().from(favorites).where(and(eq(favorites.userId, userId), eq(favorites.resourceId, resourceId)));
    return result.length > 0;
  }

  async getFolders(userId: string) {
    const result = await db
      .select({ folderName: favorites.folderName, count: sql<number>`count(*)` })
      .from(favorites)
      .where(eq(favorites.userId, userId))
      .groupBy(favorites.folderName);
    return result;
  }
}

export class DownloadRepository {
  async record(userId: string, resourceId: string) {
    const [dl] = await db.insert(downloads).values({ userId, resourceId }).returning();
    return dl;
  }

  async findByUserId(userId: string) {
    return await db.select().from(downloads).where(eq(downloads.userId, userId)).orderBy(desc(downloads.createdAt));
  }

  async hasDownloaded(userId: string, resourceId: string) {
    const result = await db.select().from(downloads).where(and(eq(downloads.userId, userId), eq(downloads.resourceId, resourceId)));
    return result.length > 0;
  }
}

export class PointsRepository {
  async addTransaction(data: { userId: string; amount: number; type: string; description: string; resourceId?: string }) {
    const [tx] = await db.insert(pointsTransactions).values(data).returning();
    // Update user points
    await db.update(users).set({ points: sql`${users.points} + ${data.amount}` }).where(eq(users.id, data.userId));
    return tx;
  }

  async findByUserId(userId: string) {
    return await db.select().from(pointsTransactions).where(eq(pointsTransactions.userId, userId)).orderBy(desc(pointsTransactions.createdAt));
  }

  async getUserPoints(userId: string) {
    const [user] = await db.select({ points: users.points }).from(users).where(eq(users.id, userId));
    return user?.points || 0;
  }
}

export const resourceRepository = new ResourceRepository();
export const reviewRepository = new ReviewRepository();
export const favoriteRepository = new FavoriteRepository();
export const downloadRepository = new DownloadRepository();
export const pointsRepository = new PointsRepository();
