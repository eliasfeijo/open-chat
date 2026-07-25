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
    publishRoomPresenceUpdated(roomId: string): Promise<void>;
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

function mapRoomPresenceUpdatedEvent(input: {
  activeUserCount: number;
  roomId: string;
}): WebSocketServerMessage {
  return {
    activeUserCount: input.activeUserCount,
    roomId: input.roomId,
    type: "room-presence-updated",
  };
}

export function createLocalRoomSubscriptionHub(): LocalRoomSubscriptionHub {
  const roomConnections = new Map<string, Map<string, RoomConnection>>();
  const subscribedRoomIdsByConnectionId = new Map<string, Set<string>>();

  function getActiveUserCount(roomId: string) {
    const connections = roomConnections.get(roomId);

    if (!connections || connections.size === 0) {
      return 0;
    }

    return new Set(
      Array.from(connections.values(), (connection) => connection.userId),
    ).size;
  }

  async function publishRoomPresenceUpdated(roomId: string) {
    const subscribedConnections = roomConnections.get(roomId);

    if (!subscribedConnections || subscribedConnections.size === 0) {
      return;
    }

    const message = mapRoomPresenceUpdatedEvent({
      activeUserCount: getActiveUserCount(roomId),
      roomId,
    });

    for (const connection of subscribedConnections.values()) {
      connection.send(message);
    }
  }

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

      for (const roomId of subscribedRoomIds) {
        void publishRoomPresenceUpdated(roomId);
      }
    },

    publishRoomPresenceUpdated,

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
