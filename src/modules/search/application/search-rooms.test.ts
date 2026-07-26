import { describe, expect, it, vi } from "vitest";

import type { RoomSearchRepository } from "@/modules/search/application/ports/room-search-repository";
import { createSearchRooms } from "@/modules/search/application/search-rooms";

describe("createSearchRooms", () => {
  it("uses default discovery filters when none are provided", async () => {
    const roomSearchRepository = {
      search: vi.fn().mockResolvedValue([]),
    } satisfies Pick<RoomSearchRepository, "search">;

    const searchRooms = createSearchRooms({
      roomSearchRepository,
    });

    await searchRooms();

    expect(roomSearchRepository.search).toHaveBeenCalledWith({
      limit: 20,
      page: 1,
      query: null,
      tagSlug: null,
    });
  });

  it("normalizes query text and tag filters", async () => {
    const roomSearchRepository = {
      search: vi.fn().mockResolvedValue([]),
    } satisfies Pick<RoomSearchRepository, "search">;

    const searchRooms = createSearchRooms({
      roomSearchRepository,
    });

    await searchRooms({
      page: "2",
      query: "  builders  ",
      tagSlug: "  TypeScript  ",
    });

    expect(roomSearchRepository.search).toHaveBeenCalledWith({
      limit: 20,
      page: 2,
      query: "builders",
      tagSlug: "typescript",
    });
  });
});
