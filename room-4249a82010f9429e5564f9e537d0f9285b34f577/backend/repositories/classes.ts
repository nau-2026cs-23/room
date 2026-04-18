import { db } from '../db';
import { classes, classMembers, users, InsertClass } from '../db/schema';
import { eq, and, sql, desc } from 'drizzle-orm';

export class ClassRepository {
  async create(data: { name: string; teacherId: string; teacherName: string; classCode: string; description?: string }) {
    const [cls] = await db.insert(classes).values(data as InsertClass).returning();
    return cls;
  }

  async findByTeacherId(teacherId: string) {
    return await db.select().from(classes).where(eq(classes.teacherId, teacherId)).orderBy(desc(classes.createdAt));
  }

  async findByCode(classCode: string) {
    const [cls] = await db.select().from(classes).where(eq(classes.classCode, classCode));
    return cls;
  }

  async findById(id: string) {
    const [cls] = await db.select().from(classes).where(eq(classes.id, id));
    return cls;
  }

  async addMember(classId: string, userId: string, userName: string) {
    const existing = await db.select().from(classMembers).where(and(eq(classMembers.classId, classId), eq(classMembers.userId, userId)));
    if (existing.length > 0) return existing[0];
    const [member] = await db.insert(classMembers).values({ classId, userId, userName }).returning();
    await db.update(classes).set({ memberCount: sql`${classes.memberCount} + 1` }).where(eq(classes.id, classId));
    return member;
  }

  async getMembers(classId: string) {
    return await db.select().from(classMembers).where(eq(classMembers.classId, classId)).orderBy(classMembers.joinedAt);
  }

  async isMember(classId: string, userId: string) {
    const result = await db.select().from(classMembers).where(and(eq(classMembers.classId, classId), eq(classMembers.userId, userId)));
    return result.length > 0;
  }

  async getUserClasses(userId: string) {
    return await db.select().from(classMembers).where(eq(classMembers.userId, userId));
  }

  async delete(id: string) {
    const result = await db.delete(classes).where(eq(classes.id, id)).returning();
    return result.length > 0;
  }
}

export const classRepository = new ClassRepository();
