import fastifyAutoload from "@fastify/autoload";
import type { FastifyInstance } from "fastify";
import type { AddressInfo } from "node:net";
import path from "node:path";
import { AppEnv } from "../app/common/types.ts";

declare module "fastify" {
  export interface FastifyInstance {}
}

export class AppServer {
  get _env() {
    return this._fastify.config.APP_ENV;
  }

  get port() {
    return this._fastify.config.PORT;
  }

  constructor(private readonly _fastify: FastifyInstance) {}

  private async _build() {
    const f = this._fastify;

    await f.register(fastifyAutoload, {
      dir: path.join(import.meta.dirname, "plugins/core"),
    });

    f.register(fastifyAutoload, {
      dir: path.join(import.meta.dirname, "plugins/app"),
    });

    f.register(fastifyAutoload, {
      dir: path.join(import.meta.dirname, "routes"),
      routeParams: true,
      autoHooks: true,
      cascadeHooks: true,
    });

    // DEBUG
    // f.addHook("onRequest", async (request, reply) => {
    //     f.log.info(`[onRequest] Received request: ${request.method} ${request.url} from IP: ${request.ip}`);
    //     f.log.info(`[onRequest] Headers: ${JSON.stringify(request.headers)}`);
    // });

    f.setNotFoundHandler((request, reply) => {
      request.log.warn(`404 Not Found: ${request.method} ${request.url}`);

      reply.status(404).send({
        error: "Not Found",
        message: `Route ${request.method}:${request.url} not found`,
      });
    });

    await f.ready();
  }

  async start() {
    await this._build();

    await this._fastify.listen({
      port: this._fastify.config.PORT,
    });

    if (this._env === AppEnv.DEV) {
      console.log("--- Fastify Routes ---");
      console.log(".");
      console.log(this._fastify.printRoutes());
      console.log("--------------------");
    }

    return this;
  }

  async stop() {
    if (!this._fastify) {
      throw new Error("Server is not running");
    }
    await this._fastify.close();
  }

  getAddress(): AddressInfo {
    if (!this._fastify) {
      throw new Error("Server is not running");
    }
    const address = this._fastify.server.address();
    if (!address || typeof address === "string") {
      throw new Error("Server address is not available");
    }
    return address;
  }
}
