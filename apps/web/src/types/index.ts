export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  credits: number;
  maxCredits: number;
  plan: 'free' | 'pro' | 'enterprise';
  createdAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  type: 'react' | 'vue' | 'angular' | 'svelte';
  status: 'generating' | 'completed' | 'failed';
  progress: number;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  files: ProjectFile[];
  figmaFrames: FigmaFrame[];
  preview?: string;
}

export interface ProjectFile {
  id: string;
  name: string;
  path: string;
  content: string;
  language: string;
  type: 'component' | 'page' | 'config' | 'style' | 'asset';
}

export interface FigmaFrame {
  id: string;
  name: string;
  type: 'mobile' | 'tablet' | 'desktop';
  width: number;
  height: number;
  imageUrl: string;
  figmaUrl?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  projectId?: string;
}

export interface GenerationStep {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  progress: number;
  message?: string;
}

export interface GenerationTask {
  id: string;
  projectId: string;
  steps: GenerationStep[];
  startedAt: Date;
  completedAt?: Date;
  estimatedDuration: number;
}

export type TabType = 'preview' | 'code' | 'canvas';

export interface AIModel {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'mistral';
  description: string;
  tokensPerCredit: number;
  isAvailable: boolean;
}