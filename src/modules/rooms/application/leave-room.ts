import type { RoomMembershipRepository } from "@/modules/rooms/application/ports/room-membership-repository";
import {
  canLeaveRoom,
  RoomMembershipNotFoundError,
  RoomOwnerCannotLeaveError,
  UnauthenticatedRoomMembershipActorError,
} from "@/modules/rooms/domain/room";
import { leaveRoomSchema } from "@/modules/rooms/validation";

export function createLeaveRoom(dependencies: {
  roomMembershipRepository: Pick<
    RoomMembershipRepository,
    "deleteByRoomIdAndUserId" | "findByRoomIdAndUserId"
  >;
}) {
  return async function leaveRoom(input: {
    actorUserId: string | null;
    roomId: string;
  }) {
    if (!input.actorUserId) {
      throw new UnauthenticatedRoomMembershipActorError();
    }

    const command = leaveRoomSchema.parse(input);
    const existingMembership =
      await dependencies.roomMembershipRepository.findByRoomIdAndUserId({
        roomId: command.roomId,
        userId: command.actorUserId,
      });

    if (!existingMembership) {
      throw new RoomMembershipNotFoundError(
        command.roomId,
        command.actorUserId,
      );
    }

    if (!canLeaveRoom(existingMembership)) {
      throw new RoomOwnerCannotLeaveError(command.roomId, command.actorUserId);
    }

    await dependencies.roomMembershipRepository.deleteByRoomIdAndUserId({
      roomId: command.roomId,
      userId: command.actorUserId,
    });
  };
}
