import { randomUUID } from "node:crypto";
import type { IncomingHttpHeaders } from "node:http";

import { WebSocketServer, type RawData, type WebSocket } from "ws";
import { ZodError } from "zod";

import type { LocalRoomSubscriptionHub } from "@/websocket/local-room-subscription-hub";
import {
  websocketClientMessageSchema,
  websocketServerMessageSchema,
  type WebSocketServerMessage,
} from "@/websocket/validation";

type RealtimeGatewayDependencies = {
  authenticateConnection: (headers: Headers) => Promise<{
    userId: string;
  } | null>;
  authorizeRoomSubscription: (input: {
    actorUserId: string | null;
    roomId: string;
  }) => Promise<unknown>;
  host?: string;
  path?: string;
  port: number;
  roomSubscriptionHub: LocalRoomSubscriptionHub;
};

export type RealtimeGateway = {
  close(): Promise<void>;
  port: number;
};

function createHeadersFromIncomingHeaders(
  headers: IncomingHttpHeaders,
): Headers {
  const requestHeaders = new Headers();

  for (const [key, value] of Object.entries(headers)) {
    if (!value) {
      continue;
    }

    if (Array.isArray(value)) {
      for (const entry of value) {
        requestHeaders.append(key, entry);
      }

      continue;
    }

    requestHeaders.set(key, value);
  }

  return requestHeaders;
}

function parseRawSocketMessage(rawMessage: RawData) {
  const messageText =
    typeof rawMessage === "string" ? rawMessage : rawMessage.toString("utf8");

  return JSON.parse(messageText) as unknown;
}

function createSendJson(socket: WebSocket) {
  return function sendJson(message: WebSocketServerMessage) {
    if (socket.readyState !== socket.OPEN) {
      return;
    }

    socket.send(JSON.stringify(websocketServerMessageSchema.parse(message)));
  };
}

export async function createRealtimeGateway(
  dependencies: RealtimeGatewayDependencies,
): Promise<RealtimeGateway> {
  const websocketServer = new WebSocketServer({
    host: dependencies.host ?? "0.0.0.0",
    path: dependencies.path ?? "/ws",
    port: dependencies.port,
  });

  await new Promise<void>((resolve, reject) => {
    websocketServer.once("listening", () => resolve());
    websocketServer.once("error", (error) => reject(error));
  });

  websocketServer.on("connection", async (socket, request) => {
    const authenticatedConnection = await dependencies.authenticateConnection(
      createHeadersFromIncomingHeaders(request.headers),
    );

    if (!authenticatedConnection) {
      socket.send(
        JSON.stringify({
          message: "Authentication required for realtime room subscriptions.",
          type: "error",
        }),
      );
      socket.close(4401, "Authentication required.");

      return;
    }

    const sendJson = createSendJson(socket);
    const connectionId = randomUUID();

    socket.on("close", () => {
      dependencies.roomSubscriptionHub.disconnectConnection(connectionId);
    });

    socket.on("message", async (rawMessage) => {
      try {
        const message = websocketClientMessageSchema.parse(
          parseRawSocketMessage(rawMessage),
        );

        if (message.type === "subscribe-room") {
          await dependencies.authorizeRoomSubscription({
            actorUserId: authenticatedConnection.userId,
            roomId: message.roomId,
          });

          dependencies.roomSubscriptionHub.subscribeConnectionToRoom({
            connection: {
              id: connectionId,
              send: sendJson,
              userId: authenticatedConnection.userId,
            },
            roomId: message.roomId,
          });

          sendJson({
            roomId: message.roomId,
            type: "subscribed-room",
          });
        }
      } catch (error) {
        const message =
          error instanceof ZodError
            ? "Invalid realtime payload."
            : error instanceof Error
              ? error.message
              : "Unexpected realtime error.";

        sendJson({
          message,
          type: "error",
        });
      }
    });
  });

  const address = websocketServer.address();

  if (!address || typeof address === "string") {
    throw new Error("Realtime gateway did not expose a TCP port.");
  }

  return {
    async close() {
      await new Promise<void>((resolve, reject) => {
        websocketServer.close((error) => {
          if (error) {
            reject(error);

            return;
          }

          resolve();
        });
      });
    },
    port: address.port,
  };
}
