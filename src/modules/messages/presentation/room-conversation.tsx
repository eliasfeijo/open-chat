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

type TypingParticipant = {
  author: RoomMessagesListAuthorProfile | null;
  expiresAt: string;
  userId: string;
};

type ConversationMessage = RoomMessagesListMessage & {
  clientMessageId?: string;
};

const AUTO_SCROLL_BOTTOM_THRESHOLD_PX = 96;
const VISIBLE_ACTIVE_PARTICIPANT_LIMIT = 5;

function isNearBottom(element: HTMLDivElement): boolean {
  return (
    element.scrollHeight - element.scrollTop - element.clientHeight <=
    AUTO_SCROLL_BOTTOM_THRESHOLD_PX
  );
}

function getParticipantLabel(input: {
  authorProfile: RoomMessagesListAuthorProfile | null | undefined;
  userId: string;
}): string {
  if (input.authorProfile?.displayName) {
    return input.authorProfile.displayName;
  }

  if (input.authorProfile?.username) {
    return `@${input.authorProfile.username}`;
  }

  return `OpenChat user (${input.userId.slice(0, 6)})`;
}

function getParticipantInitials(input: {
  authorProfile: RoomMessagesListAuthorProfile | null | undefined;
  userId: string;
}): string {
  const sourceLabel =
    input.authorProfile?.displayName ??
    input.authorProfile?.username ??
    input.userId;
  const alphaNumericLabel = sourceLabel.replace(/[^a-zA-Z0-9]/g, "");

  return alphaNumericLabel.slice(0, 2).toUpperCase() || "OC";
}

function getHoverCardPositionClass(input: {
  index: number;
  total: number;
}): string {
  if (input.total <= 1) {
    return "left-0 translate-x-0";
  }

  if (input.index === 0) {
    return "left-0 translate-x-0";
  }

  if (input.index === input.total - 1) {
    return "right-0 translate-x-0";
  }

  return "left-1/2 -translate-x-1/2";
}

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

