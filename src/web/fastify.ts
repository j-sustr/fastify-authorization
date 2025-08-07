import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import Fastify from "fastify";
import { createLogger, type LoggerConfig } from "./logger.ts";
import { AppEnv } from "../app/common/types.ts";

type Config = {
    env: AppEnv;
} & LoggerConfig;

export async function createFastify(config: Config) {
    const undefinedInDev = <T>(v: T) => (config.env === AppEnv.DEV ? undefined : v);

    const fastify = Fastify({
        connectionTimeout: undefinedInDev(5000),
        requestTimeout: undefinedInDev(5000),
        logger: createLogger(config),
        bodyLimit: 51200, // 50 KiB
        maxParamLength: 50,
    }).withTypeProvider<TypeBoxTypeProvider>();

    return fastify;
}
