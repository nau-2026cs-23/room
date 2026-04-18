export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  points: number;
  isTeacherVerified: boolean;
  teacherVerifyStatus: string;
  bio?: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  subject: string;
  stage: string;
  resourceType: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  pageCount?: number;
  year?: number;
  pointsCost: number;
  uploaderId: string;
  uploaderName: string;
  uploaderRole: string;
  status: string;
  rejectReason?: string;
  downloadCount: number;
  classId?: string;
  coverGradient: string;
  tagColor: string;
  avgRating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  resourceId: string;
  userId: string;
  userName: string;
  rating: number;
  content?: string;
  createdAt: string;
}

export interface Favorite {
  id: string;
  userId: string;
  resourceId: string;
  folderName: string;
  createdAt: string;
}

export interface PointsTransaction {
  id: string;
  userId: string;
  amount: number;
  type: string;
  description: string;
  resourceId?: string;
  createdAt: string;
}

export interface ClassItem {
  id: string;
  name: string;
  teacherId: string;
  teacherName: string;
  classCode: string;
  description?: string;
  memberCount: number;
  resourceCount?: number;
  isActive: boolean;
  createdAt: string;
}

export interface ClassMember {
  id: string;
  classId: string;
  userId: string;
  userName: string;
  joinedAt: string;
}

export interface Report {
  id: string;
  resourceId: string;
  reporterId: string;
  reason: string;
  description?: string;
  status: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export type ViewType =
  | 'home'
  | 'resources'
  | 'resource-detail'
  | 'postgrad'
  | 'civil'
  | 'teacher'
  | 'upload'
  | 'profile'
  | 'favorites'
  | 'points'
  | 'my-uploads'
  | 'classes'
  | 'admin';

export const CATEGORY_LABELS: Record<string, string> = {
  basic: '基础课程',
  professional: '专业课程',
  postgrad: '考研备考',
  civil: '考公考编',
};

export const SUBJECT_LABELS: Record<string, string> = {
  math: '数学类',
  cs: '计算机',
  english: '英语',
  physics: '物理',
  economics: '经济学',
  law: '法学',
  medicine: '医学',
  management: '管理学',
  other: '其他',
};

export const STAGE_LABELS: Record<string, string> = {
  freshman: '大一',
  sophomore: '大二',
  junior: '大三',
  senior: '大四',
  postgrad: '研究生',
  civil: '考公考编',
};

export const RESOURCE_TYPE_LABELS: Record<string, string> = {
  exam: '期末真题',
  notes: '学习笔记',
  slides: '课件PPT',
  exercise: '习题集',
  other: '其他',
};

export const COVER_GRADIENTS = [
  'from-blue-600 to-blue-800',
  'from-purple-600 to-indigo-800',
  'from-green-600 to-teal-700',
  'from-orange-500 to-red-600',
  'from-pink-500 to-rose-700',
  'from-cyan-500 to-blue-600',
  'from-amber-500 to-orange-600',
  'from-emerald-500 to-green-700',
];

export const TAG_COLORS: Record<string, string> = {
  basic: 'bg-blue-500',
  professional: 'bg-purple-500',
  postgrad: 'bg-amber-500',
  civil: 'bg-green-600',
  exam: 'bg-blue-500',
  notes: 'bg-orange-500',
  slides: 'bg-purple-500',
  exercise: 'bg-green-500',
  other: 'bg-gray-500',
};
