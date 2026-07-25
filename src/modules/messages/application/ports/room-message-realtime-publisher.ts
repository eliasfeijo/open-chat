import type { MessageAuthorProfile } from "@/modules/messages/application/ports/message-author-profile-reader";

export type RoomMessagePostedEvent = {
  author: MessageAuthorProfile | null;
  message: {
    authorUserId: string;
    body: string;
    createdAt: Date;
    id: string;
    roomId: string;
  };
};

export interface RoomMessageRealtimePublisher {
  publishRoomMessagePosted(event: RoomMessagePostedEvent): Promise<void>;
}
