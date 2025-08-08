import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { 
  Download, 
  Copy, 
  FileText, 
  Folder, 
  ChevronRight, 
  ChevronDown,
  Code,
  Package,
  Settings,
  Check,
  ExternalLink
} from "lucide-react";
import { Editor } from "@monaco-editor/react";
import { mockProjects } from "../lib/mock-data";
import JSZip from "jszip";
import { saveAs } from "file-saver";

interface FileNode {
  name: string;
  type: 'file' | 'folder';
  content?: string;
  language?: string;
  children?: FileNode[];
  path: string;
}

interface CodeEditorProps {
  projectId?: string;
  refreshSignal?: number;
}

// Default mock file structure
const defaultFileStructure: FileNode[] = [
  {
    name: 'src',
    type: 'folder',
    path: '/src',
    children: [
      {
        name: 'components',
        type: 'folder',
        path: '/src/components',
        children: [
          {
            name: 'Dashboard.tsx',
            type: 'file',
            path: '/src/components/Dashboard.tsx',
            content: mockProjects[0].files[1].content,
            language: 'typescript'
          },
          {
            name: 'ProductList.tsx',
            type: 'file',
            path: '/src/components/ProductList.tsx',
            content: `import React, { useState } from 'react';
import { Search, Plus, Filter } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
  image: string;
}

const Button = ({ children, className = "", variant = "default", ...props }: any) => (
  <button
    className={\`px-4 py-2 rounded-lg font-medium transition-colors \${
      variant === "outline"
        ? "border border-gray-300 bg-white hover:bg-gray-50"
        : "bg-blue-600 text-white hover:bg-blue-700"
    } \${className}\`}
    {...props}
  >
    {children}
  </button>
);

const ProductList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products] = useState<Product[]>([
    {
      id: 1,
      name: 'iPhone 15 Pro',
      price: 999,
      category: 'Electronics',
      stock: 25,
      image: 'https://images.unsplash.com/photo-1592910108570-74cbd2dc8f6d'
    },
    // More products...
  ]);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      <div className="mb-6 flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search products..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow p-6">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
            <p className="text-gray-600 mb-2">{product.category}</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-blue-600">
                \${product.price}
              </span>
              <span className="text-sm text-gray-500">
                Stock: {product.stock}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;`,
            language: 'typescript'
          }
        ]
      },
      {
        name: 'App.tsx',
        type: 'file',
        path: '/src/App.tsx',
        content: mockProjects[0].files[0].content,
        language: 'typescript'
      },
      {
        name: 'index.css',
        type: 'file',
        path: '/src/index.css',
        content: `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    font-family: 'Inter', system-ui, sans-serif;
  }
}

@layer components {
  .btn {
    @apply px-4 py-2 rounded-lg font-medium transition-colors;
  }
  
  .btn-primary {
    @apply bg-blue-600 text-white hover:bg-blue-700;
  }
  
  .btn-secondary {
    @apply bg-gray-200 text-gray-900 hover:bg-gray-300;
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}`,
        language: 'css'
      }
    ]
  },
  {
    name: 'package.json',
    type: 'file',
    path: '/package.json',
    content: `{
  "name": "generated-app",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "lucide-react": "^0.263.1",
    "tailwindcss": "^3.3.0",
    "typescript": "^5.0.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}`,
    language: 'json'
  },
  {
    name: 'README.md',
    type: 'file',
    path: '/README.md',
    content: `# Generated E-commerce Dashboard

This project was generated using AICodeGen.

## Features

- Modern React 18 with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- Responsive design
- Production-ready code

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Start the development server:
\`\`\`bash
npm start
\`\`\`

3. Build for production:
\`\`\`bash
npm run build
\`\`\`

## Project Structure

\`\`\`
src/
├── components/
│   ├── Dashboard.tsx
│   └── ProductList.tsx
├── App.tsx
└── index.css
\`\`\`

## Technologies Used

- React 18
- TypeScript
- Tailwind CSS
- React Router
- Lucide React Icons

## Generated with AICodeGen

This application was generated using AICodeGen - the AI-powered code generation platform.
`,
    language: 'markdown'
  }
];

