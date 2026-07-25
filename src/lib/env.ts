import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_URL: z.url(),
  BETTER_AUTH_SECRET: z.string().min(1),
  BETTER_AUTH_URL: z.url(),
  NEXT_PUBLIC_REALTIME_WS_URL: z.url().optional(),
  REALTIME_GATEWAY_PORT: z.coerce
    .number()
    .int()
    .positive()
    .max(65535)
    .optional(),
  UPSTASH_REDIS_REST_URL: z.url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function parseServerEnv(
  env: Record<string, string | undefined>,
): ServerEnv {
  return serverEnvSchema.parse(env);
}

export function getServerEnv(): ServerEnv {
  return parseServerEnv(process.env);
}
