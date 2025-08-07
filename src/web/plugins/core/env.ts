import env from '@fastify/env'
import { Type, type Static } from '@sinclair/typebox';
import { AppEnv } from '../../../app/common/types.ts';

declare module "fastify" {
    export interface FastifyInstance {
        config: Env;
    }
}

const AppEnvTB = () =>
    Type.Union([
        Type.Literal(AppEnv.DEV),
        Type.Literal(AppEnv.PROD),
        Type.Literal(AppEnv.STG),
        Type.Literal(AppEnv.TEST),
    ]);

const NodeEnvTB = () => Type.Union([Type.Literal("development"), Type.Literal("production"), Type.Literal("test")]);

const EnvSchema = Type.Object({
    APP_ENV: AppEnvTB(),
    NODE_ENV: NodeEnvTB(),
    PORT: Type.Number({ minimum: 1, maximum: 65535 }),
    LOG_LEVEL: Type.Union([Type.Literal("debug"), Type.Literal("info"), Type.Literal("warn")]),
    STACK_TRACE_LIMIT: Type.Number({ minimum: 0, default: 3 }),
});

type Env = Static<typeof EnvSchema>;

export const autoConfig = {
  confKey: 'config',
  schema: EnvSchema,
  dotenv: false,
}

/**
 * This plugins helps to check environment variables.
 *
 * @see {@link https://github.com/fastify/fastify-env}
 */
export default env
