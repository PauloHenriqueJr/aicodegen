import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Clock, AlertCircle, Loader2, Code, Monitor, Settings, Zap } from "lucide-react";
import { api } from "../lib/api";

interface RealProgressTrackerProps {
  projectId?: string;
  generationId?: string;
  isActive?: boolean;
  onStatusChange?: (status: GenerationStatus['status'], progress: number) => void;
}

interface GenerationStep {
  id: string;
  name: string;
  description: string;
  type: 'SETUP' | 'CODE' | 'SCREEN' | 'OPTIMIZATION';
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  progress: number;
  order: number;
}

interface GenerationStatus {
  id: string;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  progress: number;
  currentStep: string | null;
  totalSteps: number;
  steps: GenerationStep[];
}

export function RealProgressTracker({ projectId, generationId, isActive = false, onStatusChange }: RealProgressTrackerProps) {
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isActive && (projectId || generationId)) {
      loadGenerationStatus();
      const interval = setInterval(loadGenerationStatus, 2000);
      return () => clearInterval(interval);
    }
  }, [projectId, generationId, isActive]);

  const loadGenerationStatus = async () => {
    if (!projectId && !generationId) return;
    setIsLoading(true);
    try {
      let genId = generationId;

      // If generationId is not provided, get latest from project
      if (!genId && projectId) {
        const projectResponse = await api.getProject(projectId);
        const generations = (projectResponse as any).data.generations as Array<{ id: string }> | undefined;
        if (!generations || generations.length === 0) {
          setIsLoading(false);
          return;
        }
        genId = generations[0].id; // latest
      }

      if (!genId) return;

      const generationResponse = await api.getGeneration(genId);
      const data = (generationResponse as any).data as GenerationStatus;
      setGenerationStatus(data);
      try {
        onStatusChange?.(data.status, data.progress);
      } catch {}
    } catch (error) {
      console.error('Failed to load generation status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isActive || !generationStatus) {
    return (
      <div className="text-center text-gray-500 py-4">
        <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
        <p className="text-sm">Aguardando geração...</p>
      </div>
    );
  }

  const getStatusIcon = (status: string, type: string) => {
    if (status === 'COMPLETED') {
      return <Check className="w-4 h-4 text-green-600" />;
    } else if (status === 'RUNNING') {
      return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
    } else if (status === 'FAILED') {
      return <AlertCircle className="w-4 h-4 text-red-600" />;
    } else {
      switch (type) {
        case 'SETUP':
          return <Settings className="w-4 h-4 text-gray-400" />;
        case 'CODE':
          return <Code className="w-4 h-4 text-gray-400" />;
        case 'SCREEN':
          return <Monitor className="w-4 h-4 text-gray-400" />;
        case 'OPTIMIZATION':
          return <Zap className="w-4 h-4 text-gray-400" />;
        default:
          return <Clock className="w-4 h-4 text-gray-400" />;
      }
    }
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'RUNNING':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'FAILED':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const completedSteps = generationStatus.steps.filter(step => step.status === 'COMPLETED').length;
  const overallProgress = (completedSteps / generationStatus.totalSteps) * 100;

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'SETUP':
        return 'Configuração';
      case 'CODE':
        return 'Código';
      case 'SCREEN':
        return 'Tela';
      case 'OPTIMIZATION':
        return 'Otimização';
      default:
        return type;
    }
  };

  const isGenerating = generationStatus.status === 'RUNNING';
  const estimatedTimeRemaining = isGenerating ? Math.max(1, 5 - completedSteps) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-900 flex items-center">
          {isGenerating ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin text-blue-600" />
          ) : generationStatus.status === 'COMPLETED' ? (
            <Check className="w-4 h-4 mr-2 text-green-600" />
          ) : (
            <AlertCircle className="w-4 h-4 mr-2 text-red-600" />
          )}
          {isGenerating ? 'Geração em Progresso' : 
           generationStatus.status === 'COMPLETED' ? 'Geração Concluída' :
           generationStatus.status === 'FAILED' ? 'Geração Falhou' : 'Geração Cancelada'}
        </h4>
        <span className="text-sm text-gray-600 font-medium">
          {Math.round(overallProgress)}%
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${overallProgress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`h-2 rounded-full ${
            generationStatus.status === 'COMPLETED' 
              ? 'bg-gradient-to-r from-green-500 to-green-600'
              : generationStatus.status === 'FAILED'
              ? 'bg-gradient-to-r from-red-500 to-red-600' 
              : 'bg-gradient-to-r from-blue-500 to-purple-500'
          }`}
        />
      </div>

      {isGenerating && estimatedTimeRemaining > 0 && (
        <div className="text-xs text-gray-500 text-center">
          ~{estimatedTimeRemaining} min restantes
        </div>
      )}

      {generationStatus.currentStep && isGenerating && (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <div className="text-sm font-medium text-blue-900">
            Em andamento: {generationStatus.currentStep}
          </div>
        </motion.div>
      )}

      <div className="space-y-2">
        {generationStatus.steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`p-3 rounded-lg border ${getStepColor(step.status)} flex items-center justify-between`}
          >
            <div className="flex items-center space-x-3">
              {getStatusIcon(step.status, step.type)}
              <div>
                <div className="text-sm font-medium">{step.name}</div>
                <div className="text-xs text-gray-600">
                  {getTypeLabel(step.type)} • {Math.round(step.progress)}%
                </div>
              </div>
            </div>
            <span className="text-xs text-gray-500">#{step.order}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}