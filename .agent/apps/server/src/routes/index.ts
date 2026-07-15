import fastify from 'fastify';
import categories from './categories';
import products from './products';
import collections from './collections';
import cart from './cart';
import checkout from './checkout';

export default function (fastify: fastify.FastifyInstance) {
  fastify.register(categories);
  fastify.register(products);
  fastify.register(collections);
  fastify.register(cart);
  fastify.register(checkout);
}