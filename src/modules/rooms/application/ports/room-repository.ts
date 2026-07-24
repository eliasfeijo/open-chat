import type { ListRoomsInput, Room } from "@/modules/rooms/validation";

export type CreateRoomRecordInput = {
  description: string | null;
  name: string;
  ownerUserId: string;
  slug: string;
  topic: string | null;
};

export interface RoomRepository {
  create(input: CreateRoomRecordInput): Promise<Room>;
  findBySlug(slug: string): Promise<Room | null>;
  list(input: ListRoomsInput): Promise<Room[]>;
}
