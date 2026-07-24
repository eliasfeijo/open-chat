import type {
  RoomRepository,
  UpdateRoomDetailsRecordInput,
} from "@/modules/rooms/application/ports/room-repository";
import {
  RoomNotFoundError,
  RoomUpdateForbiddenError,
  UnauthenticatedRoomEditorError,
} from "@/modules/rooms/domain/room-errors";
import { updateRoomDetailsSchema } from "@/modules/rooms/validation";

export function createUpdateRoomDetails(dependencies: {
  roomRepository: Pick<RoomRepository, "findById">;
  runInTransaction: <T>(
    operation: (transactionDependencies: {
      replaceRoomTags: (input: {
        roomId: string;
        tagSlugs: string[];
      }) => Promise<unknown>;
      roomRepository: Pick<RoomRepository, "updateDetailsById">;
    }) => Promise<T>,
  ) => Promise<T>;
}) {
  return async function updateRoomDetails(input: {
    actorUserId: string | null;
    description: string | null;
    name: string;
    roomId: string;
    tagSlugs: string[];
    topic: string | null;
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

    return dependencies.runInTransaction(
      async ({ replaceRoomTags, roomRepository }) => {
        const updatedRoom =
          await roomRepository.updateDetailsById(roomDetailsToUpdate);

        await replaceRoomTags({
          roomId: command.roomId,
          tagSlugs: command.tagSlugs,
        });

        return updatedRoom;
      },
    );
  };
}
