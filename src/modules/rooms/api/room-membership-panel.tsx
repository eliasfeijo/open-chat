"use client";

import { useActionState, type ReactElement } from "react";

import {
  joinRoomAction,
  leaveRoomAction,
  type RoomMembershipActionState,
} from "@/modules/rooms/api/room-membership-action";
import type { RoomMemberRole } from "@/modules/rooms/validation";

type RoomMembershipPanelProps = Readonly<{
  currentMembershipRole: RoomMemberRole | null;
  roomId: string;
  roomSlug: string;
}>;

const initialRoomMembershipActionState: RoomMembershipActionState = {
  message: null,
  status: "idle",
};

export function RoomMembershipPanel({
  currentMembershipRole,
  roomId,
  roomSlug,
}: RoomMembershipPanelProps): ReactElement {
  const selectedAction =
    currentMembershipRole === "member" ? leaveRoomAction : joinRoomAction;
  const [actionState, formAction, isPending] = useActionState(
    selectedAction,
    initialRoomMembershipActionState,
  );

  if (currentMembershipRole === "owner") {
    return (
      <section className="space-y-4 rounded-4xl border border-(--color-border) bg-(--color-surface) p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-3 rounded-full bg-(--color-accent)" />
          <h2 className="text-lg font-semibold tracking-[-0.03em] text-(--color-foreground)">
            Room access
          </h2>
        </div>
        <div className="space-y-3 rounded-3xl border border-(--color-border) bg-(--color-page) p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-(--color-muted)">
            Owner status
          </p>
          <p className="text-sm leading-7 text-(--color-muted)">
            You opened this room, so your owner membership anchors the
            conversation and stays attached in this slice.
          </p>
        </div>
      </section>
    );
  }

  const isMember = currentMembershipRole === "member";
  const message = actionState.message;

  return (
    <section className="space-y-5 rounded-4xl border border-(--color-border) bg-(--color-surface) p-6 shadow-sm">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex size-3 rounded-full ${
              isMember ? "bg-emerald-500" : "bg-amber-500"
            }`}
          />
          <h2 className="text-lg font-semibold tracking-[-0.03em] text-(--color-foreground)">
            Room access
          </h2>
        </div>
        <p className="text-sm leading-7 text-(--color-muted)">
          {isMember
            ? "You are inside the room and can reply immediately or leave when you want."
            : "Join the room to move from browsing into active conversation."}
        </p>
      </div>

      <div className="rounded-3xl border border-(--color-border) bg-(--color-page) p-4 text-sm leading-7 text-(--color-muted)">
        {isMember
          ? "Posting is already unlocked for your account in this room."
          : "Joining unlocks the composer and puts your profile into the participant flow."}
      </div>

      {message ? (
        <p
          className={`rounded-2xl px-4 py-3 text-sm ${
            actionState.status === "success"
              ? "border border-emerald-300/40 bg-emerald-100/60 text-emerald-900 dark:border-emerald-400/20 dark:bg-emerald-950/30 dark:text-emerald-100"
              : "border border-red-300/40 bg-red-100/60 text-red-900 dark:border-red-400/20 dark:bg-red-950/30 dark:text-red-100"
          }`}
        >
          {message}
        </p>
      ) : null}

      <form action={formAction} className="flex items-center gap-3">
        <input name="roomId" type="hidden" value={roomId} />
        <input name="roomSlug" type="hidden" value={roomSlug} />
        <button
          className="inline-flex items-center justify-center rounded-full bg-(--color-accent) px-5 py-2.5 text-sm font-semibold text-(--color-accent-foreground) transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isPending}
          type="submit"
        >
          {isPending
            ? isMember
              ? "Leaving room..."
              : "Joining room..."
            : isMember
              ? "Step out of room"
              : "Join live room"}
        </button>
      </form>
    </section>
  );
}
