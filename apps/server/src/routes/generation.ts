import { Hono } from 'hono';
import { AuthService } from '../lib/auth';
import { ApiResponseHelper, asyncHandler } from '../lib/response';
import { validateBody, validateParams, IdParamSchema } from '../middleware/validation';
import { authMiddleware, requireCredits } from '../middleware/auth';
import { StartGenerationSchema } from '../types';
import prisma from '../../prisma';

const generationRouter = new Hono();

import { AIService } from '../lib/ai';
import { CodeGenerationService } from '../lib/code-generator';

/**
 * AI-powered generation service
 * Uses Google AI (Gemini) for real code generation
 */
class GenerationService {
  static async createGenerationPlan(prompt: string): Promise<Array<{
    name: string;
    description: string;
    type: 'CODE' | 'SCREEN' | 'SETUP' | 'OPTIMIZATION';
    order: number;
  }>> {
    try {
      // Use AI to create dynamic generation plan
      return await AIService.createGenerationPlan(prompt);
    } catch (error) {
      console.error('AI generation plan failed, using fallback:', error);
      
      // Fallback to basic plan if AI fails
      return [
        {
          name: 'Configuração inicial',
          description: 'Criando estrutura do projeto React + TypeScript',
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
          name: 'Tela Principal',
          description: 'Criando interface principal da aplicação',
          type: 'SCREEN' as const,
          order: 3,
        },
        {
          name: 'Otimização final',
          description: 'Aplicando otimizações e responsividade',
          type: 'OPTIMIZATION' as const,
          order: 4,
        },
      ];
    }
  }

  static async generateScreen(stepName: string, type: 'DESKTOP' | 'TABLET' | 'MOBILE', index: number) {
    // Generate screen with responsive design
    const positions = {
      DESKTOP: { baseX: 100, baseY: 100, offsetY: 1200 },
      TABLET: { baseX: 1200, baseY: 150, offsetY: 1300 },
      MOBILE: { baseX: 2000, baseY: 100, offsetY: 1100 },
    };

    const pos = positions[type];
    const route = stepName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    // Generate better preview images based on component type
    let imageUrl = `https://images.unsplash.com/photo-1555421689?w=800&h=600&fit=crop`;
    
    if (stepName.toLowerCase().includes('login')) {
      imageUrl = `https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop`;
    } else if (stepName.toLowerCase().includes('dashboard')) {
      imageUrl = `https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop`;
    } else if (stepName.toLowerCase().includes('contador')) {
      imageUrl = `https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop`;
    } else if (stepName.toLowerCase().includes('tarefa')) {
      imageUrl = `https://images.unsplash.com/photo-1540350394557-8d14678e7f91?w=800&h=600&fit=crop`;
    }
    
    return {
      name: stepName,
      type,
      width: type === 'DESKTOP' ? 1440 : type === 'TABLET' ? 768 : 375,
      height: type === 'DESKTOP' ? 900 : type === 'TABLET' ? 1024 : 812,
      x: pos.baseX,
      y: pos.baseY + Math.floor(index / 4) * pos.offsetY,
      imageUrl,
      route,
      component: `${stepName.replace(/\s+/g, '')}${type.charAt(0) + type.slice(1).toLowerCase()}`,
    };
  }
}

/**
 * POST /generation/start
 * Start AI generation for a project
 */
generationRouter.post(
  '/start',
  authMiddleware,
  requireCredits(5), // Require 5 credits for generation
  validateBody(StartGenerationSchema),
  asyncHandler(async (c) => {
    const user = c.get('user');
    const { projectId, prompt } = c.get('validatedData');

    // Check if project exists and user owns it
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: user.id,
      },
    });

    if (!project) {
      return ApiResponseHelper.notFound(c, 'Project not found');
    }

    // Check if there's already an active generation
    const activeGeneration = await prisma.generation.findFirst({
      where: {
        projectId,
        status: 'RUNNING',
      },
    });

    if (activeGeneration) {
      return ApiResponseHelper.conflict(c, 'Generation already in progress for this project');
    }

    // Deduct credits
    const creditsDeducted = await AuthService.deductCredits(user.id, 5);
    if (!creditsDeducted) {
      return ApiResponseHelper.forbidden(c, 'Insufficient credits');
    }

    try {
      // Create generation plan
      const steps = await GenerationService.createGenerationPlan(prompt || project.prompt);

      // Create generation record
      const generation = await prisma.generation.create({
        data: {
          projectId,
          status: 'RUNNING',
          totalSteps: steps.length,
          startedAt: new Date(),
          steps: {
            create: steps.map(step => ({
              name: step.name,
              description: step.description,
              type: step.type,
              order: step.order,
            })),
          },
        },
        include: {
          steps: {
            orderBy: {
              order: 'asc',
            },
          },
        },
      });

      // Update project status
      await prisma.project.update({
        where: { id: projectId },
        data: { status: 'GENERATING' },
      });

      // Start async generation process
      GenerationService.processGeneration(generation.id, projectId).catch(console.error);

      return ApiResponseHelper.success(c, {
        generationId: generation.id,
        status: generation.status,
        totalSteps: generation.totalSteps,
        steps: generation.steps,
      }, 'Generation started successfully');

    } catch (error) {
      // Refund credits if generation failed to start
      await AuthService.addCredits(user.id, 5);
      throw error;
    }
  })
);

