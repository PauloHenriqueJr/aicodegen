import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

export interface GenerationStep {
  id: string;
  type: 'code' | 'screen' | 'setup' | 'optimization';
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

interface UseRealAIGenerationProps {
  projectId?: string;
  onScreenGenerated?: (screen: ScreenFrame) => void;
  onStepUpdate?: (step: GenerationStep) => void;
}

export function useRealAIGeneration({ 
  projectId, 
  onScreenGenerated, 
  onStepUpdate 
}: UseRealAIGenerationProps = {}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState<GenerationStep | null>(null);
  const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>([]);
  const [generatedScreens, setGeneratedScreens] = useState<ScreenFrame[]>([]);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Convert API step to UI step format
  const convertStep = useCallback((step: any): GenerationStep => ({
    id: step.id,
    type: step.type.toLowerCase() as GenerationStep['type'],
    name: step.name,
    description: step.description,
    progress: step.progress || 0,
    completed: step.status === 'COMPLETED',
    timestamp: new Date(step.createdAt || Date.now()),
  }), []);

  // Poll generation status
  const pollGeneration = useCallback(async (id: string) => {
    try {
      const response = await api.getGeneration(id);
      const generation = response.data;
      
      // Update progress
      setGenerationProgress(generation.progress);
      
      // Update steps
      const steps = generation.steps.map(convertStep);
      setGenerationSteps(steps);
      
      // Find current step
      const currentStepData = generation.steps.find(s => s.status === 'RUNNING');
      if (currentStepData) {
        const currentStepConverted = convertStep(currentStepData);
        setCurrentStep(currentStepConverted);
        onStepUpdate?.(currentStepConverted);
      }
      
      // Check if completed
      if (generation.status === 'COMPLETED') {
        setIsGenerating(false);
        setCurrentStep(null);
        
        // Load generated screens
        if (projectId) {
          loadProjectScreens(projectId);
        }
        
        return false; // Stop polling
      }
      
      // Check if failed
      if (generation.status === 'FAILED' || generation.status === 'CANCELLED') {
        setIsGenerating(false);
        setCurrentStep(null);
        setError(generation.status === 'FAILED' ? 'Generation failed' : 'Generation cancelled');
        return false; // Stop polling
      }
      
      return true; // Continue polling
    } catch (error) {
      console.error('Error polling generation:', error);
      setError('Failed to get generation status');
      setIsGenerating(false);
      return false;
    }
  }, [convertStep, onStepUpdate, projectId]);

  // Load project screens
  const loadProjectScreens = useCallback(async (projId: string) => {
    try {
      const response = await api.getProject(projId);
      const project = response.data;
      
      const screens: ScreenFrame[] = project.screens.map(screen => ({
        id: screen.id,
        name: screen.name,
        type: screen.type.toLowerCase() as ScreenFrame['type'],
        width: screen.width,
        height: screen.height,
        x: screen.x,
        y: screen.y,
        imageUrl: screen.imageUrl,
        codeComponent: screen.component,
        route: screen.route,
        isNew: false,
        isGenerating: false,
      }));
      
      setGeneratedScreens(screens);
      
      // Notify about new screens
      screens.forEach(screen => {
        onScreenGenerated?.(screen);
      });
    } catch (error) {
      console.error('Error loading project screens:', error);
    }
  }, [onScreenGenerated]);

  // Start generation process
  const startGeneration = useCallback(async (prompt: string) => {
    if (isGenerating || !projectId) return;
    
    setIsGenerating(true);
    setGenerationProgress(0);
    setGeneratedScreens([]);
    setError(null);
    
    try {
      // Start generation via API
      const response = await api.startGeneration(projectId, prompt);
      const generation = response.data;
      
      setGenerationId(generation.generationId);
      
      // Convert and set initial steps
      const steps = generation.steps.map(convertStep);
      setGenerationSteps(steps);
      
      // Start polling for updates
      let shouldContinuePolling = true;
      const pollInterval = setInterval(async () => {
        if (!shouldContinuePolling) {
          clearInterval(pollInterval);
          return;
        }
        
        shouldContinuePolling = await pollGeneration(generation.generationId);
        
        if (!shouldContinuePolling) {
          clearInterval(pollInterval);
        }
      }, 1000); // Poll every second
      
    } catch (error: any) {
      setIsGenerating(false);
      setError(error.message || 'Failed to start generation');
      console.error('Error starting generation:', error);
    }
  }, [isGenerating, projectId, convertStep, pollGeneration]);

  // Stop generation
  const stopGeneration = useCallback(async () => {
    if (!generationId) return;
    
    try {
      await api.cancelGeneration(generationId);
      setIsGenerating(false);
      setCurrentStep(null);
      setGenerationId(null);
    } catch (error) {
      console.error('Error stopping generation:', error);
    }
  }, [generationId]);

  // Reset generation
  const resetGeneration = useCallback(() => {
    setIsGenerating(false);
    setCurrentStep(null);
    setGenerationSteps([]);
    setGeneratedScreens([]);
    setGenerationProgress(0);
    setGenerationId(null);
    setError(null);
  }, []);

  // Load existing screens on mount
  useEffect(() => {
    if (projectId) {
      loadProjectScreens(projectId);
    }
  }, [projectId, loadProjectScreens]);

  return {
    isGenerating,
    currentStep,
    generationSteps,
    generatedScreens,
    generationProgress,
    error,
    startGeneration,
    stopGeneration,
    resetGeneration,
  };
}