import { describe, expect, it } from "vitest";

import { createRoomSchema, roomSchema } from "@/modules/rooms/validation";

describe("createRoomSchema", () => {
  it("normalizes the room creation payload", () => {
    const room = createRoomSchema.parse({
      actorUserId: " user-1 ",
      description: "  Talk about architecture and product tradeoffs.  ",
      name: "  OpenChat Builders  ",
      slug: "  OpenChat-Builders  ",
      topic: "  Shipping the first public room flows  ",
    });

    expect(room).toEqual({
      actorUserId: "user-1",
      description: "Talk about architecture and product tradeoffs.",
      name: "OpenChat Builders",
      slug: "openchat-builders",
      topic: "Shipping the first public room flows",
    });
  });

  it("rejects an invalid room slug", () => {
    expect(() =>
      createRoomSchema.parse({
        actorUserId: "user-1",
        description: "Open discussion for the first rooms slice.",
        name: "Builders",
        slug: "invalid slug",
        topic: "Architecture",
      }),
    ).toThrow();
  });
});

describe("roomSchema", () => {
  it("normalizes persisted nullable text fields for room reads", () => {
    const room = roomSchema.parse({
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      description: "  ",
      id: "4f833765-a31e-4c93-bd73-39bdaec1a9b9",
      name: "  Product Strategy  ",
      ownerUserId: " user-1 ",
      slug: "  Product-Strategy  ",
      topic: "  ",
      updatedAt: new Date("2026-01-02T00:00:00.000Z"),
    });

    expect(room.description).toBeNull();
    expect(room.topic).toBeNull();
    expect(room.name).toBe("Product Strategy");
    expect(room.slug).toBe("product-strategy");
    expect(room.ownerUserId).toBe("user-1");
  });
});
