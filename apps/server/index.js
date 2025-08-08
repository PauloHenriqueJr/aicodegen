import { CodeGenerationService } from "./code-generator-CWEb2haJ.js";
import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serve } from "@hono/node-server";
import { OAuth2Client } from "google-auth-library";
import { createHash, randomBytes } from "crypto";
import * as process$1 from "node:process";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import * as runtime from "@prisma/client/runtime/library";
import { z } from "zod";

//#region prisma/generated/enums.ts
/**
* This file exports all enum related types from the schema.
*
* 🟢 You can import this file directly.
*/
const Plan$1 = {
	FREE: "FREE",
	PRO: "PRO",
	ENTERPRISE: "ENTERPRISE"
};
const ProjectStatus$1 = {
	DRAFT: "DRAFT",
	GENERATING: "GENERATING",
	COMPLETED: "COMPLETED",
	ERROR: "ERROR"
};
const GenerationStatus$1 = {
	PENDING: "PENDING",
	RUNNING: "RUNNING",
	COMPLETED: "COMPLETED",
	FAILED: "FAILED",
	CANCELLED: "CANCELLED"
};
const StepStatus$1 = {
	PENDING: "PENDING",
	RUNNING: "RUNNING",
	COMPLETED: "COMPLETED",
	FAILED: "FAILED",
	SKIPPED: "SKIPPED"
};
const StepType$1 = {
	CODE: "CODE",
	SCREEN: "SCREEN",
	SETUP: "SETUP",
	OPTIMIZATION: "OPTIMIZATION"
};
const DeviceType$1 = {
	DESKTOP: "DESKTOP",
	TABLET: "TABLET",
	MOBILE: "MOBILE"
};
const MessageRole$1 = {
	USER: "USER",
	ASSISTANT: "ASSISTANT",
	SYSTEM: "SYSTEM"
};

//#endregion
//#region prisma/generated/internal/class.ts
const config = {
	"generator": {
		"name": "client",
		"provider": {
			"fromEnvVar": null,
			"value": "prisma-client"
		},
		"output": {
			"value": "C:\\Users\\pauli\\Downloads\\aicodegen\\apps\\server\\prisma\\generated",
			"fromEnvVar": null
		},
		"config": {
			"moduleFormat": "esm",
			"engineType": "library"
		},
		"binaryTargets": [{
			"fromEnvVar": null,
			"value": "windows",
			"native": true
		}],
		"previewFeatures": [],
		"sourceFilePath": "C:\\Users\\pauli\\Downloads\\aicodegen\\apps\\server\\prisma\\schema\\schema.prisma",
		"isCustomOutput": true
	},
	"relativePath": "../schema",
	"clientVersion": "6.13.0",
	"engineVersion": "361e86d0ea4987e9f53a565309b3eed797a6bcbd",
	"datasourceNames": ["db"],
	"activeProvider": "postgresql",
	"inlineDatasources": { "db": { "url": {
		"fromEnvVar": "DATABASE_URL",
		"value": null
	} } },
	"inlineSchema": "generator client {\n  provider     = \"prisma-client\"\n  output       = \"../generated\"\n  moduleFormat = \"esm\"\n}\n\ndatasource db {\n  provider = \"postgres\"\n  url      = env(\"DATABASE_URL\")\n}\n\nmodel User {\n  id         String   @id @default(cuid())\n  email      String   @unique\n  name       String\n  avatar     String?\n  googleId   String?  @unique\n  plan       Plan     @default(FREE)\n  credits    Int      @default(50)\n  maxCredits Int      @default(50)\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  // Relations\n  projects Project[]\n  sessions Session[]\n\n  @@map(\"users\")\n}\n\nmodel Session {\n  id        String   @id @default(cuid())\n  userId    String\n  token     String   @unique\n  expiresAt DateTime\n  createdAt DateTime @default(now())\n\n  // Relations\n  user User @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@map(\"sessions\")\n}\n\nmodel Project {\n  id          String        @id @default(cuid())\n  name        String\n  description String?\n  prompt      String        @db.Text\n  status      ProjectStatus @default(DRAFT)\n  userId      String\n  createdAt   DateTime      @default(now())\n  updatedAt   DateTime      @updatedAt\n\n  // Relations\n  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)\n  generations Generation[]\n  screens     Screen[]\n  messages    ChatMessage[]\n\n  @@map(\"projects\")\n}\n\nmodel Generation {\n  id          String           @id @default(cuid())\n  projectId   String\n  status      GenerationStatus @default(PENDING)\n  progress    Int              @default(0)\n  currentStep String?\n  totalSteps  Int              @default(0)\n  startedAt   DateTime?\n  completedAt DateTime?\n  errorMsg    String?          @db.Text\n  createdAt   DateTime         @default(now())\n  updatedAt   DateTime         @updatedAt\n\n  // Relations\n  project Project          @relation(fields: [projectId], references: [id], onDelete: Cascade)\n  steps   GenerationStep[]\n\n  @@map(\"generations\")\n}\n\nmodel GenerationStep {\n  id           String     @id @default(cuid())\n  generationId String\n  name         String\n  description  String     @db.Text\n  type         StepType\n  status       StepStatus @default(PENDING)\n  progress     Int        @default(0)\n  order        Int\n  startedAt    DateTime?\n  completedAt  DateTime?\n  errorMsg     String?    @db.Text\n  createdAt    DateTime   @default(now())\n  updatedAt    DateTime   @updatedAt\n\n  // Relations\n  generation Generation @relation(fields: [generationId], references: [id], onDelete: Cascade)\n\n  @@map(\"generation_steps\")\n}\n\nmodel Screen {\n  id          String     @id @default(cuid())\n  projectId   String\n  name        String\n  type        DeviceType\n  width       Int\n  height      Int\n  x           Float\n  y           Float\n  imageUrl    String?\n  route       String?\n  component   String?\n  isGenerated Boolean    @default(false)\n  metadata    String?    @db.Text // Stores JSON with code, files, etc.\n  createdAt   DateTime   @default(now())\n  updatedAt   DateTime   @updatedAt\n\n  // Relations\n  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)\n\n  @@map(\"screens\")\n}\n\nmodel ChatMessage {\n  id        String      @id @default(cuid())\n  projectId String\n  role      MessageRole\n  content   String      @db.Text\n  createdAt DateTime    @default(now())\n\n  // Relations\n  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)\n\n  @@map(\"chat_messages\")\n}\n\n// Enums\nenum Plan {\n  FREE\n  PRO\n  ENTERPRISE\n}\n\nenum ProjectStatus {\n  DRAFT\n  GENERATING\n  COMPLETED\n  ERROR\n}\n\nenum GenerationStatus {\n  PENDING\n  RUNNING\n  COMPLETED\n  FAILED\n  CANCELLED\n}\n\nenum StepStatus {\n  PENDING\n  RUNNING\n  COMPLETED\n  FAILED\n  SKIPPED\n}\n\nenum StepType {\n  CODE\n  SCREEN\n  SETUP\n  OPTIMIZATION\n}\n\nenum DeviceType {\n  DESKTOP\n  TABLET\n  MOBILE\n}\n\nenum MessageRole {\n  USER\n  ASSISTANT\n  SYSTEM\n}\n",
	"inlineSchemaHash": "a76b71d066ea68a29ec1b3f8148cd2139f500e48b9197d584c187be51a72d190",
	"copyEngine": true,
	"runtimeDataModel": {
		"models": {},
		"enums": {},
		"types": {}
	},
	"dirname": ""
};
config.runtimeDataModel = JSON.parse("{\"models\":{\"User\":{\"dbName\":\"users\",\"schema\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"nativeType\":null,\"default\":{\"name\":\"cuid\",\"args\":[1]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"email\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"avatar\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"googleId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"plan\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Plan\",\"nativeType\":null,\"default\":\"FREE\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"credits\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"nativeType\":null,\"default\":50,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"maxCredits\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"nativeType\":null,\"default\":50,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"nativeType\":null,\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"projects\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Project\",\"nativeType\":null,\"relationName\":\"ProjectToUser\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sessions\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Session\",\"nativeType\":null,\"relationName\":\"SessionToUser\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Session\":{\"dbName\":\"sessions\",\"schema\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"nativeType\":null,\"default\":{\"name\":\"cuid\",\"args\":[1]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"token\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"expiresAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"nativeType\":null,\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"nativeType\":null,\"relationName\":\"SessionToUser\",\"relationFromFields\":[\"userId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Project\":{\"dbName\":\"projects\",\"schema\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"nativeType\":null,\"default\":{\"name\":\"cuid\",\"args\":[1]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"description\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"prompt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"Text\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"ProjectStatus\",\"nativeType\":null,\"default\":\"DRAFT\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"nativeType\":null,\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"user\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"nativeType\":null,\"relationName\":\"ProjectToUser\",\"relationFromFields\":[\"userId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"generations\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Generation\",\"nativeType\":null,\"relationName\":\"GenerationToProject\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"screens\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Screen\",\"nativeType\":null,\"relationName\":\"ProjectToScreen\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"messages\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ChatMessage\",\"nativeType\":null,\"relationName\":\"ChatMessageToProject\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Generation\":{\"dbName\":\"generations\",\"schema\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"nativeType\":null,\"default\":{\"name\":\"cuid\",\"args\":[1]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"projectId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"GenerationStatus\",\"nativeType\":null,\"default\":\"PENDING\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"progress\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"nativeType\":null,\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"currentStep\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"totalSteps\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"nativeType\":null,\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"startedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"completedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"errorMsg\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"Text\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"nativeType\":null,\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"project\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Project\",\"nativeType\":null,\"relationName\":\"GenerationToProject\",\"relationFromFields\":[\"projectId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"steps\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"GenerationStep\",\"nativeType\":null,\"relationName\":\"GenerationToGenerationStep\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"GenerationStep\":{\"dbName\":\"generation_steps\",\"schema\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"nativeType\":null,\"default\":{\"name\":\"cuid\",\"args\":[1]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"generationId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"description\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"Text\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"StepType\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"StepStatus\",\"nativeType\":null,\"default\":\"PENDING\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"progress\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"nativeType\":null,\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"order\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"startedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"completedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"errorMsg\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"Text\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"nativeType\":null,\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"generation\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Generation\",\"nativeType\":null,\"relationName\":\"GenerationToGenerationStep\",\"relationFromFields\":[\"generationId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Screen\":{\"dbName\":\"screens\",\"schema\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"nativeType\":null,\"default\":{\"name\":\"cuid\",\"args\":[1]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"projectId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DeviceType\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"width\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"height\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"x\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"y\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"imageUrl\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"route\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"component\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isGenerated\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"nativeType\":null,\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"metadata\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"Text\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"nativeType\":null,\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"project\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Project\",\"nativeType\":null,\"relationName\":\"ProjectToScreen\",\"relationFromFields\":[\"projectId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"ChatMessage\":{\"dbName\":\"chat_messages\",\"schema\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"nativeType\":null,\"default\":{\"name\":\"cuid\",\"args\":[1]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"projectId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"role\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"MessageRole\",\"nativeType\":null,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"content\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"nativeType\":[\"Text\",[]],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"nativeType\":null,\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"project\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Project\",\"nativeType\":null,\"relationName\":\"ChatMessageToProject\",\"relationFromFields\":[\"projectId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false}},\"enums\":{\"Plan\":{\"values\":[{\"name\":\"FREE\",\"dbName\":null},{\"name\":\"PRO\",\"dbName\":null},{\"name\":\"ENTERPRISE\",\"dbName\":null}],\"dbName\":null},\"ProjectStatus\":{\"values\":[{\"name\":\"DRAFT\",\"dbName\":null},{\"name\":\"GENERATING\",\"dbName\":null},{\"name\":\"COMPLETED\",\"dbName\":null},{\"name\":\"ERROR\",\"dbName\":null}],\"dbName\":null},\"GenerationStatus\":{\"values\":[{\"name\":\"PENDING\",\"dbName\":null},{\"name\":\"RUNNING\",\"dbName\":null},{\"name\":\"COMPLETED\",\"dbName\":null},{\"name\":\"FAILED\",\"dbName\":null},{\"name\":\"CANCELLED\",\"dbName\":null}],\"dbName\":null},\"StepStatus\":{\"values\":[{\"name\":\"PENDING\",\"dbName\":null},{\"name\":\"RUNNING\",\"dbName\":null},{\"name\":\"COMPLETED\",\"dbName\":null},{\"name\":\"FAILED\",\"dbName\":null},{\"name\":\"SKIPPED\",\"dbName\":null}],\"dbName\":null},\"StepType\":{\"values\":[{\"name\":\"CODE\",\"dbName\":null},{\"name\":\"SCREEN\",\"dbName\":null},{\"name\":\"SETUP\",\"dbName\":null},{\"name\":\"OPTIMIZATION\",\"dbName\":null}],\"dbName\":null},\"DeviceType\":{\"values\":[{\"name\":\"DESKTOP\",\"dbName\":null},{\"name\":\"TABLET\",\"dbName\":null},{\"name\":\"MOBILE\",\"dbName\":null}],\"dbName\":null},\"MessageRole\":{\"values\":[{\"name\":\"USER\",\"dbName\":null},{\"name\":\"ASSISTANT\",\"dbName\":null},{\"name\":\"SYSTEM\",\"dbName\":null}],\"dbName\":null}},\"types\":{}}");
config.engineWasm = void 0;
config.compilerWasm = void 0;
function getPrismaClientClass(dirname) {
	config.dirname = dirname;
	return runtime.getPrismaClient(config);
}

