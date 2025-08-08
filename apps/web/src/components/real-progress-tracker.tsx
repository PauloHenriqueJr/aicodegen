import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Clock, AlertCircle, Loader2, Code, Monitor, Settings, Zap } from "lucide-react";
import { API_BASE_URL } from "../lib/api";

interface RealProgressTrackerProps {
  projectId: string;
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

export function RealProgressTracker({ projectId, isActive = false, onStatusChange }: RealProgressTrackerProps) {
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isActive && projectId) {
      loadGenerationStatus();
      
      // Poll for updates every 2 seconds during active generation
      const interval = setInterval(loadGenerationStatus, 2000);
      
      return () => clearInterval(interval);
    }
  }, [projectId, isActive]);

  const loadGenerationStatus = async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    try {
      // First, get project to find latest generation
      const projectResponse = await fetch(`${API_BASE_URL}/api/projects/${projectId}`, {
        headers: {
          'Authorization': 'Bearer 76e12c09f37287ce35970ccdfc37a303d6425a0d28ff0c3dba219123a790b591580118d95626608f82de385bab02cc81dcdaff5a98fd8d01080b7c25bd29129f'
        }
      });
      
      if (projectResponse.ok) {
        const projectData = await projectResponse.json();
        const generations = projectData.data.generations;
        
        if (generations && generations.length > 0) {
          const latestGeneration = generations[0]; // Most recent
          
          // Get detailed generation status
          const generationResponse = await fetch(`${API_BASE_URL}/api/generation/${latestGeneration.id}`, {
            headers: {
              'Authorization': 'Bearer 76e12c09f37287ce35970ccdfc37a303d6425a0d28ff0c3dba219123a790b591580118d95626608f82de385bab02cc81dcdaff5a98fd8d01080b7c25bd29129f'
            }
          });
          
          if (generationResponse.ok) {
            const generationData = await generationResponse.json();
            setGenerationStatus(generationData.data);
            try {
              onStatusChange?.(generationData.data.status, generationData.data.progress);
            } catch {}
          }
        }
      }
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
      // Pending - show type icon
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
      {/* Header */}
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

      {/* Overall Progress Bar */}
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

      {/* Time Estimate */}
      {isGenerating && estimatedTimeRemaining > 0 && (
        <div className="text-xs text-gray-500 text-center">
          ~{estimatedTimeRemaining} min restantes
        </div>
      )}

      {/* Current Step Highlight */}
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

      {/* Steps */}
      <div className="space-y-2">
        {generationStatus.steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center p-3 rounded-lg border ${getStepColor(step.status)}`}
          >
            <div className="flex-shrink-0 mr-3">
              {getStatusIcon(step.status, step.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">
                    {step.name}
                  </span>
                  <span className="text-xs px-2 py-1 bg-white/50 rounded-full">
                    {getTypeLabel(step.type)}
                  </span>
                </div>
                {step.status === 'RUNNING' && (
                  <span className="text-sm font-medium">
                    {step.progress}%
                  </span>
                )}
              </div>
              
              <p className="text-xs opacity-75 mb-2">
                {step.description}
              </p>
              
              {step.status === 'RUNNING' && (
                <div className="w-full bg-white/50 rounded-full h-1.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${step.progress}%` }}
                    transition={{ duration: 0.3 }}
                    className="bg-blue-600 h-1.5 rounded-full"
                  />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Status Footer */}
      <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-200">
        {isGenerating ? (
          "IA trabalhando em tempo real..."
        ) : generationStatus.status === 'COMPLETED' ? (
          `Geração concluída com ${completedSteps} de ${generationStatus.totalSteps} etapas`
        ) : (
          `Geração interrompida (${completedSteps} de ${generationStatus.totalSteps} etapas concluídas)`
        )}
      </div>
    </motion.div>
  );
}