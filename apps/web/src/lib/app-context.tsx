import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Project, ChatMessage, GenerationTask } from '../types';
import { mockUser, mockProjects, mockChatMessages } from './mock-data';
import { api } from './api';

interface AppContextType {
  user: User | null;
  projects: Project[];
  messages: ChatMessage[];
  currentProject: Project | null;
  generationTask: GenerationTask | null;
  setUser: (user: User | null) => void;
  setProjects: (projects: Project[]) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setCurrentProject: (project: Project | null) => void;
  setGenerationTask: (task: GenerationTask | null) => void;
  addMessage: (message: ChatMessage) => void;
  updateProject: (project: Project) => void;
  isAuthenticated: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>(mockChatMessages);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [generationTask, setGenerationTask] = useState<GenerationTask | null>(null);

  const isAuthenticated = !!user;

  // Initialize auth from token and load user/projects
  useEffect(() => {
    const init = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const cachedUser = localStorage.getItem('aicodegen-user');

        if (token) {
          // Attempt to load profile from API
          const profile = await api.getProfile();
          const apiUser = profile.data as unknown as User;
          setUser(apiUser);
          localStorage.setItem('aicodegen-user', JSON.stringify(apiUser));

          // Try to load projects from API; fallback to mock if fails
          try {
            const res = await api.getProjects();
            // Backend DTO -> frontend mapping
            const apiProjects = (res.data || []) as any[];
            const mapped: Project[] = apiProjects.map((p) => ({
              id: p.id,
              name: p.name,
              description: p.prompt || p.description || '',
              type: 'react',
              status: (p.status?.toLowerCase?.() || 'completed') as Project['status'],
              progress: typeof p.progress === 'number' ? p.progress : 100,
              createdAt: new Date(p.createdAt || Date.now()),
              updatedAt: new Date(p.updatedAt || p.createdAt || Date.now()),
              userId: apiUser.id,
              files: [],
              figmaFrames: [],
              preview: p.preview || undefined,
            }));
            setProjects(mapped);
          } catch {
            setProjects(mockProjects);
          }
        } else if (cachedUser) {
          // Legacy cached user without token (demo mode)
          setUser(JSON.parse(cachedUser));
          setProjects(mockProjects);
        }
      } catch {
        // If anything fails, keep demo state
        const cachedUser = localStorage.getItem('aicodegen-user');
        if (cachedUser) {
          setUser(JSON.parse(cachedUser));
          setProjects(mockProjects);
        }
      }
    };

    void init();
  }, []);

  const addMessage = (message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  };

  const updateProject = (project: Project) => {
    setProjects((prev) => prev.map((p) => (p.id === project.id ? project : p)));
    if (currentProject?.id === project.id) {
      setCurrentProject(project);
    }
  };

  const value: AppContextType = {
    user,
    projects,
    messages,
    currentProject,
    generationTask,
    setUser,
    setProjects,
    setMessages,
    setCurrentProject,
    setGenerationTask,
    addMessage,
    updateProject,
    isAuthenticated,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// API-backed authentication helpers (kept under same name for compatibility)
export const mockAuth = {
  login: async (email: string, password: string) => {
    // Prefer real API; fallback to demo
    try {
      const res = await api.login(email, password);
      const { token, user } = res.data;
      api.setToken(token);
      localStorage.setItem('aicodegen-user', JSON.stringify(user));
      return user as unknown as User;
    } catch {
      // Demo mode
      await new Promise((resolve) => setTimeout(resolve, 700));
      const demoUser = { ...mockUser, email } as User;
      localStorage.setItem('aicodegen-user', JSON.stringify(demoUser));
      return demoUser;
    }
  },

  register: async (name: string, email: string, password: string) => {
    try {
      const res = await api.register(name, email, password);
      const { token, user } = res.data;
      api.setToken(token);
      localStorage.setItem('aicodegen-user', JSON.stringify(user));
      return user as unknown as User;
    } catch {
      // Demo mode
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const demoUser = { ...mockUser, name, email } as User;
      localStorage.setItem('aicodegen-user', JSON.stringify(demoUser));
      return demoUser;
    }
  },

  logout: () => {
    api.setToken(null);
    localStorage.removeItem('aicodegen-user');
    localStorage.removeItem('auth_token');
  },

  socialLogin: async (provider: 'google' | 'github') => {
    // Placeholder: implement real OAuth later; keep demo experience
    await new Promise((resolve) => setTimeout(resolve, 800));
    const user = {
      ...mockUser,
      name: provider === 'google' ? 'Google User' : 'GitHub User',
      email: `user@${provider}.com`,
    } as User;
    localStorage.setItem('aicodegen-user', JSON.stringify(user));
    return user;
  },
};