//#endregion
//#region prisma/generated/internal/prismaNamespace.ts
/**
* Validator
*/
const validator = runtime.Public.validator;
/**
* Prisma Errors
*/
const PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError;
const PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError;
const PrismaClientRustPanicError = runtime.PrismaClientRustPanicError;
const PrismaClientInitializationError = runtime.PrismaClientInitializationError;
const PrismaClientValidationError = runtime.PrismaClientValidationError;
/**
* Re-export of sql-template-tag
*/
const sql = runtime.sqltag;
const empty = runtime.empty;
const join = runtime.join;
const raw = runtime.raw;
const Sql = runtime.Sql;
/**
* Decimal.js
*/
const Decimal = runtime.Decimal;
const getExtensionContext = runtime.Extensions.getExtensionContext;
const NullTypes = {
	DbNull: runtime.objectEnumValues.classes.DbNull,
	JsonNull: runtime.objectEnumValues.classes.JsonNull,
	AnyNull: runtime.objectEnumValues.classes.AnyNull
};
/**
* Helper for filtering JSON entries that have `null` on the database (empty on the db)
*
* @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
*/
const DbNull = runtime.objectEnumValues.instances.DbNull;
/**
* Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
*
* @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
*/
const JsonNull = runtime.objectEnumValues.instances.JsonNull;
/**
* Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
*
* @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
*/
const AnyNull = runtime.objectEnumValues.instances.AnyNull;
/**
* Enums
*/
const TransactionIsolationLevel = runtime.makeStrictEnum({
	ReadUncommitted: "ReadUncommitted",
	ReadCommitted: "ReadCommitted",
	RepeatableRead: "RepeatableRead",
	Serializable: "Serializable"
});
const defineExtension = runtime.Extensions.defineExtension;

//#endregion
//#region prisma/generated/client.ts
const __dirname = path.dirname(fileURLToPath(import.meta.url));
/**
* ## Prisma Client
* 
* Type-safe database client for TypeScript
* @example
* ```
* const prisma = new PrismaClient()
* // Fetch zero or more Users
* const users = await prisma.user.findMany()
* ```
* 
* Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
*/
const PrismaClient = getPrismaClientClass(__dirname);
path.join(__dirname, "query_engine-windows.dll.node");
path.join(process$1.cwd(), "prisma/generated/query_engine-windows.dll.node");
const Plan = Plan$1;
const ProjectStatus = ProjectStatus$1;
const GenerationStatus = GenerationStatus$1;
const StepStatus = StepStatus$1;
const StepType = StepType$1;
const DeviceType = DeviceType$1;
const MessageRole = MessageRole$1;

//#endregion
//#region prisma/index.ts
const prisma = new PrismaClient();
var prisma_default = prisma;

