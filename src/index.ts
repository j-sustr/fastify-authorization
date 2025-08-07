import * as dotenv from "dotenv";
import { KyselyPgFactory } from "./infra/kysely-pg-factory.ts";
import { AppServer } from "./web/app-server.ts";
import { JwtService } from "./infra/jwt-service.ts";
import { FakeMetricsService } from "./infra/fake-metrics-service.ts";
import { AppEnv, LogLevel } from "./app/common/types.ts";
import { createFastify } from "./web/fastify.ts";

async function start() {
    dotenv.config();

    const fastify = await createFastify({
        env: process.env.APP_ENV as AppEnv,
        logLevel: process.env.LOG_LEVEL as LogLevel,
        logtailIngestingHost: process.env.LOGTAIL_INGESTING_HOST as string,
        logtailSourceToken: process.env.LOGTAIL_SOURCE_TOKEN as string,
    });

    fastify.log.info("WEBSITE_HOSTNAME=", process.env.WEBSITE_HOSTNAME);

    const jwtService = new JwtService(fastify.config.JWT_SECRET);

    const appDb = new KyselyPgFactory(fastify.config.APP_ENV, fastify.log).create({
        connectionString: fastify.config.DATABASE_URL,
    });

    const metricsService = new FakeMetricsService();

    const app = new AppServer(fastify, appDb, jwtService, metricsService);

    try {
        await app.start();
    } catch (error) {
        fastify.log.fatal(error, "Failed to start the server:");
        process.exit(1);
    }
}

start();
