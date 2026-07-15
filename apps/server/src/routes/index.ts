import { FastifyInstance } from "fastify";
import { categoryRoutes } from "./categories.js";
import { productRoutes } from "./products.js";
import { collectionRoutes } from "./collections.js";

export async function registerRoutes(app: FastifyInstance) {
  await app.register(categoryRoutes, { prefix: "/api" });
  await app.register(productRoutes, { prefix: "/api" });
  await app.register(collectionRoutes, { prefix: "/api" });
}