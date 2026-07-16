import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";

const categorySchema = z.object({
  name: z.string(),
  slug: z.string(),
  type: z.enum(["PRIMARY", "ACCESSORY"]),
});

const productSchema = z.object({
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  categoryId: z.string(),
  basePrice: z.number(),
  qikinkSku: z.string().optional(),
  images: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  isBestSeller: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
});

const collectionSchema = z.object({
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  heroImage: z.string().optional(),
  isActive: z.boolean().default(true),
});

export async function adminRoutes(app: FastifyInstance) {
  app.post("/admin/categories", async (request, reply) => {
    const parsed = categorySchema.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: parsed.error.flatten() });
    try {
      const category = await prisma.category.create({ data: parsed.data });
      return reply.send(category);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });

  app.post("/admin/products", async (request, reply) => {
    const parsed = productSchema.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: parsed.error.flatten() });
    try {
      const product = await prisma.product.create({ data: parsed.data });
      return reply.send(product);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });

  app.post("/admin/collections", async (request, reply) => {
    const parsed = collectionSchema.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: parsed.error.flatten() });
    try {
      const collection = await prisma.collection.create({ data: parsed.data });
      return reply.send(collection);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });
}
