"use client";

import { useEffect, useRef, useState, type ReactElement } from "react";

import { PostRoomMessageForm } from "@/modules/messages/presentation/post-room-message-form";
import {
  RoomMessagesList,
  type RoomMessagesListAuthorProfile,
  type RoomMessagesListMessage,
} from "@/modules/messages/presentation/room-messages-list";
import { websocketServerMessageSchema } from "@/websocket/validation";

type RoomConversationProps = Readonly<{
  canPost: boolean;
  currentUserId: string;
  initialAuthorProfilesByUserId: Record<
    string,
    RoomMessagesListAuthorProfile | null
  >;
  initialMessages: RoomMessagesListMessage[];
  ownerUserId: string;
  roomId: string;
  roomName: string;
  roomSlug: string;
}>;

type RealtimeStatus = "connected" | "connecting" | "disconnected" | "error";

function getRealtimeGatewayUrl() {
  if (typeof window === "undefined") {
    return null;
  }

  const configuredUrl = process.env.NEXT_PUBLIC_REALTIME_WS_URL;

  if (configuredUrl) {
    return configuredUrl;
  }

  const protocol = window.location.protocol === "https:" ? "wss" : "ws";

  return `${protocol}://${window.location.hostname}:3001/ws`;
}

export function RoomConversation({
  canPost,
  currentUserId,
  initialAuthorProfilesByUserId,
  initialMessages,
  ownerUserId,
  roomId,
  roomName,
  roomSlug,
}: RoomConversationProps): ReactElement {
  const [messages, setMessages] = useState(initialMessages);
  const [authorProfilesByUserId, setAuthorProfilesByUserId] = useState(
    initialAuthorProfilesByUserId,
  );
  const [realtimeStatus, setRealtimeStatus] = useState<RealtimeStatus>(
    canPost ? "connecting" : "disconnected",
  );
  const [realtimeError, setRealtimeError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    setAuthorProfilesByUserId(initialAuthorProfilesByUserId);
  }, [initialAuthorProfilesByUserId]);

  useEffect(() => {
    if (!canPost) {
      setRealtimeStatus("disconnected");
      setRealtimeError(null);

      return;
    }

    const realtimeGatewayUrl = getRealtimeGatewayUrl();

    if (!realtimeGatewayUrl) {
      setRealtimeStatus("error");
      setRealtimeError("Realtime gateway URL is not available.");

      return;
    }

    const socket = new WebSocket(realtimeGatewayUrl);
    socketRef.current = socket;
    setRealtimeStatus("connecting");
    setRealtimeError(null);

    socket.addEventListener("open", () => {
      socket.send(
        JSON.stringify({
          roomId,
          type: "subscribe-room",
        }),
      );
    });

    socket.addEventListener("message", (event) => {
      try {
        const payload = websocketServerMessageSchema.parse(
          JSON.parse(event.data as string),
        );

        if (payload.type === "subscribed-room") {
          setRealtimeStatus("connected");
          setRealtimeError(null);

          return;
        }

        if (payload.type === "error") {
          setRealtimeStatus("error");
          setRealtimeError(payload.message);

          return;
        }

        setMessages((currentMessages) => {
          if (
            currentMessages.some((message) => message.id === payload.message.id)
          ) {
            return currentMessages;
          }

          return [...currentMessages, payload.message];
        });

        setAuthorProfilesByUserId((currentProfiles) => ({
          ...currentProfiles,
          [payload.message.authorUserId]: payload.author,
        }));
      } catch {
        setRealtimeStatus("error");
        setRealtimeError("Received an invalid realtime payload.");
      }
    });

    socket.addEventListener("close", () => {
      setRealtimeStatus("disconnected");
    });

    socket.addEventListener("error", () => {
      setRealtimeStatus("error");
      setRealtimeError("Realtime connection failed.");
    });

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [canPost, roomId]);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="rounded-full border border-(--color-border) bg-(--color-page) px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-(--color-muted)">
          {realtimeStatus === "connected"
            ? "Live updates connected"
            : realtimeStatus === "connecting"
              ? "Connecting live updates"
              : "Live updates offline"}
        </div>

        {realtimeError ? (
          <p className="text-sm text-red-700 dark:text-red-300">
            {realtimeError}
          </p>
        ) : null}
      </div>

      <div className="max-h-168 overflow-y-auto pr-1">
        <RoomMessagesList
          authorProfilesByUserId={authorProfilesByUserId}
          currentUserId={currentUserId}
          messages={messages}
          ownerUserId={ownerUserId}
        />
      </div>

      <div className="rounded-4xl border border-(--color-border) bg-(--color-surface) p-5 sm:p-6">
        {canPost ? (
          <PostRoomMessageForm
            roomId={roomId}
            roomName={roomName}
            roomSlug={roomSlug}
          />
        ) : (
          <section className="space-y-3 text-sm leading-7 text-(--color-muted)">
            <h3 className="text-lg font-semibold tracking-[-0.03em] text-(--color-foreground)">
              Composer locked until you join
            </h3>
            <p>
              Public browsing stays open so the room feels active from the
              outside, but posting is held behind an explicit membership step.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
