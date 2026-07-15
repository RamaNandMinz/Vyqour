import { Router } from 'fastify';
import { CartService } from '../lib/cart.service';

const cartRouter = Router();

cartRouter.get('/', async (request, reply) => {
  const cartService = new CartService();
  const cart = await cartService.getCart();
  return reply.code(200).send(cart);
});

export default cartRouter;