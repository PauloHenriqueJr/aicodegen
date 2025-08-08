import type { User, Project, ChatMessage, AIModel, GenerationTask, GenerationStep } from '../types';

export const mockUser: User = {
  id: '1',
  name: 'João Silva',
  email: 'joao@exemplo.com',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
  credits: 750,
  maxCredits: 1000,
  plan: 'pro',
  createdAt: new Date('2024-01-01'),
};

export const mockProjects: Project[] = [
  {
    id: '1',
    name: 'E-commerce Dashboard',
    description: 'Dashboard completo para loja online com analytics e gestão de produtos',
    type: 'react',
    status: 'completed',
    progress: 100,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    userId: '1',
    files: [
      {
        id: '1',
        name: 'App.tsx',
        path: '/src/App.tsx',
        content: `import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import ProductList from './components/ProductList';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<ProductList />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;`,
        language: 'typescript',
        type: 'component',
      },
      {
        id: '2',
        name: 'Dashboard.tsx',
        path: '/src/components/Dashboard.tsx',
        content: `import React from 'react';
import { BarChart3, ShoppingCart, Users, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <ShoppingCart className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Sales</p>
              <p className="text-2xl font-semibold">R$ 45.231</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Customers</p>
              <p className="text-2xl font-semibold">1.234</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;`,
        language: 'typescript',
        type: 'component',
      },
    ],
    figmaFrames: [
      {
        id: '1',
        name: 'Dashboard - Desktop',
        type: 'desktop',
        width: 1440,
        height: 900,
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600',
      },
      {
        id: '2',
        name: 'Dashboard - Mobile',
        type: 'mobile',
        width: 375,
        height: 812,
        imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=600',
      },
    ],
    preview: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600',
  },
  {
    id: '2',
    name: 'Task Management App',
    description: 'Aplicativo de gestão de tarefas com colaboração em equipe',
    type: 'react',
    status: 'completed',
    progress: 100,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-12'),
    userId: '1',
    files: [],
    figmaFrames: [],
  },
];

export const mockChatMessages: ChatMessage[] = [
  {
    id: '1',
    role: 'assistant',
    content: 'Olá! Como posso ajudar você hoje? Descreva sua aplicação e vou criar algo incrível para você.',
    timestamp: new Date(),
  },
];

export const mockAIModels: AIModel[] = [
  {
    id: 'gpt-4',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    description: 'Modelo mais avançado para geração de código complexo',
    tokensPerCredit: 100,
    isAvailable: true,
  },
  {
    id: 'claude-3',
    name: 'Claude 3 Sonnet',
    provider: 'anthropic',
    description: 'Excelente para análise e refatoração de código',
    tokensPerCredit: 120,
    isAvailable: true,
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'google',
    description: 'Rápido e eficiente para prototipagem',
    tokensPerCredit: 80,
    isAvailable: true,
  },
];

export const mockGenerationSteps: GenerationStep[] = [
  {
    id: '1',
    name: 'Análise do Prompt',
    status: 'completed',
    progress: 100,
    message: 'Prompt analisado com sucesso',
  },
  {
    id: '2',
    name: 'Geração de Componentes',
    status: 'completed',
    progress: 100,
    message: 'Componentes React gerados',
  },
  {
    id: '3',
    name: 'Criação do Layout',
    status: 'in_progress',
    progress: 75,
    message: 'Gerando layout responsivo...',
  },
  {
    id: '4',
    name: 'Frames do Figma',
    status: 'pending',
    progress: 0,
  },
  {
    id: '5',
    name: 'Finalização',
    status: 'pending',
    progress: 0,
  },
];

export const mockGenerationTask: GenerationTask = {
  id: '1',
  projectId: '1',
  steps: mockGenerationSteps,
  startedAt: new Date(),
  estimatedDuration: 180000, // 3 minutes in ms
};