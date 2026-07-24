import { eq } from "drizzle-orm";

import { tags } from "@/db/schema";
import type {
  CreateTagRecordInput,
  TagRepository,
} from "@/modules/tags/application/ports/tag-repository";
import type { DrizzleTagPersistence } from "@/modules/tags/infrastructure/drizzle-tag-persistence";
import { tagSchema } from "@/modules/tags/validation";

function mapTag(row: typeof tags.$inferSelect) {
  return tagSchema.parse(row);
}

export function createDrizzleTagRepository(
  database: DrizzleTagPersistence,
): TagRepository {
  return {
    async create(input: CreateTagRecordInput) {
      const [createdTag] = await database
        .insert(tags)
        .values(input)
        .returning();

      return mapTag(createdTag);
    },

    async findBySlug(slug) {
      const tag = await database.query.tags.findFirst({
        where: eq(tags.slug, slug),
      });

      return tag ? mapTag(tag) : null;
    },
  };
}
