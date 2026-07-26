import type {
  PaginatedRoomSearchResult,
  SearchRoomsInput,
} from "@/modules/search/validation";

export interface RoomSearchRepository {
  search(input: SearchRoomsInput): Promise<PaginatedRoomSearchResult>;
}
