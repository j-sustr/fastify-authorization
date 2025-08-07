import fp from "fastify-plugin";
import fastifySwagger from "@fastify/swagger";
import type { OpenAPIV3_1 } from "openapi-types";

export const apiDocs: OpenAPIV3_1.Document<{}> = {
  openapi: "3.0.0",
  info: {
    title: "API Documentation",
    version: "0.1.0",
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  externalDocs: {
    url: "https://swagger.io",
    description: "Find more info here",
  },
};

export default fp(async function (fastify) {
  await fastify.register(fastifySwagger, {
    // hideUntagged: true,
    openapi: apiDocs,
  });

  await fastify.register(import("@scalar/fastify-api-reference"), {
    routePrefix: "/reference",
    configuration: {
      title: "API Reference",
    },
  });
});
