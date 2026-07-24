import type {
  RoomRepository,
  UpdateRoomDetailsRecordInput,
} from "@/modules/rooms/application/ports/room-repository";
import {
  RoomNotFoundError,
  RoomUpdateForbiddenError,
  UnauthenticatedRoomEditorError,
} from "@/modules/rooms/domain/room";
import { updateRoomDetailsSchema } from "@/modules/rooms/validation";

export function createUpdateRoomDetails(dependencies: {
  roomRepository: Pick<RoomRepository, "findById" | "updateDetailsById">;
}) {
  return async function updateRoomDetails(input: {
    actorUserId: string | null;
    description: string;
    name: string;
    roomId: string;
    topic: string;
  }) {
    if (!input.actorUserId) {
      throw new UnauthenticatedRoomEditorError();
    }

    const command = updateRoomDetailsSchema.parse(input);
    const existingRoom = await dependencies.roomRepository.findById(
      command.roomId,
    );

    if (!existingRoom) {
      throw new RoomNotFoundError(command.roomId);
    }

    if (existingRoom.ownerUserId !== command.actorUserId) {
      throw new RoomUpdateForbiddenError(command.roomId, command.actorUserId);
    }

    const roomDetailsToUpdate: UpdateRoomDetailsRecordInput = {
      description: command.description,
      name: command.name,
      roomId: command.roomId,
      topic: command.topic,
    };

    return dependencies.roomRepository.updateDetailsById(roomDetailsToUpdate);
  };
}
