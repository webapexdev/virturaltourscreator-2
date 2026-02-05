import axios from 'axios';

// Use relative URL for API calls - this allows the app to work from any origin
// Falls back to localhost:81 if accessed directly via file://
const API_BASE_URL = window.location.origin.includes('file://') 
  ? 'http://localhost:81/api' 
  : `${window.location.origin}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for session-based authentication
  timeout: 30000, // 30 second timeout
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
      baseURL: config.baseURL,
      data: config.data,
    });
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error('[API Error]', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    });
    
    // Don't redirect on 401 during initial auth check - let components handle it
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/me')) {
      localStorage.removeItem('user');
      // Navigation will be handled by ProtectedRoute component
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: number;
  email: string;
  isVerified: boolean;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  category: string;
  status: 'new' | 'todo' | 'done';
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: number;
    email: string;
  };
}

export interface RegisterData {
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface NoteCreateData {
  title: string;
  content: string;
  category: string;
  status?: 'new' | 'todo' | 'done';
}

export interface NoteUpdateData {
  title?: string;
  content?: string;
  category?: string;
  status?: 'new' | 'todo' | 'done';
}

export const authApi = {
  register: async (data: RegisterData) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  
  login: async (data: LoginData) => {
    const response = await api.post('/auth/login', data);
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  
  me: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  
  confirm: async (token: string) => {
    const response = await api.get(`/auth/confirm/${token}`);
    return response.data;
  },
  
  autoVerify: async (email: string) => {
    const response = await api.post('/auth/auto-verify', { email });
    return response.data;
  },
};

export const notesApi = {
  list: async (params?: {
    search?: string;
    status?: string;
    category?: string;
    limit?: number;
    offset?: number;
  }) => {
    const response = await api.get('/notes', { params });
    return response.data;
  },
  
  get: async (id: number) => {
    const response = await api.get(`/notes/${id}`);
    return response.data;
  },
  
  create: async (data: NoteCreateData) => {
    const response = await api.post('/notes', data);
    return response.data;
  },
  
  update: async (id: number, data: NoteUpdateData) => {
    const response = await api.put(`/notes/${id}`, data);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/notes/${id}`);
    return response.data;
  },
};

export default api;

