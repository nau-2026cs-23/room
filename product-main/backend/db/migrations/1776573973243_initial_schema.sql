-- Initial schema migration for 学研社 (XueYanShe) Learning Resource Platform

CREATE TABLE IF NOT EXISTS "Users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "username" text NOT NULL,
  "email" text NOT NULL UNIQUE,
  "password" text NOT NULL,
  "role" text NOT NULL DEFAULT 'user',
  "points" integer NOT NULL DEFAULT 50,
  "credit_score" integer NOT NULL DEFAULT 100,
  "avatar_url" text,
  "is_teacher_certified" boolean NOT NULL DEFAULT false,
  "teacher_cert_status" text NOT NULL DEFAULT 'none',
  "consecutive_check_in" integer NOT NULL DEFAULT 0,
  "last_check_in" timestamp,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Resources" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" text NOT NULL,
  "description" text NOT NULL DEFAULT '',
  "category" text NOT NULL,
  "sub_category" text,
  "stage" text NOT NULL,
  "resource_type" text NOT NULL,
  "file_url" text NOT NULL,
  "file_name" text NOT NULL,
  "file_size" integer NOT NULL DEFAULT 0,
  "page_count" integer NOT NULL DEFAULT 0,
  "point_cost" integer NOT NULL DEFAULT 0,
  "status" text NOT NULL DEFAULT 'pending',
  "uploader_id" uuid NOT NULL,
  "uploader_name" text NOT NULL,
  "uploader_certified" boolean NOT NULL DEFAULT false,
  "download_count" integer NOT NULL DEFAULT 0,
  "rating" decimal(3,2) NOT NULL DEFAULT 0,
  "rating_count" integer NOT NULL DEFAULT 0,
  "tags" text NOT NULL DEFAULT '[]',
  "year" integer,
  "school" text,
  "rejection_reason" text,
  "rejection_code" text,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Comments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "resource_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "username" text NOT NULL,
  "avatar_url" text,
  "is_teacher_certified" boolean NOT NULL DEFAULT false,
  "content" text NOT NULL,
  "rating" integer NOT NULL DEFAULT 5,
  "likes" integer NOT NULL DEFAULT 0,
  "status" text NOT NULL DEFAULT 'approved',
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "PointTransactions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "action" text NOT NULL,
  "delta" integer NOT NULL,
  "balance" integer NOT NULL,
  "description" text NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "AIChatSessions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "title" text NOT NULL DEFAULT '新对话',
  "resource_id" uuid,
  "messages" text NOT NULL DEFAULT '[]',
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "TeacherCertApplications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "username" text NOT NULL,
  "email" text NOT NULL,
  "cert_level" text NOT NULL DEFAULT 'v1',
  "institution" text NOT NULL,
  "department" text NOT NULL,
  "position" text NOT NULL,
  "materials" text NOT NULL DEFAULT '[]',
  "status" text NOT NULL DEFAULT 'pending',
  "review_note" text,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Downloads" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "resource_id" uuid NOT NULL,
  "points_spent" integer NOT NULL DEFAULT 0,
  "created_at" timestamp NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_resources_status ON "Resources"("status");
CREATE INDEX IF NOT EXISTS idx_resources_category ON "Resources"("category");
CREATE INDEX IF NOT EXISTS idx_resources_stage ON "Resources"("stage");
CREATE INDEX IF NOT EXISTS idx_resources_uploader ON "Resources"("uploader_id");
CREATE INDEX IF NOT EXISTS idx_comments_resource ON "Comments"("resource_id");
CREATE INDEX IF NOT EXISTS idx_point_tx_user ON "PointTransactions"("user_id");
CREATE INDEX IF NOT EXISTS idx_ai_sessions_user ON "AIChatSessions"("user_id");
CREATE INDEX IF NOT EXISTS idx_downloads_user ON "Downloads"("user_id");
CREATE INDEX IF NOT EXISTS idx_downloads_resource ON "Downloads"("resource_id");
