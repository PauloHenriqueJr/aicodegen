# AICodeGen API Documentation

Base URL: `http://localhost:3000/api`

## Authentication

All protected endpoints require authentication via one of these methods:
- **Authorization Header**: `Authorization: Bearer <session-token>`
- **Custom Header**: `X-Session-Token: <session-token>`

## Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message",
  "error": "Error message (only when success=false)"
}
```

Paginated responses include additional pagination metadata:

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user account.

**Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "John Doe",
      "plan": "FREE",
      "credits": 50,
      "maxCredits": 50
    },
    "session": {
      "token": "session_token",
      "expiresAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### POST /auth/login
Authenticate user and create session.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:** Same as registration.

#### POST /auth/logout
**Auth Required:** Yes

Invalidate current session.

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

#### GET /auth/me
**Auth Required:** Yes

Get current user information.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": "https://...",
    "plan": "FREE",
    "credits": 45,
    "maxCredits": 50,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "recentProjects": [...],
    "totalProjects": 5
  }
}
```

#### PUT /auth/me
**Auth Required:** Yes

Update user information.

**Body:**
```json
{
  "name": "John Smith",
  "avatar": "https://example.com/avatar.jpg"
}
```

#### GET /auth/credits
**Auth Required:** Yes

Get user credit information.

**Response:**
```json
{
  "success": true,
  "data": {
    "credits": 45,
    "maxCredits": 50,
    "usagePercentage": 90,
    "isLowCredits": true,
    "plan": "FREE",
    "canUpgrade": true
  }
}
```

### Projects

#### GET /projects
**Auth Required:** Yes

Get user's projects with pagination and filters.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `status` (optional): Filter by status (`DRAFT`, `GENERATING`, `COMPLETED`, `ERROR`)
- `search` (optional): Search in name and description

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "project_id",
      "name": "My E-commerce App",
      "description": "A modern e-commerce platform",
      "status": "COMPLETED",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "screensCount": 5,
      "messagesCount": 10,
      "generationsCount": 2,
      "latestGeneration": {
        "id": "gen_id",
        "status": "COMPLETED",
        "progress": 100,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

#### POST /projects
**Auth Required:** Yes

Create a new project.

**Body:**
```json
{
  "name": "My New App",
  "description": "Description of the app",
  "prompt": "Create a modern e-commerce platform with user authentication"
}
```

#### GET /projects/:id
**Auth Required:** Yes

Get a specific project with all details including screens, messages, and generations.

#### PUT /projects/:id
**Auth Required:** Yes

Update a project (cannot update projects that are currently generating).

**Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "prompt": "Updated prompt"
}
```

#### DELETE /projects/:id
**Auth Required:** Yes

Delete a project (cannot delete projects that are currently generating).

#### GET /projects/:id/screens
**Auth Required:** Yes

Get all screens for a project.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "screen_id",
      "name": "Login Page",
      "type": "DESKTOP",
      "width": 1440,
      "height": 900,
      "x": 100,
      "y": 100,
      "imageUrl": "https://...",
      "route": "login",
      "component": "LoginDesktop",
      "isGenerated": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### GET /projects/:id/messages
**Auth Required:** Yes

Get chat messages for a project.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "message_id",
      "role": "USER",
      "content": "Add a shopping cart feature",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "message_id_2",
      "role": "ASSISTANT",
      "content": "I'll add a shopping cart feature to your app...",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### POST /projects/:id/messages
**Auth Required:** Yes

Add a chat message to a project.

**Body:**
```json
{
  "content": "Add a dark mode toggle to the settings page"
}
```

### Generation

#### POST /generation/start
**Auth Required:** Yes
**Credits Required:** 5

Start AI generation for a project.

**Body:**
```json
{
  "projectId": "project_id",
  "prompt": "Optional additional prompt"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "generationId": "generation_id",
    "status": "RUNNING",
    "totalSteps": 7,
    "steps": [
      {
        "id": "step_id",
        "name": "Configuração inicial",
        "description": "Criando estrutura do projeto React + TypeScript",
        "type": "SETUP",
        "status": "PENDING",
        "progress": 0,
        "order": 1
      }
    ]
  }
}
```

#### GET /generation/:id
**Auth Required:** Yes

Get generation status and details.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "generation_id",
    "status": "RUNNING",
    "progress": 60,
    "currentStep": "Dashboard Principal",
    "totalSteps": 7,
    "startedAt": "2024-01-01T00:00:00.000Z",
    "steps": [
      {
        "id": "step_id",
        "name": "Configuração inicial",
        "description": "Criando estrutura do projeto React + TypeScript",
        "type": "SETUP",
        "status": "COMPLETED",
        "progress": 100,
        "order": 1,
        "startedAt": "2024-01-01T00:00:00.000Z",
        "completedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "project": {
      "id": "project_id",
      "name": "My Project"
    }
  }
}
```

#### POST /generation/:id/cancel
**Auth Required:** Yes

Cancel an active generation (partial credit refund).

**Response:**
```json
{
  "success": true,
  "message": "Generation cancelled successfully"
}
```

## Error Codes

- `200` - Success
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions/credits)
- `404` - Not Found
- `409` - Conflict (resource already exists or invalid state)
- `422` - Unprocessable Entity (validation failed)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Rate Limiting

Authentication endpoints are rate limited to 5 requests per 15 minutes per IP/user.

## Credits System

- **Free Plan**: 50 credits, max 50 credits
- **Pro Plan**: 500 credits, max 500 credits
- **Enterprise Plan**: Unlimited credits

### Credit Costs:
- **Project Generation**: 5 credits
- **Additional Messages**: 1 credit (future)
- **Premium Features**: Variable (future)

## WebSocket Support

Real-time updates for generation progress will be available via WebSocket connection (future implementation):

```
ws://localhost:3000/ws?token=<session-token>
```

Message types:
- `generation_update` - Generation progress updates
- `screen_created` - New screen added to canvas
- `step_completed` - Generation step completed
- `generation_completed` - Full generation completed
- `error` - Error occurred