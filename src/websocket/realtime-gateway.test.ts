import { afterEach, describe, expect, it, vi } from "vitest";
import WebSocket from "ws";

import { createLocalRoomSubscriptionHub } from "@/websocket/local-room-subscription-hub";
import {
  createRealtimeGateway,
  type RealtimeGateway,
} from "@/websocket/realtime-gateway";
import type { WebSocketServerMessage } from "@/websocket/validation";

function createTypingParticipant(userId: string, expiresAt: string) {
  return {
    author: {
      bio: `Bio for ${userId}`,
      displayName: `Display ${userId}`,
      id: userId,
      username: userId,
    },
    expiresAt: new Date(expiresAt),
    userId,
  };
}

const queuedMessagesBySocket = new WeakMap<
  WebSocket,
  WebSocketServerMessage[]
>();
const pendingMessageReadersBySocket = new WeakMap<
  WebSocket,
  Array<(message: WebSocketServerMessage) => void>
>();

function registerSocketMessageQueue(socket: WebSocket) {
  queuedMessagesBySocket.set(socket, []);
  pendingMessageReadersBySocket.set(socket, []);

  socket.on("message", (rawMessage) => {
    const message = JSON.parse(
      rawMessage.toString("utf8"),
    ) as WebSocketServerMessage;
    const pendingReaders = pendingMessageReadersBySocket.get(socket) ?? [];

    if (pendingReaders.length > 0) {
      const nextReader = pendingReaders.shift();

      if (nextReader) {
        nextReader(message);
      }

      return;
    }

    const queuedMessages = queuedMessagesBySocket.get(socket) ?? [];
    queuedMessages.push(message);
    queuedMessagesBySocket.set(socket, queuedMessages);
  });
}

async function connectClient(port: number) {
  const socket = new WebSocket(`ws://127.0.0.1:${port}/ws`);

  await new Promise<void>((resolve, reject) => {
    socket.once("open", () => resolve());
    socket.once("error", (error) => reject(error));
  });

  registerSocketMessageQueue(socket);

  return socket;
}

async function readMessage(socket: WebSocket) {
  const queuedMessages = queuedMessagesBySocket.get(socket) ?? [];
  const nextQueuedMessage = queuedMessages.shift();

  if (nextQueuedMessage) {
    return nextQueuedMessage;
  }

  return new Promise<WebSocketServerMessage>((resolve, reject) => {
    const pendingReaders = pendingMessageReadersBySocket.get(socket) ?? [];
    pendingReaders.push(resolve);
    pendingMessageReadersBySocket.set(socket, pendingReaders);
    socket.once("error", (error) => reject(error));
  });
}

async function waitForClose(socket: WebSocket) {
  return new Promise<{ code: number; reason: Buffer }>((resolve, reject) => {
    socket.once("close", (code, reason) => resolve({ code, reason }));
    socket.once("error", (error) => reject(error));
  });
}

async function expectNoMessage(socket: WebSocket) {
  await expect(
    Promise.race([
      readMessage(socket),
      new Promise<"timeout">((resolve) => {
        setTimeout(() => resolve("timeout"), 150);
      }),
    ]),
  ).resolves.toBe("timeout");
}

