import { asc, desc, eq, sql } from "drizzle-orm";

import { roomTags, tags } from "@/db/schema";
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

    async list(input) {
      const listedTags = await database
        .select({
          id: tags.id,
          name: tags.name,
          slug: tags.slug,
        })
        .from(tags)
        .leftJoin(roomTags, eq(roomTags.tagId, tags.id))
        .groupBy(tags.id, tags.name, tags.slug)
        .orderBy(desc(sql<number>`count(${roomTags.roomId})`), asc(tags.name))
        .limit(input?.limit ?? 50);

      return listedTags.map(mapTag);
    },
  };
}
