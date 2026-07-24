import { describe, expect, it, vi } from "vitest";

import { createCreateRoom } from "@/modules/rooms/application/create-room";
import type { RoomMembershipRepository } from "@/modules/rooms/application/ports/room-membership-repository";
import type { RoomRepository } from "@/modules/rooms/application/ports/room-repository";
import {
  RoomSlugAlreadyExistsError,
  UnauthenticatedRoomCreatorError,
} from "@/modules/rooms/domain/room-errors";

describe("createCreateRoom", () => {
  it("creates a room and assigns the creator as the owner in one transaction", async () => {
    const createdRoom = {
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
      findBySlug: vi.fn().mockResolvedValue(null),
    } satisfies Pick<RoomRepository, "findBySlug">;
    const transactionRoomRepository = {
      create: vi.fn().mockResolvedValue(createdRoom),
    } satisfies Pick<RoomRepository, "create">;
    const roomMembershipRepository = {
      create: vi.fn().mockImplementation(async (membership) => membership),
    } satisfies Pick<RoomMembershipRepository, "create">;
    const assignTagsToRoom = vi.fn().mockResolvedValue([]);
    const runInTransaction = vi.fn(async (operation) =>
      operation({
        assignTagsToRoom,
        roomMembershipRepository,
        roomRepository: transactionRoomRepository,
      }),
    );

    const createRoom = createCreateRoom({
      roomRepository,
      runInTransaction,
    });

    await expect(
      createRoom({
        actorUserId: "user-1",
        description: "Talk about architecture and product tradeoffs.",
        name: "OpenChat Builders",
        slug: "openchat-builders",
        tagSlugs: ["architecture", "product"],
        topic: "Shipping the first public room flows",
      }),
    ).resolves.toEqual(createdRoom);

    expect(assignTagsToRoom).toHaveBeenCalledWith({
      roomId: "4f833765-a31e-4c93-bd73-39bdaec1a9b9",
      tagSlugs: ["architecture", "product"],
    });

    expect(transactionRoomRepository.create).toHaveBeenCalledWith({
      description: "Talk about architecture and product tradeoffs.",
      name: "OpenChat Builders",
      ownerUserId: "user-1",
      slug: "openchat-builders",
      topic: "Shipping the first public room flows",
    });
    expect(roomMembershipRepository.create).toHaveBeenCalledWith({
      joinedAt: new Date("2026-01-01T00:00:00.000Z"),
      role: "owner",
      roomId: "4f833765-a31e-4c93-bd73-39bdaec1a9b9",
      userId: "user-1",
    });
    expect(runInTransaction).toHaveBeenCalledOnce();
  });

  it("rejects a duplicate room slug before opening the transaction", async () => {
    const roomRepository = {
      findBySlug: vi.fn().mockResolvedValue({
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        description: null,
        id: "4f833765-a31e-4c93-bd73-39bdaec1a9b9",
        name: "OpenChat Builders",
        ownerUserId: "user-1",
        slug: "openchat-builders",
        topic: null,
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      }),
    } satisfies Pick<RoomRepository, "findBySlug">;
    const runInTransaction = vi.fn();

    const createRoom = createCreateRoom({
      roomRepository,
      runInTransaction,
    });

    await expect(
      createRoom({
        actorUserId: "user-1",
        description: "",
        name: "OpenChat Builders",
        slug: "openchat-builders",
        tagSlugs: [],
        topic: "",
      }),
    ).rejects.toBeInstanceOf(RoomSlugAlreadyExistsError);

    expect(runInTransaction).not.toHaveBeenCalled();
  });

  it("rejects unauthenticated room creation before checking persistence", async () => {
    const roomRepository = {
      findBySlug: vi.fn(),
    } satisfies Pick<RoomRepository, "findBySlug">;
    const runInTransaction = vi.fn();

    const createRoom = createCreateRoom({
      roomRepository,
      runInTransaction,
    });

    await expect(
      createRoom({
        actorUserId: null,
        description: "Open discussion for the first rooms slice.",
        name: "OpenChat Builders",
        slug: "openchat-builders",
        tagSlugs: [],
        topic: "Architecture",
      }),
    ).rejects.toBeInstanceOf(UnauthenticatedRoomCreatorError);

    expect(roomRepository.findBySlug).not.toHaveBeenCalled();
    expect(runInTransaction).not.toHaveBeenCalled();
  });
});
