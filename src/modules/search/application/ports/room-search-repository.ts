import type {
  RoomSearchResult,
  SearchRoomsInput,
} from "@/modules/search/validation";

export interface RoomSearchRepository {
  search(input: SearchRoomsInput): Promise<RoomSearchResult[]>;
}
