import { describe, expect, it, vi } from "vitest";

import { createAssignTagsToRoom } from "@/modules/tags/application/assign-tags-to-room";
import type { RoomTagRepository } from "@/modules/tags/application/ports/room-tag-repository";
import type { TagRepository } from "@/modules/tags/application/ports/tag-repository";

describe("createAssignTagsToRoom", () => {
  it("creates missing tags, reuses existing ones, and assigns them to the room", async () => {
    const roomTagRepository = {
      assignTagsToRoom: vi.fn().mockResolvedValue(undefined),
    } satisfies Pick<RoomTagRepository, "assignTagsToRoom">;
    const tagRepository = {
      create: vi
        .fn()
        .mockResolvedValueOnce({
          id: "24e28f23-c6b0-4e0a-ac5c-c65fb56ff2dc",
          name: "typescript",
          slug: "typescript",
        })
        .mockResolvedValueOnce({
          id: "9725f0e9-8a49-4908-b535-37b543e15ab7",
          name: "search",
          slug: "search",
        }),
      findBySlug: vi
        .fn()
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          id: "6ef14a9e-a3a4-4482-af07-e396fe106c9e",
          name: "nextjs",
          slug: "nextjs",
        })
        .mockResolvedValueOnce(null),
    } satisfies Pick<TagRepository, "create" | "findBySlug">;

    const assignTagsToRoom = createAssignTagsToRoom({
      roomTagRepository,
      tagRepository,
    });

    await expect(
      assignTagsToRoom({
        roomId: "3f833765-a31e-4c93-bd73-39bdaec1a9b9",
        tagSlugs: ["typescript", "nextjs", "search", "typescript"],
      }),
    ).resolves.toEqual([
      {
        id: "24e28f23-c6b0-4e0a-ac5c-c65fb56ff2dc",
        name: "typescript",
        slug: "typescript",
      },
      {
        id: "6ef14a9e-a3a4-4482-af07-e396fe106c9e",
        name: "nextjs",
        slug: "nextjs",
      },
      {
        id: "9725f0e9-8a49-4908-b535-37b543e15ab7",
        name: "search",
        slug: "search",
      },
    ]);

    expect(roomTagRepository.assignTagsToRoom).toHaveBeenCalledWith({
      roomId: "3f833765-a31e-4c93-bd73-39bdaec1a9b9",
      tagIds: [
        "24e28f23-c6b0-4e0a-ac5c-c65fb56ff2dc",
        "6ef14a9e-a3a4-4482-af07-e396fe106c9e",
        "9725f0e9-8a49-4908-b535-37b543e15ab7",
      ],
    });
  });

  it("skips persistence when the input has no tags", async () => {
    const roomTagRepository = {
      assignTagsToRoom: vi.fn(),
    } satisfies Pick<RoomTagRepository, "assignTagsToRoom">;
    const tagRepository = {
      create: vi.fn(),
      findBySlug: vi.fn(),
    } satisfies Pick<TagRepository, "create" | "findBySlug">;

    const assignTagsToRoom = createAssignTagsToRoom({
      roomTagRepository,
      tagRepository,
    });

    await expect(
      assignTagsToRoom({
        roomId: "3f833765-a31e-4c93-bd73-39bdaec1a9b9",
        tagSlugs: [],
      }),
    ).resolves.toEqual([]);

    expect(tagRepository.findBySlug).not.toHaveBeenCalled();
    expect(roomTagRepository.assignTagsToRoom).not.toHaveBeenCalled();
  });
});
