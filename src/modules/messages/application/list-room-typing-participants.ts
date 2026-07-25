import type { MessageAuthorProfileReader } from "@/modules/messages/application/ports/message-author-profile-reader";
import type { RoomTypingIndicatorStore } from "@/modules/messages/application/ports/room-typing-indicator-store";
import { listRoomTypingParticipantsSchema } from "@/modules/messages/validation";

export function createListRoomTypingParticipants(dependencies: {
  messageAuthorProfileReader: MessageAuthorProfileReader;
  roomTypingIndicatorStore: RoomTypingIndicatorStore;
}) {
  return async function listRoomTypingParticipants(input: { roomId: string }) {
    const query = listRoomTypingParticipantsSchema.parse(input);
    const typingIndicators =
      await dependencies.roomTypingIndicatorStore.listActiveTypingIndicators({
        now: new Date(),
        roomId: query.roomId,
      });

    const participants = await Promise.all(
      typingIndicators.map(async (indicator) => ({
        author:
          await dependencies.messageAuthorProfileReader.getMessageAuthorProfileByUserId(
            indicator.userId,
          ),
        expiresAt: indicator.expiresAt,
        userId: indicator.userId,
      })),
    );

    return participants.sort(
      (left, right) => left.expiresAt.getTime() - right.expiresAt.getTime(),
    );
  };
}
