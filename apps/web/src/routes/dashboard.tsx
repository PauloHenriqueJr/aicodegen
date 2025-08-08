import { createFileRoute, useSearch, useRouter } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Button } from "../components/ui/button";
import { 
  Sparkles, 
  Settings, 
  Monitor,
  Code,
  Figma,
  Menu,
  Tablet,
  Smartphone,
  ExternalLink,
  Maximize2,
  Copy,
  Download,
  Eye,
  Grid3X3,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Share2,
  Moon,
  Sun
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { ChatMessage, TabType } from "../types";
import { Sidebar } from "../components/sidebar";
import { CodeEditor } from "../components/code-editor";
import { PreviewPane } from "../components/preview-pane";
import { CanvasPane } from "../components/canvas-pane";
import { useTheme } from "../components/theme-provider";
import { SettingsDialog } from "../components/settings-dialog";
import { useRealAIGeneration } from "../hooks/useRealAIGeneration";
import { useApp } from "../lib/app-context";

interface DashboardSearch {
  project?: string;
}

export const Route = createFileRoute("/dashboard")({
  component: DashboardComponent,
  validateSearch: (search): DashboardSearch => {
    return {
      project: search.project as string,
    };
  },
});

function DashboardComponent() {
  const search = useSearch({ from: "/dashboard" });
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { setUser, setProjects } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("preview");
  const [showSidebar, setShowSidebar] = useState(true);
  const [generationTask, setGenerationTask] = useState<GenerationTask | null>(null);
  const [projectName, setProjectName] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    id: "user-1",
    name: "Usuário",
    email: "usuario@exemplo.com",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    credits: 50,
    plan: "Gratuito" as const
  });
  const [hasInitialized, setHasInitialized] = useState(false);
  const [currentProject, setCurrentProject] = useState<any>(null);
  const stepMessagesRef = useRef<Set<string>>(new Set());
  const [refreshSignal, setRefreshSignal] = useState(0);
  
  // Preview controls
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  
  // AI Generation Hook
  const {
    isGenerating: aiIsGenerating,
    currentStep,
    generationSteps,
    generatedScreens,
    generationProgress,
    startGeneration,
    stopGeneration,
    resetGeneration
  } = useRealAIGeneration({
    projectId: search.project || "temp-project-id", // TODO: Get real project ID
    onScreenGenerated: (screen) => {
      console.log('Screen generated:', screen.name);
      // Adicionar mensagem no chat quando uma tela for gerada
      const screenMessage: ChatMessage = {
        id: `screen-${screen.id}`,
        role: "assistant",
        content: `✅ **Tela criada: ${screen.name}**\n\n📱 **Dispositivo:** ${screen.type}\n📐 **Dimensões:** ${screen.width} × ${screen.height}\n🔗 **Rota:** /${screen.route}\n🧩 **Componente:** ${screen.codeComponent}\n\n*A tela está disponível no Canvas!*`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, screenMessage]);
    },
    onStepUpdate: (step) => {
      // Adicionar mensagem no chat quando um step for atualizado
      if (step.progress === 100 && !stepMessagesRef.current.has(step.id)) {
        stepMessagesRef.current.add(step.id);
        const stepMessage: ChatMessage = {
          id: `step-${step.id}`,
          role: "assistant",
          content: `🔄 **${step.name}**\n\n${step.description}\n\n*Status: Concluído (${step.progress}%)*`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, stepMessage]);
      }
    }
  });
  
  // Canvas controls  
  const [canvasView, setCanvasView] = useState<'all' | 'desktop' | 'tablet' | 'mobile'>('all');

  // Initialize project when coming from chat (only once)
  useEffect(() => {
    if (search.project && messages.length === 1 && !hasInitialized) {
      // Add user message without starting generation automatically
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: search.project,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage]);
      setProjectName(search.project);
      setHasInitialized(true);
      
      // Don't auto-generate on page load - wait for user to send message
      console.log('Project initialized from URL:', search.project);
    }
  }, [search.project, messages.length, hasInitialized]);

  const startRealGeneration = async (prompt: string) => {
    try {
      const response = await fetch('http://localhost:3000/api/generation/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 76e12c09f37287ce35970ccdfc37a303d6425a0d28ff0c3dba219123a790b591580118d95626608f82de385bab02cc81dcdaff5a98fd8d01080b7c25bd29129f'
        },
        body: JSON.stringify({
          projectId: 'cme23d2zj0004s1jcf3tyl2sr',
          prompt: prompt
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `🚀 **Perfeito! Iniciando geração com IA real!**

**Projeto:** ${prompt}

**Sistema ativado:**
- ✅ Google AI (Gemini) conectado
- ✅ Banco Neon sincronizado
- ✅ ${data.data.totalSteps} etapas planejadas

**Progresso em tempo real:**
${data.data.steps.map((step: any, i: number) =>
  `${i + 1}. ${step.name} - ${step.description}`
).join('\n')}

**As telas aparecerão no Canvas conforme forem geradas!**`,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, aiMessage]);
        // Mantém isGenerating = true; o RealProgressTracker controlará a finalização via onStatusChange
      } else {
        throw new Error('Generation failed to start');
      }
    } catch (error) {
      console.error('Failed to start generation:', error);
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Perfeito! Estou criando uma aplicação "${prompt}" para você. Vou gerar componentes React modernos com TypeScript, estilização com Tailwind CSS e também criar os designs no Figma.
          
**O que estou criando:**
- ✅ Estrutura do projeto React + TypeScript
- ✅ Componentes principais da aplicação
- 🔄 Sistema de roteamento e navegação
- 🔄 Estilização responsiva com Tailwind
- ⏳ Frames do Figma para cada tela
- ⏳ Configuração e testes`,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
      // Em caso de erro na inicialização real, podemos liberar o flag de geração
      setIsGenerating(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isGenerating || aiIsGenerating) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: message,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Se for o primeiro projeto/geração, iniciar a geração com AI hook
    if (messages.length <= 2 && !currentProject) {
      setIsGenerating(true);
      setProjectName(message);
      stepMessagesRef.current.clear();
      
      const welcomeMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `🚀 **Perfeito! Iniciando geração: ${message}**\n\n**Sistema ativado:**\n- ✅ Geração de componentes React + TypeScript\n- ✅ Designs responsivos (Desktop + Mobile)\n- ✅ Canvas Figma-like integrado\n\n**Acompanhe o progresso em tempo real abaixo!**\n\n*As telas aparecerão automaticamente no Canvas conforme forem criadas.*`,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, welcomeMessage]);
      
      // Disparar geração real no backend (para progresso no sidebar)
      void startRealGeneration(message);
      
      // Iniciar geração com AI Hook (mock para Canvas local)
      setTimeout(() => {
        startGeneration(message);
      }, 1000);
      
      return;
    }

    setIsGenerating(true);

    try {
      // Call real API first
      const response = await fetch('http://localhost:3000/api/projects/cme23d2zj0004s1jcf3tyl2sr/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 76e12c09f37287ce35970ccdfc37a303d6425a0d28ff0c3dba219123a790b591580118d95626608f82de385bab02cc81dcdaff5a98fd8d01080b7c25bd29129f'
        },
        body: JSON.stringify({ content: message })
      });

      if (response.ok) {
        const data = await response.json();
        const [userMsg, assistantMsg] = data.data;
        
        const aiMessage: ChatMessage = {
          id: assistantMsg.id,
          role: "assistant",
          content: assistantMsg.content,
          timestamp: new Date(assistantMsg.createdAt),
        };
        
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error('API call failed');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Fallback response com AI Generation
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `✨ **Entendido!** Implementando: "${message}"\n\n**Atualizações:**\n- 🔄 Modificando componentes relevantes\n- 🎨 Ajustando estilos e layouts\n- 📱 Sincronizando todas as telas\n\n*As mudanças aparecerão nos próximos momentos!*`,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = async () => {
    const projectDisplayName = projectName || "Novo Projeto";
    const sanitizedName = projectDisplayName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    // Import JSZip dynamically
    const JSZip = (await import('jszip')).default;
    const { saveAs } = await import('file-saver');
    
    const zip = new JSZip();
    
    // Create project structure
    const projectFolder = zip.folder(sanitizedName);
    
    // Package.json
    projectFolder?.file('package.json', JSON.stringify({
      name: sanitizedName,
      version: '1.0.0',
      private: true,
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'tsc && vite build',
        preview: 'vite preview',
        lint: 'eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0'
      },
      dependencies: {
        'react': '^18.2.0',
        'react-dom': '^18.2.0',
        'react-router-dom': '^6.20.0',
        'framer-motion': '^10.16.0',
        'lucide-react': '^0.294.0',
        'class-variance-authority': '^0.7.0',
        'clsx': '^2.0.0',
        'tailwind-merge': '^2.0.0'
      },
      devDependencies: {
        '@types/react': '^18.2.37',
        '@types/react-dom': '^18.2.15',
        '@typescript-eslint/eslint-plugin': '^6.10.0',
        '@typescript-eslint/parser': '^6.10.0',
        '@vitejs/plugin-react': '^4.1.1',
        'autoprefixer': '^10.4.16',
        'eslint': '^8.53.0',
        'eslint-plugin-react-hooks': '^4.6.0',
        'eslint-plugin-react-refresh': '^0.4.4',
        'postcss': '^8.4.32',
        'tailwindcss': '^3.3.6',
        'typescript': '^5.2.2',
        'vite': '^5.0.0'
      }
    }, null, 2));

    // README.md
    projectFolder?.file('README.md', `# ${projectDisplayName}

Este projeto foi gerado pela AICodeGen - uma plataforma de geração automática de código React.

## 🚀 Como executar

\`\`\`bash
npm install
npm run dev
\`\`\`

## 📁 Estrutura do projeto

- \`src/components/\` - Componentes React reutilizáveis
- \`src/pages/\` - Páginas da aplicação
- \`src/hooks/\` - Custom hooks
- \`src/lib/\` - Utilitários e configurações
- \`src/types/\` - Definições TypeScript

## 🎨 Styling

Este projeto usa TailwindCSS para estilização. Os estilos estão organizados seguindo as melhores práticas de design systems.

## 📱 Responsividade

A aplicação foi construída com foco mobile-first e é totalmente responsiva.

Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`);

    // Vite config
    projectFolder?.file('vite.config.ts', `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})`);

    // Tailwind config
    projectFolder?.file('tailwind.config.js', `/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [],
}`);

    // Create src folder structure
    const srcFolder = projectFolder?.folder('src');
    const componentsFolder = srcFolder?.folder('components');
    const pagesFolder = srcFolder?.folder('pages');
    const libFolder = srcFolder?.folder('lib');
    const hooksFolder = srcFolder?.folder('hooks');
    const typesFolder = srcFolder?.folder('types');

    // Main App.tsx
    srcFolder?.file('App.tsx', `import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './lib/theme-provider';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import './index.css';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Router>
        <div className="min-h-screen bg-background text-foreground">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;`);

    // Main index.tsx
    srcFolder?.file('main.tsx', `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`);

    // CSS file
    srcFolder?.file('index.css', `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 84% 4.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}`);

    // Generate pages based on generated screens
    generatedScreens.forEach((screen, index) => {
      const componentName = screen.codeComponent || `${screen.name.replace(/\s+/g, '')}Page`;
      const fileName = `${componentName}.tsx`;
      
      pagesFolder?.file(fileName, `import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ${screen.type === 'mobile' ? 'Smartphone' : screen.type === 'tablet' ? 'Tablet' : 'Monitor'} } from 'lucide-react';

interface ${componentName}Props {
  className?: string;
}

export default function ${componentName}({ className = '' }: ${componentName}Props) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={\`min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 \${className}\`}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </button>
          <div className="flex items-center space-x-2">
            <${screen.type === 'mobile' ? 'Smartphone' : screen.type === 'tablet' ? 'Tablet' : 'Monitor'} className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">${screen.type.charAt(0).toUpperCase() + screen.type.slice(1)}</span>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                ${screen.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg mb-8">
                Esta é a página ${screen.name.toLowerCase()}, otimizada para dispositivos ${screen.type === 'mobile' ? 'móveis' : screen.type === 'tablet' ? 'tablet' : 'desktop'}.
              </p>

              <div className="grid grid-cols-1 ${screen.type === 'desktop' ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6">
                {/* Feature Cards */}
                {Array.from({ length: ${screen.type === 'desktop' ? 6 : 4} }, (_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1, duration: 0.3 }}
                    className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                      <div className="w-6 h-6 bg-blue-600 rounded"></div>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Feature {i + 1}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Descrição da funcionalidade implementada para esta seção específica.
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex ${screen.type === 'mobile' ? 'flex-col' : 'flex-row'} ${screen.type === 'mobile' ? 'space-y-4' : 'space-x-4'} mt-8">
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors">
                  Ação Principal
                </button>
                <button className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-3 px-6 rounded-lg font-medium transition-colors">
                  Ação Secundária
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center mt-12 text-sm text-gray-500 dark:text-gray-400">
          <p>Gerado pela AICodeGen • ${new Date().toLocaleDateString('pt-BR')}</p>
        </footer>
      </div>
    </motion.div>
  );
}`);
    });

    // Utils
    libFolder?.file('utils.ts', `import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}`);

    // Theme provider
    libFolder?.file('theme-provider.tsx', `import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light' | 'system'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'vite-ui-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light'

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')

  return context
}`);

    // TypeScript config
    projectFolder?.file('tsconfig.json', JSON.stringify({
      compilerOptions: {
        target: 'ES2020',
        useDefineForClassFields: true,
        lib: ['ES2020', 'DOM', 'DOM.Iterable'],
        module: 'ESNext',
        skipLibCheck: true,
        moduleResolution: 'bundler',
        allowImportingTsExtensions: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        jsx: 'react-jsx',
        strict: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noFallthroughCasesInSwitch: true,
        baseUrl: '.',
        paths: {
          '@/*': ['./src/*']
        }
      },
      include: ['src'],
      references: [{ path: './tsconfig.node.json' }]
    }, null, 2));

    // Index.html
    projectFolder?.file('index.html', `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectDisplayName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`);

    // Generate the ZIP file
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `${sanitizedName}-complete.zip`);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = () => {
    // Clear auth and user state
    // TODO: Implement real logout
    localStorage.removeItem('auth_token');
    router.navigate({ to: "/login" });
    setUser(null);
    setProjects([]);
    // Navigate to home page
    router.navigate({ to: '/' });
  };

  const handleProjectSelect = async (project: any) => {
    setCurrentProject(project);
    setProjectName(project.name);
    
    // Limpar mensagens atuais e carregar as do projeto
    const projectMessages = [
      {
        id: '1',
        role: 'system' as const,
        content: 'Sistema iniciado. Como posso ajudar você hoje?',
        timestamp: new Date(),
      },
      {
        id: project.id + '_welcome',
        role: 'assistant' as const,
        content: `**Projeto carregado: ${project.name}**\n\n${project.description}\n\n**Status:** ${project.status === 'completed' ? 'Concluído' : project.status === 'generating' ? 'Em geração...' : 'Com erro'}\n\n**O que você gostaria de fazer com este projeto?**`,
        timestamp: new Date(),
      }
    ];
    
    setMessages(projectMessages);
    
    // Se o projeto estiver sendo gerado, iniciar o tracking
    if (project.status === 'generating') {
      setIsGenerating(true);
      // Simular o progresso da geração
      setTimeout(() => {
        setIsGenerating(false);
        const updatedMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `✅ **Geração concluída para: ${project.name}**\n\n**Telas criadas:**\n- Homepage desktop (1920x1080)\n- Dashboard mobile (375x812)\n- Login screen (1200x800)\n\n**Componentes gerados:**\n- Header.tsx\n- Navigation.tsx\n- Dashboard.tsx\n\n**Próximos passos:**\n- Revisar no Canvas\n- Exportar código\n- Testar responsividade`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, updatedMessage]);
      }, 3000);
    }
  };


  // Bridge do sidebar: reage às atualizações do RealProgressTracker (backend)
  const handleSidebarGenerationStatusChange = (
    status: 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED',
    progress: number
  ) => {
    if (status === 'RUNNING') {
      setIsGenerating(true);
    } else {
      setIsGenerating(false);
    }
    if (status === 'COMPLETED') {
      setActiveTab('preview');
      setRefreshSignal((s) => s + 1);
    }
  };

  // Always show sidebar in this new flow
  return (
    <div className="h-screen flex bg-gradient-to-br from-slate-50/60 via-white/40 to-indigo-50/60 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950">
      {/* Sidebar - Always visible */}
      <AnimatePresence>
        {showSidebar && (
          <Sidebar
            user={currentUser}
            generationTask={generationTask}
            onClose={() => setShowSidebar(false)}
            messages={messages}
            onSendMessage={handleSendMessage}
            isGenerating={isGenerating || aiIsGenerating}
            projectName={projectName}
            onProjectNameChange={setProjectName}
            onSettingsClick={() => setShowSettings(true)}
            onLogout={handleLogout}
            onProjectSelect={handleProjectSelect}
            onGenerationStatusChange={handleSidebarGenerationStatusChange}
          />
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white/20 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 px-6 py-4 flex items-center justify-between rounded-b-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
          <div className="flex items-center space-x-4">
            {!showSidebar && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSidebar(true)}
                className="flex items-center space-x-2"
              >
                <Menu className="w-4 h-4" />
                <span>Menu</span>
              </Button>
            )}
            <div className="flex items-center space-x-2">
              <Sparkles className="w-6 h-6 text-blue-600" />
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">AICodeGen</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleExport}
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </header>

        {/* Main Content Area - Preview/Code/Canvas */}
        <div className="flex-1 flex flex-col bg-transparent">
          {/* Modern Toolbar - Inspired by Figma */}
          <div className="flex items-center justify-between px-4 py-3 bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/10 rounded-xl mx-4 mt-4">
            {/* Left side - Breadcrumb and Tabs */}
            <div className="flex items-center space-x-4">
              {/* Breadcrumb */}
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium text-gray-900 dark:text-white">{projectName || "Novo Projeto"}</span>
                <span className="text-gray-400 dark:text-gray-500">/</span>
                <span className="capitalize">{activeTab}</span>
              </div>
              
              {/* Tab Switcher - More compact */}
              <div className="flex bg-white/10 dark:bg-white/5 backdrop-blur-md rounded-lg p-1 border border-white/10">
                {[
                  { id: "preview" as TabType, label: "Preview", icon: Monitor },
                  { id: "code" as TabType, label: "Code", icon: Code },
                  { id: "canvas" as TabType, label: "Canvas", icon: Figma },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? "bg-white/30 text-blue-700 dark:text-blue-300 shadow-sm border border-white/20 backdrop-blur-sm"
                        : "text-gray-700 dark:text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right side - Tab-specific controls */}
            <div className="flex items-center space-x-3">
              {/* Preview Controls */}
              {activeTab === "preview" && (
                <>
                  <div className="flex bg-white/10 dark:bg-white/5 backdrop-blur-md rounded-lg p-1 border border-white/10">
                    <button 
                      onClick={() => setPreviewDevice('desktop')}
                      className={`flex items-center space-x-1 px-2 py-1 rounded text-xs ${
                        previewDevice === 'desktop' ? 'bg-white shadow-sm text-gray-700' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Monitor className="w-3 h-3" />
                      <span>Desktop</span>
                    </button>
                    <button 
                      onClick={() => setPreviewDevice('tablet')}
                      className={`flex items-center space-x-1 px-2 py-1 rounded text-xs ${
                        previewDevice === 'tablet' ? 'bg-white shadow-sm text-gray-700' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Tablet className="w-3 h-3" />
                      <span>Tablet</span>
                    </button>
                    <button 
                      onClick={() => setPreviewDevice('mobile')}
                      className={`flex items-center space-x-1 px-2 py-1 rounded text-xs ${
                        previewDevice === 'mobile' ? 'bg-white shadow-sm text-gray-700' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Smartphone className="w-3 h-3" />
                      <span>Mobile</span>
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <div className="flex bg-white/10 dark:bg-white/5 backdrop-blur-md rounded-lg p-1 border border-white/10">
                      <button className="p-1 rounded text-gray-500 hover:text-gray-700">
                        <ZoomOut className="w-3 h-3" />
                      </button>
                      <span className="px-2 py-1 text-xs text-gray-600 min-w-[40px] text-center">100%</span>
                      <button className="p-1 rounded text-gray-500 hover:text-gray-700">
                        <ZoomIn className="w-3 h-3" />
                      </button>
                    </div>
                    
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                      <Maximize2 className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}

              {/* Code Controls */}
              {activeTab === "code" && (
                <>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>TypeScript</span>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="h-8">
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="h-8">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button size="sm" className="h-8 bg-blue-600 hover:bg-blue-700 text-white">
                      <Download className="w-4 h-4 mr-1" />
                      Export
                    </Button>
                  </div>
                </>
              )}

              {/* Canvas Controls */}
              {activeTab === "canvas" && (
                <>
                  <div className="flex bg-white/10 dark:bg-white/5 backdrop-blur-md rounded-lg p-1 border border-white/10">
                    <button 
                      onClick={() => setCanvasView('all')}
                      className={`flex items-center space-x-1 px-2 py-1 rounded text-xs ${
                        canvasView === 'all' ? 'bg-white shadow-sm text-gray-700' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Grid3X3 className="w-3 h-3" />
                      <span>All</span>
                    </button>
                    <button 
                      onClick={() => setCanvasView('desktop')}
                      className={`flex items-center space-x-1 px-2 py-1 rounded text-xs ${
                        canvasView === 'desktop' ? 'bg-white shadow-sm text-gray-700' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Monitor className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={() => setCanvasView('tablet')}
                      className={`flex items-center space-x-1 px-2 py-1 rounded text-xs ${
                        canvasView === 'tablet' ? 'bg-white shadow-sm text-gray-700' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Tablet className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={() => setCanvasView('mobile')}
                      className={`flex items-center space-x-1 px-2 py-1 rounded text-xs ${
                        canvasView === 'mobile' ? 'bg-white shadow-sm text-gray-700' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Smartphone className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex bg-white/10 dark:bg-white/5 backdrop-blur-md rounded-lg p-1 border border-white/10">
                      <button className="p-1 rounded text-gray-500 hover:text-gray-700">
                        <ZoomOut className="w-3 h-3" />
                      </button>
                      <span className="px-2 py-1 text-xs text-gray-600 min-w-[40px] text-center">Fit</span>
                      <button className="p-1 rounded text-gray-500 hover:text-gray-700">
                        <ZoomIn className="w-3 h-3" />
                      </button>
                    </div>
                    
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button size="sm" className="h-8 bg-blue-600 hover:bg-blue-700 text-white">
                      <Download className="w-4 h-4 mr-1" />
                      Export
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden bg-transparent">
            <AnimatePresence mode="wait">
              {activeTab === "preview" && (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full"
                >
                  <PreviewPane
                    device={previewDevice}
                    projectId="cme23d2zj0004s1jcf3tyl2sr"
                    refreshSignal={refreshSignal}
                  />
                </motion.div>
              )}
              
              {activeTab === "code" && (
                <motion.div
                  key="code"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full"
                >
                  <CodeEditor
                    projectId="cme23d2zj0004s1jcf3tyl2sr"
                    refreshSignal={refreshSignal}
                  />
                </motion.div>
              )}
              
              {activeTab === "canvas" && (
                <motion.div
                  key="canvas"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full"
                >
                  <CanvasPane
                    isGenerating={isGenerating || aiIsGenerating}
                    deviceView={canvasView}
                    projectPrompt={projectName || search.project}
                    projectId={currentProject?.id || "cme23d2zj0004s1jcf3tyl2sr"}
                    refreshSignal={refreshSignal}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Settings Dialog */}
      <SettingsDialog
        open={showSettings}
        onClose={() => setShowSettings(false)}
        user={currentUser}
        onUserUpdate={setCurrentUser}
      />
    </div>
  );
}