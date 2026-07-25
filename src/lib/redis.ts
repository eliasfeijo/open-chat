import { Redis } from "@upstash/redis";

import { getServerEnv } from "@/lib/env";

const redisKey = Symbol.for("openchat.redis");

type GlobalWithRedis = typeof globalThis & {
  [redisKey]?: Redis;
};

export function getRedis() {
  const globalScope = globalThis as GlobalWithRedis;

  if (!globalScope[redisKey]) {
    const serverEnv = getServerEnv();

    globalScope[redisKey] = new Redis({
      token: serverEnv.UPSTASH_REDIS_REST_TOKEN,
      url: serverEnv.UPSTASH_REDIS_REST_URL,
    });
  }

  return globalScope[redisKey];
}
