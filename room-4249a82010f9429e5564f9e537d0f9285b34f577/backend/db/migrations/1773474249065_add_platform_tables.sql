-- Migration: Add learning platform tables

-- Add new columns to Users table
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "role" TEXT NOT NULL DEFAULT 'student';
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "points" INTEGER NOT NULL DEFAULT 100;
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "is_teacher_verified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "teacher_verify_status" TEXT NOT NULL DEFAULT 'none';
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "bio" TEXT;

-- Resources table
CREATE TABLE IF NOT EXISTS "Resources" (
  "id" TEXT PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "stage" TEXT NOT NULL,
  "resource_type" TEXT NOT NULL,
  "file_url" TEXT,
  "file_name" TEXT,
  "file_size" INTEGER,
  "page_count" INTEGER,
  "year" INTEGER,
  "points_cost" INTEGER NOT NULL DEFAULT 0,
  "uploader_id" TEXT NOT NULL,
  "uploader_name" TEXT NOT NULL,
  "uploader_role" TEXT NOT NULL DEFAULT 'student',
  "status" TEXT NOT NULL DEFAULT 'pending',
  "reject_reason" TEXT,
  "download_count" INTEGER NOT NULL DEFAULT 0,
  "class_id" TEXT,
  "cover_gradient" TEXT NOT NULL DEFAULT 'from-blue-600 to-blue-800',
  "tag_color" TEXT NOT NULL DEFAULT 'bg-blue-500',
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Reviews table
CREATE TABLE IF NOT EXISTS "Reviews" (
  "id" TEXT PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  "resource_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "user_name" TEXT NOT NULL,
  "rating" INTEGER NOT NULL,
  "content" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Favorites table
CREATE TABLE IF NOT EXISTS "Favorites" (
  "id" TEXT PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  "user_id" TEXT NOT NULL,
  "resource_id" TEXT NOT NULL,
  "folder_name" TEXT NOT NULL DEFAULT '默认收藏夹',
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Points Transactions table
CREATE TABLE IF NOT EXISTS "PointsTransactions" (
  "id" TEXT PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  "user_id" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "type" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "resource_id" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Classes table
CREATE TABLE IF NOT EXISTS "Classes" (
  "id" TEXT PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "teacher_id" TEXT NOT NULL,
  "teacher_name" TEXT NOT NULL,
  "class_code" TEXT NOT NULL UNIQUE,
  "description" TEXT,
  "member_count" INTEGER NOT NULL DEFAULT 0,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Class Members table
CREATE TABLE IF NOT EXISTS "ClassMembers" (
  "id" TEXT PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  "class_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "user_name" TEXT NOT NULL,
  "joined_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Reports table
CREATE TABLE IF NOT EXISTS "Reports" (
  "id" TEXT PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  "resource_id" TEXT NOT NULL,
  "reporter_id" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "description" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Downloads table
CREATE TABLE IF NOT EXISTS "Downloads" (
  "id" TEXT PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  "user_id" TEXT NOT NULL,
  "resource_id" TEXT NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
);
