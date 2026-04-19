import { API_BASE_URL } from '@/config/constants';
import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  SignupRequest,
  User,
  Resource,
  ResourceListParams,
  ResourceListResponse,
  CreateResourceRequest,
  Comment,
  PointsResponse,
  ExchangeItem,
  AIChatResponse,
  AIChatSession,
  TeacherCertApplication,
  CreateCertApplicationRequest,
  AdminStats,
} from '@shared/types/api';

function getToken(): string | null {
  return localStorage.getItem('token');
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  return res.json() as Promise<ApiResponse<T>>;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  signup: (data: SignupRequest) =>
    apiFetch<AuthResponse>('/api/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: LoginRequest) =>
    apiFetch<AuthResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  me: () => apiFetch<User>('/api/auth/me'),
};

// ─── Resources ────────────────────────────────────────────────────────────────
export const resourceApi = {
  list: (params: ResourceListParams = {}) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set('page', String(params.page));
    if (params.pageSize) qs.set('pageSize', String(params.pageSize));
    if (params.search) qs.set('search', params.search);
    if (params.category) qs.set('category', params.category);
    if (params.stage) qs.set('stage', params.stage);
    if (params.resourceType) qs.set('resourceType', params.resourceType);
    if (params.sortBy) qs.set('sortBy', params.sortBy);
    if (params.sortOrder) qs.set('sortOrder', params.sortOrder);
    return apiFetch<ResourceListResponse>(`/api/resources?${qs.toString()}`);
  },
  get: (id: string) => apiFetch<Resource>(`/api/resources/${id}`),
  create: (data: CreateResourceRequest) =>
    apiFetch<Resource>('/api/resources', { method: 'POST', body: JSON.stringify(data) }),
  download: (id: string) =>
    apiFetch<{ fileUrl: string; alreadyDownloaded: boolean }>(`/api/resources/${id}/download`, { method: 'POST' }),
  getComments: (id: string, page = 1) =>
    apiFetch<{ comments: Comment[]; total: number }>(`/api/resources/${id}/comments?page=${page}`),
  addComment: (id: string, data: { content: string; rating: number }) =>
    apiFetch<Comment>(`/api/resources/${id}/comments`, { method: 'POST', body: JSON.stringify(data) }),
  likeComment: (resourceId: string, commentId: string) =>
    apiFetch<Comment>(`/api/resources/${resourceId}/comments/${commentId}/like`, { method: 'POST' }),
  myResources: () => apiFetch<Resource[]>('/api/resources/user/my'),
  pendingResources: () => apiFetch<Resource[]>('/api/resources/admin/pending'),
  review: (id: string, data: { decision: string; rejectionCode?: string; rejectionNote?: string }) =>
    apiFetch<null>(`/api/resources/${id}/review`, { method: 'POST', body: JSON.stringify(data) }),
};

// ─── Points ───────────────────────────────────────────────────────────────────
export const pointsApi = {
  transactions: (page = 1) => apiFetch<PointsResponse>(`/api/points/transactions?page=${page}`),
  checkin: () => apiFetch<{ points: number; consecutive: number; bonusPoints: number }>('/api/points/checkin', { method: 'POST' }),
  exchangeItems: () => apiFetch<ExchangeItem[]>('/api/points/exchange-items'),
  exchange: (itemId: string) => apiFetch<{ item: ExchangeItem; newBalance: number }>('/api/points/exchange', { method: 'POST', body: JSON.stringify({ itemId }) }),
};

// ─── AI ───────────────────────────────────────────────────────────────────────
export const aiApi = {
  sessions: () => apiFetch<AIChatSession[]>('/api/ai/sessions'),
  chat: (data: { message: string; sessionId?: string; resourceId?: string }) =>
    apiFetch<AIChatResponse>('/api/ai/chat', { method: 'POST', body: JSON.stringify(data) }),
};

// ─── Teacher Cert ─────────────────────────────────────────────────────────────
export const teacherCertApi = {
  apply: (data: CreateCertApplicationRequest) =>
    apiFetch<TeacherCertApplication>('/api/teacher-cert/apply', { method: 'POST', body: JSON.stringify(data) }),
  myApplications: () => apiFetch<TeacherCertApplication[]>('/api/teacher-cert/my'),
  pendingApplications: () => apiFetch<TeacherCertApplication[]>('/api/teacher-cert/pending'),
  review: (id: string, data: { decision: string; reviewNote?: string }) =>
    apiFetch<null>(`/api/teacher-cert/${id}/review`, { method: 'POST', body: JSON.stringify(data) }),
};

// ─── Admin ────────────────────────────────────────────────────────────────────
export const adminApi = {
  stats: () => apiFetch<AdminStats>('/api/admin/stats'),
};
