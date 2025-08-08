import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serve } from "@hono/node-server";

// Import routes
import authRouter from "./routes/auth";
import projectsRouter from "./routes/projects";
import generationRouter from "./routes/generation";

// Import utilities
import { ApiResponseHelper } from "./lib/response";

const app = new Hono();

// Middleware
app.use(logger());
// Support multiple origins via env (comma-separated) and include GitHub Pages site
const envOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);
const defaultOrigins = [
  "http://localhost:3001",
  "http://localhost:3002", 
  "http://localhost:4173", // Vite preview
  "http://127.0.0.1:3001",
  "http://127.0.0.1:3002",
  "http://127.0.0.1:4173",
  // GitHub Pages for this repo
  "https://paulohenriquejr.github.io",
];
const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]));

app.use("/*", cors({
  origin: (origin: string) => {
    if (!origin) return null; // disallow null origins
    console.log(`CORS check for origin: ${origin}`);
    try {
      const u = new URL(origin);
      const base = `${u.protocol}//${u.host}`;
      
      // Check exact match for GitHub Pages subpaths
      if (origin.startsWith('https://paulohenriquejr.github.io')) {
        console.log(`GitHub Pages origin allowed: ${origin}`);
        return origin;
      }
      
      // Check other allowed origins
      const allowed = allowedOrigins.includes(base);
      console.log(`Origin ${origin} allowed: ${allowed}`);
      return allowed ? origin : null;
    } catch (error) {
      console.log(`Invalid origin format: ${origin}`, error);
      return null;
    }
  },
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization", "X-Session-Token"],
  credentials: true,
}));

// Health check
app.get("/", (c) => {
  return ApiResponseHelper.success(c, {
    service: "AICodeGen API",
    version: "1.0.0",
    status: "healthy",
    timestamp: new Date().toISOString(),
  }, "Service is running");
});

app.get("/health", (c) => {
  return ApiResponseHelper.success(c, {
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.route("/api/auth", authRouter);
app.route("/api/projects", projectsRouter);
app.route("/api/generation", generationRouter);

// 404 handler
app.notFound((c) => {
  return ApiResponseHelper.notFound(c, "API endpoint not found");
});

// Error handler
app.onError((err, c) => {
  console.error("Server Error:", err);
  console.error("Error stack:", err.stack);
  console.error("Error details:", {
    message: err.message,
    name: err.name,
    cause: err.cause
  });
  return ApiResponseHelper.internalError(c, "Internal server error");
});

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Para Vercel (serverless)
export default app;

// Para desenvolvimento local (Node.js server)
if (process.env.NODE_ENV !== 'production') {
  serve({
    fetch: app.fetch,
    port,
  }, (info) => {
    console.log(`🚀 AICodeGen API Server is running on http://localhost:${info.port}`);
    console.log(`📚 Health check: http://localhost:${info.port}/health`);
    console.log(`🔑 Auth endpoints: http://localhost:${info.port}/api/auth/*`);
    console.log(`📁 Projects endpoints: http://localhost:${info.port}/api/projects/*`);
    console.log(`⚡ Generation endpoints: http://localhost:${info.port}/api/generation/*`);
  });
}