import { Hono } from 'hono';
import { AuthService } from '../lib/auth';
import { ApiResponseHelper, asyncHandler } from '../lib/response';
import { validateBody, validateQuery, validateParams, IdParamSchema } from '../middleware/validation';
import { authMiddleware, requireCredits } from '../middleware/auth';
import { CreateProjectSchema, UpdateProjectSchema, ProjectQuerySchema } from '../types';
import { AIService } from '../lib/ai';
import prisma from '../../prisma';

const projectsRouter = new Hono();

/**
 * GET /projects
 * Get user's projects with pagination and filters
 */
projectsRouter.get(
  '/',
  authMiddleware,
  validateQuery(ProjectQuerySchema),
  asyncHandler(async (c) => {
    const user = c.get('user');
    const { page, limit, status, search } = c.get('validatedQuery');

    // Build where clause
    const where: any = {
      userId: user.id,
      ...(status && { status }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    // Get total count
    const total = await prisma.project.count({ where });
    const totalPages = Math.ceil(total / limit);

    // Get projects
    const projects = await prisma.project.findMany({
      where,
      include: {
        _count: {
          select: {
            screens: true,
            messages: true,
            generations: true,
          },
        },
        generations: {
          select: {
            id: true,
            status: true,
            progress: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1, // Latest generation only
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const formattedProjects = projects.map(project => ({
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      screensCount: project._count.screens,
      messagesCount: project._count.messages,
      generationsCount: project._count.generations,
      latestGeneration: project.generations[0] || null,
    }));

    return ApiResponseHelper.paginated(
      c,
      formattedProjects,
      { page, limit, total, totalPages }
    );
  })
);

/**
 * POST /projects
 * Create a new project
 */
projectsRouter.post(
  '/',
  authMiddleware,
  validateBody(CreateProjectSchema),
  asyncHandler(async (c) => {
    const user = c.get('user');
    const { name, description, prompt } = c.get('validatedData');

    const project = await prisma.project.create({
      data: {
        name,
        description,
        prompt,
        userId: user.id,
      },
      include: {
        _count: {
          select: {
            screens: true,
            messages: true,
            generations: true,
          },
        },
      },
    });

    return ApiResponseHelper.success(c, {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      screensCount: project._count.screens,
      messagesCount: project._count.messages,
      generationsCount: project._count.generations,
    }, 'Project created successfully');
  })
);

/**
 * GET /projects/:id
 * Get a specific project with all details
 */
projectsRouter.get(
  '/:id',
  authMiddleware,
  validateParams(IdParamSchema),
  asyncHandler(async (c) => {
    const user = c.get('user');
    const { id } = c.get('validatedParams');

    const project = await prisma.project.findFirst({
      where: {
        id,
        userId: user.id, // Ensure user owns the project
      },
      include: {
        screens: {
          orderBy: {
            createdAt: 'asc',
          },
        },
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
        generations: {
          include: {
            steps: {
              orderBy: {
                order: 'asc',
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            screens: true,
            messages: true,
            generations: true,
          },
        },
      },
    });

    if (!project) {
      return ApiResponseHelper.notFound(c, 'Project not found');
    }

    return ApiResponseHelper.success(c, project);
  })
);

/**
 * PUT /projects/:id
 * Update a project
 */
projectsRouter.put(
  '/:id',
  authMiddleware,
  validateParams(IdParamSchema),
  validateBody(UpdateProjectSchema),
  asyncHandler(async (c) => {
    const user = c.get('user');
    const { id } = c.get('validatedParams');
    const updateData = c.get('validatedData');

    // Check if project exists and user owns it
    const existingProject = await prisma.project.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingProject) {
      return ApiResponseHelper.notFound(c, 'Project not found');
    }

    // Don't allow updating projects that are currently generating
    if (existingProject.status === 'GENERATING') {
      return ApiResponseHelper.conflict(c, 'Cannot update project while generation is in progress');
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: {
            screens: true,
            messages: true,
            generations: true,
          },
        },
      },
    });

    return ApiResponseHelper.success(c, {
      id: updatedProject.id,
      name: updatedProject.name,
      description: updatedProject.description,
      status: updatedProject.status,
      createdAt: updatedProject.createdAt,
      updatedAt: updatedProject.updatedAt,
      screensCount: updatedProject._count.screens,
      messagesCount: updatedProject._count.messages,
      generationsCount: updatedProject._count.generations,
    }, 'Project updated successfully');
  })
);

/**
 * DELETE /projects/:id
 * Delete a project
 */
projectsRouter.delete(
  '/:id',
  authMiddleware,
  validateParams(IdParamSchema),
  asyncHandler(async (c) => {
    const user = c.get('user');
    const { id } = c.get('validatedParams');

    // Check if project exists and user owns it
    const project = await prisma.project.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!project) {
      return ApiResponseHelper.notFound(c, 'Project not found');
    }

    // Don't allow deleting projects that are currently generating
    if (project.status === 'GENERATING') {
      return ApiResponseHelper.conflict(c, 'Cannot delete project while generation is in progress');
    }

    await prisma.project.delete({
      where: { id },
    });

    return ApiResponseHelper.success(c, null, 'Project deleted successfully');
  })
);

/**
 * GET /projects/:id/screens
 * Get project screens
 */
projectsRouter.get(
  '/:id/screens',
  authMiddleware,
  validateParams(IdParamSchema),
  asyncHandler(async (c) => {
    const user = c.get('user');
    const { id } = c.get('validatedParams');

    // Check if project exists and user owns it
    const project = await prisma.project.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!project) {
      return ApiResponseHelper.notFound(c, 'Project not found');
    }

    const screens = await prisma.screen.findMany({
      where: {
        projectId: id,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return ApiResponseHelper.success(c, screens);
  })
);

/**
 * GET /projects/:id/code
 * Get generated code for project
 */
projectsRouter.get(
  '/:id/code',
  authMiddleware,
  validateParams(IdParamSchema),
  asyncHandler(async (c) => {
    const user = c.get('user');
    const { id } = c.get('validatedParams');

    // Check if project exists and user owns it
    const project = await prisma.project.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        screens: {
          where: {
            metadata: {
              not: null,
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!project) {
      return ApiResponseHelper.notFound(c, 'Project not found');
    }

    // Extract code from screens metadata
    const codeFiles: any[] = [];
    
    project.screens.forEach(screen => {
      if (screen.metadata) {
        try {
          const metadata = JSON.parse(screen.metadata);
          if (metadata.code && metadata.files) {
            codeFiles.push({
              screenId: screen.id,
              screenName: screen.name,
              deviceType: screen.type,
              component: metadata.component,
              code: metadata.code,
              files: JSON.parse(metadata.files),
              responsive: metadata.responsive || false,
            });
          }
        } catch (error) {
          console.error('Failed to parse screen metadata:', error);
        }
      }
    });

    return ApiResponseHelper.success(c, {
      projectId: id,
      projectName: project.name,
      totalScreens: project.screens.length,
      codeFiles,
    });
  })
);

/**
 * GET /projects/:id/messages
 * Get project chat messages
 */
projectsRouter.get(
  '/:id/messages',
  authMiddleware,
  validateParams(IdParamSchema),
  asyncHandler(async (c) => {
    const user = c.get('user');
    const { id } = c.get('validatedParams');

    // Check if project exists and user owns it
    const project = await prisma.project.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!project) {
      return ApiResponseHelper.notFound(c, 'Project not found');
    }

    const messages = await prisma.chatMessage.findMany({
      where: {
        projectId: id,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return ApiResponseHelper.success(c, messages);
  })
);

/**
 * POST /projects/:id/messages
 * Add a chat message to project
 */
projectsRouter.post(
  '/:id/messages',
  authMiddleware,
  validateParams(IdParamSchema),
  validateBody(CreateProjectSchema.pick({ prompt: true }).extend({
    content: CreateProjectSchema.shape.prompt,
  }).omit({ prompt: true })),
  asyncHandler(async (c) => {
    const user = c.get('user');
    const { id } = c.get('validatedParams');
    const { content } = c.get('validatedData');

    // Check if project exists and user owns it
    const project = await prisma.project.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!project) {
      return ApiResponseHelper.notFound(c, 'Project not found');
    }

    // Create user message
    const userMessage = await prisma.chatMessage.create({
      data: {
        projectId: id,
        role: 'USER',
        content,
      },
    });

    // Generate AI response based on user message and project context
    let assistantMessage;
    
    try {
      // Get conversation history for context
      const recentMessages = await prisma.chatMessage.findMany({
        where: { projectId: id },
        orderBy: { createdAt: 'desc' },
        take: 10, // Last 10 messages for context
      });

      const conversationHistory = recentMessages
        .reverse() // Reverse to get chronological order
        .map(msg => `${msg.role}: ${msg.content}`);

      const aiResponse = await AIService.generateChatResponse(
        content,
        `Project: ${project.name}. Description: ${project.description || project.prompt}`,
        conversationHistory
      );

      assistantMessage = await prisma.chatMessage.create({
        data: {
          projectId: id,
          role: 'ASSISTANT',
          content: aiResponse,
        },
      });
    } catch (error) {
      console.error('AI chat response failed:', error);
      
      // Fallback response if AI fails
      assistantMessage = await prisma.chatMessage.create({
        data: {
          projectId: id,
          role: 'ASSISTANT',
          content: `Entendi! Vou implementar: "${content}". As mudanças aparecerão no preview em instantes!`,
        },
      });
    }

    return ApiResponseHelper.success(c, [userMessage, assistantMessage], 'Messages created successfully');
  })
);

/**
 * GET /projects/:id/preview
 * Get live preview code for project
 */
projectsRouter.get(
  '/:id/preview',
  authMiddleware,
  validateParams(IdParamSchema),
  asyncHandler(async (c) => {
    const user = c.get('user');
    const { id } = c.get('validatedParams');

    // Check if project exists and user owns it
    const project = await prisma.project.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        screens: {
          where: {
            metadata: {
              not: null,
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1, // Get latest screen
        },
      },
    });

    if (!project) {
      return ApiResponseHelper.notFound(c, 'Project not found');
    }

    // Get the latest generated component
    let previewCode = '';
    if (project.screens.length > 0 && project.screens[0].metadata) {
      try {
        const metadata = JSON.parse(project.screens[0].metadata);
        previewCode = metadata.code || '';
      } catch (error) {
        console.error('Failed to parse screen metadata:', error);
      }
    }

    // Fallback: generate a simple preview based on project prompt
    if (!previewCode) {
      const prompt = project.prompt || project.description || 'Aplicação personalizada';
      let componentType: 'login' | 'dashboard' | 'counter' | 'todolist' | 'generic' = 'generic';
      
      if (prompt.toLowerCase().includes('contador')) componentType = 'counter';
      else if (prompt.toLowerCase().includes('tarefa') || prompt.toLowerCase().includes('todo')) componentType = 'todolist';
      else if (prompt.toLowerCase().includes('dashboard')) componentType = 'dashboard';
      else if (prompt.toLowerCase().includes('login')) componentType = 'login';
      
      const { CodeGenerationService } = await import('../lib/code-generator');
      const template = await CodeGenerationService.generateComponent(
        'PreviewComponent',
        prompt,
        componentType
      );
      previewCode = template.code;
    }

    return ApiResponseHelper.success(c, {
      projectId: id,
      projectName: project.name,
      code: previewCode,
    });
  })
);

export default projectsRouter;