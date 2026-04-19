import { eq, and, ilike, desc, asc, sql, count } from 'drizzle-orm';
import { db } from '../db';
import { resources, insertResourceSchema } from '../db/schema';
import type { InsertResource } from '../db/schema';
import { z } from 'zod';

export async function getResources(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  stage?: string;
  resourceType?: string;
  sortBy?: string;
  sortOrder?: string;
  status?: string;
}) {
  const page = params.page || 1;
  const pageSize = params.pageSize || 20;
  const offset = (page - 1) * pageSize;

  const conditions = [];
  if (params.status) conditions.push(eq(resources.status, params.status));
  else conditions.push(eq(resources.status, 'approved'));
  if (params.search) conditions.push(ilike(resources.title, `%${params.search}%`));
  if (params.category) conditions.push(eq(resources.category, params.category));
  if (params.stage) conditions.push(eq(resources.stage, params.stage));
  if (params.resourceType) conditions.push(eq(resources.resourceType, params.resourceType));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  let orderClause;
  const sortBy = params.sortBy || 'createdAt';
  const sortOrder = params.sortOrder || 'desc';
  if (sortBy === 'downloadCount') {
    orderClause = sortOrder === 'asc' ? asc(resources.downloadCount) : desc(resources.downloadCount);
  } else if (sortBy === 'rating') {
    orderClause = sortOrder === 'asc' ? asc(resources.rating) : desc(resources.rating);
  } else {
    orderClause = sortOrder === 'asc' ? asc(resources.createdAt) : desc(resources.createdAt);
  }

  const [rows, totalRows] = await Promise.all([
    db.select().from(resources).where(whereClause).orderBy(orderClause).limit(pageSize).offset(offset),
    db.select({ count: count() }).from(resources).where(whereClause),
  ]);

  return { resources: rows, total: totalRows[0]?.count || 0 };
}

export async function getResourceById(id: string) {
  const result = await db.select().from(resources).where(eq(resources.id, id)).limit(1);
  return result[0] || null;
}

export async function createResource(data: z.infer<typeof insertResourceSchema>) {
  const result = await db.insert(resources).values(data as InsertResource).returning();
  return result[0];
}

export async function updateResourceStatus(id: string, status: string, rejectionCode?: string, rejectionReason?: string) {
  await db.update(resources).set({
    status,
    rejectionCode: rejectionCode || null,
    rejectionReason: rejectionReason || null,
    updatedAt: new Date(),
  }).where(eq(resources.id, id));
}

export async function incrementDownloadCount(id: string) {
  await db.update(resources).set({
    downloadCount: sql`${resources.downloadCount} + 1`,
    updatedAt: new Date(),
  }).where(eq(resources.id, id));
}

export async function updateResourceRating(id: string, newRating: string, newCount: number) {
  await db.update(resources).set({
    rating: newRating,
    ratingCount: newCount,
    updatedAt: new Date(),
  }).where(eq(resources.id, id));
}

export async function getPendingResources() {
  return db.select().from(resources).where(eq(resources.status, 'pending')).orderBy(desc(resources.createdAt));
}

export async function getUserResources(uploaderId: string) {
  return db.select().from(resources).where(eq(resources.uploaderId, uploaderId)).orderBy(desc(resources.createdAt));
}
