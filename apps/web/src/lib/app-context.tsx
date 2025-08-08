import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Project, ChatMessage, GenerationTask } from '../types';
import { AuthService } from './auth-service';

interface AppContextType {
  user: User | null;
  projects: Project[];
  messages: ChatMessage[];
  currentProject: Project | null;
  generationTask: GenerationTask | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setProjects: (projects: Project[]) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setCurrentProject: (project: Project | null) => void;
  setGenerationTask: (task: GenerationTask | null) => void;
  addMessage: (message: ChatMessage) => void;
  updateProject: (project: Project) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [generationTask, setGenerationTask] = useState<GenerationTask | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Initialize authentication state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if user is already authenticated
        if (AuthService.isAuthenticated()) {
          const currentUser = await AuthService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            // Initialize with welcome message
            setMessages([{
              id: '1',
              role: 'assistant',
              content: 'Olá! Como posso ajudar você hoje? Descreva sua aplicação e vou criar algo incrível para você.',
              timestamp: new Date(),
            }]);
          }
        }
      } catch (error) {
        console.error('Failed to initialize authentication:', error);
        // Clear invalid session
        AuthService.clearSession();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
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

  const logout = async () => {
    try {
      await AuthService.logout();
      setUser(null);
      setProjects([]);
      setMessages([]);
      setCurrentProject(null);
      setGenerationTask(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await AuthService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      } else {
        await logout();
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      await logout();
    }
  };

  const value: AppContextType = {
    user,
    projects,
    messages,
    currentProject,
    generationTask,
    isLoading,
    setUser,
    setProjects,
    setMessages,
    setCurrentProject,
    setGenerationTask,
    addMessage,
    updateProject,
    logout,
    refreshUser,
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