import { pgTable, text, timestamp, integer, boolean, decimal, foreignKey } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// ============================================
// Enums
// ============================================
export const UserRole = z.enum(['student', 'teacher', 'admin']);
export const TeacherVerifyStatus = z.enum(['none', 'pending', 'approved', 'rejected']);
export const UploadStatus = z.enum(['pending', 'uploading', 'completed', 'failed']);
export const ResourceCategory = z.enum(['basic', 'professional', 'postgrad', 'civil']);
export const ResourceSubject = z.enum(['math', 'cs', 'english', 'physics', 'economics', 'law', 'medicine', 'management', 'other']);
export const ResourceStage = z.enum(['freshman', 'sophomore', 'junior', 'senior', 'postgrad', 'civil']);
export const ResourceType = z.enum(['exam', 'notes', 'slides', 'exercise', 'other']);
export const ResourceStatus = z.enum(['pending', 'approved', 'rejected']);
export const TransactionType = z.enum(['upload', 'download', 'daily_checkin', 'exchange']);
export const ReportReason = z.enum(['copyright', 'inappropriate', 'spam', 'other']);
export const ReportStatus = z.enum(['pending', 'resolved']);

// ============================================
// Users Table
// ============================================
export const users = pgTable('Users', {
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`)
    .notNull(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: text('role').notNull().default('student'), // student | teacher | admin
  points: integer('points').notNull().default(100),
  isTeacherVerified: boolean('is_teacher_verified').notNull().default(false),
  teacherVerifyStatus: text('teacher_verify_status').notNull().default('none'), // none | pending | approved | rejected
  bio: text('bio'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users, {
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: UserRole.optional(),
  teacherVerifyStatus: TeacherVerifyStatus.optional(),
});
export const updateUserSchema = insertUserSchema.partial();
export const loginUserSchema = insertUserSchema.pick({ email: true, password: true });
export const signupUserSchema = insertUserSchema
  .extend({ confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters') })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export const selectUserSchema = createSelectSchema(users).omit({ password: true });

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type LoginUserInput = z.infer<typeof loginUserSchema>;
export type SignupUserInput = z.infer<typeof signupUserSchema>;
export type UserWithoutPassword = z.infer<typeof selectUserSchema>;

// ============================================
// Uploads Table (file storage)
// ============================================
export const uploads = pgTable('Uploads', {
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`)
    .notNull(),
  fileName: text('file_name').notNull(),
  fileSize: integer('file_size').notNull(),
  fileType: text('file_type').notNull(),
  s3Key: text('s3_key').notNull(),
  s3Url: text('s3_url').notNull(),
  uploadId: text('upload_id'),
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const insertUploadSchema = createInsertSchema(uploads, {
  fileName: z.string().min(1, 'File name is required'),
  fileSize: z.number().int().positive('File size must be positive'),
  fileType: z.string().min(1, 'File type is required'),
  s3Key: z.string().min(1, 'S3 key is required'),
  s3Url: z.string().url('Invalid S3 URL'),
  uploadId: z.string().optional(),
  status: UploadStatus.optional(),
});
export const updateUploadSchema = insertUploadSchema.partial();
export const selectUploadSchema = createSelectSchema(uploads);

export type Upload = typeof uploads.$inferSelect;
export type InsertUpload = typeof uploads.$inferInsert;

// ============================================
// Resources Table
// ============================================
export const resources = pgTable('Resources', {
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`)
    .notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(), // basic | professional | postgrad | civil
  subject: text('subject').notNull(), // math | cs | english | physics | economics | law | medicine | management | other
  stage: text('stage').notNull(), // freshman | sophomore | junior | senior | postgrad | civil
  resourceType: text('resource_type').notNull(), // exam | notes | slides | exercise | other
  fileUrl: text('file_url'),
  fileName: text('file_name'),
  fileSize: integer('file_size'),
  pageCount: integer('page_count'),
  year: integer('year'),
  pointsCost: integer('points_cost').notNull().default(0),
  uploaderId: text('uploader_id').notNull(),
  uploaderName: text('uploader_name').notNull(),
  uploaderRole: text('uploader_role').notNull().default('student'),
  status: text('status').notNull().default('pending'), // pending | approved | rejected
  rejectReason: text('reject_reason'),
  downloadCount: integer('download_count').notNull().default(0),
  classId: text('class_id'), // if restricted to a class
  coverGradient: text('cover_gradient').notNull().default('from-blue-600 to-blue-800'),
  tagColor: text('tag_color').notNull().default('bg-blue-500'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const insertResourceSchema = createInsertSchema(resources, {
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: ResourceCategory,
  subject: ResourceSubject,
  stage: ResourceStage,
  resourceType: ResourceType,
  pointsCost: z.coerce.number().int().min(0).optional(),
  year: z.coerce.number().int().optional(),
  pageCount: z.coerce.number().int().optional(),
  fileSize: z.coerce.number().int().optional(),
  uploaderRole: UserRole.optional(),
  status: ResourceStatus.optional(),
});
export const updateResourceSchema = insertResourceSchema.partial();
export const selectResourceSchema = createSelectSchema(resources);

export type Resource = typeof resources.$inferSelect;
export type InsertResource = typeof resources.$inferInsert;

// ============================================
// Reviews Table
// ============================================
export const reviews = pgTable('Reviews', {
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`)
    .notNull(),
  resourceId: text('resource_id').notNull(),
  userId: text('user_id').notNull(),
  userName: text('user_name').notNull(),
  rating: integer('rating').notNull(), // 1-5
  content: text('content'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const insertReviewSchema = createInsertSchema(reviews, {
  rating: z.number().int().min(1).max(5),
  content: z.string().optional(),
});
export const selectReviewSchema = createSelectSchema(reviews);

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

// ============================================
// Favorites Table
// ============================================
export const favorites = pgTable('Favorites', {
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`)
    .notNull(),
  userId: text('user_id').notNull(),
  resourceId: text('resource_id').notNull(),
  folderName: text('folder_name').notNull().default('ƒ¨»œ ’≤ÿº–'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const insertFavoriteSchema = createInsertSchema(favorites, {
  folderName: z.string().min(1).optional(),
});
export const selectFavoriteSchema = createSelectSchema(favorites);

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = typeof favorites.$inferInsert;

// ============================================
// Points Transactions Table
// ============================================
export const pointsTransactions = pgTable('PointsTransactions', {
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`)
    .notNull(),
  userId: text('user_id').notNull(),
  amount: integer('amount').notNull(), // positive = earned, negative = spent
  type: text('type').notNull(), // upload | download | daily_checkin | exchange
  description: text('description').notNull(),
  resourceId: text('resource_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const insertPointsTransactionSchema = createInsertSchema(pointsTransactions, {
  amount: z.number().int(),
  type: TransactionType,
  description: z.string().min(1),
});
export const selectPointsTransactionSchema = createSelectSchema(pointsTransactions);

export type PointsTransaction = typeof pointsTransactions.$inferSelect;
export type InsertPointsTransaction = typeof pointsTransactions.$inferInsert;

// ============================================
// Classes Table
// ============================================
export const classes = pgTable('Classes', {
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`)
    .notNull(),
  name: text('name').notNull(),
  teacherId: text('teacher_id').notNull(),
  teacherName: text('teacher_name').notNull(),
  classCode: text('class_code').notNull().unique(),
  description: text('description'),
  memberCount: integer('member_count').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const insertClassSchema = createInsertSchema(classes, {
  name: z.string().min(1, 'Class name is required'),
  classCode: z.string().min(4, 'Class code must be at least 4 characters'),
});
export const updateClassSchema = insertClassSchema.partial();
export const selectClassSchema = createSelectSchema(classes);

export type Class = typeof classes.$inferSelect;
export type InsertClass = typeof classes.$inferInsert;

// ============================================
// Class Members Table
// ============================================
export const classMembers = pgTable('ClassMembers', {
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`)
    .notNull(),
  classId: text('class_id').notNull(),
  userId: text('user_id').notNull(),
  userName: text('user_name').notNull(),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
});

export const selectClassMemberSchema = createSelectSchema(classMembers);

export type ClassMember = typeof classMembers.$inferSelect;

// ============================================
// Reports Table
// ============================================
export const reports = pgTable('Reports', {
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`)
    .notNull(),
  resourceId: text('resource_id').notNull(),
  reporterId: text('reporter_id').notNull(),
  reason: text('reason').notNull(),
  description: text('description'),
  status: text('status').notNull().default('pending'), // pending | resolved
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const insertReportSchema = createInsertSchema(reports, {
  reason: ReportReason,
  description: z.string().optional(),
  status: ReportStatus.optional(),
});
export const selectReportSchema = createSelectSchema(reports);

export type Report = typeof reports.$inferSelect;

export type InsertReport = typeof reports.$inferInsert;

// ============================================
// Downloads Table
// ============================================
export const downloads = pgTable('Downloads', {
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`)
    .notNull(),
  userId: text('user_id').notNull(),
  resourceId: text('resource_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const selectDownloadSchema = createSelectSchema(downloads);

export type Download = typeof downloads.$inferSelect;
