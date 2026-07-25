import { describe, expect, it, vi } from "vitest";

import { createAuthorizeRoomRealtimeSubscription } from "@/modules/rooms/application/authorize-room-realtime-subscription";
import {
  RoomRealtimeSubscriptionForbiddenError,
  UnauthenticatedRoomRealtimeSubscriberError,
} from "@/modules/rooms/domain/room-errors";

describe("createAuthorizeRoomRealtimeSubscription", () => {
  it("returns the room and actor when the actor is a member", async () => {
    const authorizeRoomRealtimeSubscription =
      createAuthorizeRoomRealtimeSubscription({
        roomMembershipRepository: {
          findByRoomIdAndUserId: vi.fn().mockResolvedValue({
            joinedAt: new Date("2026-01-01T00:00:00.000Z"),
            role: "member",
            roomId: "9f441a9f-e920-4e92-93d8-6eb7364580fe",
            userId: "user-1",
          }),
        },
      });

    await expect(
      authorizeRoomRealtimeSubscription({
        actorUserId: " user-1 ",
        roomId: "9f441a9f-e920-4e92-93d8-6eb7364580fe",
      }),
    ).resolves.toEqual({
      roomId: "9f441a9f-e920-4e92-93d8-6eb7364580fe",
      userId: "user-1",
    });
  });

  it("rejects unauthenticated actors", async () => {
    const authorizeRoomRealtimeSubscription =
      createAuthorizeRoomRealtimeSubscription({
        roomMembershipRepository: {
          findByRoomIdAndUserId: vi.fn(),
        },
      });

    await expect(
      authorizeRoomRealtimeSubscription({
        actorUserId: null,
        roomId: "9f441a9f-e920-4e92-93d8-6eb7364580fe",
      }),
    ).rejects.toBeInstanceOf(UnauthenticatedRoomRealtimeSubscriberError);
  });

  it("rejects actors who have not joined the room", async () => {
    const authorizeRoomRealtimeSubscription =
      createAuthorizeRoomRealtimeSubscription({
        roomMembershipRepository: {
          findByRoomIdAndUserId: vi.fn().mockResolvedValue(null),
        },
      });

    await expect(
      authorizeRoomRealtimeSubscription({
        actorUserId: "user-1",
        roomId: "9f441a9f-e920-4e92-93d8-6eb7364580fe",
      }),
    ).rejects.toBeInstanceOf(RoomRealtimeSubscriptionForbiddenError);
  });
});
