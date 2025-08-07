import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export default async function (fastify: FastifyInstance) {
  fastify.addHook(
    "onRequest",
    async (request: FastifyRequest, reply: FastifyReply) => {
        await fastify.authenticate(request, reply);
    }
  );
}
