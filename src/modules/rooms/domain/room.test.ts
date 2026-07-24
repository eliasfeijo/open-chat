import { describe, expect, it } from "vitest";

import {
  canLeaveRoom,
  createMemberRoomMembership,
  createOwnerRoomMembership,
} from "@/modules/rooms/domain/room";

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

describe("createMemberRoomMembership", () => {
  it("assigns a joining user the member role", () => {
    const membership = createMemberRoomMembership({
      joinedAt: new Date("2026-01-01T00:00:00.000Z"),
      roomId: "4f833765-a31e-4c93-bd73-39bdaec1a9b9",
      userId: "user-2",
    });

    expect(membership).toEqual({
      joinedAt: new Date("2026-01-01T00:00:00.000Z"),
      role: "member",
      roomId: "4f833765-a31e-4c93-bd73-39bdaec1a9b9",
      userId: "user-2",
    });
  });
});

describe("canLeaveRoom", () => {
  it("allows members to leave and keeps owners in place", () => {
    expect(
      canLeaveRoom({
        joinedAt: new Date("2026-01-01T00:00:00.000Z"),
        role: "member",
        roomId: "4f833765-a31e-4c93-bd73-39bdaec1a9b9",
        userId: "user-2",
      }),
    ).toBe(true);

    expect(
      canLeaveRoom({
        joinedAt: new Date("2026-01-01T00:00:00.000Z"),
        role: "owner",
        roomId: "4f833765-a31e-4c93-bd73-39bdaec1a9b9",
        userId: "user-1",
      }),
    ).toBe(false);
  });
});
