import type { RoomRepository } from "@/modules/rooms/application/ports/room-repository";
import { getRoomBySlugSchema } from "@/modules/rooms/validation";

export function createGetRoomBySlug(dependencies: {
  roomRepository: Pick<RoomRepository, "findBySlug">;
}) {
  return async function getRoomBySlug(slug: string) {
    const query = getRoomBySlugSchema.parse({
      slug,
    });

    return dependencies.roomRepository.findBySlug(query.slug);
  };
}
