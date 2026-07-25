import { describe, expect, it, vi } from "vitest";

import { createAuthorizeRoomMessageSubscription } from "@/modules/messages/application/authorize-room-message-subscription";
import type { RoomMembershipReader } from "@/modules/messages/application/ports/room-membership-reader";
import {
  RoomMessageSubscriberNotMemberError,
  UnauthenticatedRoomMessageSubscriberError,
} from "@/modules/messages/domain/message";

describe("createAuthorizeRoomMessageSubscription", () => {
  it("authorizes a joined member to subscribe to room messages", async () => {
    const roomMembershipReader = {
      getRoomMembership: vi.fn().mockResolvedValue({
        role: "member",
      }),
    } satisfies RoomMembershipReader;

    const authorizeRoomMessageSubscription =
      createAuthorizeRoomMessageSubscription({
        roomMembershipReader,
      });

    await expect(
      authorizeRoomMessageSubscription({
        actorUserId: "user-1",
        roomId: "9f441a9f-e920-4e92-93d8-6eb7364580fe",
      }),
    ).resolves.toEqual({
      roomId: "9f441a9f-e920-4e92-93d8-6eb7364580fe",
      userId: "user-1",
    });
  });

  it("rejects subscriptions from non-members", async () => {
    const roomMembershipReader = {
      getRoomMembership: vi.fn().mockResolvedValue(null),
    } satisfies RoomMembershipReader;

    const authorizeRoomMessageSubscription =
      createAuthorizeRoomMessageSubscription({
        roomMembershipReader,
      });

    await expect(
      authorizeRoomMessageSubscription({
        actorUserId: "user-1",
        roomId: "9f441a9f-e920-4e92-93d8-6eb7364580fe",
      }),
    ).rejects.toBeInstanceOf(RoomMessageSubscriberNotMemberError);
  });

  it("rejects unauthenticated subscriptions before membership lookup", async () => {
    const roomMembershipReader = {
      getRoomMembership: vi.fn(),
    } satisfies RoomMembershipReader;

    const authorizeRoomMessageSubscription =
      createAuthorizeRoomMessageSubscription({
        roomMembershipReader,
      });

    await expect(
      authorizeRoomMessageSubscription({
        actorUserId: null,
        roomId: "9f441a9f-e920-4e92-93d8-6eb7364580fe",
      }),
    ).rejects.toBeInstanceOf(UnauthenticatedRoomMessageSubscriberError);

    expect(roomMembershipReader.getRoomMembership).not.toHaveBeenCalled();
  });
});
