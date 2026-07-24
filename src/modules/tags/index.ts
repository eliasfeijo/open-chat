import { getDatabase } from "@/db";
import { createAssignTagsToRoom } from "@/modules/tags/application/assign-tags-to-room";
import { createListRoomTags } from "@/modules/tags/application/list-room-tags";
import { createReplaceRoomTags } from "@/modules/tags/application/replace-room-tags";
import { createDrizzleRoomTagRepository } from "@/modules/tags/infrastructure/drizzle-room-tag-repository";
import type { DrizzleTagPersistence } from "@/modules/tags/infrastructure/drizzle-tag-persistence";
import { createDrizzleTagRepository } from "@/modules/tags/infrastructure/drizzle-tag-repository";

export function createTagsServices(
  database: DrizzleTagPersistence = getDatabase(),
) {
  const roomTagRepository = createDrizzleRoomTagRepository(database);
  const tagRepository = createDrizzleTagRepository(database);

  return {
    assignTagsToRoom: createAssignTagsToRoom({
      roomTagRepository,
      tagRepository,
    }),
    listRoomTags: createListRoomTags({
      roomTagRepository,
    }),
    replaceRoomTags: createReplaceRoomTags({
      roomTagRepository,
      tagRepository,
    }),
  };
}

export async function listRoomTags(roomId: string) {
  return createTagsServices().listRoomTags(roomId);
}

export {
  tagSlugListFromTextSchema,
  tagSlugListSchema,
  tagSlugSchema,
} from "@/modules/tags/validation";

export type { Tag } from "@/modules/tags/validation";
