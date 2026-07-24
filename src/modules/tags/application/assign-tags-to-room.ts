import type { RoomTagRepository } from "@/modules/tags/application/ports/room-tag-repository";
import type { TagRepository } from "@/modules/tags/application/ports/tag-repository";
import {
  deduplicateTagSlugs,
  TagResolutionFailedError,
} from "@/modules/tags/domain/tag";
import { tagSlugListSchema } from "@/modules/tags/validation";

export function createAssignTagsToRoom(dependencies: {
  roomTagRepository: Pick<RoomTagRepository, "assignTagsToRoom">;
  tagRepository: Pick<TagRepository, "create" | "findBySlug">;
}) {
  return async function assignTagsToRoom(input: {
    roomId: string;
    tagSlugs: string[];
  }) {
    const tagSlugs = deduplicateTagSlugs(
      tagSlugListSchema.parse(input.tagSlugs),
    );

    if (tagSlugs.length === 0) {
      return [];
    }

    const resolvedTags = [];

    for (const tagSlug of tagSlugs) {
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

    await dependencies.roomTagRepository.assignTagsToRoom({
      roomId: input.roomId,
      tagIds: resolvedTags.map((tag) => tag.id),
    });

    return resolvedTags;
  };
}
