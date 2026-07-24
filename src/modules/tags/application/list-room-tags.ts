import type { RoomTagRepository } from "@/modules/tags/application/ports/room-tag-repository";
import { roomIdSchema } from "@/modules/tags/validation";

export function createListRoomTags(dependencies: {
  roomTagRepository: Pick<RoomTagRepository, "listByRoomId">;
}) {
  return async function listRoomTags(roomId: string) {
    return dependencies.roomTagRepository.listByRoomId(
      roomIdSchema.parse(roomId),
    );
  };
}
