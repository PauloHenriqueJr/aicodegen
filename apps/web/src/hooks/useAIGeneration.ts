import { useState, useEffect, useCallback } from 'react';

export interface GenerationStep {
  id: string;
  type: 'code' | 'screen';
  name: string;
  description: string;
  progress: number;
  completed: boolean;
  timestamp: Date;
}

export interface ScreenFrame {
  id: string;
  name: string;
  type: 'desktop' | 'tablet' | 'mobile';
  width: number;
  height: number;
  x: number;
  y: number;
  imageUrl: string;
  isNew?: boolean;
  isGenerating?: boolean;
  codeComponent?: string;
  route?: string;
}

interface UseAIGenerationProps {
  projectPrompt?: string;
  onScreenGenerated?: (screen: ScreenFrame) => void;
  onStepUpdate?: (step: GenerationStep) => void;
}

export function useAIGeneration({ 
  projectPrompt, 
  onScreenGenerated, 
  onStepUpdate 
}: UseAIGenerationProps = {}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState<GenerationStep | null>(null);
  const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>([]);
  const [generatedScreens, setGeneratedScreens] = useState<ScreenFrame[]>([]);
  const [generationProgress, setGenerationProgress] = useState(0);

  // Mock generation steps based on project type
  const createGenerationPlan = useCallback((prompt: string): GenerationStep[] => {
    // This would analyze the prompt and create appropriate steps
    // For now, we'll create a generic e-commerce app structure
    const baseSteps: Omit<GenerationStep, 'id' | 'timestamp' | 'completed'>[] = [
      {
        type: 'code',
        name: 'Configuração inicial',
        description: 'Criando estrutura do projeto React + TypeScript',
        progress: 0
      },
      {
        type: 'code',
        name: 'Componentes base',
        description: 'Gerando componentes de UI e layout principal',
        progress: 0
      },
      {
        type: 'screen',
        name: 'Tela de Login',
        description: 'Criando interface de autenticação',
        progress: 0
      },
      {
        type: 'code',
        name: 'Sistema de autenticação',
        description: 'Implementando lógica de login e proteção de rotas',
        progress: 0
      },
      {
        type: 'screen',
        name: 'Dashboard Principal',
        description: 'Criando painel administrativo',
        progress: 0
      },
      {
        type: 'code',
        name: 'Gerenciamento de estado',
        description: 'Configurando Context API e hooks personalizados',
        progress: 0
      },
      {
        type: 'screen',
        name: 'Lista de Produtos',
        description: 'Criando interface de catálogo',
        progress: 0
      },
      {
        type: 'screen',
        name: 'Detalhe do Produto',
        description: 'Criando página individual de produto',
        progress: 0
      },
      {
        type: 'code',
        name: 'API Integration',
        description: 'Conectando com APIs e gerenciamento de dados',
        progress: 0
      },
      {
        type: 'screen',
        name: 'Configurações',
        description: 'Criando painel de configurações do usuário',
        progress: 0
      },
      {
        type: 'code',
        name: 'Otimização final',
        description: 'Aplicando otimizações e testes',
        progress: 0
      }
    ];

    return baseSteps.map((step, index) => ({
      ...step,
      id: `step-${index}`,
      timestamp: new Date(),
      completed: false
    }));
  }, []);

  // Generate screen coordinates based on type and order
  const getScreenPosition = useCallback((screenName: string, type: 'desktop' | 'tablet' | 'mobile', index: number) => {
    const positions = {
      desktop: { baseX: 100, baseY: 100, offsetY: 1000 },
      tablet: { baseX: 900, baseY: 200, offsetY: 1100 },
      mobile: { baseX: 1600, baseY: 100, offsetY: 950 }
    };

    const pos = positions[type];
    return {
      x: pos.baseX,
      y: pos.baseY + (Math.floor(index / 3) * pos.offsetY)
    };
  }, []);

  // Mock screen generation
  const generateScreen = useCallback((stepName: string, stepId: string): ScreenFrame[] => {
    const screens: ScreenFrame[] = [];
    
    // Generate both desktop and mobile versions for most screens
    const screenConfigs = [
      {
        name: stepName,
        type: 'desktop' as const,
        width: 1440,
        height: 900,
        route: stepName.toLowerCase().replace(/\s+/g, '-'),
        codeComponent: `${stepName.replace(/\s+/g, '')}Desktop`
      },
      {
        name: `${stepName} Mobile`,
        type: 'mobile' as const,
        width: 375,
        height: 812,
        route: stepName.toLowerCase().replace(/\s+/g, '-'),
        codeComponent: `${stepName.replace(/\s+/g, '')}Mobile`
      }
    ];

    screenConfigs.forEach((config, index) => {
      const screenIndex = generatedScreens.length + index;
      const position = getScreenPosition(config.name, config.type, screenIndex);
      
      const screen: ScreenFrame = {
        id: `${stepId}-${config.type}`,
        name: config.name,
        type: config.type,
        width: config.width,
        height: config.height,
        x: position.x,
        y: position.y,
        imageUrl: `https://images.unsplash.com/photo-${1555421689 + screenIndex * 1000}?w=800&h=600&fit=crop`,
        isNew: true,
        codeComponent: config.codeComponent,
        route: config.route
      };

      screens.push(screen);
    });

    return screens;
  }, [generatedScreens.length, getScreenPosition]);

  // Start generation process
  const startGeneration = useCallback((prompt?: string) => {
    if (isGenerating) return;

    setIsGenerating(true);
    setGenerationProgress(0);
    setGeneratedScreens([]);
    
    const steps = createGenerationPlan(prompt || projectPrompt || 'E-commerce application');
    setGenerationSteps(steps);

    let currentStepIndex = 0;
    
    const processNextStep = () => {
      if (currentStepIndex >= steps.length) {
        setIsGenerating(false);
        setCurrentStep(null);
        setGenerationProgress(100);
        return;
      }

      const step = steps[currentStepIndex];
      setCurrentStep(step);
      onStepUpdate?.(step);

      // Simulate step progress
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          progress = 100;
          clearInterval(progressInterval);
        }

        const updatedStep = { ...step, progress };
        setCurrentStep(updatedStep);
        onStepUpdate?.(updatedStep);
      }, 200);

      // Complete step after random delay
      const stepDuration = Math.random() * 2000 + 1500; // 1.5-3.5s
      
      setTimeout(() => {
        clearInterval(progressInterval);
        
        // Mark step as completed
        const completedStep = { ...step, progress: 100, completed: true };
        setGenerationSteps(prev => 
          prev.map(s => s.id === step.id ? completedStep : s)
        );

        // If this is a screen step, generate the screen
        if (step.type === 'screen') {
          const newScreens = generateScreen(step.name, step.id);
          
          newScreens.forEach((screen, index) => {
            setTimeout(() => {
              setGeneratedScreens(prev => [...prev, { ...screen, isGenerating: true }]);
              
              // Complete screen generation after delay
              setTimeout(() => {
                setGeneratedScreens(prev => 
                  prev.map(s => s.id === screen.id ? { ...s, isGenerating: false } : s)
                );
                onScreenGenerated?.(screen);
              }, 1000);
            }, index * 500);
          });
        }

        // Update overall progress
        const overallProgress = ((currentStepIndex + 1) / steps.length) * 100;
        setGenerationProgress(overallProgress);

        currentStepIndex++;
        
        // Process next step
        setTimeout(processNextStep, 500);
      }, stepDuration);
    };

    // Start processing
    processNextStep();
  }, [isGenerating, projectPrompt, createGenerationPlan, generateScreen, onScreenGenerated, onStepUpdate]);

  // Stop generation
  const stopGeneration = useCallback(() => {
    setIsGenerating(false);
    setCurrentStep(null);
  }, []);

  // Reset generation
  const resetGeneration = useCallback(() => {
    setIsGenerating(false);
    setCurrentStep(null);
    setGenerationSteps([]);
    setGeneratedScreens([]);
    setGenerationProgress(0);
  }, []);

  return {
    isGenerating,
    currentStep,
    generationSteps,
    generatedScreens,
    generationProgress,
    startGeneration,
    stopGeneration,
    resetGeneration
  };
}