export function CodeEditor({ projectId, refreshSignal }: CodeEditorProps) {
  const [fileStructure, setFileStructure] = useState<FileNode[]>(defaultFileStructure);
  const [selectedFile, setSelectedFile] = useState<FileNode>(defaultFileStructure[0].children![0].children![0]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/src', '/src/components']));
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const editorRef = useRef<any>(null);

  // Load real generated code
  useEffect(() => {
    if (projectId) {
      loadGeneratedCode();
    }
  }, [projectId, refreshSignal]);

  const loadGeneratedCode = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/projects/${projectId}/code`, {
        headers: {
          'Authorization': 'Bearer 76e12c09f37287ce35970ccdfc37a303d6425a0d28ff0c3dba219123a790b591580118d95626608f82de385bab02cc81dcdaff5a98fd8d01080b7c25bd29129f'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.data?.codeFiles && data.data.codeFiles.length > 0) {
          const generatedStructure = generateFileStructureFromCode(data.data.codeFiles, data.data.projectName);
          setFileStructure(generatedStructure);
          
          // Select first generated file
          const firstFile = findFirstFile(generatedStructure);
          if (firstFile) {
            setSelectedFile(firstFile);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load generated code:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateFileStructureFromCode = (codeFiles: any[], projectName: string): FileNode[] => {
    const structure: FileNode[] = [
      {
        name: 'src',
        type: 'folder',
        path: '/src',
        children: [
          {
            name: 'components',
            type: 'folder',
            path: '/src/components',
            children: []
          }
        ]
      },
      {
        name: 'package.json',
        type: 'file',
        path: '/package.json',
        content: generatePackageJson(projectName),
        language: 'json'
      },
      {
        name: 'README.md',
        type: 'file', 
        path: '/README.md',
        content: generateReadme(projectName),
        language: 'markdown'
      }
    ];

    // Add generated components
    const componentsFolder = structure[0].children![0]; // src/components
    
    codeFiles.forEach((codeFile, index) => {
      // Add component file
      const componentFile: FileNode = {
        name: `${codeFile.component}.tsx`,
        type: 'file',
        path: `/src/components/${codeFile.component}.tsx`,
        content: codeFile.code,
        language: 'typescript'
      };
      
      componentsFolder.children!.push(componentFile);
      
      // Add additional files from the template
      if (codeFile.files && Array.isArray(codeFile.files)) {
        codeFile.files.forEach((file: any) => {
          if (file.name !== `${codeFile.component}.tsx`) {
            const additionalFile: FileNode = {
              name: file.name,
              type: 'file',
              path: `/src/components/${file.name}`,
              content: file.content,
              language: file.name.endsWith('.css') ? 'css' : 'typescript'
            };
            componentsFolder.children!.push(additionalFile);
          }
        });
      }
    });

    // Add main App.tsx that uses generated components
    const appContent = generateAppTsx(codeFiles);
    structure[0].children!.push({
      name: 'App.tsx',
      type: 'file',
      path: '/src/App.tsx',
      content: appContent,
      language: 'typescript'
    });

    // Add styles
    structure[0].children!.push({
      name: 'index.css',
      type: 'file',
      path: '/src/index.css',
      content: generateTailwindCSS(),
      language: 'css'
    });

    return structure;
  };

  const generateAppTsx = (codeFiles: any[]): string => {
    const imports = codeFiles.map(file => 
      `import ${file.component} from './components/${file.component}';`
    ).join('\n');
    
    const firstComponent = codeFiles[0]?.component || 'div';
    
    return `import React from 'react';
import './index.css';
${imports}

function App() {
  return (
    <div className="App">
      <${firstComponent} />
    </div>
  );
}

export default App;`;
  };

  const generatePackageJson = (projectName: string): string => {
    return `{
  "name": "${projectName.toLowerCase().replace(/\s+/g, '-')}",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.263.1",
    "tailwindcss": "^3.3.0",
    "typescript": "^5.0.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}`;
  };

  const generateReadme = (projectName: string): string => {
    return `# ${projectName}

This project was generated using AICodeGen.

## Features

- Modern React 18 with TypeScript
- Tailwind CSS for styling
- Fully responsive design
- Production-ready code
- Generated with AI

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Start the development server:
\`\`\`bash
npm start
\`\`\`

3. Build for production:
\`\`\`bash
npm run build
\`\`\`

## Generated with AICodeGen

This application was generated using AICodeGen - the AI-powered code generation platform.

### Generated Components

${fileStructure[0]?.children?.[0]?.children?.map(child => 
  child.type === 'file' && child.name.endsWith('.tsx') ? `- ${child.name}` : ''
).filter(Boolean).join('\n') || '- Components will appear here after generation'}

## Technologies Used

- React 18
- TypeScript
- Tailwind CSS
- Lucide React Icons
`;
  };

  const generateTailwindCSS = (): string => {
    return `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    font-family: 'Inter', system-ui, sans-serif;
  }
}

@layer components {
  .btn {
    @apply px-4 py-2 rounded-lg font-medium transition-colors;
  }
  
  .btn-primary {
    @apply bg-blue-600 text-white hover:bg-blue-700;
  }
  
  .btn-secondary {
    @apply bg-gray-200 text-gray-900 hover:bg-gray-300;
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}`;
  };

  const findFirstFile = (nodes: FileNode[]): FileNode | null => {
    for (const node of nodes) {
      if (node.type === 'file') {
        return node;
      } else if (node.children) {
        const found = findFirstFile(node.children);
        if (found) return found;
      }
    }
    return null;
  };

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const renderFileTree = (nodes: FileNode[], depth = 0) => {
    return nodes.map((node) => (
      <div key={node.path}>
        <div
          className={`flex items-center space-x-2 py-1 px-2 hover:bg-gray-100 cursor-pointer text-sm ${
            selectedFile?.path === node.path ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
          }`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => node.type === 'file' ? setSelectedFile(node) : toggleFolder(node.path)}
        >
          {node.type === 'folder' ? (
            expandedFolders.has(node.path) ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )
          ) : (
            <div className="w-4" />
          )}
          
          {node.type === 'folder' ? (
            <Folder className="w-4 h-4 text-blue-600" />
          ) : (
            <FileText className="w-4 h-4 text-gray-500" />
          )}
          
          <span className="truncate">{node.name}</span>
        </div>
        
        {node.type === 'folder' && expandedFolders.has(node.path) && node.children && (
          <div>{renderFileTree(node.children, depth + 1)}</div>
        )}
      </div>
    ));
  };

  const copyToClipboard = async () => {
    if (selectedFile?.content) {
      await navigator.clipboard.writeText(selectedFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadProject = async () => {
    const zip = new JSZip();
    
    const addFilesToZip = (nodes: FileNode[], folder: JSZip = zip) => {
      nodes.forEach(node => {
        if (node.type === 'file' && node.content) {
          folder.file(node.name, node.content);
        } else if (node.type === 'folder' && node.children) {
          const subFolder = folder.folder(node.name);
          if (subFolder) {
            addFilesToZip(node.children, subFolder);
          }
        }
      });
    };
    
    addFilesToZip(fileStructure);
    
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, 'generated-app.zip');
  };

  return (
    <div className="h-full flex bg-white">
      {/* File Explorer */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <Code className="w-4 h-4 mr-2" />
              {projectId ? 'Generated Code' : 'Explorer'}
            </h3>
            <div className="flex items-center space-x-2">
              {isLoading && (
                <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              )}
              <Button variant="ghost" size="sm" onClick={downloadProject}>
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
          {projectId && (
            <p className="text-xs text-gray-500 mt-2">
              Código gerado pela IA em tempo real
            </p>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-sm">Carregando código gerado...</p>
            </div>
          ) : (
            renderFileTree(fileStructure)
          )}
        </div>
      </div>

      {/* Code Editor */}
      <div className="flex-1 flex flex-col">
        {/* File Info Bar - Simplified */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              {selectedFile?.name || 'Select a file'}
            </span>
            {selectedFile?.language && (
              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                {selectedFile.language}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              disabled={!selectedFile?.content}
              className="h-7"
            >
              {copied ? (
                <Check className="w-3 h-3 text-green-600" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </Button>
          </div>
        </div>

        {/* Monaco Editor */}
        <div className="flex-1">
          {selectedFile?.content ? (
            <Editor
              height="100%"
              language={selectedFile.language || 'typescript'}
              value={selectedFile.content}
              theme="vs-dark"
              options={{
                readOnly: false,
                minimap: { enabled: true },
                fontSize: 14,
                lineNumbers: 'on',
                wordWrap: 'on',
                automaticLayout: true,
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: 'blink',
                renderWhitespace: 'selection',
                bracketPairColorization: {
                  enabled: true
                }
              }}
              onMount={(editor) => {
                editorRef.current = editor;
              }}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Code className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Select a file to view its contents</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}