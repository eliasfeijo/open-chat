import { describe, expect, it } from "vitest";

import {
  createRoomSchema,
  getRoomBySlugSchema,
  getRoomMembershipSchema,
  joinRoomSchema,
  leaveRoomSchema,
  roomSchema,
  updateRoomDetailsSchema,
} from "@/modules/rooms/validation";

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

describe("getRoomBySlugSchema", () => {
  it("normalizes the room slug read input", () => {
    const query = getRoomBySlugSchema.parse({
      slug: "  OpenChat-Builders  ",
    });

    expect(query).toEqual({
      slug: "openchat-builders",
    });
  });

  it("rejects an invalid room slug read input", () => {
    expect(() =>
      getRoomBySlugSchema.parse({
        slug: "invalid slug",
      }),
    ).toThrow();
  });
});

describe("room membership command schemas", () => {
  it("normalizes join and leave membership inputs", () => {
    const joinCommand = joinRoomSchema.parse({
      actorUserId: " user-1 ",
      roomId: "4f833765-a31e-4c93-bd73-39bdaec1a9b9",
    });
    const leaveCommand = leaveRoomSchema.parse({
      actorUserId: " user-1 ",
      roomId: "4f833765-a31e-4c93-bd73-39bdaec1a9b9",
    });

    expect(joinCommand).toEqual({
      actorUserId: "user-1",
      roomId: "4f833765-a31e-4c93-bd73-39bdaec1a9b9",
    });
    expect(leaveCommand).toEqual({
      actorUserId: "user-1",
      roomId: "4f833765-a31e-4c93-bd73-39bdaec1a9b9",
    });
  });

  it("normalizes room membership lookup input", () => {
    const query = getRoomMembershipSchema.parse({
      roomId: "4f833765-a31e-4c93-bd73-39bdaec1a9b9",
      userId: " user-1 ",
    });

    expect(query).toEqual({
      roomId: "4f833765-a31e-4c93-bd73-39bdaec1a9b9",
      userId: "user-1",
    });
  });
});

describe("updateRoomDetailsSchema", () => {
  it("normalizes owner room editing fields while leaving slug outside the contract", () => {
    const command = updateRoomDetailsSchema.parse({
      actorUserId: " user-1 ",
      description:
        "  Talk about architecture, product, and release sequencing.  ",
      name: "  OpenChat Maintainers  ",
      roomId: "4f833765-a31e-4c93-bd73-39bdaec1a9b9",
      slug: "different-slug",
      topic: "  Phase 1 owner room management  ",
    });

    expect(command).toEqual({
      actorUserId: "user-1",
      description: "Talk about architecture, product, and release sequencing.",
      name: "OpenChat Maintainers",
      roomId: "4f833765-a31e-4c93-bd73-39bdaec1a9b9",
      topic: "Phase 1 owner room management",
    });
  });
});
