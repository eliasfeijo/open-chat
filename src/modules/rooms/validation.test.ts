import { describe, expect, it } from "vitest";

import {
  authorizeRoomRealtimeSubscriptionSchema,
  createRoomFormSchema,
  createRoomSchema,
  getRoomBySlugSchema,
  getRoomMembershipSchema,
  joinRoomSchema,
  leaveRoomSchema,
  roomMembershipFormSchema,
  roomSchema,
  updateRoomDetailsFormSchema,
  updateRoomDetailsSchema,
} from "@/modules/rooms/validation";

describe("createRoomSchema", () => {
  it("normalizes the room creation payload", () => {
    const room = createRoomSchema.parse({
      actorUserId: " user-1 ",
      description: "  Talk about architecture and product tradeoffs.  ",
      name: "  OpenChat Builders  ",
      slug: "  OpenChat-Builders  ",
      tagSlugs: ["  TypeScript  ", " search ", "TypeScript"],
      topic: "  Shipping the first public room flows  ",
    });

    expect(room).toEqual({
      actorUserId: "user-1",
      description: "Talk about architecture and product tradeoffs.",
      name: "OpenChat Builders",
      slug: "openchat-builders",
      tagSlugs: ["typescript", "search"],
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
        tagSlugs: [],
        topic: "Architecture",
      }),
    ).toThrow();
  });

  it("reuses the same field rules for room creation form input", () => {
    const formInput = createRoomFormSchema.parse({
      description: "  Talk about architecture and product tradeoffs.  ",
      name: "  OpenChat Builders  ",
      slug: "  OpenChat-Builders  ",
      tags: "  TypeScript, search, TypeScript  ",
      topic: "  Shipping the first public room flows  ",
    });

    expect(formInput).toEqual({
      description: "Talk about architecture and product tradeoffs.",
      name: "OpenChat Builders",
      slug: "openchat-builders",
      tagSlugs: ["typescript", "search"],
      topic: "Shipping the first public room flows",
    });
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

  it("normalizes realtime room subscription input", () => {
    const command = authorizeRoomRealtimeSubscriptionSchema.parse({
      actorUserId: " user-1 ",
      roomId: "4f833765-a31e-4c93-bd73-39bdaec1a9b9",
    });

    expect(command).toEqual({
      actorUserId: "user-1",
      roomId: "4f833765-a31e-4c93-bd73-39bdaec1a9b9",
    });
  });

  it("normalizes room membership form input for transport use", () => {
    const formInput = roomMembershipFormSchema.parse({
      roomId: "4f833765-a31e-4c93-bd73-39bdaec1a9b9",
      roomSlug: "  OpenChat-Builders  ",
    });

    expect(formInput).toEqual({
      roomId: "4f833765-a31e-4c93-bd73-39bdaec1a9b9",
      roomSlug: "openchat-builders",
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
      tagSlugs: ["  TypeScript  ", " search ", "TypeScript"],
      slug: "different-slug",
      topic: "  Phase 1 owner room management  ",
    });

    expect(command).toEqual({
      actorUserId: "user-1",
      description: "Talk about architecture, product, and release sequencing.",
      name: "OpenChat Maintainers",
      roomId: "4f833765-a31e-4c93-bd73-39bdaec1a9b9",
      tagSlugs: ["typescript", "search"],
      topic: "Phase 1 owner room management",
    });
  });

  it("reuses the same field rules for room detail form input", () => {
    const formInput = updateRoomDetailsFormSchema.parse({
      description:
        "  Talk about architecture, product, and release sequencing.  ",
      name: "  OpenChat Maintainers  ",
      roomId: "4f833765-a31e-4c93-bd73-39bdaec1a9b9",
      roomSlug: "  OpenChat-Builders  ",
      tags: "  TypeScript, search, TypeScript  ",
      topic: "  Phase 1 owner room management  ",
    });

    expect(formInput).toEqual({
      description: "Talk about architecture, product, and release sequencing.",
      name: "OpenChat Maintainers",
      roomId: "4f833765-a31e-4c93-bd73-39bdaec1a9b9",
      roomSlug: "openchat-builders",
      tagSlugs: ["typescript", "search"],
      topic: "Phase 1 owner room management",
    });
  });

  it("preserves the tags field path for invalid tag text", () => {
    const result = updateRoomDetailsFormSchema.safeParse({
      description:
        "  Talk about architecture, product, and release sequencing.  ",
      name: "  OpenChat Maintainers  ",
      roomId: "4f833765-a31e-4c93-bd73-39bdaec1a9b9",
      roomSlug: "  OpenChat-Builders  ",
      tags: "test, let's chat",
      topic: "  Phase 1 owner room management  ",
    });

    expect(result.success).toBe(false);

    if (result.success) {
      return;
    }

    expect(result.error.issues[0]).toMatchObject({
      message:
        "Tags can only contain lowercase letters, numbers, and single hyphens.",
      path: ["tags", 1],
    });
  });
});
