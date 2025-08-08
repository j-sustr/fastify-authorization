import fp from "fastify-plugin";
import type { FastifyInstance, FastifyPluginOptions } from "fastify";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>;
  }
}

export default fp(
  async (fastify: FastifyInstance, opts: FastifyPluginOptions) => {
    fastify.decorate("authenticate", async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        fastify.log.error(err);

        reply.unauthorized("Unauthorized access");
      }

      
    });
  }
);
