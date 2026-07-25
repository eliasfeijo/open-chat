import type { MessageAuthorProfile } from "@/modules/messages/application/ports/message-author-profile-reader";
import type {
  RoomMessagePostedEvent,
  RoomMessageRealtimePublisher,
} from "@/modules/messages/application/ports/room-message-realtime-publisher";
import type { WebSocketServerMessage } from "@/websocket/validation";

type RoomConnection = {
  id: string;
  send: (message: WebSocketServerMessage) => void;
  userId: string;
};

export type LocalRoomSubscriptionHub = RoomMessageRealtimePublisher & {
  disconnectConnection(connectionId: string): void;
  subscribeConnectionToRoom(input: {
    connection: RoomConnection;
    roomId: string;
  }): void;
};

function mapAuthor(author: MessageAuthorProfile | null) {
  if (!author) {
    return null;
  }

  return {
    bio: author.bio,
    displayName: author.displayName,
    id: author.id,
    username: author.username,
  };
}

function mapRoomMessagePostedEvent(
  event: RoomMessagePostedEvent,
): WebSocketServerMessage {
  return {
    author: mapAuthor(event.author),
    message: {
      authorUserId: event.message.authorUserId,
      body: event.message.body,
      createdAt: event.message.createdAt.toISOString(),
      id: event.message.id,
      roomId: event.message.roomId,
    },
    type: "room-message-posted",
  };
}

export function createLocalRoomSubscriptionHub(): LocalRoomSubscriptionHub {
  const roomConnections = new Map<string, Map<string, RoomConnection>>();
  const subscribedRoomIdsByConnectionId = new Map<string, Set<string>>();

  return {
    disconnectConnection(connectionId) {
      const subscribedRoomIds =
        subscribedRoomIdsByConnectionId.get(connectionId) ?? new Set<string>();

      for (const roomId of subscribedRoomIds) {
        const connections = roomConnections.get(roomId);

        if (!connections) {
          continue;
        }

        connections.delete(connectionId);

        if (connections.size === 0) {
          roomConnections.delete(roomId);
        }
      }

      subscribedRoomIdsByConnectionId.delete(connectionId);
    },

    async publishRoomMessagePosted(event) {
      const subscribedConnections = roomConnections.get(event.message.roomId);

      if (!subscribedConnections || subscribedConnections.size === 0) {
        return;
      }

      const message = mapRoomMessagePostedEvent(event);

      for (const connection of subscribedConnections.values()) {
        connection.send(message);
      }
    },

    subscribeConnectionToRoom({ connection, roomId }) {
      let subscribedRoomIds = subscribedRoomIdsByConnectionId.get(
        connection.id,
      );

      if (!subscribedRoomIds) {
        subscribedRoomIds = new Set<string>();
        subscribedRoomIdsByConnectionId.set(connection.id, subscribedRoomIds);
      }

      subscribedRoomIds.add(roomId);

      let connections = roomConnections.get(roomId);

      if (!connections) {
        connections = new Map<string, RoomConnection>();
        roomConnections.set(roomId, connections);
      }

      connections.set(connection.id, connection);
    },
  };
}
