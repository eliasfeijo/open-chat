import type { RoomMembership } from "@/modules/rooms/validation";

export interface RoomMembershipRepository {
  create(input: RoomMembership): Promise<RoomMembership>;
}
