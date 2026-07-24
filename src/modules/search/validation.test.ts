import { describe, expect, it } from "vitest";

import { searchRoomsSchema } from "@/modules/search/validation";

describe("searchRoomsSchema", () => {
  it("normalizes empty filters to null", () => {
    expect(searchRoomsSchema.parse({ query: "  ", tagSlug: "" })).toEqual({
      limit: 20,
      query: null,
      tagSlug: null,
    });
  });

  it("normalizes query text and tag slug filters", () => {
    expect(
      searchRoomsSchema.parse({
        limit: "12",
        query: "  builders  ",
        tagSlug: "  TypeScript  ",
      }),
    ).toEqual({
      limit: 12,
      query: "builders",
      tagSlug: "typescript",
    });
  });
});
