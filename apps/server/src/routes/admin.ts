import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import prisma from '../lib/prisma.js';

export async function adminRoutes(app: FastifyInstance) {
  app.post('/admin/categories', {
    schema: {
      body: z.object({
        name: z.string().min(3).max(50),
        slug: z.string().min(3).max(50),
        type: z.string().min(3).max(50),
      }),
    },
    handler: async (request, reply) => {
      try {
        const { name, slug, type } = request.body;
        const category = await prisma.category.create({
          data: {
            name,
            slug,
            type,
          },
        });
        return category;
      } catch (error) {
        return reply.code(400).send(error);
      }
    },
  });

  app.post('/admin/products', {
    schema: {
      body: z.object({
        name: z.string().min(3).max(50),
        slug: z.string().min(3).max(50),
        description: z.string().min(10).max(200),
        categoryId: z.number().int().positive(),
        basePrice: z.number().int().positive(),
        quickSku: z.string().min(3).max(20),
        images: z.array(z.string().url()),
        isActive: z.boolean(),
        isBestSeller: z.boolean(),
        isNewArrival: z.boolean(),
      }),
    },
    handler: async (request, reply) => {
      try {
        const {
          name,
          slug,
          description,
          categoryId,
          basePrice,
          quickSku,
          images,
          isActive,
          isBestSeller,
          isNewArrival,
        } = request.body;
        const product = await prisma.product.create({
          data: {
            name,
            slug,
            description,
            categoryId,
            basePrice,
            quickSku,
            images,
            isActive,
            isBestSeller,
            isNewArrival,
          },
        });
        return product;
      } catch (error) {
        return reply.code(400).send(error);
      }
    },
  });

  app.post('/admin/collections', {
    schema: {
      body: z.object({
        name: z.string().min(3).max(50),
        slug: z.string().min(3).max(50),
        description: z.string().min(10).max(200),
        heroImage: z.string().url(),
        isActive: z.boolean(),
      }),
    },
    handler: async (request, reply) => {
      try {
        const { name, slug, description, heroImage, isActive } = request.body;
        const collection = await prisma.collection.create({
          data: {
            name,
            slug,
            description,
            heroImage,
            isActive,
          },
        });
        return collection;
      } catch (error) {
        return reply.code(400).send(error);
      }
    },
  });
}