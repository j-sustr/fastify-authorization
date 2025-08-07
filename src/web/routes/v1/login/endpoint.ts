import type { FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest } from "fastify";

export default async function endpoint(fastify: FastifyInstance, options: FastifyPluginOptions) {
    fastify.get("/", async (_request: FastifyRequest, reply: FastifyReply) => {

        const user = { id: 1, name: 'Alice' };

        // Sign the JWT token and send it back to the client.
        const token = reply.jwtSign(user);
        
        return { token };
    });
}
