import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { useRealAIGeneration, type ScreenFrame } from "../hooks/useRealAIGeneration";
import { authenticatedFetch } from "../lib/auth-utils";
import { API_BASE_URL } from "../lib/api";
import { 
  Monitor, 
  Tablet, 
  Smartphone, 
  Download, 
  ExternalLink,
  Maximize2,
  Eye,
  Copy,
  ZoomIn,
  ZoomOut,
  Move,
  Sparkles,
  Loader2,
  MousePointer2,
  Code,
  Layers
} from "lucide-react";

type DeviceView = 'all' | 'desktop' | 'tablet' | 'mobile';

interface CanvasPaneProps {
  isGenerating?: boolean;
  deviceView?: DeviceView;
  projectPrompt?: string;
  projectId?: string;
  refreshSignal?: number;
}

export function CanvasPane({ isGenerating = false, deviceView = 'all', projectPrompt, projectId, refreshSignal }: CanvasPaneProps) {
  const [realScreens, setRealScreens] = useState<any[]>([]);
  const [loadingRealScreens, setLoadingRealScreens] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.5);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFrameId, setSelectedFrameId] = useState<string | null>(null);

  // Load real screens from backend
  const loadRealScreens = async () => {
    if (!projectId) return;
    
    setLoadingRealScreens(true);
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/api/projects/${projectId}/screens`);
      
      if (response.ok) {
        const data = await response.json();
        setRealScreens(data.data || []);
      }
    } catch (error) {
      console.error('Failed to load screens:', error);
    } finally {
      setLoadingRealScreens(false);
    }
  };
  
  // Use Real AI Generation hook
  const {
    isGenerating: aiIsGenerating,
    currentStep,
    generatedScreens,
    startGeneration,
    resetGeneration,
    error: generationError
  } = useRealAIGeneration({
    projectId,
    onScreenGenerated: (screen) => {
      console.log('New screen generated:', screen.name);
    },
    onStepUpdate: (step) => {
      console.log('Generation step:', step.name, `${step.progress}%`);
    }
  });
  
  // Load real screens on component mount and when projectId changes
  useEffect(() => {
    loadRealScreens();
    
    // Poll for new screens every 3 seconds during generation
    let interval: NodeJS.Timeout;
    if (isGenerating || aiIsGenerating) {
      interval = setInterval(loadRealScreens, 3000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [projectId, isGenerating, aiIsGenerating]);

  // Start generation when isGenerating prop changes
  useEffect(() => {
    if (isGenerating && !aiIsGenerating) {
      startGeneration(projectPrompt);
    } else if (!isGenerating && aiIsGenerating) {
      // Don't immediately reset, let current generation finish
    }
  }, [isGenerating, aiIsGenerating, startGeneration, projectPrompt]);

  // Refresh real screens when dashboard signals a refresh (e.g., generation completed)
  useEffect(() => {
    if (projectId) {
      loadRealScreens();
    }
  }, [refreshSignal]);

  // Reset when component unmounts or major changes
  useEffect(() => {
    return () => {
      if (!isGenerating) {
        resetGeneration();
      }
    };
  }, [resetGeneration, isGenerating]);

  // Generate actual preview from React code
  const generateScreenPreview = (screen: any): string => {
    // Extract the code from metadata if available
    const metadata = screen.metadata ? JSON.parse(screen.metadata) : null;
    const code = metadata?.code || screen.code || '';
    
    if (!code) {
      const fallbackSvg = `
        <svg width="${screen.width}" height="${screen.height}" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#f8fafc"/>
          <rect x="20" y="20" width="${screen.width - 40}" height="60" rx="8" fill="#e2e8f0"/>
          <rect x="20" y="100" width="${screen.width - 40}" height="40" rx="6" fill="#cbd5e1"/>
          <rect x="20" y="160" width="${(screen.width - 40) * 0.7}" height="40" rx="6" fill="#cbd5e1"/>
          <text x="${screen.width/2}" y="${screen.height/2}" text-anchor="middle" fill="#64748b" font-family="Arial" font-size="14">
            ${screen.name}
          </text>
        </svg>
      `;
      return `data:image/svg+xml;base64,${btoa(fallbackSvg)}`;
    }

    // Create a mockup preview based on screen type and code content
    const isLoginScreen = code.toLowerCase().includes('login') || code.toLowerCase().includes('signin') || screen.name.toLowerCase().includes('login');
    const isDashboard = code.toLowerCase().includes('dashboard') || code.toLowerCase().includes('analytics') || screen.name.toLowerCase().includes('dashboard');
    const isCounter = code.toLowerCase().includes('counter') || code.toLowerCase().includes('count') || screen.name.toLowerCase().includes('counter');
    const isTodoList = code.toLowerCase().includes('todo') || code.toLowerCase().includes('task') || screen.name.toLowerCase().includes('todo');
    
    let previewSvg = '';
    
    if (isLoginScreen) {
      previewSvg = `
        <svg width="${screen.width}" height="${screen.height}" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#f8fafc"/>
          <rect x="0" y="0" width="100%" height="80" fill="#3b82f6"/>
          <text x="${screen.width/2}" y="45" text-anchor="middle" fill="white" font-family="Arial" font-size="18" font-weight="bold">Login</text>
          <rect x="${screen.width/2 - 160}" y="120" width="320" height="300" rx="12" fill="white" stroke="#e2e8f0"/>
          <rect x="${screen.width/2 - 140}" y="160" width="280" height="40" rx="6" fill="#f8fafc" stroke="#cbd5e1"/>
          <text x="${screen.width/2 - 130}" y="182" fill="#64748b" font-family="Arial" font-size="12">Email</text>
          <rect x="${screen.width/2 - 140}" y="220" width="280" height="40" rx="6" fill="#f8fafc" stroke="#cbd5e1"/>
          <text x="${screen.width/2 - 130}" y="242" fill="#64748b" font-family="Arial" font-size="12">Password</text>
          <rect x="${screen.width/2 - 140}" y="280" width="280" height="40" rx="6" fill="#3b82f6"/>
          <text x="${screen.width/2}" y="302" text-anchor="middle" fill="white" font-family="Arial" font-size="14" font-weight="bold">Sign In</text>
          <text x="${screen.width/2}" y="350" text-anchor="middle" fill="#3b82f6" font-family="Arial" font-size="12">Don't have an account?</text>
        </svg>
      `;
    } else if (isDashboard) {
      previewSvg = `
        <svg width="${screen.width}" height="${screen.height}" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#f8fafc"/>
          <rect x="0" y="0" width="100%" height="70" fill="white" stroke="#e2e8f0"/>
          <text x="20" y="40" fill="#1f2937" font-family="Arial" font-size="16" font-weight="bold">Dashboard</text>
          <circle cx="${screen.width - 40}" cy="35" r="15" fill="#3b82f6"/>
          <rect x="0" y="70" width="240" height="${screen.height - 70}" fill="white" stroke="#e2e8f0"/>
          <rect x="20" y="90" width="200" height="30" rx="4" fill="#eff6ff"/>
          <rect x="20" y="130" width="200" height="30" rx="4" fill="#f8fafc"/>
          <rect x="20" y="170" width="200" height="30" rx="4" fill="#f8fafc"/>
          <rect x="260" y="90" width="${screen.width - 280}" height="120" rx="8" fill="white" stroke="#e2e8f0"/>
          <rect x="280" y="110" width="${screen.width - 320}" height="20" rx="4" fill="#3b82f6"/>
          <text x="290" y="125" fill="white" font-family="Arial" font-size="12">Revenue Analytics</text>
          <rect x="260" y="230" width="${(screen.width - 320) / 2 - 10}" height="80" rx="8" fill="white" stroke="#e2e8f0"/>
          <rect x="${260 + (screen.width - 320) / 2 + 10}" y="230" width="${(screen.width - 320) / 2 - 10}" height="80" rx="8" fill="white" stroke="#e2e8f0"/>
          <rect x="260" y="330" width="${screen.width - 280}" height="150" rx="8" fill="white" stroke="#e2e8f0"/>
          <text x="${260 + (screen.width - 280) / 2}" y="410" text-anchor="middle" fill="#64748b" font-family="Arial" font-size="14">Sales Chart</text>
        </svg>
      `;
    } else if (isCounter) {
      previewSvg = `
        <svg width="${screen.width}" height="${screen.height}" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#f8fafc"/>
          <rect x="${screen.width/2 - 150}" y="${screen.height/2 - 100}" width="300" height="200" rx="12" fill="white" stroke="#e2e8f0"/>
          <text x="${screen.width/2}" y="${screen.height/2 - 60}" text-anchor="middle" fill="#1f2937" font-family="Arial" font-size="20" font-weight="bold">Counter</text>
          <circle cx="${screen.width/2}" cy="${screen.height/2 - 10}" r="40" fill="#eff6ff" stroke="#3b82f6" stroke-width="2"/>
          <text x="${screen.width/2}" y="${screen.height/2 - 5}" text-anchor="middle" fill="#3b82f6" font-family="Arial" font-size="24" font-weight="bold">0</text>
          <rect x="${screen.width/2 - 80}" y="${screen.height/2 + 40}" width="60" height="30" rx="6" fill="#ef4444"/>
          <text x="${screen.width/2 - 50}" y="${screen.height/2 + 58}" text-anchor="middle" fill="white" font-family="Arial" font-size="12">-</text>
          <rect x="${screen.width/2 + 20}" y="${screen.height/2 + 40}" width="60" height="30" rx="6" fill="#22c55e"/>
          <text x="${screen.width/2 + 50}" y="${screen.height/2 + 58}" text-anchor="middle" fill="white" font-family="Arial" font-size="12">+</text>
        </svg>
      `;
    } else if (isTodoList) {
      previewSvg = `
        <svg width="${screen.width}" height="${screen.height}" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#f8fafc"/>
          <rect x="20" y="20" width="${screen.width - 40}" height="60" rx="8" fill="#3b82f6"/>
          <text x="40" y="55" fill="white" font-family="Arial" font-size="18" font-weight="bold">Todo List</text>
          <rect x="20" y="100" width="${screen.width - 100}" height="40" rx="6" fill="white" stroke="#cbd5e1"/>
          <text x="30" y="122" fill="#64748b" font-family="Arial" font-size="12">Add new task...</text>
          <rect x="${screen.width - 70}" y="105" width="50" height="30" rx="6" fill="#3b82f6"/>
          <text x="${screen.width - 45}" y="122" text-anchor="middle" fill="white" font-family="Arial" font-size="10">Add</text>
          <rect x="20" y="160" width="${screen.width - 40}" height="40" rx="6" fill="white" stroke="#e2e8f0"/>
          <circle cx="40" cy="180" r="8" fill="#22c55e"/>
          <text x="60" y="185" fill="#1f2937" font-family="Arial" font-size="12">Complete the project</text>
          <rect x="20" y="210" width="${screen.width - 40}" height="40" rx="6" fill="white" stroke="#e2e8f0"/>
          <circle cx="40" cy="230" r="8" fill="#e2e8f0"/>
          <text x="60" y="235" fill="#64748b" font-family="Arial" font-size="12">Review documentation</text>
          <rect x="20" y="260" width="${screen.width - 40}" height="40" rx="6" fill="white" stroke="#e2e8f0"/>
          <circle cx="40" cy="280" r="8" fill="#e2e8f0"/>
          <text x="60" y="285" fill="#64748b" font-family="Arial" font-size="12">Update tests</text>
        </svg>
      `;
    } else {
      previewSvg = `
        <svg width="${screen.width}" height="${screen.height}" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#f8fafc"/>
          <rect x="20" y="20" width="${screen.width - 40}" height="60" rx="8" fill="#e2e8f0"/>
          <text x="30" y="55" fill="#64748b" font-family="Arial" font-size="16" font-weight="bold">${screen.name}</text>
          <rect x="20" y="100" width="${screen.width - 40}" height="${screen.height - 140}" rx="8" fill="white" stroke="#e2e8f0"/>
          <rect x="40" y="120" width="${screen.width - 80}" height="20" rx="4" fill="#cbd5e1"/>
          <rect x="40" y="150" width="${(screen.width - 80) * 0.7}" height="20" rx="4" fill="#e2e8f0"/>
          <rect x="40" y="180" width="${(screen.width - 80) * 0.9}" height="20" rx="4" fill="#e2e8f0"/>
          <rect x="40" y="${screen.height - 80}" width="100" height="35" rx="6" fill="#3b82f6"/>
          <text x="90" y="${screen.height - 58}" text-anchor="middle" fill="white" font-family="Arial" font-size="12">Action</text>
        </svg>
      `;
    }
    
    return `data:image/svg+xml;base64,${btoa(previewSvg)}`;
  };

  // Convert real screens to ScreenFrame format
  const convertedRealScreens: ScreenFrame[] = realScreens.map((screen, index) => ({
    id: screen.id || `real-${index}`,
    name: screen.name,
    type: screen.type.toLowerCase() as 'desktop' | 'tablet' | 'mobile',
    width: screen.width,
    height: screen.height,
    x: screen.x,
    y: screen.y,
    imageUrl: generateScreenPreview(screen),
    route: screen.route,
    component: screen.component,
    codeComponent: screen.component,
    isGenerating: false,
    isNew: false
  }));
  
  const allScreens = realScreens.length > 0 ? convertedRealScreens : generatedScreens;
  const filteredScreens = deviceView === 'all' ? allScreens : allScreens.filter(screen => screen.type === deviceView);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement | null;
    const isInsideFrame = target ? target.closest('.frame') : null;
    if (e.button === 0 && !isInsideFrame) {
      setIsDragging(true);
      setSelectedFrameId(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan(prev => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY
      }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleFrameClick = (frameId: string) => {
    setSelectedFrameId(frameId);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.1));
  };

  const fitToScreen = () => {
    setZoom(0.5);
    setPan({ x: 0, y: 0 });
  };

  const getScreenScale = (screen: ScreenFrame) => {
    return screen.type === 'desktop' ? 0.3 : screen.type === 'tablet' ? 0.4 : 0.5;
  };

  return (
    <div className="h-full flex flex-col bg-transparent relative overflow-hidden">
      {selectedFrameId && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="absolute top-4 right-4 z-20 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 min-w-[280px]"
        >
          {(() => {
            const selectedScreen = allScreens.find(s => s.id === selectedFrameId);
            if (!selectedScreen) return null;
            
            return (
              <>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{selectedScreen.name}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFrameId(null)}
                    className="h-6 w-6 p-0"
                  >
                    ×
                  </Button>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Device:</span>
                    <span className="font-medium capitalize">{selectedScreen.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Size:</span>
                    <span className="font-medium">{selectedScreen.width} × {selectedScreen.height}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Route:</span>
                    <span className="font-medium">/{selectedScreen.route}</span>
                  </div>
                  {selectedScreen.codeComponent && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Component:</span>
                      <span className="font-medium font-mono text-xs">{selectedScreen.codeComponent}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                    <Eye className="w-3 h-3 mr-1" />
                    Preview
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Code className="w-3 h-3 mr-1" />
                    Code
                  </Button>
                </div>
              </>
            );
          })()}
        </motion.div>
      )}

      <div className="absolute top-4 left-4 z-10 flex items-center space-x-2">
        <div className="bg-white/20 dark:bg-white/5 backdrop-blur-md rounded-lg shadow-lg border border-white/10 p-2 flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={handleZoomOut} className="h-8 w-8 p-0">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400 min-w-[50px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button variant="ghost" size="sm" onClick={handleZoomIn} className="h-8 w-8 p-0">
            <ZoomIn className="w-4 h-4" />
          </Button>
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />
          <Button variant="ghost" size="sm" onClick={fitToScreen} className="h-8 px-3">
            <Maximize2 className="w-4 h-4 mr-1" />
            <span className="text-xs">Fit</span>
          </Button>
        </div>
      </div>

      {currentStep && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 right-4 z-10"
        >
          <div className="bg-blue-600 text-white rounded-lg shadow-lg p-3 flex items-center space-x-3 min-w-[280px]">
            <div className="relative">
              {currentStep.type === 'code' ? (
                <Code className="w-5 h-5" />
              ) : (
                <Layers className="w-5 h-5" />
              )}
              <div className="absolute -inset-1 bg-white/20 rounded-full animate-ping" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">{currentStep.name}</div>
              <div className="text-xs text-blue-100 mb-1">{currentStep.description}</div>
              <div className="w-full bg-blue-800 rounded-full h-1.5">
                <div 
                  className="bg-white rounded-full h-1.5 transition-all duration-300"
                  style={{ width: `${currentStep.progress}%` }}
                />
              </div>
            </div>
            <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
          </div>
        </motion.div>
      )}

      <div
        ref={canvasRef}
        className="flex-1 relative cursor-grab active:cursor-grabbing overflow-hidden"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
            backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
            transform: `translate(${pan.x % (20 * zoom)}px, ${pan.y % (20 * zoom)}px)`
          }}
        />
        <div
          className="absolute inset-0 origin-top-left"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
          }}
        >
          <AnimatePresence>
            {filteredScreens.map((screen) => (
              <motion.div
                key={screen.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="frame absolute group cursor-pointer"
                style={{
                  left: screen.x,
                  top: screen.y,
                  width: screen.width * getScreenScale(screen),
                  height: screen.height * getScreenScale(screen)
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleFrameClick(screen.id);
                }}
              >
                <div className={`w-full h-full bg-white/60 dark:bg-white/5 backdrop-blur-md rounded-lg shadow-lg border overflow-hidden group-hover:shadow-xl transition-all duration-200 ${
                  selectedFrameId === screen.id
                    ? 'border-blue-500/60 shadow-blue-200 ring-2 ring-blue-200/60'
                    : 'border-white/20'
                }`}>
                  {screen.isGenerating ? (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                        </div>
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Gerando...
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {screen.route && `Route: /${screen.route}`}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <img
                        src={screen.imageUrl}
                        alt={screen.name}
                        className="w-full h-full object-cover"
                        draggable={false}
                      />
                      
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                        <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white" title="Preview">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white" title="Copy to Figma">
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white" title="View Code">
                          <Code className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white" title="Open Route">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                      {screen.isNew && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2"
                        >
                          <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg">
                            NEW
                          </div>
                        </motion.div>
                      )}
                    </>
                  )}
                </div>
                <div className="absolute -bottom-8 left-0 right-0">
                  <div className="bg-white/30 dark:bg-white/5 backdrop-blur-md rounded border border-white/20 px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 text-center shadow-sm">
                    <div>{screen.name}</div>
                    {screen.route && (
                      <div className="text-gray-600 dark:text-gray-400 text-xs mt-0.5">
                        /{screen.route}
                      </div>
                    )}
                  </div>
                </div>
                <div className="absolute -top-6 left-0">
                  <div className="bg-white/20 dark:bg-white/5 backdrop-blur-md text-gray-700 dark:text-gray-300 border border-white/10 rounded px-2 py-1 text-xs flex items-center space-x-1">
                    {screen.type === 'desktop' && <Monitor className="w-3 h-3" />}
                    {screen.type === 'tablet' && <Tablet className="w-3 h-3" />}
                    {screen.type === 'mobile' && <Smartphone className="w-3 h-3" />}
                    <span className="capitalize">{screen.type}</span>
                  </div>
                </div>
                {screen.codeComponent && (
                  <div className="absolute -top-6 right-0">
                    <div className="bg-white/20 dark:bg-white/5 backdrop-blur-md text-purple-700 dark:text-purple-200 border border-white/10 rounded px-2 py-1 text-xs flex items-center space-x-1">
                      <Code className="w-3 h-3" />
                      <span className="font-mono">{screen.codeComponent}</span>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredScreens.length === 0 && !aiIsGenerating && !loadingRealScreens && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MousePointer2 className="w-10 h-10 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Canvas Vazio
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {projectId ? 'Aguardando geração de telas...' : 'Inicie uma nova geração para ver as telas aparecerem aqui'}
              </p>
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-400 dark:text-gray-500">
                <div className="flex items-center space-x-1">
                  <Move className="w-4 h-4" />
                  <span>Arraste para mover</span>
                </div>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <ZoomIn className="w-4 h-4" />
                  <span>Zoom com os controles</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {loadingRealScreens && filteredScreens.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Carregando telas...
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Verificando gerações em andamento
              </p>
            </div>
          </div>
        )}
      </div>

      {filteredScreens.length > 0 && (
        <div className="p-4 bg-white/10 dark:bg-white/5 backdrop-blur-md border-t border-white/10">
          <div className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-300">
            <div className="flex items-center space-x-4">
              <span>
                <span className="font-medium">{filteredScreens.length}</span> screens
              </span>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${realScreens.length > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                <span>{realScreens.length > 0 ? 'Conectado ao backend' : 'Modo demo'}</span>
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Last updated 2 min ago
            </div>
          </div>
        </div>
      )}
    </div>
  );
}