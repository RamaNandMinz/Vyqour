import fastify from 'fastify';
import { z } from 'zod';
import { authenticate } from '../plugins/authenticate';
import { getCart, addItem, updateItem, removeItem } from '../services/cart';

const addItemSchema = z.object({
  itemId: z.string().uuid(),
  quantity: z.number().positive(),
});

const updateItemSchema = z.object({
  itemId: z.string().uuid(),
  quantity: z.number().positive(),
});

const cartSchema = z.object({
  items: z.array(
    z.object({
      itemId: z.string().uuid(),
      quantity: z.number().positive(),
    })
  ),
});

export default function (fastify: fastify.FastifyInstance) {
  fastify.post(
    '/api/cart/add',
    {
      schema: {
        body: addItemSchema,
      },
      preValidation: [authenticate],
    },
    async (request, reply) => {
      const { itemId, quantity } = addItemSchema.parse(request.body);
      await addItem(request.user.id, itemId, quantity);
      return { message: 'Item added to cart' };
    }
  );

  fastify.get('/api/cart', {
    preValidation: [authenticate],
  }, async (request) => {
    return cartSchema.parse(await getCart(request.user.id));
  });

  fastify.patch('/api/cart/item/:itemId', {
    preValidation: [authenticate],
    schema: {
      params: z.object({
        itemId: z.string().uuid(),
      }),
      body: updateItemSchema,
    },
  }, async (request, reply) => {
    const { itemId, quantity } = updateItemSchema.parse(request.body);
    await updateItem(request.user.id, itemId, quantity);
    return { message: 'Item updated in cart' };
  });

  fastify.delete('/api/cart/item/:itemId', {
    preValidation: [authenticate],
    schema: {
      params: z.object({
        itemId: z.string().uuid(),
      }),
    },
  }, async (request, reply) => {
    const { itemId } = request.params;
    await removeItem(request.user.id, itemId);
    return { message: 'Item removed from cart' };
  });
}