//#endregion
//#region src/lib/auth.ts
var AuthService = class AuthService {
	/**
	* Hash password with salt
	*/
	static hashPassword(password, salt) {
		const actualSalt = salt || randomBytes(32).toString("hex");
		const hash = createHash("sha256").update(password + actualSalt).digest("hex");
		return {
			hash,
			salt: actualSalt
		};
	}
	/**
	* Verify password against hash
	*/
	static verifyPassword(password, hash, salt) {
		const { hash: testHash } = AuthService.hashPassword(password, salt);
		return testHash === hash;
	}
	/**
	* Generate session token
	*/
	static generateSessionToken() {
		return randomBytes(64).toString("hex");
	}
	/**
	* Create session for user
	*/
	static async createSession(userId) {
		const token = AuthService.generateSessionToken();
		const expiresAt = /* @__PURE__ */ new Date();
		expiresAt.setDate(expiresAt.getDate() + 30);
		await prisma_default.session.create({ data: {
			userId,
			token,
			expiresAt
		} });
		return {
			token,
			expiresAt
		};
	}
	/**
	* Get user from session token
	*/
	static async getUserFromSession(token) {
		const session = await prisma_default.session.findUnique({
			where: { token },
			include: { user: true }
		});
		if (!session || session.expiresAt < /* @__PURE__ */ new Date()) {
			if (session) await prisma_default.session.delete({ where: { id: session.id } });
			return null;
		}
		return {
			id: session.user.id,
			email: session.user.email,
			name: session.user.name,
			plan: session.user.plan
		};
	}
	/**
	* Invalidate session
	*/
	static async invalidateSession(token) {
		await prisma_default.session.deleteMany({ where: { token } });
	}
	/**
	* Clean up expired sessions
	*/
	static async cleanupExpiredSessions() {
		await prisma_default.session.deleteMany({ where: { expiresAt: { lt: /* @__PURE__ */ new Date() } } });
	}
	/**
	* Get user by email
	*/
	static async getUserByEmail(email) {
		return await prisma_default.user.findUnique({ where: { email } });
	}
	/**
	* Create new user
	*/
	static async createUser(email, name, password) {
		const { hash, salt } = AuthService.hashPassword(password);
		return await prisma_default.user.create({ data: {
			email,
			name
		} });
	}
	/**
	* Check if user has sufficient credits
	*/
	static async checkCredits(userId, requiredCredits = 1) {
		const user = await prisma_default.user.findUnique({
			where: { id: userId },
			select: { credits: true }
		});
		return user ? user.credits >= requiredCredits : false;
	}
	/**
	* Deduct credits from user
	*/
	static async deductCredits(userId, amount = 1) {
		try {
			await prisma_default.user.update({
				where: {
					id: userId,
					credits: { gte: amount }
				},
				data: { credits: { decrement: amount } }
			});
			return true;
		} catch (error) {
			return false;
		}
	}
	/**
	* Add credits to user (for upgrades, admin, etc.)
	*/
	static async addCredits(userId, amount) {
		await prisma_default.user.update({
			where: { id: userId },
			data: { credits: { increment: amount } }
		});
	}
};
setInterval(() => {
	AuthService.cleanupExpiredSessions().catch(console.error);
}, 1e3 * 60 * 60);

//#endregion
//#region src/lib/response.ts
var ApiResponseHelper = class ApiResponseHelper {
	/**
	* Send a successful response
	*/
	static success(c, data, message) {
		const response = {
			success: true,
			data,
			message
		};
		return c.json(response);
	}
	/**
	* Send a paginated response
	*/
	static paginated(c, data, pagination, message) {
		const response = {
			success: true,
			data,
			pagination,
			message
		};
		return c.json(response);
	}
	/**
	* Send an error response
	*/
	static error(c, error, statusCode = 400, data) {
		const response = {
			success: false,
			error,
			data
		};
		return c.json(response, statusCode);
	}
	/**
	* Send a validation error response
	*/
	static validationError(c, errors) {
		return ApiResponseHelper.error(c, "Validation failed", 422, { errors });
	}
	/**
	* Send an unauthorized response
	*/
	static unauthorized(c, message = "Unauthorized") {
		return ApiResponseHelper.error(c, message, 401);
	}
	/**
	* Send a forbidden response
	*/
	static forbidden(c, message = "Forbidden") {
		return ApiResponseHelper.error(c, message, 403);
	}
	/**
	* Send a not found response
	*/
	static notFound(c, message = "Resource not found") {
		return ApiResponseHelper.error(c, message, 404);
	}
	/**
	* Send a conflict response
	*/
	static conflict(c, message = "Conflict") {
		return ApiResponseHelper.error(c, message, 409);
	}
	/**
	* Send an internal server error response
	*/
	static internalError(c, message = "Internal server error") {
		return ApiResponseHelper.error(c, message, 500);
	}
	/**
	* Handle async route errors
	*/
	static async handleAsync(c, asyncFn) {
		try {
			return await asyncFn();
		} catch (error) {
			console.error("API Error:", error);
			if (error instanceof Error) return ApiResponseHelper.internalError(c, error.message);
			return ApiResponseHelper.internalError(c, "An unexpected error occurred");
		}
	}
};
const asyncHandler = (fn) => {
	return async (c) => {
		return ApiResponseHelper.handleAsync(c, () => fn(c));
	};
};

//#endregion
//#region src/middleware/validation.ts
/**
* Validation middleware for request body
*/
const validateBody = (schema) => {
	return async (c, next) => {
		try {
			const body = await c.req.json();
			const validatedData = schema.parse(body);
			c.set("validatedData", validatedData);
			await next();
		} catch (error) {
			if (error instanceof z.ZodError) return ApiResponseHelper.validationError(c, error.errors);
			return ApiResponseHelper.error(c, "Invalid request body");
		}
	};
};
/**
* Validation middleware for query parameters
*/
const validateQuery = (schema) => {
	return async (c, next) => {
		try {
			const query = c.req.query();
			const validatedData = schema.parse(query);
			c.set("validatedQuery", validatedData);
			await next();
		} catch (error) {
			if (error instanceof z.ZodError) return ApiResponseHelper.validationError(c, error.errors);
			return ApiResponseHelper.error(c, "Invalid query parameters");
		}
	};
};
/**
* Validation middleware for path parameters
*/
const validateParams = (schema) => {
	return async (c, next) => {
		try {
			const params = c.req.param();
			const validatedData = schema.parse(params);
			c.set("validatedParams", validatedData);
			await next();
		} catch (error) {
			if (error instanceof z.ZodError) return ApiResponseHelper.validationError(c, error.errors);
			return ApiResponseHelper.error(c, "Invalid path parameters");
		}
	};
};
const IdParamSchema = z.object({ id: z.string().cuid("Invalid ID format") });
const PaginationQuerySchema = z.object({
	page: z.string().transform(Number).pipe(z.number().int().positive()).optional().default("1"),
	limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional().default("10")
});

//#endregion
//#region src/middleware/auth.ts
/**
* Authentication middleware
* Validates session token and adds user to context
*/
const authMiddleware = async (c, next) => {
	const authHeader = c.req.header("Authorization");
	const sessionToken = c.req.header("X-Session-Token");
	let token = null;
	if (authHeader?.startsWith("Bearer ")) token = authHeader.substring(7);
	else if (sessionToken) token = sessionToken;
	if (!token) return ApiResponseHelper.unauthorized(c, "Authentication token required");
	const user = await AuthService.getUserFromSession(token);
	if (!user) return ApiResponseHelper.unauthorized(c, "Invalid or expired session");
	c.set("user", user);
	await next();
};
/**
* Credits requirement middleware
* Requires user to have sufficient credits
*/
const requireCredits = (amount = 1) => {
	return async (c, next) => {
		const user = c.get("user");
		if (!user) return ApiResponseHelper.unauthorized(c, "Authentication required");
		const hasCredits = await AuthService.checkCredits(user.id, amount);
		if (!hasCredits) return ApiResponseHelper.forbidden(c, "Insufficient credits. Please upgrade your plan or purchase more credits.");
		await next();
	};
};
/**
* Rate limiting middleware (simple in-memory implementation)
*/
const rateLimitStore = /* @__PURE__ */ new Map();
const rateLimit = (maxRequests, windowMs) => {
	return async (c, next) => {
		const user = c.get("user");
		const ip = c.req.header("CF-Connecting-IP") || c.req.header("X-Forwarded-For") || "unknown";
		const identifier = user ? `user:${user.id}` : `ip:${ip}`;
		const now = Date.now();
		const windowStart = now - windowMs;
		let entry = rateLimitStore.get(identifier);
		if (!entry || entry.resetTime < windowStart) {
			entry = {
				count: 0,
				resetTime: now + windowMs
			};
			rateLimitStore.set(identifier, entry);
		}
		entry.count++;
		if (entry.count > maxRequests) return ApiResponseHelper.error(c, "Rate limit exceeded. Please try again later.", 429);
		if (Math.random() < .01) {
			for (const [key, value] of rateLimitStore.entries()) if (value.resetTime < now) rateLimitStore.delete(key);
		}
		await next();
	};
};