// Add method to GenerationService
GenerationService.processGeneration = async (generationId: string, projectId: string) => {
  try {
    const generation = await prisma.generation.findUnique({
      where: { id: generationId },
      include: {
        steps: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!generation) return;

    for (const step of generation.steps) {
      // Update step to running
      await prisma.generationStep.update({
        where: { id: step.id },
        data: {
          status: 'RUNNING',
          startedAt: new Date(),
        },
      });

      // Simulate step processing (accelerated for testing)
      const processingTime = Math.random() * 1000 + 500; // 0.5-1.5 seconds
      
      // Simulate progress updates
      for (let progress = 0; progress <= 100; progress += 25) {
        await new Promise(resolve => setTimeout(resolve, processingTime / 4));
        await prisma.generationStep.update({
          where: { id: step.id },
          data: { progress },
        });
      }

      // Complete step
      await prisma.generationStep.update({
        where: { id: step.id },
        data: {
          status: 'COMPLETED',
          progress: 100,
          completedAt: new Date(),
        },
      });

      // If this is a screen step, create screens
      if (step.type === 'SCREEN') {
        const screenTypes: ('DESKTOP' | 'TABLET' | 'MOBILE')[] = ['DESKTOP', 'TABLET', 'MOBILE'];
        
        // Generate real component code
        let componentType: 'login' | 'dashboard' | 'counter' | 'todolist' | 'generic' = 'generic';
        if (step.name.toLowerCase().includes('login')) componentType = 'login';
        else if (step.name.toLowerCase().includes('dashboard') || step.name.toLowerCase().includes('principal')) componentType = 'dashboard';
        else if (step.name.toLowerCase().includes('contador')) componentType = 'counter';
        else if (step.name.toLowerCase().includes('tarefa') || step.name.toLowerCase().includes('todo')) componentType = 'todolist';
        
        const componentTemplate = await CodeGenerationService.generateComponent(
          step.name.replace(/\s+/g, ''),
          step.description,
          componentType
        );
        
        for (let i = 0; i < screenTypes.length; i++) {
          const screenData = await GenerationService.generateScreen(
            step.name,
            screenTypes[i],
            generation.steps.indexOf(step) * 3 + i
          );
          
          // Store the generated code
          const codeData = {
            component: componentTemplate.name,
            code: componentTemplate.code,
            files: JSON.stringify(componentTemplate.files),
            responsive: true
          };

          await prisma.screen.create({
            data: {
              ...screenData,
              projectId,
              isGenerated: true,
              // Store code metadata
              metadata: JSON.stringify(codeData),
            },
          });
        }
      }

      // Update generation progress
      const completedSteps = generation.steps.filter(s => s.id === step.id || s.order < step.order).length;
      await prisma.generation.update({
        where: { id: generationId },
        data: {
          progress: Math.round((completedSteps / generation.totalSteps) * 100),
          currentStep: step.name,
        },
      });
    }

    // Complete generation
    await prisma.generation.update({
      where: { id: generationId },
      data: {
        status: 'COMPLETED',
        progress: 100,
        completedAt: new Date(),
        currentStep: null,
      },
    });

    // Update project status
    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'COMPLETED' },
    });

  } catch (error) {
    console.error('Generation failed:', error);
    
    // Mark generation as failed
    await prisma.generation.update({
      where: { id: generationId },
      data: {
        status: 'FAILED',
        errorMsg: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date(),
      },
    });

    // Update project status
    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'ERROR' },
    });
  }
};

/**
 * GET /generation/:id
 * Get generation status and details
 */
generationRouter.get(
  '/:id',
  authMiddleware,
  validateParams(IdParamSchema),
  asyncHandler(async (c) => {
    const user = c.get('user');
    const { id } = c.get('validatedParams');

    const generation = await prisma.generation.findFirst({
      where: {
        id,
        project: {
          userId: user.id, // Ensure user owns the project
        },
      },
      include: {
        steps: {
          orderBy: {
            order: 'asc',
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!generation) {
      return ApiResponseHelper.notFound(c, 'Generation not found');
    }

    return ApiResponseHelper.success(c, generation);
  })
);

/**
 * POST /generation/:id/cancel
 * Cancel an active generation
 */
generationRouter.post(
  '/:id/cancel',
  authMiddleware,
  validateParams(IdParamSchema),
  asyncHandler(async (c) => {
    const user = c.get('user');
    const { id } = c.get('validatedParams');

    const generation = await prisma.generation.findFirst({
      where: {
        id,
        status: 'RUNNING',
        project: {
          userId: user.id,
        },
      },
      include: {
        project: true,
      },
    });

    if (!generation) {
      return ApiResponseHelper.notFound(c, 'Active generation not found');
    }

    // Update generation status
    await prisma.generation.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        completedAt: new Date(),
      },
    });

    // Update project status
    await prisma.project.update({
      where: { id: generation.projectId },
      data: { status: 'DRAFT' },
    });

    // Refund some credits (partial refund for cancellation)
    await AuthService.addCredits(user.id, 2);

    return ApiResponseHelper.success(c, null, 'Generation cancelled successfully');
  })
);

export default generationRouter;