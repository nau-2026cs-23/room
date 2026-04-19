// Shared API types — single source of truth for frontend ↔ backend contracts.

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ─── User & Auth ───────────────────────────────────────────────────────────────
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'teacher' | 'reviewer' | 'admin';
  points: number;
  creditScore: number;
  avatarUrl?: string;
  isTeacherCertified: boolean;
  teacherCertStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  consecutiveCheckIn: number;
  lastCheckIn?: string;
  createdAt: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// ─── Resource ─────────────────────────────────────────────────────────────────
export type ResourceStage = 'undergraduate' | 'graduate' | 'exam_postgrad' | 'exam_civil';
export type ResourceType = 'notes' | 'exam_paper' | 'slides' | 'exercise' | 'solution' | 'other';
export type ResourceStatus = 'pending' | 'approved' | 'rejected' | 'flagged';
export type PointTier = 0 | 5 | 15 | 30;

export interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  subCategory?: string;
  stage: ResourceStage;
  resourceType: ResourceType;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  pageCount: number;
  pointCost: PointTier;
  status: ResourceStatus;
  uploaderId: string;
  uploaderName: string;
  uploaderCertified: boolean;
  downloadCount: number;
  rating: number;
  ratingCount: number;
  tags: string[];
  year?: number;
  school?: string;
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
  rejectionCode?: string;
}

export interface ResourceListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  stage?: string;
  resourceType?: string;
  sortBy?: 'createdAt' | 'downloadCount' | 'rating';
  sortOrder?: 'asc' | 'desc';
  status?: ResourceStatus;
}

export interface ResourceListResponse {
  resources: Resource[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateResourceRequest {
  title: string;
  description: string;
  category: string;
  subCategory?: string;
  stage: ResourceStage;
  resourceType: ResourceType;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  pageCount: number;
  pointCost: PointTier;
  tags: string[];
  year?: number;
  school?: string;
}

// ─── Comments ─────────────────────────────────────────────────────────────────
export interface Comment {
  id: string;
  resourceId: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  isTeacherCertified: boolean;
  content: string;
  rating: number;
  likes: number;
  createdAt: string;
}

export interface CreateCommentRequest {
  resourceId: string;
  content: string;
  rating: number;
}

// ─── Points ───────────────────────────────────────────────────────────────────
export type PointAction =
  | 'register'
  | 'checkin'
  | 'checkin_streak_7'
  | 'checkin_streak_30'
  | 'upload_approved'
  | 'resource_downloaded'
  | 'five_star_review'
  | 'real_name_verify'
  | 'teacher_certified'
  | 'invite_user'
  | 'write_comment'
  | 'report_verified'
  | 'download_resource'
  | 'ai_query'
  | 'preview_extra'
  | 'exchange';

export interface PointTransaction {
  id: string;
  userId: string;
  action: PointAction;
  delta: number;
  balance: number;
  description: string;
  createdAt: string;
}

export interface PointsResponse {
  balance: number;
  transactions: PointTransaction[];
  total: number;
}

export interface ExchangeRequest {
  itemId: string;
}

export interface ExchangeItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  category: 'download_pack' | 'ai_pack' | 'resource_pack' | 'membership';
  validDays: number;
  quantity?: number;
  limitPerMonth?: number;
}

// ─── AI Chat ──────────────────────────────────────────────────────────────────
export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface AIChatSession {
  id: string;
  userId: string;
  title: string;
  messages: AIChatMessage[];
  resourceId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIChatRequest {
  message: string;
  sessionId?: string;
  resourceId?: string;
}

export interface AIChatResponse {
  reply: string;
  sessionId: string;
  pointsUsed: number;
  remainingFreeQueries: number;
}

// ─── Teacher Certification ────────────────────────────────────────────────────
export type CertLevel = 'v1' | 'v2' | 'v3';
export type CertStatus = 'pending' | 'approved' | 'rejected';

export interface TeacherCertApplication {
  id: string;
  userId: string;
  username: string;
  email: string;
  certLevel: CertLevel;
  institution: string;
  department: string;
  position: string;
  materials: string[];
  status: CertStatus;
  reviewNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCertApplicationRequest {
  certLevel: CertLevel;
  institution: string;
  department: string;
  position: string;
  materials: string[];
}

// ─── Admin / Review ───────────────────────────────────────────────────────────
export interface ReviewDecision {
  resourceId: string;
  decision: 'approved' | 'rejected' | 'flagged';
  rejectionCode?: string;
  rejectionNote?: string;
}

export interface AdminStats {
  totalUsers: number;
  totalResources: number;
  pendingReviews: number;
  pendingCertifications: number;
  totalDownloads: number;
  dailyActiveUsers: number;
}
