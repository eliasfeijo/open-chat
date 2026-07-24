import { describe, expect, it, vi } from "vitest";

import { createJoinRoom } from "@/modules/rooms/application/join-room";
import type { RoomMembershipRepository } from "@/modules/rooms/application/ports/room-membership-repository";
import type { RoomRepository } from "@/modules/rooms/application/ports/room-repository";
import {
  RoomMembershipAlreadyExistsError,
  RoomNotFoundError,
  UnauthenticatedRoomMembershipActorError,
} from "@/modules/rooms/domain/room";

describe("createJoinRoom", () => {
  it("creates a member membership for a signed-in user", async () => {
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
    } satisfies Pick<RoomRepository, "findById">;
    const roomMembershipRepository = {
      create: vi.fn().mockImplementation(async (membership) => membership),
      findByRoomIdAndUserId: vi.fn().mockResolvedValue(null),
    } satisfies Pick<
      RoomMembershipRepository,
      "create" | "findByRoomIdAndUserId"
    >;

    const joinRoom = createJoinRoom({
      roomMembershipRepository,
      roomRepository,
    });

    const membership = await joinRoom({
      actorUserId: "user-2",
      roomId: "4f833765-a31e-4c93-bd73-39bdaec1a9b9",
    });

    expect(membership.role).toBe("member");
    expect(membership.roomId).toBe("4f833765-a31e-4c93-bd73-39bdaec1a9b9");
    expect(membership.userId).toBe("user-2");
  });

  it("rejects a duplicate room membership", async () => {
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
    } satisfies Pick<RoomRepository, "findById">;
    const roomMembershipRepository = {
      create: vi.fn(),
      findByRoomIdAndUserId: vi.fn().mockResolvedValue({
        joinedAt: new Date("2026-01-01T00:00:00.000Z"),
        role: "member",
        roomId: "4f833765-a31e-4c93-bd73-39bdaec1a9b9",
        userId: "user-2",
      }),
    } satisfies Pick<
      RoomMembershipRepository,
      "create" | "findByRoomIdAndUserId"
    >;

    const joinRoom = createJoinRoom({
      roomMembershipRepository,
      roomRepository,
    });

    await expect(
      joinRoom({
        actorUserId: "user-2",
        roomId: "4f833765-a31e-4c93-bd73-39bdaec1a9b9",
      }),
    ).rejects.toBeInstanceOf(RoomMembershipAlreadyExistsError);

    expect(roomMembershipRepository.create).not.toHaveBeenCalled();
  });

  it("rejects a missing room", async () => {
    const roomRepository = {
      findById: vi.fn().mockResolvedValue(null),
    } satisfies Pick<RoomRepository, "findById">;
    const roomMembershipRepository = {
      create: vi.fn(),
      findByRoomIdAndUserId: vi.fn(),
    } satisfies Pick<
      RoomMembershipRepository,
      "create" | "findByRoomIdAndUserId"
    >;

    const joinRoom = createJoinRoom({
      roomMembershipRepository,
      roomRepository,
    });

    await expect(
      joinRoom({
        actorUserId: "user-2",
        roomId: "4f833765-a31e-4c93-bd73-39bdaec1a9b9",
      }),
    ).rejects.toBeInstanceOf(RoomNotFoundError);
  });

  it("rejects an unauthenticated actor before persistence", async () => {
    const roomRepository = {
      findById: vi.fn(),
    } satisfies Pick<RoomRepository, "findById">;
    const roomMembershipRepository = {
      create: vi.fn(),
      findByRoomIdAndUserId: vi.fn(),
    } satisfies Pick<
      RoomMembershipRepository,
      "create" | "findByRoomIdAndUserId"
    >;

    const joinRoom = createJoinRoom({
      roomMembershipRepository,
      roomRepository,
    });

    await expect(
      joinRoom({
        actorUserId: null,
        roomId: "4f833765-a31e-4c93-bd73-39bdaec1a9b9",
      }),
    ).rejects.toBeInstanceOf(UnauthenticatedRoomMembershipActorError);

    expect(roomRepository.findById).not.toHaveBeenCalled();
    expect(
      roomMembershipRepository.findByRoomIdAndUserId,
    ).not.toHaveBeenCalled();
  });
});
