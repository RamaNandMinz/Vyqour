import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";

const CategoryTypeEnum = z.enum(["PRIMARY", "ACCESSORY"]);

const listCategoriesQuerySchema = z.object({
  type: CategoryTypeEnum.optional(),
});

export async function categoryRoutes(app: FastifyInstance) {
  // GET /api/categories - list all, filterable by type PRIMARY/ACCESSORY
  app.get("/categories", async (request: FastifyRequest, reply: FastifyReply) => {
    const query = listCategoriesQuerySchema.safeParse(request.query);
    if (!query.success) {
      return reply.status(400).send({
        error: "Invalid query parameters",
        details: query.error.flatten(),
      });
    }

    const where: Record<string, unknown> = {};
    if (query.data.type) {
      where.type = query.data.type;
    }

    const categories = await prisma.category.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return reply.send(categories);
  });

  // GET /api/categories/:slug - single category with its products
  app.get("/categories/:slug", async (request: FastifyRequest<{ Params: { slug: string } }>, reply: FastifyReply) => {
    const { slug } = request.params;

    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        products: {
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!category) {
      return reply.status(404).send({ error: "Category not found" });
    }

    return reply.send(category);
  });
}