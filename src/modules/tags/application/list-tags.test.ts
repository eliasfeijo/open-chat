import { describe, expect, it, vi } from "vitest";

import { createListTags } from "@/modules/tags/application/list-tags";
import type { TagRepository } from "@/modules/tags/application/ports/tag-repository";

describe("createListTags", () => {
  it("uses the default listing limit when none is provided", async () => {
    const tags = [
      {
        id: "4f833765-a31e-4c93-bd73-39bdaec1a9b9",
        name: "architecture",
        slug: "architecture",
      },
    ];
    const tagRepository = {
      list: vi.fn().mockResolvedValue(tags),
    } satisfies Pick<TagRepository, "list">;

    const listTags = createListTags({
      tagRepository,
    });

    await expect(listTags()).resolves.toEqual(tags);
    expect(tagRepository.list).toHaveBeenCalledWith({
      limit: 50,
    });
  });

  it("passes through an explicit listing limit", async () => {
    const tagRepository = {
      list: vi.fn().mockResolvedValue([]),
    } satisfies Pick<TagRepository, "list">;

    const listTags = createListTags({
      tagRepository,
    });

    await listTags({ limit: 12 });

    expect(tagRepository.list).toHaveBeenCalledWith({
      limit: 12,
    });
  });
});
