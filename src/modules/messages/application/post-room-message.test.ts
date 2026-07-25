import { describe, expect, it, vi } from "vitest";

import type { MessageAuthorProfileReader } from "@/modules/messages/application/ports/message-author-profile-reader";
import type { MessageRepository } from "@/modules/messages/application/ports/message-repository";
import type { RoomMembershipReader } from "@/modules/messages/application/ports/room-membership-reader";
import type { RoomMessageRealtimePublisher } from "@/modules/messages/application/ports/room-message-realtime-publisher";
import { createPostRoomMessage } from "@/modules/messages/application/post-room-message";
import {
  RoomMessageAuthorNotMemberError,
  UnauthenticatedMessageAuthorError,
} from "@/modules/messages/domain/message";

describe("createPostRoomMessage", () => {
  it("creates a message for a joined room member", async () => {
    const messageRepository = {
      create: vi.fn().mockResolvedValue({
        authorUserId: "user-1",
        body: "Shipping the first room message slice.",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        id: "4f833765-a31e-4c93-bd73-39bdaec1a9b9",
        roomId: "9f441a9f-e920-4e92-93d8-6eb7364580fe",
      }),
    } satisfies Pick<MessageRepository, "create">;
    const roomMembershipReader = {
      getRoomMembership: vi.fn().mockResolvedValue({
        role: "member",
      }),
    } satisfies RoomMembershipReader;
    const messageAuthorProfileReader = {
      getMessageAuthorProfileByUserId: vi.fn().mockResolvedValue({
        bio: "Testing the first realtime slice.",
        displayName: "OpenChat Builder",
        id: "user-1",
        username: "builder",
      }),
    } satisfies MessageAuthorProfileReader;
    const roomMessageRealtimePublisher = {
      publishRoomMessagePosted: vi.fn().mockResolvedValue(undefined),
    } satisfies RoomMessageRealtimePublisher;

    const postRoomMessage = createPostRoomMessage({
      messageAuthorProfileReader,
      messageRepository,
      roomMessageRealtimePublisher,
      roomMembershipReader,
    });

    await expect(
      postRoomMessage({
        actorUserId: "user-1",
        body: "Shipping the first room message slice.",
        roomId: "9f441a9f-e920-4e92-93d8-6eb7364580fe",
      }),
    ).resolves.toMatchObject({
      authorUserId: "user-1",
      roomId: "9f441a9f-e920-4e92-93d8-6eb7364580fe",
    });

    expect(
      messageAuthorProfileReader.getMessageAuthorProfileByUserId,
    ).toHaveBeenCalledWith("user-1");
    expect(
      roomMessageRealtimePublisher.publishRoomMessagePosted,
    ).toHaveBeenCalledWith({
      author: {
        bio: "Testing the first realtime slice.",
        displayName: "OpenChat Builder",
        id: "user-1",
        username: "builder",
      },
      message: expect.objectContaining({
        authorUserId: "user-1",
        body: "Shipping the first room message slice.",
      }),
    });
  });

  it("rejects posting when the actor is not a member", async () => {
    const messageRepository = {
      create: vi.fn(),
    } satisfies Pick<MessageRepository, "create">;
    const roomMembershipReader = {
      getRoomMembership: vi.fn().mockResolvedValue(null),
    } satisfies RoomMembershipReader;

    const postRoomMessage = createPostRoomMessage({
      messageRepository,
      roomMembershipReader,
    });

    await expect(
      postRoomMessage({
        actorUserId: "user-1",
        body: "Shipping the first room message slice.",
        roomId: "9f441a9f-e920-4e92-93d8-6eb7364580fe",
      }),
    ).rejects.toBeInstanceOf(RoomMessageAuthorNotMemberError);

    expect(messageRepository.create).not.toHaveBeenCalled();
  });

  it("rejects an unauthenticated actor before reading membership", async () => {
    const messageRepository = {
      create: vi.fn(),
    } satisfies Pick<MessageRepository, "create">;
    const roomMembershipReader = {
      getRoomMembership: vi.fn(),
    } satisfies RoomMembershipReader;

    const postRoomMessage = createPostRoomMessage({
      messageRepository,
      roomMembershipReader,
    });

    await expect(
      postRoomMessage({
        actorUserId: null,
        body: "Shipping the first room message slice.",
        roomId: "9f441a9f-e920-4e92-93d8-6eb7364580fe",
      }),
    ).rejects.toBeInstanceOf(UnauthenticatedMessageAuthorError);

    expect(roomMembershipReader.getRoomMembership).not.toHaveBeenCalled();
  });
});
