import type { RoomMembershipRepository } from "@/modules/rooms/application/ports/room-membership-repository";
import type { RoomRepository } from "@/modules/rooms/application/ports/room-repository";
import { createMemberRoomMembership } from "@/modules/rooms/domain/room";
import {
  RoomMembershipAlreadyExistsError,
  RoomNotFoundError,
  UnauthenticatedRoomMembershipActorError,
} from "@/modules/rooms/domain/room-errors";
import { joinRoomSchema } from "@/modules/rooms/validation";

export function createJoinRoom(dependencies: {
  roomMembershipRepository: Pick<
    RoomMembershipRepository,
    "create" | "findByRoomIdAndUserId"
  >;
  roomRepository: Pick<RoomRepository, "findById">;
}) {
  return async function joinRoom(input: {
    actorUserId: string | null;
    roomId: string;
  }) {
    if (!input.actorUserId) {
      throw new UnauthenticatedRoomMembershipActorError();
    }

    const command = joinRoomSchema.parse(input);
    const room = await dependencies.roomRepository.findById(command.roomId);

    if (!room) {
      throw new RoomNotFoundError(command.roomId);
    }

    const existingMembership =
      await dependencies.roomMembershipRepository.findByRoomIdAndUserId({
        roomId: command.roomId,
        userId: command.actorUserId,
      });

    if (existingMembership) {
      throw new RoomMembershipAlreadyExistsError(
        command.roomId,
        command.actorUserId,
      );
    }

    return dependencies.roomMembershipRepository.create(
      createMemberRoomMembership({
        joinedAt: new Date(),
        roomId: command.roomId,
        userId: command.actorUserId,
      }),
    );
  };
}
