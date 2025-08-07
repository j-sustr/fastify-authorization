
import type { FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest } from "fastify";

export default async function endpoint(fastify: FastifyInstance, options: FastifyPluginOptions) {
    fastify.get("/", async (_request: FastifyRequest, reply: FastifyReply) => {

        reply.code(200).send({ message: "Action A" });
    });
}
