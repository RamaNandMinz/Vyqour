import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import { prisma } from "./lib/prisma.js";
import { redis } from "./lib/redis.js";
import { auth } from "./lib/auth.js";

const app = Fastify({
  logger: {
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
  },
});

// Register plugins
await app.register(cors, {
  origin: true,
  credentials: true,
});

await app.register(cookie, {
  secret: process.env.BETTER_AUTH_SECRET || "change-me",
  parseOptions: {},
});

// Better Auth handler — delegates all /api/auth/* requests to Better Auth
app.all("/api/auth/*", async (request, reply) => {
  await auth.handler(request.raw, reply.raw);
  reply.hijack(); // prevent Fastify from sending its own response
});

// Test route to verify Better Auth session
app.get("/api/auth/session", async (request, _reply) => {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    return session || null;
  } catch (error) {
    request.log.error(error, "Error fetching session");
    return null;
  }
});

// Health check route
app.get("/health", async (_request, _reply) => {
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
  };
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  app.log.info(`Received ${signal}, shutting down gracefully...`);
  await app.close();
  await prisma.$disconnect();
  await redis.quit();
  process.exit(0);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

export default app;