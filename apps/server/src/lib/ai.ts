/**
 * AI Integration Service
 * Currently supports Google AI (Gemini)
 */

import type { StepUpdate } from '../types';

interface AIResponse {
  content: string;
  usage?: {
    totalTokens: number;
    inputTokens: number;
    outputTokens: number;
  };
}

interface GenerationStep {
  name: string;
  description: string;
  type: StepUpdate['type'];
  order: number;
}

interface ComponentCode {
  name: string;
  code: string;
  imports: string[];
  exports: string[];
}

export class AIService {
  private static apiKey = process.env.GOOGLE_AI_API_KEY;
  private static baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  /**
   * Make request to Google AI API
   */
  private static async makeRequest(endpoint: string, body: any): Promise<any> {
    if (!this.apiKey) {
      throw new Error('Google AI API key not configured');
    }

    const response = await fetch(`${this.baseUrl}${endpoint}?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google AI API error: ${response.status} ${error}`);
    }

    return response.json();
  }

  /**
   * Generate text using Gemini
   */
  static async generateText(prompt: string): Promise<AIResponse> {
    try {
      const response = await this.makeRequest('/models/gemini-pro:generateContent', {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      });

      const content = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      return {
        content,
        usage: response.usageMetadata ? {
          totalTokens: response.usageMetadata.totalTokenCount || 0,
          inputTokens: response.usageMetadata.promptTokenCount || 0,
          outputTokens: response.usageMetadata.candidatesTokenCount || 0,
        } : undefined
      };
    } catch (error) {
      console.error('AI Generation Error:', error);
      throw new Error(`Failed to generate AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Analyze project prompt and create generation plan
   */
  static async createGenerationPlan(projectPrompt: string): Promise<GenerationStep[]> {
    const prompt = `
Analyze this project description and create a detailed step-by-step generation plan for building a React application:

Project Description: "${projectPrompt}"

Create a generation plan with the following step types:
- SETUP: Initial project setup and configuration
- CODE: Code generation (components, hooks, utils, etc.)
- SCREEN: UI screen/page creation
- OPTIMIZATION: Final optimizations, tests, performance

Each step should have:
- name: Clear, descriptive name
- description: Detailed description of what will be done
- type: One of the four types above
- order: Sequential order number

Return ONLY a JSON array of steps, no additional text or explanation.

Example format:
[
  {
    "name": "Project Setup",
    "description": "Initialize React project with TypeScript, Tailwind CSS, and required dependencies",
    "type": "SETUP",
    "order": 1
  },
  {
    "name": "Login Component",
    "description": "Create authentication form with email/password fields and validation",
    "type": "CODE",
    "order": 2
  },
  {
    "name": "Login Screen",
    "description": "Design login page layout with branding and responsive design",
    "type": "SCREEN",
    "order": 3
  }
]
`;

    try {
      const response = await this.generateText(prompt);
      
      // Try to parse JSON from response
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response');
      }

      const steps = JSON.parse(jsonMatch[0]);
      
      // Validate and sanitize steps
      const validatedSteps: GenerationStep[] = steps
        .filter((step: any) => 
          step.name && 
          step.description && 
          ['SETUP', 'CODE', 'SCREEN', 'OPTIMIZATION'].includes(step.type) &&
          typeof step.order === 'number'
        )
        .map((step: any, index: number) => ({
          name: step.name.trim(),
          description: step.description.trim(),
          type: step.type,
          order: index + 1, // Ensure sequential ordering
        }));

      if (validatedSteps.length === 0) {
        throw new Error('No valid steps generated');
      }

      return validatedSteps;
    } catch (error) {
      console.error('Failed to create generation plan:', error);
      
      // Fallback to default plan
      return this.getDefaultGenerationPlan(projectPrompt);
    }
  }

  /**
   * Generate React component code
   */
  static async generateComponent(
    componentName: string, 
    description: string, 
    projectContext?: string
  ): Promise<ComponentCode> {
    const prompt = `
Generate a React TypeScript component with the following requirements:

Component Name: ${componentName}
Description: ${description}
${projectContext ? `Project Context: ${projectContext}` : ''}

Requirements:
- Use modern React with hooks
- Include TypeScript types
- Use Tailwind CSS for styling
- Follow best practices
- Include proper imports and exports
- Make it responsive and accessible

Return the response in this exact JSON format:
{
  "name": "${componentName}",
  "code": "// Complete component code here",
  "imports": ["import statements as separate array items"],
  "exports": ["export statements as separate array items"]
}

Generate ONLY the JSON, no additional text.
`;

    try {
      const response = await this.generateText(prompt);
      
      // Try to parse JSON from response
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response');
      }

      const componentData = JSON.parse(jsonMatch[0]);
      
      return {
        name: componentData.name || componentName,
        code: componentData.code || `// Component code for ${componentName}`,
        imports: Array.isArray(componentData.imports) ? componentData.imports : [],
        exports: Array.isArray(componentData.exports) ? componentData.exports : [`export default ${componentName};`],
      };
    } catch (error) {
      console.error('Failed to generate component:', error);
      
      // Return fallback component
      return {
        name: componentName,
        code: `import React from 'react';

interface ${componentName}Props {
  // Add props here
}

const ${componentName}: React.FC<${componentName}Props> = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">${componentName}</h1>
      <p className="text-gray-600">${description}</p>
    </div>
  );
};

export default ${componentName};`,
        imports: ['import React from \'react\';'],
        exports: [`export default ${componentName};`],
      };
    }
  }

  /**
   * Generate chat response for user messages
   */
  static async generateChatResponse(
    userMessage: string,
    projectContext?: string,
    conversationHistory?: string[]
  ): Promise<string> {
    const prompt = `
You are an AI assistant helping to build a React application. Respond to the user's message in a helpful, concise way.

${projectContext ? `Project Context: ${projectContext}` : ''}

${conversationHistory && conversationHistory.length > 0 ? 
  `Previous conversation:\n${conversationHistory.slice(-5).join('\n')}\n` : ''
}

User Message: "${userMessage}"

Respond as an AI assistant who is building their app. Be encouraging and specific about what you will implement. Keep the response under 200 words.
`;

    try {
      const response = await this.generateText(prompt);
      return response.content.trim();
    } catch (error) {
      console.error('Failed to generate chat response:', error);
      return `Entendi! Vou implementar: "${userMessage}". As mudanças aparecerão no preview em instantes!`;
    }
  }

  /**
   * Fallback generation plan when AI fails
   */
  private static getDefaultGenerationPlan(projectPrompt: string): GenerationStep[] {
    const isEcommerce = /ecommerce|shop|store|product|cart/i.test(projectPrompt);
    const isDashboard = /dashboard|admin|management|analytics/i.test(projectPrompt);
    const isSocial = /social|chat|message|post|feed/i.test(projectPrompt);
    
    let steps = [
      {
        name: 'Configuração inicial',
        description: 'Criando estrutura do projeto React + TypeScript com Tailwind CSS',
        type: 'SETUP' as const,
        order: 1,
      },
      {
        name: 'Componentes base',
        description: 'Gerando componentes de UI e layout principal',
        type: 'CODE' as const,
        order: 2,
      },
      {
        name: 'Tela de Login',
        description: 'Criando interface de autenticação',
        type: 'SCREEN' as const,
        order: 3,
      },
    ];

    if (isEcommerce) {
      steps = steps.concat([
        {
          name: 'Sistema de produtos',
          description: 'Implementando gerenciamento de produtos e catálogo',
          type: 'CODE' as const,
          order: 4,
        },
        {
          name: 'Lista de Produtos',
          description: 'Criando interface de catálogo de produtos',
          type: 'SCREEN' as const,
          order: 5,
        },
        {
          name: 'Carrinho de Compras',
          description: 'Implementando funcionalidade de carrinho',
          type: 'CODE' as const,
          order: 6,
        },
      ]);
    } else if (isDashboard) {
      steps = steps.concat([
        {
          name: 'Dashboard Principal',
          description: 'Criando painel administrativo com métricas',
          type: 'SCREEN' as const,
          order: 4,
        },
        {
          name: 'Sistema de dados',
          description: 'Implementando gerenciamento de estado e APIs',
          type: 'CODE' as const,
          order: 5,
        },
      ]);
    } else if (isSocial) {
      steps = steps.concat([
        {
          name: 'Sistema de posts',
          description: 'Implementando criação e exibição de posts',
          type: 'CODE' as const,
          order: 4,
        },
        {
          name: 'Feed Principal',
          description: 'Criando timeline de posts e interações',
          type: 'SCREEN' as const,
          order: 5,
        },
      ]);
    } else {
      steps = steps.concat([
        {
          name: 'Dashboard Principal',
          description: 'Criando painel principal da aplicação',
          type: 'SCREEN' as const,
          order: 4,
        },
      ]);
    }

    steps.push({
      name: 'Otimização final',
      description: 'Aplicando otimizações de performance e responsividade',
      type: 'OPTIMIZATION' as const,
      order: steps.length + 1,
    });

    return steps;
  }
}