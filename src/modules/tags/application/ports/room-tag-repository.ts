import type { Tag } from "@/modules/tags/validation";

export interface RoomTagRepository {
  assignTagsToRoom(input: { roomId: string; tagIds: string[] }): Promise<void>;
  listByRoomId(roomId: string): Promise<Tag[]>;
  replaceTagsForRoom(input: {
    roomId: string;
    tagIds: string[];
  }): Promise<void>;
}
