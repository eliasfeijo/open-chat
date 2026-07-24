import { describe, expect, it, vi } from "vitest";

import { createGetRoomMembership } from "@/modules/rooms/application/get-room-membership";
import type { RoomMembershipRepository } from "@/modules/rooms/application/ports/room-membership-repository";

describe("createGetRoomMembership", () => {
  it("normalizes membership lookup input before reading persistence", async () => {
    const membership = {
      joinedAt: new Date("2026-01-01T00:00:00.000Z"),
      role: "member" as const,
      roomId: "4f833765-a31e-4c93-bd73-39bdaec1a9b9",
      userId: "user-1",
    };
    const roomMembershipRepository = {
      findByRoomIdAndUserId: vi.fn().mockResolvedValue(membership),
    } satisfies Pick<RoomMembershipRepository, "findByRoomIdAndUserId">;

    const getRoomMembership = createGetRoomMembership({
      roomMembershipRepository,
    });

    await expect(
      getRoomMembership({
        roomId: "4f833765-a31e-4c93-bd73-39bdaec1a9b9",
        userId: " user-1 ",
      }),
    ).resolves.toEqual(membership);

    expect(roomMembershipRepository.findByRoomIdAndUserId).toHaveBeenCalledWith(
      {
        roomId: "4f833765-a31e-4c93-bd73-39bdaec1a9b9",
        userId: "user-1",
      },
    );
  });
});
