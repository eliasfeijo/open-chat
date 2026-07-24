import { describe, expect, it } from "vitest";

import {
  listRoomMessagesSchema,
  postRoomMessageSchema,
} from "@/modules/messages/validation";

describe("postRoomMessageSchema", () => {
  it("normalizes room message input", () => {
    const command = postRoomMessageSchema.parse({
      actorUserId: " user-1 ",
      body: "  Shipping the first room message slice.  ",
      roomId: "4f833765-a31e-4c93-bd73-39bdaec1a9b9",
    });

    expect(command).toEqual({
      actorUserId: "user-1",
      body: "Shipping the first room message slice.",
      roomId: "4f833765-a31e-4c93-bd73-39bdaec1a9b9",
    });
  });

  it("rejects an empty message body", () => {
    expect(() =>
      postRoomMessageSchema.parse({
        actorUserId: "user-1",
        body: "   ",
        roomId: "4f833765-a31e-4c93-bd73-39bdaec1a9b9",
      }),
    ).toThrow();
  });
});

describe("listRoomMessagesSchema", () => {
  it("uses the default list limit", () => {
    expect(
      listRoomMessagesSchema.parse({
        roomId: "4f833765-a31e-4c93-bd73-39bdaec1a9b9",
      }),
    ).toEqual({
      limit: 50,
      roomId: "4f833765-a31e-4c93-bd73-39bdaec1a9b9",
    });
  });
});
