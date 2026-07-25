"use client";

import type { ReactElement } from "react";

export type RoomMessagesListAuthorProfile = {
  bio: string | null;
  displayName: string | null;
  username: string | null;
};

export type RoomMessagesListMessage = {
  authorUserId: string;
  body: string;
  createdAt: Date | string;
  id: string;
  roomId: string;
};

type RoomMessagesListProps = Readonly<{
  authorProfilesByUserId: Record<string, RoomMessagesListAuthorProfile | null>;
  currentUserId: string;
  messages: RoomMessagesListMessage[];
  ownerUserId: string;
}>;

function getParticipantName(input: {
  authorProfile: RoomMessagesListAuthorProfile | null | undefined;
  currentUserId: string;
  messageAuthorUserId: string;
}): string {
  if (input.messageAuthorUserId === input.currentUserId) {
    return "You";
  }

  if (input.authorProfile?.username) {
    return `@${input.authorProfile.username}`;
  }

  if (input.authorProfile?.displayName) {
    return input.authorProfile.displayName;
  }

  return "OpenChat user";
}

function getParticipantInitials(input: {
  authorProfile: RoomMessagesListAuthorProfile | null | undefined;
  messageAuthorUserId: string;
}): string {
  const label =
    input.authorProfile?.username ??
    input.authorProfile?.displayName ??
    input.messageAuthorUserId;
  const alphaNumericLabel = label.replace(/[^a-zA-Z0-9]/g, "");

  return alphaNumericLabel.slice(0, 2).toUpperCase() || "OC";
}

export function RoomMessagesList({
  authorProfilesByUserId,
  currentUserId,
  messages,
  ownerUserId,
}: RoomMessagesListProps): ReactElement {
  if (messages.length === 0) {
    return (
      <div className="rounded-4xl border border-dashed border-(--color-border) bg-(--color-surface) p-8 text-sm leading-7 text-(--color-muted)">
        The room is live but still quiet. Join and drop the opening message so
        the conversation starts feeling inhabited.
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${
            message.authorUserId === currentUserId
              ? "justify-end"
              : "justify-start"
          }`}
        >
          <article
            className={`w-full max-w-3xl rounded-4xl border p-5 shadow-sm backdrop-blur-sm sm:p-6 ${
              message.authorUserId === currentUserId
                ? "border-emerald-500/20 bg-linear-to-br from-emerald-500/14 to-(--color-surface-strong)"
                : "border-(--color-border) bg-(--color-surface)"
            }`}
          >
            <div
              className={`flex gap-4 ${
                message.authorUserId === currentUserId ? "flex-row-reverse" : ""
              }`}
            >
              <div
                className={`flex size-11 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold ${
                  message.authorUserId === currentUserId
                    ? "bg-(--color-accent) text-(--color-accent-foreground)"
                    : "bg-(--color-page) text-(--color-foreground)"
                }`}
              >
                {getParticipantInitials({
                  authorProfile: authorProfilesByUserId[message.authorUserId],
                  messageAuthorUserId: message.authorUserId,
                })}
              </div>

              <div className="min-w-0 flex-1 space-y-3">
                <div
                  className={`flex flex-wrap items-center gap-2 text-sm ${
                    message.authorUserId === currentUserId
                      ? "justify-end text-right"
                      : ""
                  }`}
                >
                  <span className="font-semibold text-(--color-foreground)">
                    {getParticipantName({
                      authorProfile:
                        authorProfilesByUserId[message.authorUserId],
                      currentUserId,
                      messageAuthorUserId: message.authorUserId,
                    })}
                  </span>
                  {message.authorUserId === ownerUserId ? (
                    <span className="rounded-full border border-(--color-border) bg-(--color-page) px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-(--color-muted)">
                      Host
                    </span>
                  ) : null}
                  <span className="text-(--color-muted)">
                    {new Date(message.createdAt).toLocaleString("en-US", {
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      month: "short",
                    })}
                  </span>
                </div>

                {authorProfilesByUserId[message.authorUserId]?.bio ? (
                  <p
                    className={`text-sm leading-6 text-(--color-muted) ${
                      message.authorUserId === currentUserId ? "text-right" : ""
                    }`}
                  >
                    {authorProfilesByUserId[message.authorUserId]?.bio}
                  </p>
                ) : null}

                <p className="whitespace-pre-wrap text-base leading-7 text-(--color-foreground)">
                  {message.body}
                </p>
              </div>
            </div>
          </article>
        </div>
      ))}
    </div>
  );
}
