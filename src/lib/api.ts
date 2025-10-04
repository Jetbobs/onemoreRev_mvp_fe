// API 호출 헬퍼 함수
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

interface ApiOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
}

class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

export async function apiFetch(path: string, options: ApiOptions = {}) {
  const { headers, body, method } = options;
  const finalHeaders = new Headers(headers || {});
  
  if (body && !finalHeaders.has('Content-Type')) {
    finalHeaders.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: method || (body ? 'POST' : 'GET'),
    credentials: 'include',
    headers: finalHeaders,
    body: typeof body === 'object' && !(body instanceof FormData) 
      ? JSON.stringify(body) 
      : body
  });

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson 
    ? await response.json().catch(() => null) 
    : await response.text();

  if (!response.ok) {
    const error = new ApiError('API 요청 실패', response.status, data);
    throw error;
  }

  return data;
}

// 인증 관련 API
export const authApi = {
  login: (email: string, password: string) => 
    apiFetch('/api/v1/login', {
      method: 'POST',
      body: { email, password }
    }),

  register: (userData: Record<string, unknown>) =>
    apiFetch('/api/v1/register', {
      method: 'POST',
      body: userData
    }),

  profile: () => 
    apiFetch('/api/v1/user/profile'),

  logout: () => 
    apiFetch('/api/v1/logout', { method: 'POST' })
};

// 프로젝트 관련 API
export const projectApi = {
  list: () =>
    apiFetch('/api/v1/project/list'),

  detail: (id: string) =>
    apiFetch(`/api/v1/project/${id}`),

  info: (projectId: string) =>
    apiFetch(`/api/v1/project/info?projectId=${projectId}`),

  create: (projectData: Record<string, unknown>) =>
    apiFetch('/api/v1/project/new', {
      method: 'POST',
      body: projectData
    })
};

// 리비전 관련 API
export const revisionApi = {
  createNext: (projectId: string) =>
    apiFetch('/api/v1/revision/new', {
      method: 'POST',
      body: { projectId: parseInt(projectId) }
    })
};

// 파일 변환 관련 타입
export interface ConvertImgRequest {
  fileContent: string;
  outputFormat: 'png' | 'jpg';
  keepTempFiles?: string;
}

export interface ConvertImgResponse {
  success: boolean;
  message: string;
  fileContent: string;
  fileSize: number;
  modifiedDate: Date;
  outputFormat: string;
}

// 소스 파일 정보 타입
export interface SrcFileInfo {
  id: number;
  trackId: number;
  originalFilename: string;
  storedFilename: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
}

// 프로젝트 히스토리 리비전 타입 확장
export interface ProjectHistoryRevision {
  id: number;
  revNo: number;
  description?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  createdTracks: Array<{ id: number; name: string }>;
  files: Array<{
    id: number;
    trackId: number;
    originalFilename: string;
    storedFilename: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: Date;
  }>;
  srcFiles?: SrcFileInfo[];
}

// Tool API
export const toolApi = {
  convertImage: (data: ConvertImgRequest): Promise<ConvertImgResponse> =>
    apiFetch('/api/tool/convert_img', {
      method: 'POST',
      body: data
    })
};