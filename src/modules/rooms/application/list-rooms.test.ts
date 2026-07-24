import { describe, expect, it, vi } from "vitest";

import { createListRooms } from "@/modules/rooms/application/list-rooms";
import type { RoomRepository } from "@/modules/rooms/application/ports/room-repository";

describe("createListRooms", () => {
  it("uses the default listing limit when none is provided", async () => {
    const rooms = [
      {
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        description: null,
        id: "4f833765-a31e-4c93-bd73-39bdaec1a9b9",
        name: "OpenChat Builders",
        ownerUserId: "user-1",
        slug: "openchat-builders",
        topic: "Architecture",
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      },
    ];
    const roomRepository = {
      list: vi.fn().mockResolvedValue(rooms),
    } satisfies Pick<RoomRepository, "list">;

    const listRooms = createListRooms({
      roomRepository,
    });

    await expect(listRooms()).resolves.toEqual(rooms);
    expect(roomRepository.list).toHaveBeenCalledWith({
      limit: 20,
    });
  });

  it("passes through an explicit listing limit", async () => {
    const roomRepository = {
      list: vi.fn().mockResolvedValue([]),
    } satisfies Pick<RoomRepository, "list">;

    const listRooms = createListRooms({
      roomRepository,
    });

    await listRooms({ limit: 12 });

    expect(roomRepository.list).toHaveBeenCalledWith({
      limit: 12,
    });
  });
});