function createInitialRealtimeStatus(canPost: boolean): RealtimeStatus {
  return canPost ? "connecting" : "disconnected";
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
  const [messages, setMessages] =
    useState<ConversationMessage[]>(initialMessages);
  const [authorProfilesByUserId, setAuthorProfilesByUserId] = useState(
    initialAuthorProfilesByUserId,
  );
  const [realtimeStatus, setRealtimeStatus] = useState<RealtimeStatus>(() =>
    createInitialRealtimeStatus(canPost),
  );
  const [realtimeError, setRealtimeError] = useState<string | null>(null);
  const [activeUserCount, setActiveUserCount] = useState<number | null>(null);
  const [activeUserIds, setActiveUserIds] = useState<string[]>([]);
  const [typingParticipants, setTypingParticipants] = useState<
    TypingParticipant[]
  >([]);
  const isCurrentUserTypingRef = useRef(false);
  const socketRef = useRef<WebSocket | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const shouldAutoScrollRef = useRef(true);
  const previousMessageCountRef = useRef(initialMessages.length);

  function scrollMessagesToBottom(behavior: ScrollBehavior) {
    const container = messagesContainerRef.current;

    if (!container) {
      return;
    }

    container.scrollTo({
      behavior,
      top: container.scrollHeight,
    });
  }

  function sendTypingState(isTyping: boolean) {
    const socket = socketRef.current;

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }

    isCurrentUserTypingRef.current = isTyping;
    socket.send(
      JSON.stringify({
        isTyping,
        roomId,
        type: "set-room-typing",
      }),
    );
  }

  function addOptimisticMessage(input: {
    body: string;
    optimisticMessageId: string;
  }) {
    setMessages((currentMessages) => [
      ...currentMessages,
      {
        authorUserId: currentUserId,
        body: input.body,
        clientMessageId: input.optimisticMessageId,
        createdAt: new Date().toISOString(),
        deliveryStatus: "sending",
        id: input.optimisticMessageId,
        roomId,
      },
    ]);
  }

  function markOptimisticMessageAsFailed(input: {
    optimisticMessageId: string;
  }) {
    setMessages((currentMessages) =>
      currentMessages.map((message) =>
        message.clientMessageId === input.optimisticMessageId
          ? {
              ...message,
              deliveryStatus: "failed",
            }
          : message,
      ),
    );
  }

  function confirmOptimisticMessage(input: {
    message: RoomMessagesListMessage;
    optimisticMessageId: string;
  }) {
    setMessages((currentMessages) => {
      const reconciledMessages = currentMessages.map((message) =>
        message.clientMessageId === input.optimisticMessageId
          ? {
              ...input.message,
            }
          : message,
      );
      const deduplicatedMessages: ConversationMessage[] = [];
      const seenMessageIds = new Set<string>();

      for (const message of reconciledMessages) {
        if (seenMessageIds.has(message.id)) {
          continue;
        }

        seenMessageIds.add(message.id);
        deduplicatedMessages.push(message);
      }

      return deduplicatedMessages;
    });
  }

  useEffect(() => {
    if (!canPost) {
      return;
    }

    const realtimeGatewayUrl = getRealtimeGatewayUrl();

    if (!realtimeGatewayUrl) {
      return;
    }

    const socket = new WebSocket(realtimeGatewayUrl);
    socketRef.current = socket;

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

        if (payload.type === "room-presence-updated") {
          setActiveUserCount(payload.activeUserCount);
          setActiveUserIds(payload.activeUserIds ?? []);

          return;
        }

        if (payload.type === "room-typing-updated") {
          setTypingParticipants(payload.typingParticipants);

          return;
        }

        setMessages((currentMessages) => {
          if (
            currentMessages.some((message) => message.id === payload.message.id)
          ) {
            return currentMessages;
          }

          if (payload.message.authorUserId === currentUserId) {
            const optimisticMessageIndex = currentMessages.findIndex(
              (message) =>
                message.authorUserId === currentUserId &&
                message.deliveryStatus === "sending" &&
                message.body === payload.message.body,
            );

            if (optimisticMessageIndex !== -1) {
              const reconciledMessages = [...currentMessages];

              reconciledMessages[optimisticMessageIndex] = payload.message;

              return reconciledMessages;
            }
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
      if (
        isCurrentUserTypingRef.current &&
        socket.readyState === WebSocket.OPEN
      ) {
        socket.send(
          JSON.stringify({
            isTyping: false,
            roomId,
            type: "set-room-typing",
          }),
        );
      }

      socket.close();
      socketRef.current = null;
    };
  }, [canPost, roomId]);

  useEffect(() => {
    const container = messagesContainerRef.current;

    if (!container) {
      return;
    }

    const messagesContainer = container;

    scrollMessagesToBottom("auto");
    shouldAutoScrollRef.current = true;

    function handleMessagesScroll() {
      shouldAutoScrollRef.current = isNearBottom(messagesContainer);
    }

    messagesContainer.addEventListener("scroll", handleMessagesScroll);

    return () => {
      messagesContainer.removeEventListener("scroll", handleMessagesScroll);
    };
  }, []);

  useEffect(() => {
    const previousMessageCount = previousMessageCountRef.current;
    const hasNewMessage = messages.length > previousMessageCount;

    previousMessageCountRef.current = messages.length;

    if (!hasNewMessage || !shouldAutoScrollRef.current) {
      return;
    }

    scrollMessagesToBottom("smooth");
  }, [messages.length]);

  useEffect(() => {
    if (typingParticipants.length === 0) {
      return;
    }

    const nextExpiration = typingParticipants.reduce<number | null>(
      (currentValue, participant) => {
        const expirationTime = new Date(participant.expiresAt).getTime();

        if (currentValue === null || expirationTime < currentValue) {
          return expirationTime;
        }

        return currentValue;
      },
      null,
    );

    if (nextExpiration === null) {
      return;
    }

    const timeoutHandle = window.setTimeout(
      () => {
        setTypingParticipants((currentParticipants) =>
          currentParticipants.filter(
            (participant) =>
              new Date(participant.expiresAt).getTime() > Date.now(),
          ),
        );
      },
      Math.max(0, nextExpiration - Date.now()) + 25,
    );

    return () => {
      window.clearTimeout(timeoutHandle);
    };
  }, [typingParticipants]);

  const visibleTypingParticipants = typingParticipants.filter(
    (participant) => participant.userId !== currentUserId,
  );
  const typingSummary =
    visibleTypingParticipants.length === 0
      ? null
      : visibleTypingParticipants.length === 1
        ? `${
            visibleTypingParticipants[0]?.author?.displayName ??
            visibleTypingParticipants[0]?.author?.username ??
            "Someone"
          } is typing...`
        : `${visibleTypingParticipants.length} people are typing...`;
  const resolvedActiveUserIds =
    activeUserIds.length > 0
      ? activeUserIds
      : canPost && (activeUserCount ?? 0) > 0
        ? [currentUserId]
        : [];
  const effectiveActiveUserCount =
    activeUserIds.length > 0 ? activeUserIds.length : (activeUserCount ?? 0);
  const visibleActiveUserIds = resolvedActiveUserIds.slice(
    0,
    VISIBLE_ACTIVE_PARTICIPANT_LIMIT,
  );
  const hasOverflowActiveParticipants =
    effectiveActiveUserCount > VISIBLE_ACTIVE_PARTICIPANT_LIMIT;
  const visibleActiveParticipantCount = visibleActiveUserIds.length;
  const visibleTypingParticipantCount = visibleTypingParticipants.length;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-10 items-center rounded-full border border-(--color-border) bg-(--color-page) px-4 text-xs font-semibold uppercase tracking-[0.16em] text-(--color-muted)">
            {realtimeStatus === "connected"
              ? "Live updates connected"
              : realtimeStatus === "connecting"
                ? "Connecting live updates"
                : "Live updates offline"}
          </div>

          <div className="flex h-10 items-center gap-3 rounded-full border border-(--color-border) bg-(--color-page) px-3 text-xs font-semibold uppercase tracking-[0.16em] text-(--color-muted)">
            <span>
              {canPost
                ? activeUserCount === null
                  ? "Presence syncing"
                  : activeUserCount === 1
                    ? "1 active participant"
                    : `${activeUserCount} active participants`
                : "Join to appear online"}
            </span>

            {canPost && effectiveActiveUserCount > 0 ? (
              <div className="flex shrink-0 items-center gap-1.5">
                {visibleActiveUserIds.map((activeUserId, index) => {
                  const authorProfile = authorProfilesByUserId[activeUserId];
                  const participantLabel = getParticipantLabel({
                    authorProfile,
                    userId: activeUserId,
                  });
                  const participantBio = authorProfile?.bio;
                  const hoverCardPositionClass = getHoverCardPositionClass({
                    index,
                    total: visibleActiveParticipantCount,
                  });

                  return (
                    <div className="group relative" key={activeUserId}>
                      <div className="flex size-7 items-center justify-center rounded-full border border-(--color-border) bg-(--color-surface) text-[11px] font-semibold text-(--color-foreground) shadow-xs">
                        {getParticipantInitials({
                          authorProfile,
                          userId: activeUserId,
                        })}
                      </div>
                      <div
                        className={`pointer-events-none absolute bottom-full z-10 mb-2 hidden w-56 max-w-[calc(100vw-2rem)] rounded-2xl border border-(--color-border) bg-(--color-surface) p-3 text-left normal-case tracking-normal text-(--color-foreground) shadow-lg group-hover:block ${hoverCardPositionClass}`}
                      >
                        <p className="text-sm font-semibold">
                          {participantLabel}
                        </p>
                        <p className="mt-1 text-xs text-(--color-muted)">
                          {participantBio && participantBio.trim().length > 0
                            ? participantBio
                            : "No profile bio yet."}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {hasOverflowActiveParticipants ? (
                  <div
                    className="flex size-7 items-center justify-center rounded-full border border-(--color-border) bg-(--color-surface) text-[11px] font-semibold text-(--color-muted)"
                    title={`+${effectiveActiveUserCount - VISIBLE_ACTIVE_PARTICIPANT_LIMIT} more active participants`}
                  >
                    +
                    {effectiveActiveUserCount -
                      VISIBLE_ACTIVE_PARTICIPANT_LIMIT}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        {realtimeError ? (
          <p className="text-sm text-red-700 dark:text-red-300">
            {realtimeError}
          </p>
        ) : null}
      </div>

      <div
        ref={messagesContainerRef}
        className="max-h-168 overflow-y-auto pr-1"
      >
        <RoomMessagesList
          authorProfilesByUserId={authorProfilesByUserId}
          currentUserId={currentUserId}
          messages={messages}
          ownerUserId={ownerUserId}
        />
      </div>

      {typingSummary ? (
        <div className="flex min-h-6 items-center gap-2 text-sm text-(--color-muted)">
          <div className="flex shrink-0 items-center gap-1.5">
            {visibleTypingParticipants.map((participant, index) => {
              const participantLabel = getParticipantLabel({
                authorProfile: participant.author,
                userId: participant.userId,
              });
              const participantBio = participant.author?.bio;
              const hoverCardPositionClass = getHoverCardPositionClass({
                index,
                total: visibleTypingParticipantCount,
              });

              return (
                <div className="group relative" key={participant.userId}>
                  <div className="flex size-7 items-center justify-center rounded-full border border-(--color-border) bg-(--color-surface) text-[11px] font-semibold text-(--color-foreground) shadow-xs">
                    {getParticipantInitials({
                      authorProfile: participant.author,
                      userId: participant.userId,
                    })}
                  </div>
                  <div
                    className={`pointer-events-none absolute bottom-full z-10 mb-2 hidden w-56 max-w-[calc(100vw-2rem)] rounded-2xl border border-(--color-border) bg-(--color-surface) p-3 text-left normal-case tracking-normal text-(--color-foreground) shadow-lg group-hover:block ${hoverCardPositionClass}`}
                  >
                    <p className="text-sm font-semibold">{participantLabel}</p>
                    <p className="mt-1 text-xs text-(--color-muted)">
                      {participantBio && participantBio.trim().length > 0
                        ? participantBio
                        : "No profile bio yet."}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <p>{typingSummary}</p>
        </div>
      ) : (
        <div className="min-h-6" />
      )}

      <div className="rounded-4xl border border-(--color-border) bg-(--color-surface) p-5 sm:p-6">
        {canPost ? (
          <PostRoomMessageForm
            onOptimisticMessageFailed={({ optimisticMessageId }) => {
              markOptimisticMessageAsFailed({
                optimisticMessageId,
              });
            }}
            onOptimisticMessagePosted={({ body, optimisticMessageId }) => {
              addOptimisticMessage({
                body,
                optimisticMessageId,
              });
            }}
            onOptimisticMessageSucceeded={({
              message,
              optimisticMessageId,
            }) => {
              confirmOptimisticMessage({
                message,
                optimisticMessageId,
              });
            }}
            onTypingStateChange={sendTypingState}
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
