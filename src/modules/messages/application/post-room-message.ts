import type { MessageAuthorProfileReader } from "@/modules/messages/application/ports/message-author-profile-reader";
import type { MessageRepository } from "@/modules/messages/application/ports/message-repository";
import type { RoomMembershipReader } from "@/modules/messages/application/ports/room-membership-reader";
import type { RoomMessageRealtimePublisher } from "@/modules/messages/application/ports/room-message-realtime-publisher";
import {
  RoomMessageAuthorNotMemberError,
  UnauthenticatedMessageAuthorError,
} from "@/modules/messages/domain/message";
import { postRoomMessageSchema } from "@/modules/messages/validation";

export function createPostRoomMessage(dependencies: {
  messageAuthorProfileReader?: MessageAuthorProfileReader;
  messageRepository: Pick<MessageRepository, "create">;
  roomMessageRealtimePublisher?: RoomMessageRealtimePublisher;
  roomMembershipReader: RoomMembershipReader;
}) {
  return async function postRoomMessage(input: {
    actorUserId: string | null;
    body: string;
    roomId: string;
  }) {
    if (!input.actorUserId) {
      throw new UnauthenticatedMessageAuthorError();
    }

    const command = postRoomMessageSchema.parse(input);
    const membership =
      await dependencies.roomMembershipReader.getRoomMembership({
        roomId: command.roomId,
        userId: command.actorUserId,
      });

    if (!membership) {
      throw new RoomMessageAuthorNotMemberError(
        command.roomId,
        command.actorUserId,
      );
    }

    const createdMessage = await dependencies.messageRepository.create({
      authorUserId: command.actorUserId,
      body: command.body,
      roomId: command.roomId,
    });

    if (dependencies.roomMessageRealtimePublisher) {
      const author = dependencies.messageAuthorProfileReader
        ? await dependencies.messageAuthorProfileReader.getMessageAuthorProfileByUserId(
            createdMessage.authorUserId,
          )
        : null;

      await dependencies.roomMessageRealtimePublisher.publishRoomMessagePosted({
        author,
        message: createdMessage,
      });
    }

    return createdMessage;
  };
}
