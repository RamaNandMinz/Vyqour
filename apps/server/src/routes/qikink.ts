import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";

const webhookSchema = z.object({
  qikinkOrderId: z.string(),
  status: z.string(),
});

function mapQikinkStatus(status: string): "SHIPPED" | "DELIVERED" | "CANCELLED" | null {
  const s = status.toLowerCase();
  if (s === "shipped") return "SHIPPED";
  if (s === "delivered") return "DELIVERED";
  if (s === "cancelled" || s === "canceled") return "CANCELLED";
  return null;
}

export async function qikinkRoutes(app: FastifyInstance) {
  // POST /qikink/webhook/order-status
  app.post("/qikink/webhook/order-status", async (request, reply) => {
    const parsed = webhookSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.flatten() });
    }
    const { qikinkOrderId, status } = parsed.data;

    const mappedStatus = mapQikinkStatus(status);
    if (!mappedStatus) {
      return reply.status(400).send({ error: `Unrecognized status: ${status}` });
    }

    try {
      const order = await prisma.order.update({
        where: { qikinkOrderId },
        data: { status: mappedStatus },
      });
      return reply.send({ success: true, order });
    } catch (err: any) {
      return reply.status(404).send({ error: "Order not found for this qikinkOrderId" });
    }
  });
}

// Helper: push an order to Qikink for fulfillment
export async function pushOrderToQikink(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          productVariant: {
            include: { product: true },
          },
        },
      },
      address: true,
    },
  });

  if (!order) {
    throw new Error(`Order ${orderId} not found`);
  }

  const payload = {
    order_number: order.id,
    qikink_shipping: "1",
    gateway: order.paymentMethod === "COD" ? "COD" : "PREPAID",
    total_order_value: String(order.totalAmount),
    line_items: order.items.map((item) => ({
      search_from_my_products: "1",
      quantity: item.quantity,
      sku: item.productVariant.sku,
      price: String(item.priceAtPurchase),
    })),
    shipping_address: {
      first_name: order.guestEmail ?? "Customer",
      address: order.address.line1,
      address2: order.address.line2 ?? "",
      city: order.address.city,
      province: order.address.state,
      zip: order.address.pincode,
      phone: order.address.phone,
      country_code: "IN",
    },
  };

  const response = await fetch("https://api.qikink.com/api/order/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ClientId: process.env.QIKINK_CLIENT_ID || "",
      Accesstoken: process.env.QIKINK_API_KEY || "",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Qikink order push failed: ${response.status} ${errText}`);
  }

  const data = await response.json();
  const qikinkOrderId = data.order_id || data.id || null;

  if (qikinkOrderId) {
    await prisma.order.update({
      where: { id: orderId },
      data: { qikinkOrderId: String(qikinkOrderId) },
    });
  }

  return data;
}

