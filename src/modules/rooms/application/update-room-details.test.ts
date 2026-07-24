import { describe, expect, it, vi } from "vitest";

import type { RoomRepository } from "@/modules/rooms/application/ports/room-repository";
import { createUpdateRoomDetails } from "@/modules/rooms/application/update-room-details";
import {
  RoomNotFoundError,
  RoomUpdateForbiddenError,
  UnauthenticatedRoomEditorError,
} from "@/modules/rooms/domain/room-errors";

describe("createUpdateRoomDetails", () => {
  it("updates room details when the actor owns the room", async () => {
    const existingRoom = {
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      description: "Talk about architecture and product tradeoffs.",
      id: "4f833765-a31e-4c93-bd73-39bdaec1a9b9",
      name: "OpenChat Builders",
      ownerUserId: "user-1",
      slug: "openchat-builders",
      topic: "Shipping the first public room flows",
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    };
    const updatedRoom = {
      ...existingRoom,
      description: "Talk about architecture, product, and release sequencing.",
      name: "OpenChat Maintainers",
      topic: "Phase 1 owner room management",
      updatedAt: new Date("2026-01-02T00:00:00.000Z"),
    };
    const roomRepository = {
      findById: vi.fn().mockResolvedValue(existingRoom),
      updateDetailsById: vi.fn().mockResolvedValue(updatedRoom),
    } satisfies Pick<RoomRepository, "findById" | "updateDetailsById">;

    const updateRoomDetails = createUpdateRoomDetails({
      roomRepository,
    });

    await expect(
      updateRoomDetails({
        actorUserId: "user-1",
        description:
          "Talk about architecture, product, and release sequencing.",
        name: "OpenChat Maintainers",
        roomId: "4f833765-a31e-4c93-bd73-39bdaec1a9b9",
        topic: "Phase 1 owner room management",
      }),
    ).resolves.toEqual(updatedRoom);

    expect(roomRepository.updateDetailsById).toHaveBeenCalledWith({
      description: "Talk about architecture, product, and release sequencing.",
      name: "OpenChat Maintainers",
      roomId: "4f833765-a31e-4c93-bd73-39bdaec1a9b9",
      topic: "Phase 1 owner room management",
    });
  });

  it("rejects updates for a missing room", async () => {
    const roomRepository = {
      findById: vi.fn().mockResolvedValue(null),
      updateDetailsById: vi.fn(),
    } satisfies Pick<RoomRepository, "findById" | "updateDetailsById">;

    const updateRoomDetails = createUpdateRoomDetails({
      roomRepository,
    });

    await expect(
      updateRoomDetails({
        actorUserId: "user-1",
        description: "",
        name: "OpenChat Maintainers",
        roomId: "4f833765-a31e-4c93-bd73-39bdaec1a9b9",
        topic: "",
      }),
    ).rejects.toBeInstanceOf(RoomNotFoundError);

    expect(roomRepository.updateDetailsById).not.toHaveBeenCalled();
  });

  it("rejects updates from non-owners", async () => {
    const roomRepository = {
      findById: vi.fn().mockResolvedValue({
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        description: null,
        id: "4f833765-a31e-4c93-bd73-39bdaec1a9b9",
        name: "OpenChat Builders",
        ownerUserId: "user-1",
        slug: "openchat-builders",
        topic: null,
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      }),
      updateDetailsById: vi.fn(),
    } satisfies Pick<RoomRepository, "findById" | "updateDetailsById">;

    const updateRoomDetails = createUpdateRoomDetails({
      roomRepository,
    });

    await expect(
      updateRoomDetails({
        actorUserId: "user-2",
        description: "",
        name: "OpenChat Maintainers",
        roomId: "4f833765-a31e-4c93-bd73-39bdaec1a9b9",
        topic: "",
      }),
    ).rejects.toBeInstanceOf(RoomUpdateForbiddenError);

    expect(roomRepository.updateDetailsById).not.toHaveBeenCalled();
  });

  it("rejects unauthenticated room editing before persistence", async () => {
    const roomRepository = {
      findById: vi.fn(),
      updateDetailsById: vi.fn(),
    } satisfies Pick<RoomRepository, "findById" | "updateDetailsById">;

    const updateRoomDetails = createUpdateRoomDetails({
      roomRepository,
    });

    await expect(
      updateRoomDetails({
        actorUserId: null,
        description: "Talk about architecture and product tradeoffs.",
        name: "OpenChat Maintainers",
        roomId: "4f833765-a31e-4c93-bd73-39bdaec1a9b9",
        topic: "Phase 1 owner room management",
      }),
    ).rejects.toBeInstanceOf(UnauthenticatedRoomEditorError);

    expect(roomRepository.findById).not.toHaveBeenCalled();
    expect(roomRepository.updateDetailsById).not.toHaveBeenCalled();
  });
});