//#endregion
//#region src/types/index.ts
const CreateUserSchema = z.object({
	email: z.string().email(),
	name: z.string().min(1).max(100),
	avatar: z.string().url().optional()
});
const UpdateUserSchema = z.object({
	name: z.string().min(1).max(100).optional(),
	avatar: z.string().url().optional()
});
const LoginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6)
});
const RegisterSchema = z.object({
	email: z.string().email(),
	name: z.string().min(1).max(100),
	password: z.string().min(6)
});
const CreateProjectSchema = z.object({
	name: z.string().min(1).max(200),
	description: z.string().max(1e3).optional(),
	prompt: z.string().min(1)
});
const UpdateProjectSchema = z.object({
	name: z.string().min(1).max(200).optional(),
	description: z.string().max(1e3).optional(),
	prompt: z.string().min(1).optional()
});
const StartGenerationSchema = z.object({
	projectId: z.string().cuid(),
	prompt: z.string().min(1).optional()
});
const CreateChatMessageSchema = z.object({
	projectId: z.string().cuid(),
	content: z.string().min(1)
});
const CreateScreenSchema = z.object({
	projectId: z.string().cuid(),
	name: z.string().min(1).max(100),
	type: z.enum([
		"DESKTOP",
		"TABLET",
		"MOBILE"
	]),
	width: z.number().int().positive(),
	height: z.number().int().positive(),
	x: z.number(),
	y: z.number(),
	imageUrl: z.string().url().optional(),
	route: z.string().max(200).optional(),
	component: z.string().max(200).optional()
});
const PaginationSchema = z.object({
	page: z.string().transform(Number).pipe(z.number().int().positive()).optional().default("1"),
	limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional().default("10")
});
const ProjectQuerySchema = PaginationSchema.extend({
	status: z.enum([
		"DRAFT",
		"GENERATING",
		"COMPLETED",
		"ERROR"
	]).optional(),
	search: z.string().max(200).optional()
});

//#endregion
//#region src/routes/auth.ts
new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const GoogleAuthSchema = z.object({ credential: z.string() });
const authRouter = new Hono();
const authRateLimit = rateLimit(5, 900 * 1e3);
/**
* POST /auth/register
* Register a new user
*/
authRouter.post("/register", authRateLimit, validateBody(RegisterSchema), asyncHandler(async (c) => {
	const { email, name, password } = c.get("validatedData");
	const existingUser = await AuthService.getUserByEmail(email);
	if (existingUser) return ApiResponseHelper.conflict(c, "User with this email already exists");
	const user = await prisma_default.user.create({ data: {
		email,
		name,
		credits: 50,
		maxCredits: 50
	} });
	const { token, expiresAt } = await AuthService.createSession(user.id);
	return ApiResponseHelper.success(c, {
		user: {
			id: user.id,
			email: user.email,
			name: user.name,
			plan: user.plan,
			credits: user.credits,
			maxCredits: user.maxCredits
		},
		session: {
			token,
			expiresAt
		}
	}, "User registered successfully");
}));
/**
* POST /auth/login
* Authenticate user and create session
*/
authRouter.post("/login", authRateLimit, validateBody(LoginSchema), asyncHandler(async (c) => {
	const { email, password } = c.get("validatedData");
	const user = await AuthService.getUserByEmail(email);
	if (!user) return ApiResponseHelper.unauthorized(c, "Invalid credentials");
	const { token, expiresAt } = await AuthService.createSession(user.id);
	return ApiResponseHelper.success(c, {
		user: {
			id: user.id,
			email: user.email,
			name: user.name,
			plan: user.plan,
			credits: user.credits,
			maxCredits: user.maxCredits
		},
		session: {
			token,
			expiresAt
		}
	}, "Login successful");
}));
/**
* POST /auth/google
* Authenticate user with Google OAuth token
*/
authRouter.post("/google", authRateLimit, validateBody(GoogleAuthSchema), asyncHandler(async (c) => {
	const { credential } = c.get("validatedData");
	try {
		console.log("Verificando token do Google...");
		const base64Url = credential.split(".")[1];
		const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
		const jsonPayload = decodeURIComponent(atob(base64).split("").map((c$1) => "%" + ("00" + c$1.charCodeAt(0).toString(16)).slice(-2)).join(""));
		const decodedPayload = JSON.parse(jsonPayload);
		console.log("Token decodificado:", {
			email: decodedPayload.email,
			name: decodedPayload.name,
			iss: decodedPayload.iss,
			aud: decodedPayload.aud,
			exp: decodedPayload.exp,
			currentTime: Math.floor(Date.now() / 1e3)
		});
		if (decodedPayload.iss !== "https://accounts.google.com") {
			console.error("Token não é do Google:", decodedPayload.iss);
			return ApiResponseHelper.unauthorized(c, "Token não é do Google");
		}
		if (decodedPayload.aud !== process.env.GOOGLE_CLIENT_ID) {
			console.error("Audience incorreta:", decodedPayload.aud);
			return ApiResponseHelper.unauthorized(c, "Token para cliente incorreto");
		}
		const currentTime = Math.floor(Date.now() / 1e3);
		const isDevelopment = process.env.NODE_ENV !== "production";
		const tolerance = isDevelopment ? 86400 : 300;
		if (decodedPayload.exp && decodedPayload.exp + tolerance < currentTime) {
			console.error("Token expirado mesmo com tolerância:", {
				exp: decodedPayload.exp,
				current: currentTime,
				diff: currentTime - decodedPayload.exp,
				tolerance,
				isDevelopment
			});
			if (isDevelopment) console.warn("⚠️ DESENVOLVIMENTO: Aceitando token expirado");
			else return ApiResponseHelper.unauthorized(c, "Token expirado");
		} else if (decodedPayload.exp && decodedPayload.exp < currentTime) console.warn("Token tecnicamente expirado, mas aceitando com tolerância:", {
			exp: decodedPayload.exp,
			current: currentTime,
			diff: currentTime - decodedPayload.exp
		});
		const payload = decodedPayload;
		console.log("Token verificado com sucesso:", {
			email: payload?.email,
			name: payload?.name,
			sub: payload?.sub
		});
		if (!payload || !payload.email) {
			console.error("Payload inválido:", payload);
			return ApiResponseHelper.unauthorized(c, "Invalid Google token");
		}
		let user = await AuthService.getUserByEmail(payload.email);
		if (!user) user = await prisma_default.user.create({ data: {
			email: payload.email,
			name: payload.name || payload.email.split("@")[0],
			avatar: payload.picture || null,
			credits: 50,
			maxCredits: 50,
			googleId: payload.sub
		} });
		else if (!user.googleId) user = await prisma_default.user.update({
			where: { id: user.id },
			data: {
				googleId: payload.sub,
				avatar: payload.picture || user.avatar
			}
		});
		const { token, expiresAt } = await AuthService.createSession(user.id);
		return ApiResponseHelper.success(c, {
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
				avatar: user.avatar,
				plan: user.plan,
				credits: user.credits,
				maxCredits: user.maxCredits,
				createdAt: user.createdAt
			},
			session: {
				token,
				expiresAt
			}
		}, "Google authentication successful");
	} catch (error) {
		console.error("Google authentication error:", error);
		return ApiResponseHelper.unauthorized(c, "Failed to verify Google token");
	}
}));
/**
* POST /auth/logout
* Invalidate current session
*/
authRouter.post("/logout", authMiddleware, asyncHandler(async (c) => {
	const authHeader = c.req.header("Authorization");
	const sessionToken = c.req.header("X-Session-Token");
	let token = null;
	if (authHeader?.startsWith("Bearer ")) token = authHeader.substring(7);
	else if (sessionToken) token = sessionToken;
	if (token) await AuthService.invalidateSession(token);
	return ApiResponseHelper.success(c, null, "Logout successful");
}));
/**
* GET /auth/me
* Get current user information
*/
authRouter.get("/me", authMiddleware, asyncHandler(async (c) => {
	const sessionUser = c.get("user");
	const user = await prisma_default.user.findUnique({
		where: { id: sessionUser.id },
		include: {
			projects: {
				select: {
					id: true,
					name: true,
					status: true,
					updatedAt: true
				},
				orderBy: { updatedAt: "desc" },
				take: 5
			},
			_count: { select: { projects: true } }
		}
	});
	if (!user) return ApiResponseHelper.notFound(c, "User not found");
	return ApiResponseHelper.success(c, {
		id: user.id,
		email: user.email,
		name: user.name,
		avatar: user.avatar,
		plan: user.plan,
		credits: user.credits,
		maxCredits: user.maxCredits,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt,
		recentProjects: user.projects,
		totalProjects: user._count.projects
	});
}));
/**
* PUT /auth/me
* Update current user information
*/
authRouter.put("/me", authMiddleware, validateBody(RegisterSchema.pick({ name: true }).extend({ avatar: RegisterSchema.shape.name.optional() })), asyncHandler(async (c) => {
	const sessionUser = c.get("user");
	const { name, avatar } = c.get("validatedData");
	const updatedUser = await prisma_default.user.update({
		where: { id: sessionUser.id },
		data: {
			...name && { name },
			...avatar && { avatar }
		}
	});
	return ApiResponseHelper.success(c, {
		id: updatedUser.id,
		email: updatedUser.email,
		name: updatedUser.name,
		avatar: updatedUser.avatar,
		plan: updatedUser.plan,
		credits: updatedUser.credits,
		maxCredits: updatedUser.maxCredits
	}, "User updated successfully");
}));
/**
* GET /auth/credits
* Get user credit information
*/
authRouter.get("/credits", authMiddleware, asyncHandler(async (c) => {
	const sessionUser = c.get("user");
	const user = await prisma_default.user.findUnique({
		where: { id: sessionUser.id },
		select: {
			credits: true,
			maxCredits: true,
			plan: true
		}
	});
	if (!user) return ApiResponseHelper.notFound(c, "User not found");
	const usagePercentage = Math.round(user.credits / user.maxCredits * 100);
	const isLowCredits = usagePercentage < 25;
	return ApiResponseHelper.success(c, {
		credits: user.credits,
		maxCredits: user.maxCredits,
		usagePercentage,
		isLowCredits,
		plan: user.plan,
		canUpgrade: user.plan !== "ENTERPRISE"
	});
}));
var auth_default = authRouter;

