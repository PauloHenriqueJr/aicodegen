import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { authenticatedFetch } from "../lib/auth-utils";
import { API_BASE_URL } from "../lib/api";
import { 
  Monitor, 
  Tablet, 
  Smartphone, 
  Maximize2, 
  RotateCcw, 
  ExternalLink,
  Loader2,
  AlertCircle
} from "lucide-react";

type DeviceType = 'desktop' | 'tablet' | 'mobile';

interface PreviewPaneProps {
  device?: DeviceType;
  projectId?: string;
  refreshSignal?: number;
}

interface GeneratedComponent {
  name: string;
  code: string;
  route: string;
}

export function PreviewPane({ device = 'desktop', projectId, refreshSignal }: PreviewPaneProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [currentRoute, setCurrentRoute] = useState<string>('/');
  const [hasError, setHasError] = useState(false);

  const deviceSizes = {
    desktop: { width: '100%', height: '100%' },
    tablet: { width: '768px', height: '1024px' },
    mobile: { width: '375px', height: '812px' }
  };

  const handleRefresh = () => {
    if (projectId) {
      loadProjectPreview();
    }
  };

  const loadProjectPreview = async () => {
    setIsLoading(true);
    setHasError(false);
    
    try {
      if (projectId) {
        // Load real generated code from backend using authenticated fetch
        const response = await authenticatedFetch(`${API_BASE_URL}/api/projects/${projectId}/code`, {
          method: 'GET'
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.data?.code) {
            // Convert React component to HTML
            const htmlCode = convertReactToHTML(data.data.code, data.data.projectName);
            setGeneratedCode(htmlCode);
          } else {
            // No code available - show empty state
            setGeneratedCode('');
            setHasError(true);
          }
        } else {
          throw new Error(`Failed to load preview: ${response.status}`);
        }
      } else {
        // No project selected - show empty state
        setGeneratedCode('');
        setHasError(false);
      }
    } catch (error) {
      console.error('Failed to load preview:', error);
      setGeneratedCode('');
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };
  
  const convertReactToHTML = (reactCode: string, projectName: string): string => {
    // Convert React component to executable HTML
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectName}</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      /* Dark mode support */
      .dark { color-scheme: dark; }
      @media (prefers-color-scheme: dark) {
        .dark\\:bg-gray-900 { background-color: rgb(17 24 39); }
        .dark\\:bg-gray-800 { background-color: rgb(31 41 55); }
        .dark\\:text-white { color: rgb(255 255 255); }
        .dark\\:text-gray-300 { color: rgb(209 213 219); }
        .dark\\:text-gray-400 { color: rgb(156 163 175); }
      }
    </style>
</head>
<body class="bg-gray-100 dark:bg-gray-900 min-h-screen">
    <div id="root"></div>
    <script type="text/babel">
        const { useState, useEffect } = React;
        
        // Generated component code
        ${reactCode}
        
        // Render the component
        const App = () => React.createElement(PreviewComponent || GeneratedComponent || Counter || TodoList || Dashboard || LoginForm || Component, {});
        ReactDOM.render(React.createElement(App), document.getElementById('root'));
    </script>
</body>
</html>
    `;
  };

  useEffect(() => {
    if (projectId) {
      loadProjectPreview();
    }
  }, [projectId, refreshSignal]);

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">

      {/* Preview Area */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
        <motion.div
          key={device}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden ${
            device === 'mobile' ? 'max-w-sm' : device === 'tablet' ? 'max-w-4xl' : 'w-full'
          }`}
          style={{
            width: device === 'desktop' ? '100%' : deviceSizes[device].width,
            height: device === 'desktop' ? 'calc(100vh - 200px)' : deviceSizes[device].height,
            maxHeight: device === 'desktop' ? 'calc(100vh - 200px)' : '85vh'
          }}
        >
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Gerando preview...</p>
                <p className="text-xs text-gray-500 mt-2">{projectId ? 'Carregando código real gerado' : 'Aguardando projeto'}</p>
              </div>
            </div>
          ) : hasError ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Nenhum código gerado ainda</p>
                <p className="text-xs text-gray-500 mt-2">Inicie uma nova geração para ver o preview</p>
                <Button onClick={handleRefresh} variant="outline" className="mt-4">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Tentar novamente
                </Button>
              </div>
            </div>
          ) : generatedCode ? (
            <iframe
              srcDoc={generatedCode}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin"
              title="Preview"
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Monitor className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Selecione um projeto</p>
                <p className="text-xs text-gray-500 mt-2">Escolha um projeto para ver o preview</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
