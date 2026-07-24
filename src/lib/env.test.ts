import { describe, expect, it } from "vitest";

import { parseServerEnv } from "@/lib/env";

describe("parseServerEnv", () => {
  it("parses the required server environment contract", () => {
    const env = parseServerEnv({
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/open_chat",
      BETTER_AUTH_SECRET: "development-secret",
      BETTER_AUTH_URL: "http://localhost:3000",
      UPSTASH_REDIS_REST_URL: "https://example.upstash.io",
      UPSTASH_REDIS_REST_TOKEN: "token",
    });

    expect(env.BETTER_AUTH_URL).toBe("http://localhost:3000");
    expect(env.DATABASE_URL).toContain("open_chat");
  });
});
