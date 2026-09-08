const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('token', token);
}

export function removeAuthToken() {
  localStorage.removeItem('token');
}

async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `HTTP error ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  register: (body: any) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: any) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request('/auth/me'),
  logout: () => request('/auth/logout', { method: 'POST' }),

  // Company & Profile
  getCompany: () => request('/company'),
  updateCompany: (body: any) => request('/company', { method: 'PATCH', body: JSON.stringify(body) }),
  getProfile: () => request('/profile'),
  updateProfileField: (body: any) => request('/profile/field', { method: 'PATCH', body: JSON.stringify(body) }),
  updateProfileBatch: (body: any) => request('/profile/batch', { method: 'POST', body: JSON.stringify(body) }),
  completeOnboarding: () => request('/profile/complete-onboarding', { method: 'POST' }),

  // Chat
  getChatMessages: () => request('/chat/messages'),
  sendChatMessage: (message: string) => request('/chat/message', { method: 'POST', body: JSON.stringify({ message }) }),
  askAnalyticsBot: (question: string) => request('/chat/analytics', { method: 'POST', body: JSON.stringify({ question }) }),
  resetChat: () => request('/chat/reset', { method: 'POST' }),

  // Documents
  getDocuments: () => request('/documents'),
  uploadDocument: (formData: FormData) => request('/documents', { method: 'POST', body: formData }),
  deleteDocument: (id: string) => request(`/documents/${id}`, { method: 'DELETE' }),
  reprocessDocument: (id: string) => request(`/documents/${id}/process`, { method: 'POST' }),
  getDocumentInsights: (id: string) => request(`/documents/${id}/insights`),

  // Analytics & Reports
  getAnalytics: () => request('/analytics'),
  recalculateAnalytics: () => request('/analytics/recalculate', { method: 'POST' }),
  getSnapshotHistory: () => request('/analytics/history'),
  compareSnapshots: (v1: number, v2: number) => request(`/analytics/compare?v1=${v1}&v2=${v2}`),
  getReport: () => request('/analytics/report'),
  updateRecommendationStatus: (id: string, status: string) => request(`/analytics/recommendations/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Data Conflicts
  getConflicts: () => request('/conflicts'),
  resolveConflict: (id: string, body: any) => request(`/conflicts/${id}/resolve`, { method: 'POST', body: JSON.stringify(body) })
};
