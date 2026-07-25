import { describe, expect, it, vi } from "vitest";

import { createListRoomTypingParticipants } from "@/modules/messages/application/list-room-typing-participants";

describe("createListRoomTypingParticipants", () => {
  it("loads active typing indicators and maps author profiles", async () => {
    const listRoomTypingParticipants = createListRoomTypingParticipants({
      messageAuthorProfileReader: {
        getMessageAuthorProfileByUserId: vi
          .fn()
          .mockResolvedValueOnce({
            bio: "Building realtime UI feedback.",
            displayName: "Builder One",
            id: "user-1",
            username: "builder_one",
          })
          .mockResolvedValueOnce(null),
      },
      roomTypingIndicatorStore: {
        clearTypingIndicator: vi.fn(),
        listActiveTypingIndicators: vi.fn().mockResolvedValue([
          {
            expiresAt: new Date("2026-01-01T00:00:05.000Z"),
            userId: "user-1",
          },
          {
            expiresAt: new Date("2026-01-01T00:00:04.000Z"),
            userId: "user-2",
          },
        ]),
        setTypingIndicator: vi.fn(),
      },
    });

    await expect(
      listRoomTypingParticipants({
        roomId: "9f441a9f-e920-4e92-93d8-6eb7364580fe",
      }),
    ).resolves.toEqual([
      {
        author: null,
        expiresAt: new Date("2026-01-01T00:00:04.000Z"),
        userId: "user-2",
      },
      {
        author: {
          bio: "Building realtime UI feedback.",
          displayName: "Builder One",
          id: "user-1",
          username: "builder_one",
        },
        expiresAt: new Date("2026-01-01T00:00:05.000Z"),
        userId: "user-1",
      },
    ]);
  });
});
