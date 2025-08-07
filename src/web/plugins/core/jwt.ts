import fastifyJwt, { type FastifyJWTOptions } from "@fastify/jwt";

export const autoConfig: FastifyJWTOptions = {
  secret: "supersecret",
  sign: {
    expiresIn: "1h",
  },
};

export default fastifyJwt;
