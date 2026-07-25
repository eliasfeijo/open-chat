import { describe, expect, it, vi } from "vitest";

import { createListUserRoomMemberships } from "@/modules/rooms/application/list-user-room-memberships";
import type { RoomMembershipRepository } from "@/modules/rooms/application/ports/room-membership-repository";

describe("createListUserRoomMemberships", () => {
  it("lists memberships for the requested user", async () => {
    const memberships = [
      {
        joinedAt: new Date("2026-01-01T00:00:00.000Z"),
        role: "member" as const,
        roomId: "4f833765-a31e-4c93-bd73-39bdaec1a9b9",
        userId: "user-1",
      },
      {
        joinedAt: new Date("2026-01-02T00:00:00.000Z"),
        role: "owner" as const,
        roomId: "7f02395e-f7cc-4a71-9f9d-4dc2e0c7f75c",
        userId: "user-1",
      },
    ];
    const roomMembershipRepository = {
      listByUserId: vi.fn().mockResolvedValue(memberships),
    } satisfies Pick<RoomMembershipRepository, "listByUserId">;

    const listUserRoomMemberships = createListUserRoomMemberships({
      roomMembershipRepository,
    });

    await expect(
      listUserRoomMemberships({
        userId: "user-1",
      }),
    ).resolves.toEqual(memberships);

    expect(roomMembershipRepository.listByUserId).toHaveBeenCalledWith(
      "user-1",
    );
  });
});