describe("createRealtimeGateway", () => {
  const gateways: RealtimeGateway[] = [];

  afterEach(async () => {
    await Promise.all(gateways.splice(0).map((gateway) => gateway.close()));
  });

  it("broadcasts durable room messages only to subscribed room connections", async () => {
    const roomSubscriptionHub = createLocalRoomSubscriptionHub();
    const authorizeRoomSubscription = vi.fn().mockResolvedValue(undefined);
    const gateway = await createRealtimeGateway({
      authenticateConnection: vi.fn().mockResolvedValue({
        userId: "user-1",
      }),
      authorizeRoomSubscription,
      host: "127.0.0.1",
      listRoomTypingParticipants: vi.fn().mockResolvedValue([]),
      port: 0,
      roomSubscriptionHub,
      setRoomTypingState: vi.fn(),
    });

    gateways.push(gateway);

    const subscribedRoomSocket = await connectClient(gateway.port);
    const otherRoomSocket = await connectClient(gateway.port);

    subscribedRoomSocket.send(
      JSON.stringify({
        roomId: "9f441a9f-e920-4e92-93d8-6eb7364580fe",
        type: "subscribe-room",
      }),
    );
    otherRoomSocket.send(
      JSON.stringify({
        roomId: "a35c596e-d022-421f-9c3d-6f9960f5c6c2",
        type: "subscribe-room",
      }),
    );

    await expect(readMessage(subscribedRoomSocket)).resolves.toMatchObject({
      roomId: "9f441a9f-e920-4e92-93d8-6eb7364580fe",
      type: "subscribed-room",
    });
    await expect(readMessage(otherRoomSocket)).resolves.toMatchObject({
      roomId: "a35c596e-d022-421f-9c3d-6f9960f5c6c2",
      type: "subscribed-room",
    });
    await expect(readMessage(subscribedRoomSocket)).resolves.toMatchObject({
      activeUserCount: 1,
      roomId: "9f441a9f-e920-4e92-93d8-6eb7364580fe",
      type: "room-presence-updated",
    });
    await expect(readMessage(subscribedRoomSocket)).resolves.toMatchObject({
      roomId: "9f441a9f-e920-4e92-93d8-6eb7364580fe",
      type: "room-typing-updated",
      typingParticipants: [],
    });
    await expect(readMessage(otherRoomSocket)).resolves.toMatchObject({
      activeUserCount: 1,
      roomId: "a35c596e-d022-421f-9c3d-6f9960f5c6c2",
      type: "room-presence-updated",
    });
    await expect(readMessage(otherRoomSocket)).resolves.toMatchObject({
      roomId: "a35c596e-d022-421f-9c3d-6f9960f5c6c2",
      type: "room-typing-updated",
      typingParticipants: [],
    });

    await roomSubscriptionHub.publishRoomMessagePosted({
      author: {
        bio: "Realtime delivery in progress.",
        displayName: "OpenChat Builder",
        id: "user-1",
        username: "builder",
      },
      message: {
        authorUserId: "user-1",
        body: "Persist first, then fan out.",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        id: "2f1f9e5e-fc8a-43a1-95f5-f9ef57f9a347",
        roomId: "9f441a9f-e920-4e92-93d8-6eb7364580fe",
      },
    });

    await expect(readMessage(subscribedRoomSocket)).resolves.toMatchObject({
      author: {
        displayName: "OpenChat Builder",
        username: "builder",
      },
      message: {
        body: "Persist first, then fan out.",
        roomId: "9f441a9f-e920-4e92-93d8-6eb7364580fe",
      },
      type: "room-message-posted",
    });
    await expectNoMessage(otherRoomSocket);

    expect(authorizeRoomSubscription).toHaveBeenNthCalledWith(1, {
      actorUserId: "user-1",
      roomId: "9f441a9f-e920-4e92-93d8-6eb7364580fe",
    });
    expect(authorizeRoomSubscription).toHaveBeenNthCalledWith(2, {
      actorUserId: "user-1",
      roomId: "a35c596e-d022-421f-9c3d-6f9960f5c6c2",
    });

    subscribedRoomSocket.close();
    otherRoomSocket.close();
  });

  it("subscribes successfully when the client sends immediately after open", async () => {
    const roomSubscriptionHub = createLocalRoomSubscriptionHub();
    const gateway = await createRealtimeGateway({
      authenticateConnection: vi.fn().mockImplementation(
        () =>
          new Promise<{ userId: string }>((resolve) => {
            setTimeout(() => resolve({ userId: "user-1" }), 100);
          }),
      ),
      authorizeRoomSubscription: vi.fn().mockResolvedValue(undefined),
      host: "127.0.0.1",
      listRoomTypingParticipants: vi.fn().mockResolvedValue([]),
      port: 0,
      roomSubscriptionHub,
      setRoomTypingState: vi.fn(),
    });

    gateways.push(gateway);

    const socket = await connectClient(gateway.port);

    socket.send(
      JSON.stringify({
        roomId: "9f441a9f-e920-4e92-93d8-6eb7364580fe",
        type: "subscribe-room",
      }),
    );

    await expect(readMessage(socket)).resolves.toMatchObject({
      roomId: "9f441a9f-e920-4e92-93d8-6eb7364580fe",
      type: "subscribed-room",
    });
    await expect(readMessage(socket)).resolves.toMatchObject({
      activeUserCount: 1,
      roomId: "9f441a9f-e920-4e92-93d8-6eb7364580fe",
      type: "room-presence-updated",
    });
    await expect(readMessage(socket)).resolves.toMatchObject({
      roomId: "9f441a9f-e920-4e92-93d8-6eb7364580fe",
      type: "room-typing-updated",
      typingParticipants: [],
    });

    socket.close();
  });

  it("broadcasts room-scoped presence counts on subscribe and disconnect", async () => {
    const roomSubscriptionHub = createLocalRoomSubscriptionHub();
    const gateway = await createRealtimeGateway({
      authenticateConnection: vi
        .fn()
        .mockResolvedValueOnce({ userId: "user-1" })
        .mockResolvedValueOnce({ userId: "user-2" })
        .mockResolvedValueOnce({ userId: "user-3" }),
      authorizeRoomSubscription: vi.fn().mockResolvedValue(undefined),
      host: "127.0.0.1",
      listRoomTypingParticipants: vi.fn().mockResolvedValue([]),
      port: 0,
      roomSubscriptionHub,
      setRoomTypingState: vi.fn(),
    });

    gateways.push(gateway);

    const firstRoomSocket = await connectClient(gateway.port);
    const secondRoomSocket = await connectClient(gateway.port);
    const otherRoomSocket = await connectClient(gateway.port);

    firstRoomSocket.send(
      JSON.stringify({
        roomId: "9f441a9f-e920-4e92-93d8-6eb7364580fe",
        type: "subscribe-room",
      }),
    );

    await expect(readMessage(firstRoomSocket)).resolves.toMatchObject({
      roomId: "9f441a9f-e920-4e92-93d8-6eb7364580fe",
      type: "subscribed-room",
    });
    await expect(readMessage(firstRoomSocket)).resolves.toMatchObject({
      activeUserCount: 1,
      roomId: "9f441a9f-e920-4e92-93d8-6eb7364580fe",
      type: "room-presence-updated",
    });
    await expect(readMessage(firstRoomSocket)).resolves.toMatchObject({
      roomId: "9f441a9f-e920-4e92-93d8-6eb7364580fe",
      type: "room-typing-updated",
      typingParticipants: [],
    });

    otherRoomSocket.send(
      JSON.stringify({
        roomId: "a35c596e-d022-421f-9c3d-6f9960f5c6c2",
        type: "subscribe-room",
      }),
    );

    await expect(readMessage(otherRoomSocket)).resolves.toMatchObject({
      roomId: "a35c596e-d022-421f-9c3d-6f9960f5c6c2",
      type: "subscribed-room",
    });
    await expect(readMessage(otherRoomSocket)).resolves.toMatchObject({
      activeUserCount: 1,
      roomId: "a35c596e-d022-421f-9c3d-6f9960f5c6c2",
      type: "room-presence-updated",
    });
    await expect(readMessage(otherRoomSocket)).resolves.toMatchObject({
      roomId: "a35c596e-d022-421f-9c3d-6f9960f5c6c2",
      type: "room-typing-updated",
      typingParticipants: [],
    });

    secondRoomSocket.send(
      JSON.stringify({
        roomId: "9f441a9f-e920-4e92-93d8-6eb7364580fe",
        type: "subscribe-room",
      }),
    );

    await expect(readMessage(secondRoomSocket)).resolves.toMatchObject({
      roomId: "9f441a9f-e920-4e92-93d8-6eb7364580fe",
      type: "subscribed-room",
    });

    await expect(readMessage(firstRoomSocket)).resolves.toMatchObject({
      activeUserCount: 2,
      roomId: "9f441a9f-e920-4e92-93d8-6eb7364580fe",
      type: "room-presence-updated",
    });
    await expect(readMessage(secondRoomSocket)).resolves.toMatchObject({
      activeUserCount: 2,
      roomId: "9f441a9f-e920-4e92-93d8-6eb7364580fe",
      type: "room-presence-updated",
    });
    await expect(readMessage(secondRoomSocket)).resolves.toMatchObject({
      roomId: "9f441a9f-e920-4e92-93d8-6eb7364580fe",
      type: "room-typing-updated",
      typingParticipants: [],
    });
    await expectNoMessage(otherRoomSocket);

    secondRoomSocket.close();

    await expect(readMessage(firstRoomSocket)).resolves.toMatchObject({
      activeUserCount: 1,
      roomId: "9f441a9f-e920-4e92-93d8-6eb7364580fe",
      type: "room-presence-updated",
    });
    await expectNoMessage(otherRoomSocket);

    firstRoomSocket.close();
    otherRoomSocket.close();
  });

  it("publishes room-scoped typing snapshots and typing updates", async () => {
    const roomSubscriptionHub = createLocalRoomSubscriptionHub();
    const listRoomTypingParticipants = vi
      .fn()
      .mockResolvedValueOnce([
        createTypingParticipant("user-2", "2026-01-01T00:00:05.000Z"),
      ])
      .mockResolvedValue([]);
    const setRoomTypingState = vi.fn().mockImplementation(async () => {
      await roomSubscriptionHub.publishRoomTypingUpdated({
        roomId: "9f441a9f-e920-4e92-93d8-6eb7364580fe",
        typingParticipants: [
          createTypingParticipant("user-1", "2026-01-01T00:00:06.000Z"),
          createTypingParticipant("user-2", "2026-01-01T00:00:05.000Z"),
        ],
      });
    });
    const gateway = await createRealtimeGateway({
      authenticateConnection: vi.fn().mockResolvedValue({
        userId: "user-1",
      }),
      authorizeRoomSubscription: vi.fn().mockResolvedValue(undefined),
      host: "127.0.0.1",
      listRoomTypingParticipants,
      port: 0,
      roomSubscriptionHub,
      setRoomTypingState,
    });

    gateways.push(gateway);

    const socket = await connectClient(gateway.port);

    socket.send(
      JSON.stringify({
        roomId: "9f441a9f-e920-4e92-93d8-6eb7364580fe",
        type: "subscribe-room",
      }),
    );

    await expect(readMessage(socket)).resolves.toMatchObject({
      roomId: "9f441a9f-e920-4e92-93d8-6eb7364580fe",
      type: "subscribed-room",
    });
    await expect(readMessage(socket)).resolves.toMatchObject({
      activeUserCount: 1,
      roomId: "9f441a9f-e920-4e92-93d8-6eb7364580fe",
      type: "room-presence-updated",
    });
    await expect(readMessage(socket)).resolves.toMatchObject({
      roomId: "9f441a9f-e920-4e92-93d8-6eb7364580fe",
      type: "room-typing-updated",
      typingParticipants: [{ userId: "user-2" }],
    });

    socket.send(
      JSON.stringify({
        isTyping: true,
        roomId: "9f441a9f-e920-4e92-93d8-6eb7364580fe",
        type: "set-room-typing",
      }),
    );

    await expect(readMessage(socket)).resolves.toMatchObject({
      roomId: "9f441a9f-e920-4e92-93d8-6eb7364580fe",
      type: "room-typing-updated",
      typingParticipants: [{ userId: "user-1" }, { userId: "user-2" }],
    });

    expect(setRoomTypingState).toHaveBeenCalledWith({
      actorUserId: "user-1",
      isTyping: true,
      roomId: "9f441a9f-e920-4e92-93d8-6eb7364580fe",
    });

    socket.close();
  });

  it("rejects unauthenticated sockets even if they send immediately after open", async () => {
    const roomSubscriptionHub = createLocalRoomSubscriptionHub();
    const gateway = await createRealtimeGateway({
      authenticateConnection: vi.fn().mockImplementation(
        () =>
          new Promise<null>((resolve) => {
            setTimeout(() => resolve(null), 100);
          }),
      ),
      authorizeRoomSubscription: vi.fn(),
      host: "127.0.0.1",
      listRoomTypingParticipants: vi.fn().mockResolvedValue([]),
      port: 0,
      roomSubscriptionHub,
      setRoomTypingState: vi.fn(),
    });

    gateways.push(gateway);

    const socket = await connectClient(gateway.port);

    socket.send(
      JSON.stringify({
        roomId: "9f441a9f-e920-4e92-93d8-6eb7364580fe",
        type: "subscribe-room",
      }),
    );

    await expect(readMessage(socket)).resolves.toMatchObject({
      message: "Authentication required for realtime room subscriptions.",
      type: "error",
    });

    await expect(waitForClose(socket)).resolves.toMatchObject({
      code: 4401,
    });
  });
});
