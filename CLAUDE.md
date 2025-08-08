# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development
- `npm run dev` - Starts all applications (web on port 3001, server on port 3000)
- `npm run dev:web` - Start only the frontend application
- `npm run dev:server` - Start only the backend server
- `npm run build` - Build all applications
- `npm run check-types` - Check TypeScript types across all apps

### Database (Prisma)
- `npm run db:push` - Push schema changes to PostgreSQL database
- `npm run db:studio` - Open Prisma Studio for database management
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations

### Individual App Commands
Navigate to `apps/web` or `apps/server` directories to run app-specific commands:
- Web: `npm run dev`, `npm run build`, `npm run check-types`
- Server: `npm run dev`, `npm run build`, `npm run check-types`, database commands

## Architecture Overview

This is a TypeScript monorepo using Turborepo with two main applications:

### Frontend (`apps/web`)
- **Framework**: React 19 with TanStack Router for file-based routing
- **Styling**: TailwindCSS v4 with shadcn/ui components
- **State Management**: TanStack Query for server state
- **Forms**: TanStack React Form with Zod validation
- **Dev Server**: Vite on port 3001
- **Build Tool**: Vite with TypeScript compilation
- **Animations**: Framer Motion for smooth transitions
- **Theme**: next-themes for dark/light mode support

### Backend (`apps/server`)
- **Framework**: Hono.js lightweight server framework
- **Runtime**: Node.js with `tsx` for development
- **Database**: PostgreSQL with Prisma ORM
- **Port**: 3000
- **Build**: tsdown for production builds

### Key Architectural Patterns
- **Monorepo**: Uses Turborepo for efficient builds and task orchestration
- **Type Safety**: Full TypeScript coverage across frontend and backend
- **File-Based Routing**: TanStack Router generates routes from file structure in `apps/web/src/routes/`
- **Component Organization**: UI components in `apps/web/src/components/ui/` using shadcn/ui patterns
- **Database Schema**: Prisma schema located in `apps/server/prisma/schema/schema.prisma`

## Application Features

### Dashboard System
- **Main Layout**: Sidebar + Header + Content Area with tab-based navigation
- **Responsive Design**: Adaptive layout for different screen sizes
- **Dark/Light Mode**: Complete theming system with automatic persistence
- **Real-time Generation**: Live progress tracking and UI updates during AI generation

### Core Components

#### Sidebar (`apps/web/src/components/sidebar.tsx`)
- **User Profile Section**: Avatar, name, email with settings access
- **Project Management**: Editable project names with real-time updates
- **Credit System**: Visual credit tracking with usage indicators and upgrade prompts
- **Progress Tracking**: Real-time generation progress with step-by-step updates
- **Recent Projects**: Quick access to previously generated projects
- **Chat Interface**: Interactive chat with AI for project modifications
- **Functional Features**: Settings modal, logout, file upload, audio recording (placeholder)

#### Canvas System (`apps/web/src/components/canvas-pane.tsx`)
- **Figma-like Interface**: Infinite canvas with pan/zoom functionality
- **Real-time Screen Generation**: Screens appear dynamically as AI creates code
- **Multi-device Support**: Desktop, tablet, and mobile screen previews
- **Interactive Controls**: Zoom controls, device filters, screen actions
- **Screen Management**: Generated screens with metadata (routes, components, device types)
- **Visual States**: Loading states, generation progress, completion indicators

#### Preview System (`apps/web/src/components/preview-pane.tsx`)
- **Device Simulation**: Desktop, tablet, and mobile preview modes
- **Optimized Dimensions**: Maximized screen usage with responsive scaling
- **Live Preview**: Real-time application preview in iframe
- **Interactive Controls**: Device switching, zoom controls, external link access

#### Code Editor (`apps/web/src/components/code-editor.tsx`)
- **Syntax Highlighting**: Full TypeScript/React code display
- **Export Functionality**: Download generated code as files
- **Copy Actions**: Quick code copying with syntax preservation

### AI Generation System

#### Mock Generation Hook (`apps/web/src/hooks/useAIGeneration.ts`)
- **Generation Steps**: Simulates realistic AI code generation process
- **Step Types**: Differentiates between code generation and screen creation steps
- **Progress Tracking**: Real-time progress updates with completion status
- **Screen Coordination**: Automatic positioning of generated screens in canvas
- **Callback System**: Extensible hooks for real AI integration
- **Generation Plan**: Dynamic step creation based on project requirements

