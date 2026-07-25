import type { MessageAuthorProfile } from "@/modules/messages/application/ports/message-author-profile-reader";

export type RoomTypingParticipant = {
  author: MessageAuthorProfile | null;
  expiresAt: Date;
  userId: string;
};

export type RoomTypingUpdatedEvent = {
  roomId: string;
  typingParticipants: RoomTypingParticipant[];
};

export interface RoomTypingRealtimePublisher {
  publishRoomTypingUpdated(event: RoomTypingUpdatedEvent): Promise<void>;
}
