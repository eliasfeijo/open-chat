import type { RoomRepository } from "@/modules/rooms/application/ports/room-repository";
import { listRoomsSchema } from "@/modules/rooms/validation";

export function createListRooms(dependencies: {
  roomRepository: Pick<RoomRepository, "list">;
}) {
  return async function listRooms(input?: { limit?: number }) {
    const query = listRoomsSchema.parse(input ?? {});

    return dependencies.roomRepository.list(query);
  };
}
