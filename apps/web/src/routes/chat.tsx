import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { 
  Send, 
  Sparkles, 
  User,
  Mic,
  ImagePlus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { ChatMessage } from "../types";
import { useApp } from "../lib/app-context";

export const Route = createFileRoute("/chat")({
  component: ChatComponent,
});

function ChatComponent() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! Como posso ajudar você hoje? Descreva sua aplicação e vou criar algo incrível para você.',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { isAuthenticated, isLoading, projects, user } = useApp();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Continue pending prompt after login
  useEffect(() => {
    const pending = sessionStorage.getItem('pendingPrompt');
    if (pending && isAuthenticated) {
      sessionStorage.removeItem('pendingPrompt');
      const restoredPrompt = pending;

      // echo user message
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: restoredPrompt,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);

      // small delay then go to dashboard to start generation flow
      setTimeout(() => {
        // signal dashboard to auto-continuar geração pós-login
        sessionStorage.setItem('resumeAfterLogin', '1');
        router.navigate({
          to: "/dashboard",
          search: { project: restoredPrompt }
        });
      }, 500);
    }
  }, [isAuthenticated]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isGenerating) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue("");

    // If not authenticated, require login to continue generation
    if (!isAuthenticated) {
      setIsGenerating(false);
      // Save the requested project to continue after login
      sessionStorage.setItem('pendingPrompt', currentInput);

      const gateMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Para continuar a criação de "${currentInput}", faça login. Você será redirecionado agora e retomaremos automaticamente.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, gateMessage]);

      setTimeout(() => {
        router.navigate({ to: "/login" });
      }, 600);
      return;
    }

    setIsGenerating(true);

    // Simulate brief AI acknowledgement then go to dashboard to generate
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Perfeito! Vou criar uma aplicação "${currentInput}" para você. Redirecionando para o workspace...`,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Redirect to dashboard after short delay
      setTimeout(() => {
        router.navigate({
          to: "/dashboard",
          search: { project: currentInput }
        });
      }, 900);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Show loading screen while initializing
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto">
        {/* Logo */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            AICodeGen
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Descreva sua aplicação em linguagem natural</p>
        </motion.div>

        {/* Chat Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/80 dark:bg-gray-950/70 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden max-h-[70vh] flex flex-col"
        >
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-[400px] max-h-[500px]">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-2xl ${message.role === 'user' ? 'ml-12' : 'mr-12'}`}>
                    <div className={`flex items-start space-x-3 ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === 'user' 
                          ? 'bg-blue-600' 
                          : 'bg-gradient-to-r from-purple-500 to-blue-500'
                      }`}>
                        {message.role === 'user' ? (
                          <User className="w-5 h-5 text-white" />
                        ) : (
                          <Sparkles className="w-5 h-5 text-white" />
                        )}
                      </div>
                      
                      <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                        <div className={`inline-block px-6 py-4 rounded-2xl ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                        }`}>
                          <p className="leading-relaxed">{message.content}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="max-w-2xl mr-12">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-gray-700 dark:text-gray-300">Iniciando geração...</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Examples */}
          {messages.length === 1 && !isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-6 pb-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  "Dashboard de e-commerce com analytics",
                  "Aplicativo de tarefas com colaboração",
                  "Landing page para startup",
                  "Sistema de gestão de usuários"
                ].map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setInputValue(example)}
                    className="p-3 text-left bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 transition-all text-sm text-gray-700 dark:text-gray-200 hover:text-blue-700"
                    disabled={isGenerating}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Input Area */}
          <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-end space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Descreva sua aplicação... (ex: Dashboard de e-commerce com gráficos)"
                    className="h-14 text-base pr-32 resize-none"
                    disabled={isGenerating}
                  />
                  
                  {/* Audio and Upload Icons */}
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      disabled={isGenerating}
                    >
                      <Mic className="w-4 h-4 text-gray-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      disabled={isGenerating}
                    >
                      <ImagePlus className="w-4 h-4 text-gray-500" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isGenerating}
                className="h-14 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                {isGenerating ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* User Projects (after login) */}
        {isAuthenticated && projects && projects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="mt-8"
          >
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Seus projetos
                </h3>
                <button
                  className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  onClick={() => router.navigate({ to: "/dashboard" })}
                >
                  Abrir workspace
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {projects.slice(0, 6).map((p) => (
                  <button
                    key={p.id}
                    onClick={() =>
                      router.navigate({
                        to: "/dashboard",
                        search: { project: p.name },
                      })
                    }
                    className="text-left p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 hover:bg-white dark:hover:bg-gray-800 shadow-sm hover:shadow transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {p.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                          {p.description}
                        </div>
                      </div>
                      <div
                        className={`text-[10px] px-2 py-1 rounded-full ${
                          p.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : p.status === "generating"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {p.status === "completed"
                          ? "Concluído"
                          : p.status === "generating"
                          ? "Gerando"
                          : "Erro"}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-8"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Comece gratuitamente • Gere código React + designs Figma
          </p>
        </motion.div>
      </div>
    </div>
  );
}