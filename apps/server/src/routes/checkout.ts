import fastify from 'fastify';
import { z } from 'zod';
import { authenticate } from '../plugins/authenticate';
import { createOrder, updateOrder, getOrder } from '../services/order';
import { razorpay } from '../services/razorpay';

const createOrderSchema = z.object({
  amount: z.number().positive(),
  currency: z.string(),
});

const verifyPaymentSchema = z.object({
  razorpayPaymentId: z.string(),
  razorpayOrderId: z.string(),
  razorpaySignature: z.string(),
});

export default function (fastify: fastify.FastifyInstance) {
  fastify.post(
    '/api/checkout/razorpay/create-order',
    {
      schema: {
        body: createOrderSchema,
      },
      preValidation: [authenticate],
    },
    async (request, reply) => {
      const { amount, currency } = createOrderSchema.parse(request.body);
      const razorpayOrder = await razorpay.createOrder(amount, currency);
      const order = await createOrder(request.user.id, razorpayOrder.id, 'PENDING');
      return { order: order };
    }
  );

  fastify.post(
    '/api/checkout/razorpay/verify',
    {
      schema: {
        body: verifyPaymentSchema,
      },
      preValidation: [authenticate],
    },
    async (request, reply) => {
      const { razorpayPaymentId, razorpayOrderId, razorpaySignature } = verifyPaymentSchema.parse(request.body);
      const razorpayOrder = await razorpay.getOrder(razorpayOrderId);
      const razorpayPayment = await razorpay.getPayment(razorpayPaymentId);
      if (razorpaySignature === razorpay.generateSignature(razorpayOrder.id, razorpayPayment.id)) {
        await updateOrder(request.user.id, razorpayOrder.id, 'PAID');
        return { message: 'Payment verified and order updated' };
      } else {
        return { error: 'Invalid payment signature' };
      }
    }
  );

  fastify.post('/api/checkout/cod', {
    preValidation: [authenticate],
  }, async (request) => {
    await createOrder(request.user.id, null, 'COD_CONFIRMED');
    return { message: 'Order created with COD status' };
  });
}