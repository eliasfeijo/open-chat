import { describe, expect, it } from "vitest";

import {
  roomSearchResultSchema,
  searchRoomsSchema,
} from "@/modules/search/validation";

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

  it("requires room search activity counters and timestamps", () => {
    const now = new Date("2026-01-01T00:00:00.000Z");

    expect(
      roomSearchResultSchema.parse({
        createdAt: now,
        description: null,
        id: "2f91cdcc-69e1-4cc0-b8f1-9ed4a0392f0a",
        latestMessageAt: now,
        memberCount: 3,
        messageCount: 17,
        name: "Golang",
        ownerUserId: "user-1",
        slug: "golang",
        tags: [],
        topic: "Programming",
        updatedAt: now,
      }),
    ).toMatchObject({
      latestMessageAt: now,
      memberCount: 3,
      messageCount: 17,
      name: "Golang",
      slug: "golang",
    });
  });
});
