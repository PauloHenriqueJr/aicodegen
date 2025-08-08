import { motion } from "framer-motion";
import { Check, Clock, AlertCircle, Loader2 } from "lucide-react";
import type { GenerationTask } from "../types";

interface ProgressTrackerProps {
  task: GenerationTask;
}

export function ProgressTracker({ task }: ProgressTrackerProps) {
  const completedSteps = task.steps.filter(step => step.status === 'completed').length;
  const totalSteps = task.steps.length;
  const overallProgress = (completedSteps / totalSteps) * 100;
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'in_progress':
        return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 border-blue-200';
      case 'error':
        return 'bg-red-100 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const estimatedTimeRemaining = Math.max(0, task.estimatedDuration - (Date.now() - task.startedAt.getTime()));
  const formattedTimeRemaining = Math.ceil(estimatedTimeRemaining / 1000 / 60);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">
          Geração em Progresso
        </h4>
        <span className="text-xs text-gray-500">
          {Math.round(overallProgress)}%
        </span>
      </div>

      {/* Overall Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${overallProgress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full"
        />
      </div>

      {/* Time Estimate */}
      {estimatedTimeRemaining > 0 && (
        <div className="text-xs text-gray-500 text-center">
          ~{formattedTimeRemaining} min restantes
        </div>
      )}

      {/* Steps - Minimalista */}
      <div className="space-y-2">
        {task.steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center space-x-2"
          >
            <div className="flex-shrink-0">
              {getStatusIcon(step.status)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-700">
                  {step.name}
                </span>
                {step.status === 'in_progress' && (
                  <span className="text-xs text-blue-600">
                    {step.progress}%
                  </span>
                )}
              </div>
              
              {step.status === 'in_progress' && (
                <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${step.progress}%` }}
                    transition={{ duration: 0.3 }}
                    className="bg-blue-500 h-1 rounded-full"
                  />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}