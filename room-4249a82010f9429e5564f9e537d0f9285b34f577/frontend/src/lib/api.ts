import { API_BASE_URL } from '../config/constants';
import type { ApiResponse, Resource, Review, Favorite, PointsTransaction, ClassItem, ClassMember } from '../types';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
};

// Resources
export const getResources = async (filters?: Record<string, string>) => {
  const params = new URLSearchParams();
  if (filters) Object.entries(filters).forEach(([k, v]) => v && params.set(k, v));
  const res = await fetch(`${API_BASE_URL}/api/resources?${params}`, { headers: getAuthHeaders() });
  return res.json() as Promise<ApiResponse<(Resource & { avgRating: number; reviewCount: number })[]>>;
};

export const getResource = async (id: string) => {
  const res = await fetch(`${API_BASE_URL}/api/resources/${id}`, { headers: getAuthHeaders() });
  return res.json() as Promise<ApiResponse<Resource & { avgRating: number; reviewCount: number; reviews: Review[] }>>;
};

export const getResourceStats = async () => {
  const res = await fetch(`${API_BASE_URL}/api/resources/stats`);
  return res.json() as Promise<ApiResponse<{ total: number; pending: number }>>;
};

export const createResource = async (data: Partial<Resource>) => {
  const res = await fetch(`${API_BASE_URL}/api/resources`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json() as Promise<ApiResponse<Resource>>;
};

export const deleteResource = async (id: string) => {
  const res = await fetch(`${API_BASE_URL}/api/resources/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return res.json() as Promise<ApiResponse<{ message: string }>>;
};

export const downloadResource = async (id: string) => {
  const res = await fetch(`${API_BASE_URL}/api/resources/${id}/download`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  return res.json() as Promise<ApiResponse<{ fileUrl: string; fileName: string }>>;
};

export const favoriteResource = async (id: string, folderName?: string) => {
  const res = await fetch(`${API_BASE_URL}/api/resources/${id}/favorite`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ folderName }),
  });
  return res.json() as Promise<ApiResponse<Favorite>>;
};

export const unfavoriteResource = async (id: string) => {
  const res = await fetch(`${API_BASE_URL}/api/resources/${id}/favorite`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return res.json() as Promise<ApiResponse<{ message: string }>>;
};

export const getResourceReviews = async (id: string) => {
  const res = await fetch(`${API_BASE_URL}/api/resources/${id}/reviews`, { headers: getAuthHeaders() });
  return res.json() as Promise<ApiResponse<{ reviews: Review[]; avgRating: number; reviewCount: number }>>;
};

export const createReview = async (id: string, data: { rating: number; content?: string }) => {
  const res = await fetch(`${API_BASE_URL}/api/resources/${id}/reviews`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json() as Promise<ApiResponse<Review>>;
};

export const reportResource = async (id: string, data: { reason: string; description?: string }) => {
  const res = await fetch(`${API_BASE_URL}/api/resources/${id}/report`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json() as Promise<ApiResponse<unknown>>;
};

// Profile
export const getMyUploads = async () => {
  const res = await fetch(`${API_BASE_URL}/api/profile/uploads`, { headers: getAuthHeaders() });
  return res.json() as Promise<ApiResponse<Resource[]>>;
};

export const getMyFavorites = async () => {
  const res = await fetch(`${API_BASE_URL}/api/profile/favorites`, { headers: getAuthHeaders() });
  return res.json() as Promise<ApiResponse<{ favorites: Favorite[]; folders: { folderName: string; count: number }[] }>>;
};

export const getMyPoints = async () => {
  const res = await fetch(`${API_BASE_URL}/api/profile/points`, { headers: getAuthHeaders() });
  return res.json() as Promise<ApiResponse<{ balance: number; transactions: PointsTransaction[] }>>;
};

export const dailyCheckin = async () => {
  const res = await fetch(`${API_BASE_URL}/api/profile/checkin`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  return res.json() as Promise<ApiResponse<PointsTransaction>>;
};

export const updateProfile = async (data: { name?: string; bio?: string }) => {
  const res = await fetch(`${API_BASE_URL}/api/profile`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json() as Promise<ApiResponse<unknown>>;
};

export const applyTeacherVerify = async () => {
  const res = await fetch(`${API_BASE_URL}/api/profile/teacher-verify`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  return res.json() as Promise<ApiResponse<{ message: string; status: string }>>;
};

// Classes
export const getMyClasses = async () => {
  const res = await fetch(`${API_BASE_URL}/api/classes/my`, { headers: getAuthHeaders() });
  return res.json() as Promise<ApiResponse<ClassItem[]>>;
};

export const createClass = async (data: { name: string; description?: string }) => {
  const res = await fetch(`${API_BASE_URL}/api/classes`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json() as Promise<ApiResponse<ClassItem>>;
};

export const joinClass = async (classCode: string) => {
  const res = await fetch(`${API_BASE_URL}/api/classes/join`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ classCode }),
  });
  return res.json() as Promise<ApiResponse<{ class: ClassItem; member: ClassMember }>>;
};

export const getClassMembers = async (classId: string) => {
  const res = await fetch(`${API_BASE_URL}/api/classes/${classId}/members`, { headers: getAuthHeaders() });
  return res.json() as Promise<ApiResponse<ClassMember[]>>;
};

// Admin
export const getPendingResources = async () => {
  const res = await fetch(`${API_BASE_URL}/api/admin/pending`, { headers: getAuthHeaders() });
  return res.json() as Promise<ApiResponse<Resource[]>>;
};

export const approveResource = async (id: string) => {
  const res = await fetch(`${API_BASE_URL}/api/admin/resources/${id}/approve`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  return res.json() as Promise<ApiResponse<Resource>>;
};

export const rejectResource = async (id: string, reason: string) => {
  const res = await fetch(`${API_BASE_URL}/api/admin/resources/${id}/reject`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ reason }),
  });
  return res.json() as Promise<ApiResponse<Resource>>;
};

export const getAdminUsers = async () => {
  const res = await fetch(`${API_BASE_URL}/api/admin/users`, { headers: getAuthHeaders() });
  return res.json() as Promise<ApiResponse<unknown[]>>;
};

export const verifyTeacher = async (userId: string) => {
  const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/verify-teacher`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  return res.json() as Promise<ApiResponse<unknown>>;
};

export const getAdminReports = async () => {
  const res = await fetch(`${API_BASE_URL}/api/admin/reports`, { headers: getAuthHeaders() });
  return res.json() as Promise<ApiResponse<unknown[]>>;
};

// Auth
export const getCurrentUser = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/me`, { headers: getAuthHeaders() });
    if (!res.ok) {
      throw new Error('Failed to fetch user');
    }
    return res.json() as Promise<ApiResponse<{ user: { id: string; name: string; email: string; role?: string; points?: number; isTeacherVerified?: boolean; teacherVerifyStatus?: string } }>>;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return { success: false, data: null, message: 'Failed to fetch user' };
  }
};
