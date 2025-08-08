import type { User } from '../types';
import { GoogleAuthService } from './google-auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://aicodegen-server-virid.vercel.app';

// Função para decodificar JWT (simplificada para demo)
function parseJWT(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Erro ao decodificar JWT:', error);
    return null;
  }
}

export interface AuthResponse {
  user: User;
  session: {
    token: string;
    expiresAt: string;
  };
}

export class AuthService {
  private static SESSION_KEY = 'aicodegen-session';
  private static USER_KEY = 'aicodegen-user';

  static async loginWithGoogle(): Promise<AuthResponse> {
    try {
      // Get Google credential
      const { credential } = await GoogleAuthService.signIn();
      
      // Verify with backend
      const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Authentication failed');
      }

      const authData: AuthResponse = await response.json().then(data => data.data);
      
      // Store session data
      this.setSession(authData.session.token, authData.user);
      
      return authData;
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
    }
  }

  static async loginWithCredentials(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const authData: AuthResponse = await response.json().then(data => data.data);
    
    // Store session data
    this.setSession(authData.session.token, authData.user);
    
    return authData;
  }

  static async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    const authData: AuthResponse = await response.json().then(data => data.data);
    
    // Store session data
    this.setSession(authData.session.token, authData.user);
    
    return authData;
  }

  static async logout(): Promise<void> {
    const token = this.getSessionToken();
    
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error('Logout request failed:', error);
      }
    }

    this.clearSession();
  }

  static async getCurrentUser(): Promise<User | null> {
    const token = this.getSessionToken();
    
    if (!token) {
      return null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        this.clearSession();
        return null;
      }

      const userData = await response.json().then(data => data.data);
      
      // Update stored user data
      localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
      
      return userData;
    } catch (error) {
      console.error('Failed to get current user:', error);
      this.clearSession();
      return null;
    }
  }

  static async updateUser(updates: { name?: string; avatar?: string }): Promise<User> {
    const token = this.getSessionToken();
    
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update user');
    }

    const userData = await response.json().then(data => data.data);
    
    // Update stored user data
    localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
    
    return userData;
  }

  static getSessionToken(): string | null {
    return localStorage.getItem(this.SESSION_KEY);
  }

  static getStoredUser(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  static setSession(token: string, user: User): void {
    localStorage.setItem(this.SESSION_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  static clearSession(): void {
    localStorage.removeItem(this.SESSION_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  static isAuthenticated(): boolean {
    const token = this.getSessionToken();
    const user = this.getStoredUser();
    
    return !!(token && user);
  }
}