//#endregion
//#region src/lib/ai.ts
var AIService = class {
	static apiKey = process.env.GOOGLE_AI_API_KEY;
	static baseUrl = "https://generativelanguage.googleapis.com/v1beta";
	/**
	* Make request to Google AI API
	*/
	static async makeRequest(endpoint, body) {
		if (!this.apiKey) throw new Error("Google AI API key not configured");
		const response = await fetch(`${this.baseUrl}${endpoint}?key=${this.apiKey}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body)
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
	static async generateText(prompt) {
		try {
			const response = await this.makeRequest("/models/gemini-pro:generateContent", {
				contents: [{ parts: [{ text: prompt }] }],
				generationConfig: {
					temperature: .7,
					topK: 40,
					topP: .95,
					maxOutputTokens: 2048
				},
				safetySettings: [
					{
						category: "HARM_CATEGORY_HARASSMENT",
						threshold: "BLOCK_MEDIUM_AND_ABOVE"
					},
					{
						category: "HARM_CATEGORY_HATE_SPEECH",
						threshold: "BLOCK_MEDIUM_AND_ABOVE"
					},
					{
						category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
						threshold: "BLOCK_MEDIUM_AND_ABOVE"
					},
					{
						category: "HARM_CATEGORY_DANGEROUS_CONTENT",
						threshold: "BLOCK_MEDIUM_AND_ABOVE"
					}
				]
			});
			const content = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
			return {
				content,
				usage: response.usageMetadata ? {
					totalTokens: response.usageMetadata.totalTokenCount || 0,
					inputTokens: response.usageMetadata.promptTokenCount || 0,
					outputTokens: response.usageMetadata.candidatesTokenCount || 0
				} : void 0
			};
		} catch (error) {
			console.error("AI Generation Error:", error);
			throw new Error(`Failed to generate AI response: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}
	/**
	* Analyze project prompt and create generation plan
	*/
	static async createGenerationPlan(projectPrompt) {
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
			const jsonMatch = response.content.match(/\[[\s\S]*\]/);
			if (!jsonMatch) throw new Error("No valid JSON found in AI response");
			const steps = JSON.parse(jsonMatch[0]);
			const validatedSteps = steps.filter((step) => step.name && step.description && [
				"SETUP",
				"CODE",
				"SCREEN",
				"OPTIMIZATION"
			].includes(step.type) && typeof step.order === "number").map((step, index) => ({
				name: step.name.trim(),
				description: step.description.trim(),
				type: step.type,
				order: index + 1
			}));
			if (validatedSteps.length === 0) throw new Error("No valid steps generated");
			return validatedSteps;
		} catch (error) {
			console.error("Failed to create generation plan:", error);
			return this.getDefaultGenerationPlan(projectPrompt);
		}
	}
	/**
	* Generate React component code
	*/
	static async generateComponent(componentName, description, projectContext) {
		const prompt = `
Generate a React TypeScript component with the following requirements:

Component Name: ${componentName}
Description: ${description}
${projectContext ? `Project Context: ${projectContext}` : ""}

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
			const jsonMatch = response.content.match(/\{[\s\S]*\}/);
			if (!jsonMatch) throw new Error("No valid JSON found in AI response");
			const componentData = JSON.parse(jsonMatch[0]);
			return {
				name: componentData.name || componentName,
				code: componentData.code || `// Component code for ${componentName}`,
				imports: Array.isArray(componentData.imports) ? componentData.imports : [],
				exports: Array.isArray(componentData.exports) ? componentData.exports : [`export default ${componentName};`]
			};
		} catch (error) {
			console.error("Failed to generate component:", error);
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
				imports: ["import React from 'react';"],
				exports: [`export default ${componentName};`]
			};
		}
	}
	/**
	* Generate chat response for user messages
	*/
	static async generateChatResponse(userMessage, projectContext, conversationHistory) {
		const prompt = `
You are an AI assistant helping to build a React application. Respond to the user's message in a helpful, concise way.

${projectContext ? `Project Context: ${projectContext}` : ""}

${conversationHistory && conversationHistory.length > 0 ? `Previous conversation:\n${conversationHistory.slice(-5).join("\n")}\n` : ""}

User Message: "${userMessage}"

Respond as an AI assistant who is building their app. Be encouraging and specific about what you will implement. Keep the response under 200 words.
`;
		try {
			const response = await this.generateText(prompt);
			return response.content.trim();
		} catch (error) {
			console.error("Failed to generate chat response:", error);
			return `Entendi! Vou implementar: "${userMessage}". As mudanças aparecerão no preview em instantes!`;
		}
	}
	/**
	* Fallback generation plan when AI fails
	*/
	static getDefaultGenerationPlan(projectPrompt) {
		const isEcommerce = /ecommerce|shop|store|product|cart/i.test(projectPrompt);
		const isDashboard = /dashboard|admin|management|analytics/i.test(projectPrompt);
		const isSocial = /social|chat|message|post|feed/i.test(projectPrompt);
		let steps = [
			{
				name: "Configuração inicial",
				description: "Criando estrutura do projeto React + TypeScript com Tailwind CSS",
				type: "SETUP",
				order: 1
			},
			{
				name: "Componentes base",
				description: "Gerando componentes de UI e layout principal",
				type: "CODE",
				order: 2
			},
			{
				name: "Tela de Login",
				description: "Criando interface de autenticação",
				type: "SCREEN",
				order: 3
			}
		];
		if (isEcommerce) steps = steps.concat([
			{
				name: "Sistema de produtos",
				description: "Implementando gerenciamento de produtos e catálogo",
				type: "CODE",
				order: 4
			},
			{
				name: "Lista de Produtos",
				description: "Criando interface de catálogo de produtos",
				type: "SCREEN",
				order: 5
			},
			{
				name: "Carrinho de Compras",
				description: "Implementando funcionalidade de carrinho",
				type: "CODE",
				order: 6
			}
		]);
		else if (isDashboard) steps = steps.concat([{
			name: "Dashboard Principal",
			description: "Criando painel administrativo com métricas",
			type: "SCREEN",
			order: 4
		}, {
			name: "Sistema de dados",
			description: "Implementando gerenciamento de estado e APIs",
			type: "CODE",
			order: 5
		}]);
		else if (isSocial) steps = steps.concat([{
			name: "Sistema de posts",
			description: "Implementando criação e exibição de posts",
			type: "CODE",
			order: 4
		}, {
			name: "Feed Principal",
			description: "Criando timeline de posts e interações",
			type: "SCREEN",
			order: 5
		}]);
		else steps = steps.concat([{
			name: "Dashboard Principal",
			description: "Criando painel principal da aplicação",
			type: "SCREEN",
			order: 4
		}]);
		steps.push({
			name: "Otimização final",
			description: "Aplicando otimizações de performance e responsividade",
			type: "OPTIMIZATION",
			order: steps.length + 1
		});
		return steps;
	}
};

