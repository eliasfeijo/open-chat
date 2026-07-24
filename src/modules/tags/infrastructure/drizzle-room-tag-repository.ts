import { asc, eq } from "drizzle-orm";

import { roomTags, tags } from "@/db/schema";
import type { RoomTagRepository } from "@/modules/tags/application/ports/room-tag-repository";
import type { DrizzleTagPersistence } from "@/modules/tags/infrastructure/drizzle-tag-persistence";
import { tagSchema } from "@/modules/tags/validation";

function mapTag(row: typeof tags.$inferSelect) {
  return tagSchema.parse(row);
}

export function createDrizzleRoomTagRepository(
  database: DrizzleTagPersistence,
): RoomTagRepository {
  return {
    async assignTagsToRoom(input) {
      if (input.tagIds.length === 0) {
        return;
      }

      await database
        .insert(roomTags)
        .values(
          input.tagIds.map((tagId) => ({
            roomId: input.roomId,
            tagId,
          })),
        )
        .onConflictDoNothing();
    },

    async listByRoomId(roomId) {
      const roomTagRows = await database
        .select({
          id: tags.id,
          name: tags.name,
          slug: tags.slug,
        })
        .from(roomTags)
        .innerJoin(tags, eq(tags.id, roomTags.tagId))
        .where(eq(roomTags.roomId, roomId))
        .orderBy(asc(tags.name));

      return roomTagRows.map(mapTag);
    },

    async replaceTagsForRoom(input) {
      await database.delete(roomTags).where(eq(roomTags.roomId, input.roomId));

      if (input.tagIds.length === 0) {
        return;
      }

      await database.insert(roomTags).values(
        input.tagIds.map((tagId) => ({
          roomId: input.roomId,
          tagId,
        })),
      );
    },
  };
}
