import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { FastifyInstance } from "fastify";
import fastifySensible from "@fastify/sensible";
import fastifyAutoload from "@fastify/autoload";
import type { AddressInfo } from "node:net";
import type { Env } from "../env-schema.ts";
import { AppEnv } from "../app/common/types.ts";
import fastifyJwt from "@fastify/jwt";
import fastifySwagger from "@fastify/swagger";
import { apiDocs } from "./api-docs.ts";


const __dirname = dirname(fileURLToPath(import.meta.url));

declare module "fastify" {
    export interface FastifyInstance {
        config: Env;
    }

    interface Session {
        user_id: number;
        id?: number
    }
}

export class AppServer {
    get _env() {
        return this._fastify.config.APP_ENV;
    }

    get port() {
        return this._fastify.config.PORT;
    }

    constructor(
        private readonly _fastify: FastifyInstance,
    ) {}

    private async _build() {
        const f = this._fastify;

        await f.register(fastifyJwt, {
            secret: "supersecret",
            sign: {
                expiresIn: "1h",
                
            }
        });

        await f.register(fastifySensible);

        // DEBUG
        // f.addHook("onRequest", async (request, reply) => {
        //     f.log.info(`[onRequest] Received request: ${request.method} ${request.url} from IP: ${request.ip}`);
        //     f.log.info(`[onRequest] Headers: ${JSON.stringify(request.headers)}`);
        // });

        await f.register(fastifySwagger, {
            openapi: apiDocs,
        });
        await f.register(import("@scalar/fastify-api-reference"), {
            routePrefix: "/reference",
            configuration: {
                title: "API Reference",
            },
        });

        await f.register(fastifyAutoload, {
            dir: join(__dirname, "routes"),
            routeParams: true,
            autoHooks: true
        });

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

        try {
            await this._fastify.listen({ host: "::", port: this._fastify.config.PORT });

            if (this._env === AppEnv.DEV) {
                console.log("--- Fastify Routes ---");
                console.log(".");
                console.log(this._fastify.printRoutes());
                console.log("--------------------");
            }

            return this;
        } catch (err) {
            this._fastify.log.error(err);
            throw err;
        }
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
