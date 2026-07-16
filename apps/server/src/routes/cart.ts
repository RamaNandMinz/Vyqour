import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";

const addItemSchema = z.object({
  productVariantId: z.string(),
  quantity: z.number().int().positive(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
});

const updateItemSchema = z.object({ quantity: z.number().int().positive() });

async function getOrCreateCart(userId?: string, sessionId?: string) {
  if (!userId && !sessionId) throw new Error("userId or sessionId is required");
  const existing = await prisma.cart.findFirst({ where: userId ? { userId } : { sessionId } });
  if (existing) return existing;
  return prisma.cart.create({ data: { userId, sessionId } });
}

export async function cartRoutes(app: FastifyInstance) {
  app.post("/cart/add", async (request, reply) => {
    const parsed = addItemSchema.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: parsed.error.flatten() });
    const { productVariantId, quantity, userId, sessionId } = parsed.data;
    try {
      const cart = await getOrCreateCart(userId, sessionId);
      const existingItem = await prisma.cartItem.findFirst({ where: { cartId: cart.id, productVariantId } });
      let item;
      if (existingItem) {
        item = await prisma.cartItem.update({ where: { id: existingItem.id }, data: { quantity: existingItem.quantity + quantity } });
      } else {
        item = await prisma.cartItem.create({ data: { cartId: cart.id, productVariantId, quantity } });
      }
      return reply.send({ cartId: cart.id, item });
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });

  app.get("/cart", async (request, reply) => {
    const { userId, sessionId } = request.query as { userId?: string; sessionId?: string };
    if (!userId && !sessionId) return reply.status(400).send({ error: "userId or sessionId query param is required" });
    const cart = await prisma.cart.findFirst({
      where: userId ? { userId } : { sessionId },
      include: { items: { include: { productVariant: { include: { product: true } } } } },
    });
    if (!cart) return reply.send({ cart: null, items: [], total: 0 });
    const total = cart.items.reduce((sum, item) => {
      const price = item.productVariant.priceOverride ?? item.productVariant.product.basePrice;
      return sum + price * item.quantity;
    }, 0);
    return reply.send({ cart, items: cart.items, total });
  });

  app.patch("/cart/item/:itemId", async (request, reply) => {
    const { itemId } = request.params as { itemId: string };
    const parsed = updateItemSchema.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: parsed.error.flatten() });
    try {
      const updated = await prisma.cartItem.update({ where: { id: itemId }, data: { quantity: parsed.data.quantity } });
      return reply.send({ item: updated });
    } catch {
      return reply.status(404).send({ error: "Cart item not found" });
    }
  });

  app.delete("/cart/item/:itemId", async (request, reply) => {
    const { itemId } = request.params as { itemId: string };
    try {
      await prisma.cartItem.delete({ where: { id: itemId } });
      return reply.send({ success: true });
    } catch {
      return reply.status(404).send({ error: "Cart item not found" });
    }
  });
}