//#endregion
//#region src/routes/projects.ts
const projectsRouter = new Hono();
/**
* GET /projects
* Get user's projects with pagination and filters
*/
projectsRouter.get("/", authMiddleware, validateQuery(ProjectQuerySchema), asyncHandler(async (c) => {
	const user = c.get("user");
	const { page, limit, status, search } = c.get("validatedQuery");
	const where = {
		userId: user.id,
		...status && { status },
		...search && { OR: [{ name: {
			contains: search,
			mode: "insensitive"
		} }, { description: {
			contains: search,
			mode: "insensitive"
		} }] }
	};
	const total = await prisma_default.project.count({ where });
	const totalPages = Math.ceil(total / limit);
	const projects = await prisma_default.project.findMany({
		where,
		include: {
			_count: { select: {
				screens: true,
				messages: true,
				generations: true
			} },
			generations: {
				select: {
					id: true,
					status: true,
					progress: true,
					createdAt: true
				},
				orderBy: { createdAt: "desc" },
				take: 1
			}
		},
		orderBy: { updatedAt: "desc" },
		skip: (page - 1) * limit,
		take: limit
	});
	const formattedProjects = projects.map((project) => ({
		id: project.id,
		name: project.name,
		description: project.description,
		status: project.status,
		createdAt: project.createdAt,
		updatedAt: project.updatedAt,
		screensCount: project._count.screens,
		messagesCount: project._count.messages,
		generationsCount: project._count.generations,
		latestGeneration: project.generations[0] || null
	}));
	return ApiResponseHelper.paginated(c, formattedProjects, {
		page,
		limit,
		total,
		totalPages
	});
}));
/**
* POST /projects
* Create a new project
*/
projectsRouter.post("/", authMiddleware, validateBody(CreateProjectSchema), asyncHandler(async (c) => {
	const user = c.get("user");
	const { name, description, prompt } = c.get("validatedData");
	const project = await prisma_default.project.create({
		data: {
			name,
			description,
			prompt,
			userId: user.id
		},
		include: { _count: { select: {
			screens: true,
			messages: true,
			generations: true
		} } }
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
		generationsCount: project._count.generations
	}, "Project created successfully");
}));
/**
* GET /projects/:id
* Get a specific project with all details
*/
projectsRouter.get("/:id", authMiddleware, validateParams(IdParamSchema), asyncHandler(async (c) => {
	const user = c.get("user");
	const { id } = c.get("validatedParams");
	const project = await prisma_default.project.findFirst({
		where: {
			id,
			userId: user.id
		},
		include: {
			screens: { orderBy: { createdAt: "asc" } },
			messages: { orderBy: { createdAt: "asc" } },
			generations: {
				include: { steps: { orderBy: { order: "asc" } } },
				orderBy: { createdAt: "desc" }
			},
			_count: { select: {
				screens: true,
				messages: true,
				generations: true
			} }
		}
	});
	if (!project) return ApiResponseHelper.notFound(c, "Project not found");
	return ApiResponseHelper.success(c, project);
}));
/**
* PUT /projects/:id
* Update a project
*/
projectsRouter.put("/:id", authMiddleware, validateParams(IdParamSchema), validateBody(UpdateProjectSchema), asyncHandler(async (c) => {
	const user = c.get("user");
	const { id } = c.get("validatedParams");
	const updateData = c.get("validatedData");
	const existingProject = await prisma_default.project.findFirst({ where: {
		id,
		userId: user.id
	} });
	if (!existingProject) return ApiResponseHelper.notFound(c, "Project not found");
	if (existingProject.status === "GENERATING") return ApiResponseHelper.conflict(c, "Cannot update project while generation is in progress");
	const updatedProject = await prisma_default.project.update({
		where: { id },
		data: updateData,
		include: { _count: { select: {
			screens: true,
			messages: true,
			generations: true
		} } }
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
		generationsCount: updatedProject._count.generations
	}, "Project updated successfully");
}));
/**
* DELETE /projects/:id
* Delete a project
*/
projectsRouter.delete("/:id", authMiddleware, validateParams(IdParamSchema), asyncHandler(async (c) => {
	const user = c.get("user");
	const { id } = c.get("validatedParams");
	const project = await prisma_default.project.findFirst({ where: {
		id,
		userId: user.id
	} });
	if (!project) return ApiResponseHelper.notFound(c, "Project not found");
	if (project.status === "GENERATING") return ApiResponseHelper.conflict(c, "Cannot delete project while generation is in progress");
	await prisma_default.project.delete({ where: { id } });
	return ApiResponseHelper.success(c, null, "Project deleted successfully");
}));
/**
* GET /projects/:id/screens
* Get project screens
*/
projectsRouter.get("/:id/screens", authMiddleware, validateParams(IdParamSchema), asyncHandler(async (c) => {
	const user = c.get("user");
	const { id } = c.get("validatedParams");
	const project = await prisma_default.project.findFirst({ where: {
		id,
		userId: user.id
	} });
	if (!project) return ApiResponseHelper.notFound(c, "Project not found");
	const screens = await prisma_default.screen.findMany({
		where: { projectId: id },
		orderBy: { createdAt: "asc" }
	});
	return ApiResponseHelper.success(c, screens);
}));
/**
* GET /projects/:id/code
* Get generated code for project
*/
projectsRouter.get("/:id/code", authMiddleware, validateParams(IdParamSchema), asyncHandler(async (c) => {
	const user = c.get("user");
	const { id } = c.get("validatedParams");
	const project = await prisma_default.project.findFirst({
		where: {
			id,
			userId: user.id
		},
		include: { screens: {
			where: { metadata: { not: null } },
			orderBy: { createdAt: "asc" }
		} }
	});
	if (!project) return ApiResponseHelper.notFound(c, "Project not found");
	const codeFiles = [];
	project.screens.forEach((screen) => {
		if (screen.metadata) try {
			const metadata = JSON.parse(screen.metadata);
			if (metadata.code && metadata.files) codeFiles.push({
				screenId: screen.id,
				screenName: screen.name,
				deviceType: screen.type,
				component: metadata.component,
				code: metadata.code,
				files: JSON.parse(metadata.files),
				responsive: metadata.responsive || false
			});
		} catch (error) {
			console.error("Failed to parse screen metadata:", error);
		}
	});
	return ApiResponseHelper.success(c, {
		projectId: id,
		projectName: project.name,
		totalScreens: project.screens.length,
		codeFiles
	});
}));
/**
* GET /projects/:id/messages
* Get project chat messages
*/
projectsRouter.get("/:id/messages", authMiddleware, validateParams(IdParamSchema), asyncHandler(async (c) => {
	const user = c.get("user");
	const { id } = c.get("validatedParams");
	const project = await prisma_default.project.findFirst({ where: {
		id,
		userId: user.id
	} });
	if (!project) return ApiResponseHelper.notFound(c, "Project not found");
	const messages = await prisma_default.chatMessage.findMany({
		where: { projectId: id },
		orderBy: { createdAt: "asc" }
	});
	return ApiResponseHelper.success(c, messages);
}));
/**
* POST /projects/:id/messages
* Add a chat message to project
*/
projectsRouter.post("/:id/messages", authMiddleware, validateParams(IdParamSchema), validateBody(CreateProjectSchema.pick({ prompt: true }).extend({ content: CreateProjectSchema.shape.prompt }).omit({ prompt: true })), asyncHandler(async (c) => {
	const user = c.get("user");
	const { id } = c.get("validatedParams");
	const { content } = c.get("validatedData");
	const project = await prisma_default.project.findFirst({ where: {
		id,
		userId: user.id
	} });
	if (!project) return ApiResponseHelper.notFound(c, "Project not found");
	const userMessage = await prisma_default.chatMessage.create({ data: {
		projectId: id,
		role: "USER",
		content
	} });
	let assistantMessage;
	try {
		const recentMessages = await prisma_default.chatMessage.findMany({
			where: { projectId: id },
			orderBy: { createdAt: "desc" },
			take: 10
		});
		const conversationHistory = recentMessages.reverse().map((msg) => `${msg.role}: ${msg.content}`);
		const aiResponse = await AIService.generateChatResponse(content, `Project: ${project.name}. Description: ${project.description || project.prompt}`, conversationHistory);
		assistantMessage = await prisma_default.chatMessage.create({ data: {
			projectId: id,
			role: "ASSISTANT",
			content: aiResponse
		} });
	} catch (error) {
		console.error("AI chat response failed:", error);
		assistantMessage = await prisma_default.chatMessage.create({ data: {
			projectId: id,
			role: "ASSISTANT",
			content: `Entendi! Vou implementar: "${content}". As mudanças aparecerão no preview em instantes!`
		} });
	}
	return ApiResponseHelper.success(c, [userMessage, assistantMessage], "Messages created successfully");
}));
/**
* GET /projects/:id/preview
* Get live preview code for project
*/
projectsRouter.get("/:id/preview", authMiddleware, validateParams(IdParamSchema), asyncHandler(async (c) => {
	const user = c.get("user");
	const { id } = c.get("validatedParams");
	const project = await prisma_default.project.findFirst({
		where: {
			id,
			userId: user.id
		},
		include: { screens: {
			where: { metadata: { not: null } },
			orderBy: { createdAt: "desc" },
			take: 1
		} }
	});
	if (!project) return ApiResponseHelper.notFound(c, "Project not found");
	let previewCode = "";
	if (project.screens.length > 0 && project.screens[0].metadata) try {
		const metadata = JSON.parse(project.screens[0].metadata);
		previewCode = metadata.code || "";
	} catch (error) {
		console.error("Failed to parse screen metadata:", error);
	}
	if (!previewCode) {
		const prompt = project.prompt || project.description || "Aplicação personalizada";
		let componentType = "generic";
		if (prompt.toLowerCase().includes("contador")) componentType = "counter";
		else if (prompt.toLowerCase().includes("tarefa") || prompt.toLowerCase().includes("todo")) componentType = "todolist";
		else if (prompt.toLowerCase().includes("dashboard")) componentType = "dashboard";
		else if (prompt.toLowerCase().includes("login")) componentType = "login";
		const { CodeGenerationService: CodeGenerationService$1 } = await import("./code-generator-DEYbuzkj.js");
		const template = await CodeGenerationService$1.generateComponent("PreviewComponent", prompt, componentType);
		previewCode = template.code;
	}
	return ApiResponseHelper.success(c, {
		projectId: id,
		projectName: project.name,
		code: previewCode
	});
}));
var projects_default = projectsRouter;

