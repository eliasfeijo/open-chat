import { describe, expect, it, vi } from "vitest";

import { createGetRoomBySlug } from "@/modules/rooms/application/get-room-by-slug";
import type { RoomRepository } from "@/modules/rooms/application/ports/room-repository";

describe("createGetRoomBySlug", () => {
  it("normalizes the slug before reading the room", async () => {
    const room = {
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      description: "Talk about architecture and product tradeoffs.",
      id: "4f833765-a31e-4c93-bd73-39bdaec1a9b9",
      name: "OpenChat Builders",
      ownerUserId: "user-1",
      slug: "openchat-builders",
      topic: "Shipping the first public room flows",
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    };
    const roomRepository = {
      findBySlug: vi.fn().mockResolvedValue(room),
    } satisfies Pick<RoomRepository, "findBySlug">;

    const getRoomBySlug = createGetRoomBySlug({
      roomRepository,
    });

    await expect(getRoomBySlug("  OpenChat-Builders  ")).resolves.toEqual(room);
    expect(roomRepository.findBySlug).toHaveBeenCalledWith("openchat-builders");
  });

  it("rejects an invalid slug before reading persistence", async () => {
    const roomRepository = {
      findBySlug: vi.fn(),
    } satisfies Pick<RoomRepository, "findBySlug">;

    const getRoomBySlug = createGetRoomBySlug({
      roomRepository,
    });

    await expect(getRoomBySlug("invalid slug")).rejects.toThrow();
    expect(roomRepository.findBySlug).not.toHaveBeenCalled();
  });
});
