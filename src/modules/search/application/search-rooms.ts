import type { RoomSearchRepository } from "@/modules/search/application/ports/room-search-repository";
import { searchRoomsSchema } from "@/modules/search/validation";

export function createSearchRooms(dependencies: {
  roomSearchRepository: Pick<RoomSearchRepository, "search">;
}) {
  return async function searchRooms(input?: {
    limit?: number;
    page?: number | string;
    query?: string | null;
    tagSlug?: string | null;
  }) {
    const query = searchRoomsSchema.parse(input ?? {});

    return dependencies.roomSearchRepository.search(query);
  };
}
