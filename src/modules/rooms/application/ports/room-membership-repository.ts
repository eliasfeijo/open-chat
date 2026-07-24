import type { RoomMembership } from "@/modules/rooms/validation";

export interface RoomMembershipRepository {
  create(input: RoomMembership): Promise<RoomMembership>;
  deleteByRoomIdAndUserId(input: {
    roomId: string;
    userId: string;
  }): Promise<void>;
  findByRoomIdAndUserId(input: {
    roomId: string;
    userId: string;
  }): Promise<RoomMembership | null>;
}
