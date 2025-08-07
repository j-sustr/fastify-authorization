import type { LogLevel } from "fastify";
import { AppEnv } from "../app/common/types.ts";
import pino from "pino";

export interface LoggerConfig {
    env: AppEnv;
    logLevel: LogLevel;
}

export function createLogger(config: LoggerConfig) {
    const commonLogOptions = {
        level: config.logLevel,
    };

    const productionLogs: pino.LoggerOptions = {
        ...commonLogOptions,
        base: {
            env: shortenEnvName(config.env),
        },
        transport: {
            targets: [
                {
                    target: "pino/file", // logs to the standard output by default
                },
            ],
        },
    };

    const prettyLogs: pino.LoggerOptions = {
        ...commonLogOptions,
        transport: {
            target: "pino-pretty",
            options: {
                translateTime: "HH:MM:ss Z",
                ignore: "pid,hostname",
            },
        },
    };

    switch (config.env) {
        case AppEnv.DEV:
            return prettyLogs;
        case AppEnv.TEST:
            return prettyLogs;
        case AppEnv.STG:
        case AppEnv.PROD:
            return productionLogs;
        default:
            throw new Error(`Unknown environment: ${config.env}`);
    }
}

function shortenEnvName(env: AppEnv): string {
    switch (env) {
        case AppEnv.DEV:
            return "dev";
        case AppEnv.TEST:
            return "test";
        case AppEnv.STG:
            return "stg";
        case AppEnv.PROD:
            return "prod";
        default:
            throw new Error(`Unhandled environment value in shortenEnvName: ${env}`);
    }
}
