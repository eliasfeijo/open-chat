import { describe, expect, it, vi } from "vitest";

import type { MessageRepository } from "@/modules/messages/application/ports/message-repository";
import { createListRoomMessages } from "@/modules/messages/application/list-room-messages";

describe("createListRoomMessages", () => {
  it("uses the default limit for room messages", async () => {
    const messages = [
      {
        authorUserId: "user-1",
        body: "Shipping the first room message slice.",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        id: "4f833765-a31e-4c93-bd73-39bdaec1a9b9",
        roomId: "9f441a9f-e920-4e92-93d8-6eb7364580fe",
      },
    ];
    const messageRepository = {
      listByRoomId: vi.fn().mockResolvedValue(messages),
    } satisfies Pick<MessageRepository, "listByRoomId">;

    const listRoomMessages = createListRoomMessages({
      messageRepository,
    });

    await expect(
      listRoomMessages({
        roomId: "9f441a9f-e920-4e92-93d8-6eb7364580fe",
      }),
    ).resolves.toEqual(messages);

    expect(messageRepository.listByRoomId).toHaveBeenCalledWith({
      limit: 50,
      roomId: "9f441a9f-e920-4e92-93d8-6eb7364580fe",
    });
  });
});
