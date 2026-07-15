import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../lib/prisma.js";

export async function collectionRoutes(app: FastifyInstance) {
  // GET /api/collections - list active
  app.get("/collections", async (_request: FastifyRequest, reply: FastifyReply) => {
    const collections = await prisma.collection.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    return reply.send(collections);
  });

  // GET /api/collections/:slug - single with products
  app.get("/collections/:slug", async (request: FastifyRequest<{ Params: { slug: string } }>, reply: FastifyReply) => {
    const { slug } = request.params;

    const collection = await prisma.collection.findUnique({
      where: { slug },
      include: {
        products: {
          include: {
            product: {
              include: {
                category: true,
                variants: true,
              },
            },
          },
        },
      },
    });

    if (!collection) {
      return reply.status(404).send({ error: "Collection not found" });
    }

    // Flatten the nested structure for convenience
    const result = {
      ...collection,
      products: collection.products.map((cp) => cp.product),
    };

    return reply.send(result);
  });
}