#### Generation Process Flow
1. **Project Analysis**: Parse user prompt to create generation plan
2. **Code Steps**: Simulate component creation, routing, state management
3. **Screen Steps**: Generate visual representations of created pages
4. **Canvas Updates**: Real-time screen appearance in Figma-like canvas
5. **Progress Tracking**: Visual progress bars and step completion
6. **Final Integration**: Complete project structure with all screens and code

### UI Component System

#### Custom Components
- **Dialog System** (`apps/web/src/components/ui/dialog.tsx`): Modal system with animations
- **Settings Dialog** (`apps/web/src/components/settings-dialog.tsx`): User preferences and profile management
- **Progress Tracker** (`apps/web/src/components/progress-tracker.tsx`): Generation progress visualization
- **Tabs System** (`apps/web/src/components/ui/tabs.tsx`): Navigation between Preview/Code/Canvas
- **Progress Bar** (`apps/web/src/components/ui/progress.tsx`): Credit usage and generation progress

#### Theme System
- **Provider**: ThemeProvider using next-themes for persistence
- **Dark Mode**: Complete dark theme coverage across all components
- **Theme Toggle**: Functional theme switching with system preference detection
- **Consistent Styling**: Dark variants for all UI elements including borders, backgrounds, text

### Functional Features

#### Export System
- **Project Export**: Complete project data export as JSON
- **Code Export**: Individual file downloads with proper structure
- **Figma Integration**: Screen export capabilities (placeholder for real Figma API)

#### Settings System
- **User Profile**: Editable name, email, avatar management
- **Theme Preferences**: Light, dark, system theme selection
- **Plan Management**: Credit usage display, upgrade options
- **Persistent Storage**: Settings saved to localStorage

#### Interactive Elements
- **File Upload**: Drag-and-drop file upload with image preview
- **Audio Recording**: Voice input placeholder for future implementation  
- **Chat System**: Interactive AI conversation with message history
- **Real-time Updates**: Live project name editing, credit tracking

## Database Setup

Requires PostgreSQL database. Environment configuration goes in `apps/server/.env` with `DATABASE_URL` connection string.

## Project Structure
```
aicodegen/
├── apps/
│   ├── web/                     # React frontend with TanStack Router
│   │   ├── src/
│   │   │   ├── components/      # Reusable components
│   │   │   │   ├── ui/         # Base UI components (shadcn/ui)
│   │   │   │   ├── sidebar.tsx # Main sidebar with chat and user features
│   │   │   │   ├── canvas-pane.tsx # Figma-like canvas for screens
│   │   │   │   ├── preview-pane.tsx # Device preview system
│   │   │   │   ├── code-editor.tsx # Code display and export
│   │   │   │   └── settings-dialog.tsx # User settings modal
│   │   │   ├── hooks/           # Custom React hooks
│   │   │   │   └── useAIGeneration.ts # AI generation simulation
│   │   │   ├── routes/          # File-based routing
│   │   │   │   ├── __root.tsx   # Root layout with theme provider
│   │   │   │   ├── index.tsx    # Landing page
│   │   │   │   ├── login.tsx    # Authentication
│   │   │   │   ├── chat.tsx     # Initial chat interface
│   │   │   │   └── dashboard.tsx # Main application dashboard
│   │   │   ├── lib/             # Utilities and context
│   │   │   ├── types/           # TypeScript type definitions
│   │   │   └── index.css        # Global styles with Tailwind
│   └── server/                  # Hono.js backend with Prisma
├── turbo.json                   # Turborepo configuration
└── package.json                 # Root workspace configuration
```

## Development Notes
- Uses npm workspaces for package management
- TanStack Router auto-generates route tree from file structure
- Prisma client generates to `apps/server/generated/` directory
- CORS configured for development between frontend (3001) and backend (3000)
- Framer Motion used for all animations and transitions
- Complete TypeScript coverage with strict type checking
- Dark mode implementation using CSS custom properties and Tailwind variants

## Implementation Status

### ✅ Completed Features
- Complete UI/UX design system with dark mode
- Functional sidebar with user management
- Figma-like canvas with AI screen generation
- Device-responsive preview system
- Settings management with persistence
- Export functionality for projects and code
- Mock AI generation system ready for real integration
- Interactive chat interface with message history
- Real-time progress tracking and visual feedback

### 🔄 Ready for Integration
- AI Generation Hook prepared for real AI API
- Screen generation system ready for actual code creation
- Canvas positioning system for dynamic screen placement
- Progress tracking hooks for real generation steps
- Export system extensible for multiple formats

### 📋 Future Enhancements
- Real AI integration with code generation
- Figma API integration for actual design export
- Audio recording implementation for voice prompts
- Enhanced file upload with multiple formats
- Real-time collaboration features
- Advanced project management and version control