//#endregion
//#region src/routes/generation.ts
const generationRouter = new Hono();
/**
* AI-powered generation service
* Uses Google AI (Gemini) for real code generation
*/
var GenerationService = class {
	static async createGenerationPlan(prompt) {
		try {
			return await AIService.createGenerationPlan(prompt);
		} catch (error) {
			console.error("AI generation plan failed, using fallback:", error);
			return [
				{
					name: "Configuração inicial",
					description: "Criando estrutura do projeto React + TypeScript",
					type: "SETUP",
					order: 1
				},
				{
					name: "Componentes base",
					description: "Gerando componentes de UI e layout principal",
					type: "CODE",
					order: 2
				},
				{
					name: "Tela Principal",
					description: "Criando interface principal da aplicação",
					type: "SCREEN",
					order: 3
				},
				{
					name: "Otimização final",
					description: "Aplicando otimizações e responsividade",
					type: "OPTIMIZATION",
					order: 4
				}
			];
		}
	}
	static async generateScreen(stepName, type, index) {
		const positions = {
			DESKTOP: {
				baseX: 100,
				baseY: 100,
				offsetY: 1200
			},
			TABLET: {
				baseX: 1200,
				baseY: 150,
				offsetY: 1300
			},
			MOBILE: {
				baseX: 2e3,
				baseY: 100,
				offsetY: 1100
			}
		};
		const pos = positions[type];
		const route = stepName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
		let imageUrl = `https://images.unsplash.com/photo-1555421689?w=800&h=600&fit=crop`;
		if (stepName.toLowerCase().includes("login")) imageUrl = `https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop`;
		else if (stepName.toLowerCase().includes("dashboard")) imageUrl = `https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop`;
		else if (stepName.toLowerCase().includes("contador")) imageUrl = `https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop`;
		else if (stepName.toLowerCase().includes("tarefa")) imageUrl = `https://images.unsplash.com/photo-1540350394557-8d14678e7f91?w=800&h=600&fit=crop`;
		return {
			name: stepName,
			type,
			width: type === "DESKTOP" ? 1440 : type === "TABLET" ? 768 : 375,
			height: type === "DESKTOP" ? 900 : type === "TABLET" ? 1024 : 812,
			x: pos.baseX,
			y: pos.baseY + Math.floor(index / 4) * pos.offsetY,
			imageUrl,
			route,
			component: `${stepName.replace(/\s+/g, "")}${type.charAt(0) + type.slice(1).toLowerCase()}`
		};
	}
};
/**
* POST /generation/start
* Start AI generation for a project
*/
generationRouter.post("/start", authMiddleware, requireCredits(5), validateBody(StartGenerationSchema), asyncHandler(async (c) => {
	const user = c.get("user");
	const { projectId, prompt } = c.get("validatedData");
	const project = await prisma_default.project.findFirst({ where: {
		id: projectId,
		userId: user.id
	} });
	if (!project) return ApiResponseHelper.notFound(c, "Project not found");
	const activeGeneration = await prisma_default.generation.findFirst({ where: {
		projectId,
		status: "RUNNING"
	} });
	if (activeGeneration) return ApiResponseHelper.conflict(c, "Generation already in progress for this project");
	const creditsDeducted = await AuthService.deductCredits(user.id, 5);
	if (!creditsDeducted) return ApiResponseHelper.forbidden(c, "Insufficient credits");
	try {
		const steps = await GenerationService.createGenerationPlan(prompt || project.prompt);
		const generation = await prisma_default.generation.create({
			data: {
				projectId,
				status: "RUNNING",
				totalSteps: steps.length,
				startedAt: /* @__PURE__ */ new Date(),
				steps: { create: steps.map((step) => ({
					name: step.name,
					description: step.description,
					type: step.type,
					order: step.order
				})) }
			},
			include: { steps: { orderBy: { order: "asc" } } }
		});
		await prisma_default.project.update({
			where: { id: projectId },
			data: { status: "GENERATING" }
		});
		GenerationService.processGeneration(generation.id, projectId).catch(console.error);
		return ApiResponseHelper.success(c, {
			generationId: generation.id,
			status: generation.status,
			totalSteps: generation.totalSteps,
			steps: generation.steps
		}, "Generation started successfully");
	} catch (error) {
		await AuthService.addCredits(user.id, 5);
		throw error;
	}
}));
GenerationService.processGeneration = async (generationId, projectId) => {
	try {
		const generation = await prisma_default.generation.findUnique({
			where: { id: generationId },
			include: { steps: { orderBy: { order: "asc" } } }
		});
		if (!generation) return;
		for (const step of generation.steps) {
			await prisma_default.generationStep.update({
				where: { id: step.id },
				data: {
					status: "RUNNING",
					startedAt: /* @__PURE__ */ new Date()
				}
			});
			const processingTime = Math.random() * 1e3 + 500;
			for (let progress = 0; progress <= 100; progress += 25) {
				await new Promise((resolve) => setTimeout(resolve, processingTime / 4));
				await prisma_default.generationStep.update({
					where: { id: step.id },
					data: { progress }
				});
			}
			await prisma_default.generationStep.update({
				where: { id: step.id },
				data: {
					status: "COMPLETED",
					progress: 100,
					completedAt: /* @__PURE__ */ new Date()
				}
			});
			if (step.type === "SCREEN") {
				const screenTypes = [
					"DESKTOP",
					"TABLET",
					"MOBILE"
				];
				let componentType = "generic";
				if (step.name.toLowerCase().includes("login")) componentType = "login";
				else if (step.name.toLowerCase().includes("dashboard") || step.name.toLowerCase().includes("principal")) componentType = "dashboard";
				else if (step.name.toLowerCase().includes("contador")) componentType = "counter";
				else if (step.name.toLowerCase().includes("tarefa") || step.name.toLowerCase().includes("todo")) componentType = "todolist";
				const componentTemplate = await CodeGenerationService.generateComponent(step.name.replace(/\s+/g, ""), step.description, componentType);
				for (let i = 0; i < screenTypes.length; i++) {
					const screenData = await GenerationService.generateScreen(step.name, screenTypes[i], generation.steps.indexOf(step) * 3 + i);
					const codeData = {
						component: componentTemplate.name,
						code: componentTemplate.code,
						files: JSON.stringify(componentTemplate.files),
						responsive: true
					};
					await prisma_default.screen.create({ data: {
						...screenData,
						projectId,
						isGenerated: true,
						metadata: JSON.stringify(codeData)
					} });
				}
			}
			const completedSteps = generation.steps.filter((s) => s.id === step.id || s.order < step.order).length;
			await prisma_default.generation.update({
				where: { id: generationId },
				data: {
					progress: Math.round(completedSteps / generation.totalSteps * 100),
					currentStep: step.name
				}
			});
		}
		await prisma_default.generation.update({
			where: { id: generationId },
			data: {
				status: "COMPLETED",
				progress: 100,
				completedAt: /* @__PURE__ */ new Date(),
				currentStep: null
			}
		});
		await prisma_default.project.update({
			where: { id: projectId },
			data: { status: "COMPLETED" }
		});
	} catch (error) {
		console.error("Generation failed:", error);
		await prisma_default.generation.update({
			where: { id: generationId },
			data: {
				status: "FAILED",
				errorMsg: error instanceof Error ? error.message : "Unknown error",
				completedAt: /* @__PURE__ */ new Date()
			}
		});
		await prisma_default.project.update({
			where: { id: projectId },
			data: { status: "ERROR" }
		});
	}
};
/**
* GET /generation/:id
* Get generation status and details
*/
generationRouter.get("/:id", authMiddleware, validateParams(IdParamSchema), asyncHandler(async (c) => {
	const user = c.get("user");
	const { id } = c.get("validatedParams");
	const generation = await prisma_default.generation.findFirst({
		where: {
			id,
			project: { userId: user.id }
		},
		include: {
			steps: { orderBy: { order: "asc" } },
			project: { select: {
				id: true,
				name: true
			} }
		}
	});
	if (!generation) return ApiResponseHelper.notFound(c, "Generation not found");
	return ApiResponseHelper.success(c, generation);
}));
/**
* POST /generation/:id/cancel
* Cancel an active generation
*/
generationRouter.post("/:id/cancel", authMiddleware, validateParams(IdParamSchema), asyncHandler(async (c) => {
	const user = c.get("user");
	const { id } = c.get("validatedParams");
	const generation = await prisma_default.generation.findFirst({
		where: {
			id,
			status: "RUNNING",
			project: { userId: user.id }
		},
		include: { project: true }
	});
	if (!generation) return ApiResponseHelper.notFound(c, "Active generation not found");
	await prisma_default.generation.update({
		where: { id },
		data: {
			status: "CANCELLED",
			completedAt: /* @__PURE__ */ new Date()
		}
	});
	await prisma_default.project.update({
		where: { id: generation.projectId },
		data: { status: "DRAFT" }
	});
	await AuthService.addCredits(user.id, 2);
	return ApiResponseHelper.success(c, null, "Generation cancelled successfully");
}));
var generation_default = generationRouter;

