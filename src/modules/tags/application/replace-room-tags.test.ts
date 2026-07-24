import { describe, expect, it, vi } from "vitest";

import type { RoomTagRepository } from "@/modules/tags/application/ports/room-tag-repository";
import type { TagRepository } from "@/modules/tags/application/ports/tag-repository";
import { createReplaceRoomTags } from "@/modules/tags/application/replace-room-tags";

describe("createReplaceRoomTags", () => {
  it("replaces the room tags with resolved normalized tags", async () => {
    const roomTagRepository = {
      replaceTagsForRoom: vi.fn().mockResolvedValue(undefined),
    } satisfies Pick<RoomTagRepository, "replaceTagsForRoom">;
    const tagRepository = {
      create: vi.fn().mockResolvedValue({
        id: "24e28f23-c6b0-4e0a-ac5c-c65fb56ff2dc",
        name: "typescript",
        slug: "typescript",
      }),
      findBySlug: vi
        .fn()
        .mockResolvedValueOnce({
          id: "6ef14a9e-a3a4-4482-af07-e396fe106c9e",
          name: "nextjs",
          slug: "nextjs",
        })
        .mockResolvedValueOnce(null),
    } satisfies Pick<TagRepository, "create" | "findBySlug">;

    const replaceRoomTags = createReplaceRoomTags({
      roomTagRepository,
      tagRepository,
    });

    await expect(
      replaceRoomTags({
        roomId: "3f833765-a31e-4c93-bd73-39bdaec1a9b9",
        tagSlugs: ["  nextjs", "TypeScript", "typescript"],
      }),
    ).resolves.toEqual([
      {
        id: "6ef14a9e-a3a4-4482-af07-e396fe106c9e",
        name: "nextjs",
        slug: "nextjs",
      },
      {
        id: "24e28f23-c6b0-4e0a-ac5c-c65fb56ff2dc",
        name: "typescript",
        slug: "typescript",
      },
    ]);

    expect(roomTagRepository.replaceTagsForRoom).toHaveBeenCalledWith({
      roomId: "3f833765-a31e-4c93-bd73-39bdaec1a9b9",
      tagIds: [
        "6ef14a9e-a3a4-4482-af07-e396fe106c9e",
        "24e28f23-c6b0-4e0a-ac5c-c65fb56ff2dc",
      ],
    });
  });

  it("clears room tags when the owner submits no tags", async () => {
    const roomTagRepository = {
      replaceTagsForRoom: vi.fn().mockResolvedValue(undefined),
    } satisfies Pick<RoomTagRepository, "replaceTagsForRoom">;
    const tagRepository = {
      create: vi.fn(),
      findBySlug: vi.fn(),
    } satisfies Pick<TagRepository, "create" | "findBySlug">;

    const replaceRoomTags = createReplaceRoomTags({
      roomTagRepository,
      tagRepository,
    });

    await expect(
      replaceRoomTags({
        roomId: "3f833765-a31e-4c93-bd73-39bdaec1a9b9",
        tagSlugs: [],
      }),
    ).resolves.toEqual([]);

    expect(roomTagRepository.replaceTagsForRoom).toHaveBeenCalledWith({
      roomId: "3f833765-a31e-4c93-bd73-39bdaec1a9b9",
      tagIds: [],
    });
    expect(tagRepository.findBySlug).not.toHaveBeenCalled();
  });
});
