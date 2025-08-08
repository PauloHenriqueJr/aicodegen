import { z } from 'zod';

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// User Types
export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  avatar: z.string().url().optional(),
});

export const UpdateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatar: z.string().url().optional(),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

// Authentication Types
export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const RegisterSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  password: z.string().min(6),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;

// Project Types
export const CreateProjectSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  prompt: z.string().min(1),
});

export const UpdateProjectSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  prompt: z.string().min(1).optional(),
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;

// Generation Types
export const StartGenerationSchema = z.object({
  projectId: z.string().cuid(),
  prompt: z.string().min(1).optional(),
});

export type StartGenerationInput = z.infer<typeof StartGenerationSchema>;

// Chat Message Types
export const CreateChatMessageSchema = z.object({
  projectId: z.string().cuid(),
  content: z.string().min(1),
});

export type CreateChatMessageInput = z.infer<typeof CreateChatMessageSchema>;

// Screen Types
export const CreateScreenSchema = z.object({
  projectId: z.string().cuid(),
  name: z.string().min(1).max(100),
  type: z.enum(['DESKTOP', 'TABLET', 'MOBILE']),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  x: z.number(),
  y: z.number(),
  imageUrl: z.string().url().optional(),
  route: z.string().max(200).optional(),
  component: z.string().max(200).optional(),
});

export type CreateScreenInput = z.infer<typeof CreateScreenSchema>;

// Query Parameters
export const PaginationSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().positive()).optional().default('1'),
  limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional().default('10'),
});

export const ProjectQuerySchema = PaginationSchema.extend({
  status: z.enum(['DRAFT', 'GENERATING', 'COMPLETED', 'ERROR']).optional(),
  search: z.string().max(200).optional(),
});

export type PaginationQuery = z.infer<typeof PaginationSchema>;
export type ProjectQuery = z.infer<typeof ProjectQuerySchema>;

// WebSocket Types
export interface WebSocketMessage {
  type: 'generation_update' | 'screen_created' | 'step_completed' | 'generation_completed' | 'error';
  data: any;
  projectId?: string;
  userId?: string;
}

export interface GenerationUpdate {
  generationId: string;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED';
  progress: number;
  currentStep?: string;
  completedSteps: number;
  totalSteps: number;
}

export interface StepUpdate {
  stepId: string;
  name: string;
  type: 'CODE' | 'SCREEN' | 'SETUP' | 'OPTIMIZATION';
  status: 'RUNNING' | 'COMPLETED' | 'FAILED';
  progress: number;
  startedAt?: string;
  completedAt?: string;
  errorMsg?: string;
}

export interface ScreenCreated {
  screenId: string;
  name: string;
  type: 'DESKTOP' | 'TABLET' | 'MOBILE';
  x: number;
  y: number;
  width: number;
  height: number;
  imageUrl?: string;
  route?: string;
  component?: string;
}

// Utility Types
export type DatabaseUser = {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
  credits: number;
  maxCredits: number;
  createdAt: Date;
  updatedAt: Date;
};

export type PublicUser = Omit<DatabaseUser, 'email'> & {
  email?: string; // Only included for the user themselves
};

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
};