//#endregion
//#region src/index.ts
const app = new Hono();
app.use(logger());
const envOrigins = (process.env.CORS_ORIGIN || "").split(",").map((o) => o.trim()).filter(Boolean);
const defaultOrigins = [
	"http://localhost:3001",
	"http://localhost:3002",
	"http://localhost:4173",
	"http://127.0.0.1:3001",
	"http://127.0.0.1:3002",
	"http://127.0.0.1:4173",
	"https://paulohenriquejr.github.io"
];
const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]));
app.use("/*", cors({
	origin: (origin) => {
		if (!origin) return null;
		console.log(`CORS check for origin: ${origin}`);
		try {
			const u = new URL(origin);
			const base = `${u.protocol}//${u.host}`;
			if (origin.startsWith("https://paulohenriquejr.github.io")) {
				console.log(`GitHub Pages origin allowed: ${origin}`);
				return origin;
			}
			const allowed = allowedOrigins.includes(base);
			console.log(`Origin ${origin} allowed: ${allowed}`);
			return allowed ? origin : null;
		} catch (error) {
			console.log(`Invalid origin format: ${origin}`, error);
			return null;
		}
	},
	allowMethods: [
		"GET",
		"POST",
		"PUT",
		"DELETE",
		"OPTIONS"
	],
	allowHeaders: [
		"Content-Type",
		"Authorization",
		"X-Session-Token"
	],
	credentials: true
}));
app.get("/", (c) => {
	return ApiResponseHelper.success(c, {
		service: "AICodeGen API",
		version: "1.0.0",
		status: "healthy",
		timestamp: (/* @__PURE__ */ new Date()).toISOString()
	}, "Service is running");
});
app.get("/health", (c) => {
	return ApiResponseHelper.success(c, {
		status: "healthy",
		uptime: process.uptime(),
		timestamp: (/* @__PURE__ */ new Date()).toISOString()
	});
});
app.route("/api/auth", auth_default);
app.route("/api/projects", projects_default);
app.route("/api/generation", generation_default);
app.notFound((c) => {
	return ApiResponseHelper.notFound(c, "API endpoint not found");
});
app.onError((err, c) => {
	console.error("Server Error:", err);
	return ApiResponseHelper.internalError(c, "Internal server error");
});
const port = process.env.PORT ? parseInt(process.env.PORT) : 3e3;
var src_default = app;
if (process.env.NODE_ENV !== "production") serve({
	fetch: app.fetch,
	port
}, (info) => {
	console.log(`🚀 AICodeGen API Server is running on http://localhost:${info.port}`);
	console.log(`📚 Health check: http://localhost:${info.port}/health`);
	console.log(`🔑 Auth endpoints: http://localhost:${info.port}/api/auth/*`);
	console.log(`📁 Projects endpoints: http://localhost:${info.port}/api/projects/*`);
	console.log(`⚡ Generation endpoints: http://localhost:${info.port}/api/generation/*`);
});

//#endregion
export { src_default as default };