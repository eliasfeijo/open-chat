import { afterEach, describe, expect, it, vi } from "vitest";
import WebSocket from "ws";

import { createLocalRoomSubscriptionHub } from "@/websocket/local-room-subscription-hub";
import {
  createRealtimeGateway,
  type RealtimeGateway,
} from "@/websocket/realtime-gateway";
import type { WebSocketServerMessage } from "@/websocket/validation";

async function connectClient(port: number) {
  const socket = new WebSocket(`ws://127.0.0.1:${port}/ws`);

  await new Promise<void>((resolve, reject) => {
    socket.once("open", () => resolve());
    socket.once("error", (error) => reject(error));
  });

  return socket;
}

async function readMessage(socket: WebSocket) {
  return new Promise<WebSocketServerMessage>((resolve, reject) => {
    socket.once("message", (rawMessage) => {
      try {
        resolve(
          JSON.parse(rawMessage.toString("utf8")) as WebSocketServerMessage,
        );
      } catch (error) {
        reject(error);
      }
    });
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
      port: 0,
      roomSubscriptionHub,
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
});
