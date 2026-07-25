import type { RoomMembershipRepository } from "@/modules/rooms/application/ports/room-membership-repository";
import { listUserRoomMembershipsSchema } from "@/modules/rooms/validation";

export function createListUserRoomMemberships(dependencies: {
  roomMembershipRepository: Pick<RoomMembershipRepository, "listByUserId">;
}) {
  return async function listUserRoomMemberships(input: { userId: string }) {
    const query = listUserRoomMembershipsSchema.parse(input);

    return dependencies.roomMembershipRepository.listByUserId(query.userId);
  };
}
