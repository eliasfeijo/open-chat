import { describe, expect, it } from "vitest";

import { createOwnerRoomMembership } from "@/modules/rooms/domain/room";

describe("createOwnerRoomMembership", () => {
  it("assigns the creating user as the room owner", () => {
    const membership = createOwnerRoomMembership({
      joinedAt: new Date("2026-01-01T00:00:00.000Z"),
      roomId: "4f833765-a31e-4c93-bd73-39bdaec1a9b9",
      userId: "user-1",
    });

    expect(membership).toEqual({
      joinedAt: new Date("2026-01-01T00:00:00.000Z"),
      role: "owner",
      roomId: "4f833765-a31e-4c93-bd73-39bdaec1a9b9",
      userId: "user-1",
    });
  });
});
