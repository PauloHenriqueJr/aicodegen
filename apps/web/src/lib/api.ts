const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = `${API_BASE_URL}/api`;

export { API_BASE_URL, API_URL };

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = API_URL;
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiError(
        error.message || `HTTP ${response.status}`,
        response.status,
        error.code
      );
    }

    return response.json();
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request<{
      success: boolean;
      data: {
        token: string;
        user: {
          id: string;
          email: string;
          name: string;
          credits: number;
        };
      };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(name: string, email: string, password: string) {
    return this.request<{
      success: boolean;
      data: {
        token: string;
        user: {
          id: string;
          email: string;
          name: string;
          credits: number;
        };
      };
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  }

  async getProfile() {
    return this.request<{
      success: boolean;
      data: {
        id: string;
        email: string;
        name: string;
        credits: number;
      };
    }>('/auth/profile');
  }

  // Projects endpoints
  async getProjects() {
    return this.request<{
      success: boolean;
      data: Array<{
        id: string;
        name: string;
        prompt: string;
        status: string;
        createdAt: string;
      }>;
    }>('/projects');
  }

  async createProject(name: string, prompt: string) {
    return this.request<{
      success: boolean;
      data: {
        id: string;
        name: string;
        prompt: string;
        status: string;
        createdAt: string;
      };
    }>('/projects', {
      method: 'POST',
      body: JSON.stringify({ name, prompt }),
    });
  }

  async getProject(id: string) {
    return this.request<{
      success: boolean;
      data: {
        id: string;
        name: string;
        prompt: string;
        status: string;
        createdAt: string;
        screens: Array<{
          id: string;
          name: string;
          type: string;
          width: number;
          height: number;
          x: number;
          y: number;
          imageUrl: string;
          component: string;
          route: string;
        }>;
      };
    }>(`/projects/${id}`);
  }

  // Generation endpoints
  async startGeneration(projectId: string, prompt?: string) {
    return this.request<{
      success: boolean;
      data: {
        generationId: string;
        status: string;
        totalSteps: number;
        steps: Array<{
          id: string;
          name: string;
          description: string;
          type: string;
          order: number;
          status: string;
          progress: number;
        }>;
      };
    }>('/generation/start', {
      method: 'POST',
      body: JSON.stringify({ projectId, prompt }),
    });
  }

  async getGeneration(id: string) {
    return this.request<{
      success: boolean;
      data: {
        id: string;
        status: string;
        progress: number;
        currentStep: string | null;
        totalSteps: number;
        steps: Array<{
          id: string;
          name: string;
          description: string;
          type: string;
          order: number;
          status: string;
          progress: number;
        }>;
      };
    }>(`/generation/${id}`);
  }

  async cancelGeneration(id: string) {
    return this.request<{
      success: boolean;
    }>(`/generation/${id}/cancel`, {
      method: 'POST',
    });
  }
}

export const api = new ApiClient();