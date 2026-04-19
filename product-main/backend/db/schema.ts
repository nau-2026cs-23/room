import { pgTable, text, integer, timestamp, boolean, uuid, decimal } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// ─── Users ───────────────────────────────────────────────────────────────────
export const users = pgTable('Users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: text('username').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: text('role').notNull().default('user'),
  points: integer('points').notNull().default(50),
  creditScore: integer('credit_score').notNull().default(100),
  avatarUrl: text('avatar_url'),
  isTeacherCertified: boolean('is_teacher_certified').notNull().default(false),
  teacherCertStatus: text('teacher_cert_status').notNull().default('none'),
  consecutiveCheckIn: integer('consecutive_check_in').notNull().default(0),
  lastCheckIn: timestamp('last_check_in'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email(),
  username: z.string().min(2).max(50),
  password: z.string().min(6),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Resources ───────────────────────────────────────────────────────────────
export const resources = pgTable('Resources', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  category: text('category').notNull(),
  subCategory: text('sub_category'),
  stage: text('stage').notNull(),
  resourceType: text('resource_type').notNull(),
  fileUrl: text('file_url').notNull(),
  fileName: text('file_name').notNull(),
  fileSize: integer('file_size').notNull().default(0),
  pageCount: integer('page_count').notNull().default(0),
  pointCost: integer('point_cost').notNull().default(0),
  status: text('status').notNull().default('pending'),
  uploaderId: uuid('uploader_id').notNull(),
  uploaderName: text('uploader_name').notNull(),
  uploaderCertified: boolean('uploader_certified').notNull().default(false),
  downloadCount: integer('download_count').notNull().default(0),
  rating: decimal('rating', { precision: 3, scale: 2 }).notNull().default('0'),
  ratingCount: integer('rating_count').notNull().default(0),
  tags: text('tags').notNull().default('[]'),
  year: integer('year'),
  school: text('school'),
  rejectionReason: text('rejection_reason'),
  rejectionCode: text('rejection_code'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const insertResourceSchema = createInsertSchema(resources, {
  title: z.string().min(2).max(200),
  description: z.string().max(2000),
  pointCost: z.coerce.number().int().min(0).max(30),
  pageCount: z.coerce.number().int().min(0),
  fileSize: z.coerce.number().int().min(0),
  rating: z.coerce.string(),
  tags: z.string().default('[]'),
  uploaderId: z.string().uuid(),
  uploaderName: z.string().min(1),
  uploaderCertified: z.boolean().default(false),
  status: z.string().default('pending'),
});

export type Resource = typeof resources.$inferSelect;
export type InsertResource = typeof resources.$inferInsert;

// ─── Comments ────────────────────────────────────────────────────────────────
export const comments = pgTable('Comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  resourceId: uuid('resource_id').notNull(),
  userId: uuid('user_id').notNull(),
  username: text('username').notNull(),
  avatarUrl: text('avatar_url'),
  isTeacherCertified: boolean('is_teacher_certified').notNull().default(false),
  content: text('content').notNull(),
  rating: integer('rating').notNull().default(5),
  likes: integer('likes').notNull().default(0),
  status: text('status').notNull().default('approved'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const insertCommentSchema = createInsertSchema(comments, {
  content: z.string().min(20).max(1000),
  rating: z.coerce.number().int().min(1).max(5),
});

export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;

// ─── Point Transactions ───────────────────────────────────────────────────────
export const pointTransactions = pgTable('PointTransactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  action: text('action').notNull(),
  delta: integer('delta').notNull(),
  balance: integer('balance').notNull(),
  description: text('description').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type PointTransaction = typeof pointTransactions.$inferSelect;
export type InsertPointTransaction = typeof pointTransactions.$inferInsert;

// ─── AI Chat Sessions ─────────────────────────────────────────────────────────
export const aiChatSessions = pgTable('AIChatSessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  title: text('title').notNull().default('新对话'),
  resourceId: uuid('resource_id'),
  messages: text('messages').notNull().default('[]'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type AIChatSession = typeof aiChatSessions.$inferSelect;
export type InsertAIChatSession = typeof aiChatSessions.$inferInsert;

// ─── Teacher Cert Applications ────────────────────────────────────────────────
export const teacherCertApplications = pgTable('TeacherCertApplications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  username: text('username').notNull(),
  email: text('email').notNull(),
  certLevel: text('cert_level').notNull().default('v1'),
  institution: text('institution').notNull(),
  department: text('department').notNull(),
  position: text('position').notNull(),
  materials: text('materials').notNull().default('[]'),
  status: text('status').notNull().default('pending'),
  reviewNote: text('review_note'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type TeacherCertApplication = typeof teacherCertApplications.$inferSelect;
export type InsertTeacherCertApplication = typeof teacherCertApplications.$inferInsert;

// ─── Downloads ────────────────────────────────────────────────────────────────
export const downloads = pgTable('Downloads', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  resourceId: uuid('resource_id').notNull(),
  pointsSpent: integer('points_spent').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Download = typeof downloads.$inferSelect;
