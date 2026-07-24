import { describe, expect, it, vi } from "vitest";

import { createLeaveRoom } from "@/modules/rooms/application/leave-room";
import type { RoomMembershipRepository } from "@/modules/rooms/application/ports/room-membership-repository";
import {
  RoomMembershipNotFoundError,
  RoomOwnerCannotLeaveError,
  UnauthenticatedRoomMembershipActorError,
} from "@/modules/rooms/domain/room";

describe("createLeaveRoom", () => {
  it("deletes a non-owner membership", async () => {
    const roomMembershipRepository = {
      deleteByRoomIdAndUserId: vi.fn().mockResolvedValue(undefined),
      findByRoomIdAndUserId: vi.fn().mockResolvedValue({
        joinedAt: new Date("2026-01-01T00:00:00.000Z"),
        role: "member",
        roomId: "4f833765-a31e-4c93-bd73-39bdaec1a9b9",
        userId: "user-2",
      }),
    } satisfies Pick<
      RoomMembershipRepository,
      "deleteByRoomIdAndUserId" | "findByRoomIdAndUserId"
    >;

    const leaveRoom = createLeaveRoom({
      roomMembershipRepository,
    });

    await expect(
      leaveRoom({
        actorUserId: "user-2",
        roomId: "4f833765-a31e-4c93-bd73-39bdaec1a9b9",
      }),
    ).resolves.toBeUndefined();

    expect(
      roomMembershipRepository.deleteByRoomIdAndUserId,
    ).toHaveBeenCalledWith({
      roomId: "4f833765-a31e-4c93-bd73-39bdaec1a9b9",
      userId: "user-2",
    });
  });

  it("keeps the owner membership in place", async () => {
    const roomMembershipRepository = {
      deleteByRoomIdAndUserId: vi.fn(),
      findByRoomIdAndUserId: vi.fn().mockResolvedValue({
        joinedAt: new Date("2026-01-01T00:00:00.000Z"),
        role: "owner",
        roomId: "4f833765-a31e-4c93-bd73-39bdaec1a9b9",
        userId: "user-1",
      }),
    } satisfies Pick<
      RoomMembershipRepository,
      "deleteByRoomIdAndUserId" | "findByRoomIdAndUserId"
    >;

    const leaveRoom = createLeaveRoom({
      roomMembershipRepository,
    });

    await expect(
      leaveRoom({
        actorUserId: "user-1",
        roomId: "4f833765-a31e-4c93-bd73-39bdaec1a9b9",
      }),
    ).rejects.toBeInstanceOf(RoomOwnerCannotLeaveError);

    expect(
      roomMembershipRepository.deleteByRoomIdAndUserId,
    ).not.toHaveBeenCalled();
  });

  it("rejects leaving when the membership does not exist", async () => {
    const roomMembershipRepository = {
      deleteByRoomIdAndUserId: vi.fn(),
      findByRoomIdAndUserId: vi.fn().mockResolvedValue(null),
    } satisfies Pick<
      RoomMembershipRepository,
      "deleteByRoomIdAndUserId" | "findByRoomIdAndUserId"
    >;

    const leaveRoom = createLeaveRoom({
      roomMembershipRepository,
    });

    await expect(
      leaveRoom({
        actorUserId: "user-2",
        roomId: "4f833765-a31e-4c93-bd73-39bdaec1a9b9",
      }),
    ).rejects.toBeInstanceOf(RoomMembershipNotFoundError);
  });

  it("rejects an unauthenticated actor before persistence", async () => {
    const roomMembershipRepository = {
      deleteByRoomIdAndUserId: vi.fn(),
      findByRoomIdAndUserId: vi.fn(),
    } satisfies Pick<
      RoomMembershipRepository,
      "deleteByRoomIdAndUserId" | "findByRoomIdAndUserId"
    >;

    const leaveRoom = createLeaveRoom({
      roomMembershipRepository,
    });

    await expect(
      leaveRoom({
        actorUserId: null,
        roomId: "4f833765-a31e-4c93-bd73-39bdaec1a9b9",
      }),
    ).rejects.toBeInstanceOf(UnauthenticatedRoomMembershipActorError);

    expect(
      roomMembershipRepository.findByRoomIdAndUserId,
    ).not.toHaveBeenCalled();
  });
});
