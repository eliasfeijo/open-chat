import { describe, expect, it } from "vitest";

import { appConfig } from "@/shared/config/app-config";

describe("appConfig", () => {
  it("declares the expected initial modules", () => {
    expect(appConfig.initialModules).toEqual([
      "auth",
      "users",
      "rooms",
      "tags",
      "messages",
      "search",
    ]);
  });

  it("describes the product foundation", () => {
    expect(appConfig.description).toContain("public chat platform");
    expect(appConfig.foundationAreas).toHaveLength(3);
  });
});
