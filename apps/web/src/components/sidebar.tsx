import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { 
  User, 
  Settings, 
  LogOut, 
  ArrowUpRight,
  X,
  Folder,
  Send,
  Mic,
  ImagePlus,
  Edit3
} from "lucide-react";
import type { User as UserType, GenerationTask, ChatMessage } from "../types";
import { ProgressTracker } from "./progress-tracker";
import { RealProgressTracker } from "./real-progress-tracker";
import { mockProjects } from "../lib/mock-data";
import { useState, useRef, useEffect } from "react";

interface SidebarProps {
  user: UserType;
  generationTask?: GenerationTask | null;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isGenerating: boolean;
  projectName: string;
  onProjectNameChange: (name: string) => void;
  onSettingsClick?: () => void;
  onLogout?: () => void;
  onProjectSelect?: (project: any) => void;
  onGenerationStatusChange?: (status: 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED', progress: number) => void;
  projectId?: string;
  generationId?: string;
}

export function Sidebar({
  user,
  generationTask,
  onClose,
  messages,
  onSendMessage,
  isGenerating,
  projectName,
  onProjectNameChange,
  onSettingsClick,
  onLogout,
  onProjectSelect,
  onGenerationStatusChange,
  projectId,
  generationId,
}: SidebarProps) {
  const [inputValue, setInputValue] = useState("");
  const [isEditingProjectName, setIsEditingProjectName] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const creditPercentage = (user.credits / user.maxCredits) * 100;
  const isLowCredits = creditPercentage < 25;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim() || isGenerating) return;
    onSendMessage(inputValue);
    setInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const hasRecentProjects = mockProjects.length > 0;

  return (
    <motion.div
      initial={{ x: -400 }}
      animate={{ x: 0 }}
      exit={{ x: -400 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="w-96 bg-white/60 dark:bg-gray-900/30 backdrop-blur-xl border-r border-white/20 dark:border-white/10 flex flex-col h-full relative shadow-xl"
    >
      {/* Close Button - Mobile */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 lg:hidden"
      >
        <X className="w-4 h-4" />
      </Button>

      {/* Header - User Profile */}
      <div className="p-4 border-b border-white/20 dark:border-white/10 bg-white/20 dark:bg-white/5 backdrop-blur-sm">
        <div className="flex items-center space-x-3 mb-4">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 dark:text-white text-sm">{user.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={onSettingsClick}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* Project Name */}
        <div className="mb-4">
          {isEditingProjectName ? (
            <Input
              value={projectName}
              onChange={(e) => onProjectNameChange(e.target.value)}
              onBlur={() => setIsEditingProjectName(false)}
              onKeyPress={(e) => e.key === 'Enter' && setIsEditingProjectName(false)}
              className="text-sm font-medium"
              placeholder="Nome do projeto"
              autoFocus
            />
          ) : (
            <div 
              onClick={() => setIsEditingProjectName(true)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer group"
            >
              <span className="text-sm font-medium text-gray-900 dark:text-white flex-1">
                {projectName || "Novo Projeto"}
              </span>
              <Edit3 className="w-3 h-3 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
            </div>
          )}
        </div>

        {/* Credits - Minimalista */}
        <div className="rounded-lg p-3 bg-white/20 dark:bg-white/5 backdrop-blur-sm border border-white/10 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-600 dark:text-gray-300">Créditos</span>
              {user.plan === 'pro' && (
                <div className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                  PRO
                </div>
              )}
            </div>
            <span className="text-xs font-medium text-gray-900 dark:text-white">
              {user.credits}/{user.maxCredits}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 mb-2">
            <div
              className={`h-1.5 rounded-full ${
                isLowCredits 
                  ? 'bg-orange-500' 
                  : 'bg-blue-500'
              }`}
              style={{ width: `${creditPercentage}%` }}
            />
          </div>
          
          {isLowCredits && (
            <Button 
              size="sm" 
              className="w-full h-7 text-xs bg-orange-600 hover:bg-orange-700 text-white"
            >
              <ArrowUpRight className="w-3 h-3 mr-1" />
              Upgrade
            </Button>
          )}
        </div>
      </div>

      {/* Progress Tracker - Só aparece quando está gerando */}
      {/* Real AI Progress */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="p-4 border-b border-white/20 dark:border-white/10 bg-white/10 dark:bg-white/5 backdrop-blur-sm"
      >
        <RealProgressTracker
          projectId={projectId}
          generationId={generationId}
          isActive={isGenerating || generationTask !== null}
          onStatusChange={onGenerationStatusChange}
        />
      </motion.div>
      

      {/* Recent Projects - Só aparece se tiver projetos */}
      {hasRecentProjects && (
        <div className="p-4 border-b border-white/20 dark:border-white/10 bg-white/10 dark:bg-white/5 backdrop-blur-sm">
          <h4 className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-3 uppercase tracking-wide">
            Projetos Recentes
          </h4>
          
          <div className="space-y-2">
            {mockProjects.slice(0, 2).map((project) => (
              <motion.div
                key={project.id}
                whileHover={{ scale: 1.01 }}
                onClick={() => onProjectSelect?.(project)}
                className="p-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded flex items-center justify-center flex-shrink-0">
                    <Folder className="w-3 h-3 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-medium text-gray-900 dark:text-white truncate">
                      {project.name}
                    </h5>
                    <div className="flex items-center space-x-1 mt-0.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        project.status === 'completed' ? 'bg-green-500' :
                        project.status === 'generating' ? 'bg-blue-500' :
                        'bg-red-500'
                      }`} />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {project.status === 'completed' ? 'Concluído' :
                         project.status === 'generating' ? 'Gerando...' :
                         'Erro'}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Chat */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] ${message.role === 'user' ? 'ml-6' : 'mr-6'}`}>
                <div className={`p-3 rounded-lg text-sm ${message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-white/10'}`}>
                  {message.content}
                </div>
                <div className="text-[10px] text-gray-500 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/20 dark:border-white/10 bg-white/30 dark:bg-gray-900/30 backdrop-blur">
        <div className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Descreva a próxima melhoria ou tela..."
              className="pr-24"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Mic className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ImagePlus className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <Button onClick={handleSendMessage} className="h-10">
            <Send className="w-4 h-4 mr-2" />
            Enviar
          </Button>
        </div>
        {onLogout && (
          <div className="text-right mt-2">
            <button onClick={onLogout} className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 float-right">
              <LogOut className="w-3 h-3" />
              Sair
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}