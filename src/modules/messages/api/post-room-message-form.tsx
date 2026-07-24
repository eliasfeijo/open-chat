"use client";

import { useActionState, type ReactElement } from "react";

import {
  postRoomMessageAction,
  type PostRoomMessageActionState,
} from "@/modules/messages/api/post-room-message-action";

type PostRoomMessageFormProps = Readonly<{
  roomName: string;
  roomId: string;
  roomSlug: string;
}>;

const initialPostRoomMessageActionState: PostRoomMessageActionState = {
  fieldErrors: {},
  message: null,
  status: "idle",
};

export function PostRoomMessageForm({
  roomName,
  roomId,
  roomSlug,
}: PostRoomMessageFormProps): ReactElement {
  const [actionState, formAction, isPending] = useActionState(
    postRoomMessageAction,
    initialPostRoomMessageActionState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold tracking-[-0.03em] text-(--color-foreground)">
          Compose into the room
        </h2>
        <p className="text-sm leading-7 text-(--color-muted)">
          Post directly into /{roomSlug} and keep the pace conversational.
        </p>
      </div>

      <input name="roomId" type="hidden" value={roomId} />
      <input name="roomSlug" type="hidden" value={roomSlug} />

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="room-message-body">
          Message
        </label>
        <textarea
          className="min-h-36 w-full rounded-3xl border border-(--color-border) bg-(--color-page) px-5 py-4 text-base outline-none transition focus:border-(--color-accent)"
          id="room-message-body"
          name="body"
          placeholder={`Say something that gets ${roomName} moving.`}
        />
        {actionState.fieldErrors.body ? (
          <p className="text-sm text-red-700 dark:text-red-300">
            {actionState.fieldErrors.body}
          </p>
        ) : null}
      </div>

      {actionState.message ? (
        <p
          className={`rounded-2xl px-4 py-3 text-sm ${
            actionState.status === "success"
              ? "border border-emerald-300/40 bg-emerald-100/60 text-emerald-900 dark:border-emerald-400/20 dark:bg-emerald-950/30 dark:text-emerald-100"
              : "border border-red-300/40 bg-red-100/60 text-red-900 dark:border-red-400/20 dark:bg-red-950/30 dark:text-red-100"
          }`}
        >
          {actionState.message}
        </p>
      ) : null}

      <button
        className="inline-flex items-center justify-center rounded-full bg-(--color-accent) px-5 py-2.5 text-sm font-semibold text-(--color-accent-foreground) transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Posting message..." : "Send to room"}
      </button>
    </form>
  );
}
