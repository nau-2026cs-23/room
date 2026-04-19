import { eq, desc } from 'drizzle-orm';
import { db } from '../db';
import { teacherCertApplications } from '../db/schema';
import type { InsertTeacherCertApplication } from '../db/schema';

export async function createCertApplication(data: InsertTeacherCertApplication) {
  const result = await db.insert(teacherCertApplications).values(data).returning();
  return result[0];
}

export async function getCertApplicationsByUser(userId: string) {
  return db.select().from(teacherCertApplications).where(eq(teacherCertApplications.userId, userId)).orderBy(desc(teacherCertApplications.createdAt));
}

export async function getPendingCertApplications() {
  return db.select().from(teacherCertApplications).where(eq(teacherCertApplications.status, 'pending')).orderBy(desc(teacherCertApplications.createdAt));
}

export async function updateCertApplicationStatus(id: string, status: string, reviewNote?: string) {
  const result = await db.update(teacherCertApplications).set({
    status,
    reviewNote: reviewNote || null,
    updatedAt: new Date(),
  }).where(eq(teacherCertApplications.id, id)).returning();
  return result[0];
}
