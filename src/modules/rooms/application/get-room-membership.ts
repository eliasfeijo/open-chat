import type { RoomMembershipRepository } from "@/modules/rooms/application/ports/room-membership-repository";
import { getRoomMembershipSchema } from "@/modules/rooms/validation";

export function createGetRoomMembership(dependencies: {
  roomMembershipRepository: Pick<
    RoomMembershipRepository,
    "findByRoomIdAndUserId"
  >;
}) {
  return async function getRoomMembership(input: {
    roomId: string;
    userId: string;
  }) {
    const query = getRoomMembershipSchema.parse(input);

    return dependencies.roomMembershipRepository.findByRoomIdAndUserId(query);
  };
}
