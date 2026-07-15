import { FastifyInstance } from "fastify";
import { z } from "zod";
import crypto from "crypto";
import Razorpay from "razorpay";
import { prisma } from "../lib/prisma.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

const itemSchema = z.object({
  productVariantId: z.string(),
  quantity: z.number().int().positive(),
  priceAtPurchase: z.number().positive(),
});

const createOrderSchema = z.object({
  items: z.array(itemSchema),
  addressId: z.string(),
  userId: z.string().optional(),
  guestEmail: z.string().email().optional(),
});

const verifySchema = z.object({
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
});

const codSchema = z.object({
  items: z.array(itemSchema),
  addressId: z.string(),
  userId: z.string().optional(),
  guestEmail: z.string().email().optional(),
});

function calcTotal(items: { quantity: number; priceAtPurchase: number }[]) {
  return items.reduce((sum, i) => sum + i.quantity * i.priceAtPurchase, 0);
}

export async function checkoutRoutes(app: FastifyInstance) {
  // POST /checkout/razorpay/create-order
  app.post("/checkout/razorpay/create-order", async (request, reply) => {
    const parsed = createOrderSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.flatten() });
    }
    const { items, addressId, userId, guestEmail } = parsed.data;
    const totalAmount = calcTotal(items);

    try {
      const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(totalAmount * 100), // paise
        currency: "INR",
        receipt: `order_${Date.now()}`,
      });

      const order = await prisma.order.create({
        data: {
          userId,
          guestEmail,
          addressId,
          status: "PENDING",
          paymentMethod: "PREPAID",
          razorpayOrderId: razorpayOrder.id,
          totalAmount,
          items: {
            create: items.map((i) => ({
              productVariantId: i.productVariantId,
              quantity: i.quantity,
              priceAtPurchase: i.priceAtPurchase,
            })),
          },
        },
        include: { items: true },
      });

      return reply.send({
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        localOrderId: order.id,
      });
    } catch (err: any) {
      request.log.error(err);
      return reply.status(500).send({ error: "Failed to create order" });
    }
  });

  // POST /checkout/razorpay/verify
  app.post("/checkout/razorpay/verify", async (request, reply) => {
    const parsed = verifySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.flatten() });
    }
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = parsed.data;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return reply.status(400).send({ error: "Invalid payment signature" });
    }

    try {
      const order = await prisma.order.update({
        where: { razorpayOrderId },
        data: {
          status: "PAID",
          razorpayPaymentId,
        },
      });
      return reply.send({ success: true, order });
    } catch (err: any) {
      return reply.status(404).send({ error: "Order not found" });
    }
  });

  // POST /checkout/cod
  app.post("/checkout/cod", async (request, reply) => {
    const parsed = codSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.flatten() });
    }
    const { items, addressId, userId, guestEmail } = parsed.data;
    const totalAmount = calcTotal(items);

    try {
      const order = await prisma.order.create({
        data: {
          userId,
          guestEmail,
          addressId,
          status: "COD_CONFIRMED",
          paymentMethod: "COD",
          totalAmount,
          items: {
            create: items.map((i) => ({
              productVariantId: i.productVariantId,
              quantity: i.quantity,
              priceAtPurchase: i.priceAtPurchase,
            })),
          },
        },
        include: { items: true },
      });

      return reply.send({ success: true, order });
    } catch (err: any) {
      request.log.error(err);
      return reply.status(500).send({ error: "Failed to create COD order" });
    }
  });
}

