import { describe, expect, it, vi } from "vitest";

import { createSetRoomTypingState } from "@/modules/messages/application/set-room-typing-state";
import {
  RoomTypingActorNotMemberError,
  UnauthenticatedRoomTypingActorError,
} from "@/modules/messages/domain/message";

describe("createSetRoomTypingState", () => {
  it("stores a typing heartbeat and publishes the updated room snapshot", async () => {
    const typingParticipants = [
      {
        author: {
          bio: "Realtime builder.",
          displayName: "Builder",
          id: "user-1",
          username: "builder",
        },
        expiresAt: new Date("2026-01-01T00:00:05.000Z"),
        userId: "user-1",
      },
    ];
    const roomTypingIndicatorStore = {
      clearTypingIndicator: vi.fn(),
      listActiveTypingIndicators: vi.fn(),
      setTypingIndicator: vi.fn().mockResolvedValue(undefined),
    };
    const roomTypingRealtimePublisher = {
      publishRoomTypingUpdated: vi.fn().mockResolvedValue(undefined),
    };
    const setRoomTypingState = createSetRoomTypingState({
      getCurrentDate: () => new Date("2026-01-01T00:00:00.000Z"),
      listRoomTypingParticipants: vi.fn().mockResolvedValue(typingParticipants),
      roomMembershipReader: {
        getRoomMembership: vi.fn().mockResolvedValue({ role: "member" }),
      },
      roomTypingIndicatorStore,
      roomTypingRealtimePublisher,
    });

    await expect(
      setRoomTypingState({
        actorUserId: "user-1",
        isTyping: true,
        roomId: "9f441a9f-e920-4e92-93d8-6eb7364580fe",
      }),
    ).resolves.toEqual(typingParticipants);

    expect(roomTypingIndicatorStore.setTypingIndicator).toHaveBeenCalledWith({
      expiresAt: new Date("2026-01-01T00:00:05.000Z"),
      roomId: "9f441a9f-e920-4e92-93d8-6eb7364580fe",
      userId: "user-1",
    });
    expect(
      roomTypingRealtimePublisher.publishRoomTypingUpdated,
    ).toHaveBeenCalledWith({
      roomId: "9f441a9f-e920-4e92-93d8-6eb7364580fe",
      typingParticipants,
    });
  });

  it("clears typing state when the actor stops typing", async () => {
    const roomTypingIndicatorStore = {
      clearTypingIndicator: vi.fn().mockResolvedValue(undefined),
      listActiveTypingIndicators: vi.fn(),
      setTypingIndicator: vi.fn(),
    };
    const setRoomTypingState = createSetRoomTypingState({
      listRoomTypingParticipants: vi.fn().mockResolvedValue([]),
      roomMembershipReader: {
        getRoomMembership: vi.fn().mockResolvedValue({ role: "member" }),
      },
      roomTypingIndicatorStore,
      roomTypingRealtimePublisher: {
        publishRoomTypingUpdated: vi.fn().mockResolvedValue(undefined),
      },
    });

    await expect(
      setRoomTypingState({
        actorUserId: "user-1",
        isTyping: false,
        roomId: "9f441a9f-e920-4e92-93d8-6eb7364580fe",
      }),
    ).resolves.toEqual([]);

    expect(roomTypingIndicatorStore.clearTypingIndicator).toHaveBeenCalledWith({
      roomId: "9f441a9f-e920-4e92-93d8-6eb7364580fe",
      userId: "user-1",
    });
  });

  it("rejects unauthenticated actors", async () => {
    const setRoomTypingState = createSetRoomTypingState({
      listRoomTypingParticipants: vi.fn(),
      roomMembershipReader: {
        getRoomMembership: vi.fn(),
      },
      roomTypingIndicatorStore: {
        clearTypingIndicator: vi.fn(),
        listActiveTypingIndicators: vi.fn(),
        setTypingIndicator: vi.fn(),
      },
    });

    await expect(
      setRoomTypingState({
        actorUserId: null,
        isTyping: true,
        roomId: "9f441a9f-e920-4e92-93d8-6eb7364580fe",
      }),
    ).rejects.toBeInstanceOf(UnauthenticatedRoomTypingActorError);
  });

  it("rejects actors who have not joined the room", async () => {
    const setRoomTypingState = createSetRoomTypingState({
      listRoomTypingParticipants: vi.fn(),
      roomMembershipReader: {
        getRoomMembership: vi.fn().mockResolvedValue(null),
      },
      roomTypingIndicatorStore: {
        clearTypingIndicator: vi.fn(),
        listActiveTypingIndicators: vi.fn(),
        setTypingIndicator: vi.fn(),
      },
    });

    await expect(
      setRoomTypingState({
        actorUserId: "user-1",
        isTyping: true,
        roomId: "9f441a9f-e920-4e92-93d8-6eb7364580fe",
      }),
    ).rejects.toBeInstanceOf(RoomTypingActorNotMemberError);
  });
});
