import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Project, ChatMessage, GenerationTask } from '../types';
import { mockUser, mockProjects, mockChatMessages } from './mock-data';

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

  // Initialize with mock data for demonstration
  useEffect(() => {
    // Simulate loading user data from localStorage or API
    const savedUser = localStorage.getItem('aicodegen-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setProjects(mockProjects);
    }
  }, []);

  const addMessage = (message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  };

  const updateProject = (project: Project) => {
    setProjects(prev => prev.map(p => p.id === project.id ? project : p));
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
    isAuthenticated
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// Mock authentication functions
export const mockAuth = {
  login: async (email: string, password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = { ...mockUser, email };
    localStorage.setItem('aicodegen-user', JSON.stringify(user));
    return user;
  },
  
  register: async (name: string, email: string, password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const user = { ...mockUser, name, email };
    localStorage.setItem('aicodegen-user', JSON.stringify(user));
    return user;
  },
  
  logout: () => {
    localStorage.removeItem('aicodegen-user');
  },
  
  socialLogin: async (provider: 'google' | 'github') => {
    // Simulate social login
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = { 
      ...mockUser, 
      name: provider === 'google' ? 'Google User' : 'GitHub User',
      email: `user@${provider}.com`
    };
    localStorage.setItem('aicodegen-user', JSON.stringify(user));
    return user;
  }
};