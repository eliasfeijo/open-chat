import type { RoomTagRepository } from "@/modules/tags/application/ports/room-tag-repository";
import type { TagRepository } from "@/modules/tags/application/ports/tag-repository";
import {
  deduplicateTagSlugs,
  TagResolutionFailedError,
} from "@/modules/tags/domain/tag";
import { tagSlugListSchema } from "@/modules/tags/validation";

async function resolveTagsBySlug(dependencies: {
  tagRepository: Pick<TagRepository, "create" | "findBySlug">;
  tagSlugs: string[];
}) {
  const resolvedTags = [];

  for (const tagSlug of dependencies.tagSlugs) {
    const existingTag = await dependencies.tagRepository.findBySlug(tagSlug);

    if (existingTag) {
      resolvedTags.push(existingTag);
      continue;
    }

    try {
      const createdTag = await dependencies.tagRepository.create({
        name: tagSlug,
        slug: tagSlug,
      });

      resolvedTags.push(createdTag);
    } catch {
      const concurrentTag =
        await dependencies.tagRepository.findBySlug(tagSlug);

      if (!concurrentTag) {
        throw new TagResolutionFailedError(tagSlug);
      }

      resolvedTags.push(concurrentTag);
    }
  }

  return resolvedTags;
}

export function createReplaceRoomTags(dependencies: {
  roomTagRepository: Pick<RoomTagRepository, "replaceTagsForRoom">;
  tagRepository: Pick<TagRepository, "create" | "findBySlug">;
}) {
  return async function replaceRoomTags(input: {
    roomId: string;
    tagSlugs: string[];
  }) {
    const tagSlugs = deduplicateTagSlugs(
      tagSlugListSchema.parse(input.tagSlugs),
    );

    const resolvedTags = await resolveTagsBySlug({
      tagRepository: dependencies.tagRepository,
      tagSlugs,
    });

    await dependencies.roomTagRepository.replaceTagsForRoom({
      roomId: input.roomId,
      tagIds: resolvedTags.map((tag) => tag.id),
    });

    return resolvedTags;
  };
}
