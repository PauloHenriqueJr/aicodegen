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
app.use("/*", cors({
  origin: ["http://localhost:3001", "http://localhost:3002", process.env.CORS_ORIGIN].filter((origin): origin is string => Boolean(origin)),
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
  return ApiResponseHelper.internalError(c, "Internal server error");
});

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

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