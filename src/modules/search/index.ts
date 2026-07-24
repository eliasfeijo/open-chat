import { getDatabase } from "@/db";
import { createSearchRooms } from "@/modules/search/application/search-rooms";
import { createDrizzleRoomSearchRepository } from "@/modules/search/infrastructure/drizzle-room-search-repository";

function createSearchServices() {
  const roomSearchRepository = createDrizzleRoomSearchRepository(getDatabase());

  return {
    searchRooms: createSearchRooms({
      roomSearchRepository,
    }),
  };
}

export async function searchRooms(input?: {
  limit?: number;
  query?: string | null;
  tagSlug?: string | null;
}) {
  return createSearchServices().searchRooms(input);
}

export type {
  RoomSearchResult,
  SearchRoomsInput,
} from "@/modules/search/validation";
