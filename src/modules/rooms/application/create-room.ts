import type { RoomMembershipRepository } from "@/modules/rooms/application/ports/room-membership-repository";
import type {
  CreateRoomRecordInput,
  RoomRepository,
} from "@/modules/rooms/application/ports/room-repository";
import {
  createOwnerRoomMembership,
  RoomSlugAlreadyExistsError,
} from "@/modules/rooms/domain/room";
import { createRoomSchema } from "@/modules/rooms/validation";

type CreateRoomTransactionDependencies = {
  roomMembershipRepository: Pick<RoomMembershipRepository, "create">;
  roomRepository: Pick<RoomRepository, "create">;
};

export function createCreateRoom(dependencies: {
  roomRepository: Pick<RoomRepository, "findBySlug">;
  runInTransaction: <T>(
    operation: (
      transactionDependencies: CreateRoomTransactionDependencies,
    ) => Promise<T>,
  ) => Promise<T>;
}) {
  return async function createRoom(input: {
    actorUserId: string;
    description: string;
    name: string;
    slug: string;
    topic: string;
  }) {
    const command = createRoomSchema.parse(input);
    const existingRoom = await dependencies.roomRepository.findBySlug(
      command.slug,
    );

    if (existingRoom) {
      throw new RoomSlugAlreadyExistsError(command.slug);
    }

    const roomToCreate: CreateRoomRecordInput = {
      description: command.description,
      name: command.name,
      ownerUserId: command.actorUserId,
      slug: command.slug,
      topic: command.topic,
    };

    return dependencies.runInTransaction(
      async ({ roomMembershipRepository, roomRepository }) => {
        const createdRoom = await roomRepository.create(roomToCreate);

        await roomMembershipRepository.create(
          createOwnerRoomMembership({
            joinedAt: createdRoom.createdAt,
            roomId: createdRoom.id,
            userId: command.actorUserId,
          }),
        );

        return createdRoom;
      },
    );
  };
}
