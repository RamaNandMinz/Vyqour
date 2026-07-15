import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";

const listProductsQuerySchema = z.object({
  category: z.string().optional(),
  isNewArrival: z
    .string()
    .optional()
    .transform((val) => (val === "true" ? true : val === "false" ? false : undefined)),
  isBestSeller: z
    .string()
    .optional()
    .transform((val) => (val === "true" ? true : val === "false" ? false : undefined)),
});

export async function productRoutes(app: FastifyInstance) {
  // GET /api/products - list, with query params for category, isNewArrival, isBestSeller
  app.get("/products", async (request: FastifyRequest, reply: FastifyReply) => {
    const query = listProductsQuerySchema.safeParse(request.query);
    if (!query.success) {
      return reply.status(400).send({
        error: "Invalid query parameters",
        details: query.error.flatten(),
      });
    }

    const where: Record<string, unknown> = {
      isActive: true,
    };

    if (query.data.category) {
      where.category = {
        slug: query.data.category,
      };
    }

    if (query.data.isNewArrival !== undefined) {
      where.isNewArrival = query.data.isNewArrival;
    }

    if (query.data.isBestSeller !== undefined) {
      where.isBestSeller = query.data.isBestSeller;
    }

    // If any filter is applied, limit to 8 results
    const hasFilters = query.data.category || query.data.isNewArrival !== undefined || query.data.isBestSeller !== undefined;
    const take = hasFilters ? 8 : undefined;

    const products = await prisma.product.findMany({
      where,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        variants: true,
      },
    });

    return reply.send(products);
  });

  // GET /api/products/:slug - single product with variants
  app.get("/products/:slug", async (request: FastifyRequest<{ Params: { slug: string } }>, reply: FastifyReply) => {
    const { slug } = request.params;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        variants: true,
      },
    });

    if (!product) {
      return reply.status(404).send({ error: "Product not found" });
    }

    return reply.send(product);
  });
}