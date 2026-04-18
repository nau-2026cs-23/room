import { db } from '../db';
import { users, InsertUser, insertUserSchema, updateUserSchema, User } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Use Zod-inferred type for repository inputs so routes can pass
// `insertUserSchema.parse(...)` directly without type mismatches.
type CreateUserInput = z.infer<typeof insertUserSchema>;
type UpdateUserInput = z.infer<typeof updateUserSchema>;

export class UserRepository {
  async create(userData: CreateUserInput) {
    // Hash password before storing
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        password: hashedPassword,
      } as InsertUser)
      .returning();

    return user;
  }

  async findByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async findById(id: string) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async findAll() {
    return await db.select().from(users);
  }

  async findByRole(role: string) {
    return await db.select().from(users).where(eq(users.role, role));
  }

  async update(id: string, userData: UpdateUserInput) {
    // If password is being updated, hash it
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 12);
    }

    const [user] = await db
      .update(users)
      .set({
        ...userData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    return user;
  }

  async delete(id: string) {
    const [user] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning();

    return user;
  }

  async verifyPassword(plainPassword: string, hashedPassword: string) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async updatePassword(id: string, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    const [user] = await db
      .update(users)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    return user;
  }

  async updatePoints(id: string, points: number) {
    const [user] = await db
      .update(users)
      .set({
        points,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    return user;
  }

  async updateTeacherStatus(id: string, isVerified: boolean, status: string) {
    const [user] = await db
      .update(users)
      .set({
        isTeacherVerified: isVerified,
        teacherVerifyStatus: status,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    return user;
  }
}
export const userRepository = new UserRepository();
