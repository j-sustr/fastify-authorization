import type { Static } from "@sinclair/typebox";
import { Type } from "@sinclair/typebox";
import { AppEnv } from "./app/common/types.ts";

const AppEnvTB = () =>
    Type.Union([
        Type.Literal(AppEnv.DEV),
        Type.Literal(AppEnv.PROD),
        Type.Literal(AppEnv.STG),
        Type.Literal(AppEnv.TEST),
    ]);

const NodeEnvTB = () => Type.Union([Type.Literal("development"), Type.Literal("production"), Type.Literal("test")]);

export const EnvSchema = Type.Object({
    APP_ENV: AppEnvTB(),
    NODE_ENV: NodeEnvTB(),
    PORT: Type.Number({ minimum: 1, maximum: 65535 }),
    LOG_LEVEL: Type.Union([Type.Literal("debug"), Type.Literal("info"), Type.Literal("warn")]),
    STACK_TRACE_LIMIT: Type.Number({ minimum: 0, default: 3 }),
});

export type Env = Static<typeof EnvSchema>;
