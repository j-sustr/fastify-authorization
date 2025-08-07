

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

declare module '@fastify/session' {
  interface FastifySessionObject {
    user_id?: string;
    state?: string; // For OAuth state
    email?: string;
    access_token?: string;
    id_token?: string;
    userinfo?: Record<string, unknown>;
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
        const isDev = this._env === AppEnv.DEV;

        await f.register(fastifySensible);

        const errorHandler = new ErrorHandler(this._metricsService);
        f.setErrorHandler(errorHandler.handle.bind(errorHandler));

        // DEBUG
        // f.addHook("onRequest", async (request, reply) => {
        //     f.log.info(`[onRequest] Received request: ${request.method} ${request.url} from IP: ${request.ip}`);
        //     f.log.info(`[onRequest] Headers: ${JSON.stringify(request.headers)}`);
        // });

        // f.addHook("preParsing", async (request, reply) => {
        //     f.log.info("Before parsing the request body");
        // });

        // f.addHook("preValidation", async (request, reply) => {
        //     f.log.info("Before request validation");
        // });

        // f.addHook("preHandler", async (request, reply) => {
        //     f.log.info("Before handler execution");
        // });

        await f.register(apiAuthGuard, {
            prefix: "/api/v1",
        });

        await f.register(fastifyBasicAuth, {
            validate: async (username, password, request, reply) => {
                if (username === "admin" && password === f.config.API_DOCS_PASSWORD) {
                    return;
                }
                return reply.unauthorized("Invalid credentials");
            },
            authenticate: true,
        });

        await f.addHook("onRequest", (request, reply, done) => {
            const docsRoutes = ["/api-docs", "/reference"];
            if (docsRoutes.some((prefix) => request.url.startsWith(prefix))) {
                f.basicAuth(request, reply, done);
            } else {
                done();
            }
        });

        await f.register(fastifyAutoload, {
            dir: join(__dirname, "routes"),
            routeParams: true
        });

        f.setNotFoundHandler((request, reply) => {
            request.log.warn(`404 Not Found: ${request.method} ${request.url}`);

            reply.status(404).send({
                error: "Not Found",
                message: `Route ${request.method}:${request.url} not found`,
            });
        });

        await f.ready();
        // f.swagger();
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
