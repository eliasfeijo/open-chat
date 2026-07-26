import type { TagRepository } from "@/modules/tags/application/ports/tag-repository";
import { listTagsSchema } from "@/modules/tags/validation";

export function createListTags(dependencies: {
  tagRepository: Pick<TagRepository, "list">;
}) {
  return async function listTags(input?: { limit?: number }) {
    const query = listTagsSchema.parse(input ?? {});

    return dependencies.tagRepository.list(query);
  };
}
