import * as dotenv from "dotenv";
import { AppServer } from "./web/app-server.ts";
import { AppEnv, LogLevel } from "./app/common/types.ts";
import { createFastify } from "./web/fastify.ts";
import closeWithGrace from "close-with-grace";

async function start() {
  dotenv.config();

  const fastify = await createFastify({
    env: process.env.APP_ENV as AppEnv,
    logLevel: process.env.LOG_LEVEL as LogLevel,
  });

  fastify.log.info("WEBSITE_HOSTNAME=", process.env.WEBSITE_HOSTNAME);

  const app = new AppServer(fastify);

  closeWithGrace({ delay: 500 }, async ({ err }) => {
    if (err != null) {
      fastify.log.error(err);
    }

    await app.stop();
  });

  try {
    await app.start();
  } catch (error) {
    fastify.log.fatal(error, "Failed to start the server:");
    process.exit(1);
  }
}

start();
