"use client";

import {
  useActionState,
  useState,
  type ChangeEvent,
  type ReactElement,
} from "react";

import type { Room } from "@/modules/rooms";
import {
  updateRoomDetailsAction,
  type UpdateRoomDetailsActionState,
} from "@/modules/rooms/presentation/server/update-room-details-action";

const initialUpdateRoomDetailsActionState: UpdateRoomDetailsActionState = {
  fieldErrors: {},
  message: null,
  status: "idle",
};

type EditRoomDetailsFormProps = Readonly<{
  room: Room;
}>;

export function EditRoomDetailsForm({
  room,
}: EditRoomDetailsFormProps): ReactElement {
  const [actionState, formAction, isPending] = useActionState(
    updateRoomDetailsAction,
    initialUpdateRoomDetailsActionState,
  );
  const [formValues, setFormValues] = useState({
    description: room.description ?? "",
    name: room.name,
    topic: room.topic ?? "",
  });
  const fieldErrors = actionState?.fieldErrors ?? {};
  const message = actionState?.message ?? null;
  const status = actionState?.status ?? "idle";

  function updateField(
    fieldName: "description" | "name" | "topic",
    value: string,
  ): void {
    setFormValues((currentValues) => ({
      ...currentValues,
      [fieldName]: value,
    }));
  }

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-4xl border border-(--color-border) bg-(--color-surface) p-6 shadow-sm"
    >
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold tracking-[-0.03em] text-(--color-foreground)">
            Edit room details
          </h2>
          <span className="rounded-full border border-(--color-border) bg-(--color-page) px-3 py-1 text-xs font-medium text-(--color-muted)">
            Owner only
          </span>
        </div>
        <p className="text-sm leading-6 text-(--color-muted)">
          Update the public room profile. The slug stays fixed for now so the
          current room URL remains stable.
        </p>
      </div>

      <input name="roomId" type="hidden" value={room.id} />
      <input name="roomSlug" type="hidden" value={room.slug} />

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="edit-room-name">
          Room name
        </label>
        <input
          className="w-full rounded-2xl border border-(--color-border) bg-(--color-page) px-4 py-3 text-base outline-none transition focus:border-(--color-accent)"
          id="edit-room-name"
          name="name"
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            updateField("name", event.target.value)
          }
          type="text"
          value={formValues.name}
        />
        {fieldErrors.name ? (
          <p className="text-sm text-red-700 dark:text-red-300">
            {fieldErrors.name}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="edit-room-topic">
          Topic
        </label>
        <input
          className="w-full rounded-2xl border border-(--color-border) bg-(--color-page) px-4 py-3 text-base outline-none transition focus:border-(--color-accent)"
          id="edit-room-topic"
          name="topic"
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            updateField("topic", event.target.value)
          }
          type="text"
          value={formValues.topic}
        />
        {fieldErrors.topic ? (
          <p className="text-sm text-red-700 dark:text-red-300">
            {fieldErrors.topic}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="edit-room-description">
          Description
        </label>
        <textarea
          className="min-h-28 w-full rounded-2xl border border-(--color-border) bg-(--color-page) px-4 py-3 text-base outline-none transition focus:border-(--color-accent)"
          id="edit-room-description"
          name="description"
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
            updateField("description", event.target.value)
          }
          value={formValues.description}
        />
        {fieldErrors.description ? (
          <p className="text-sm text-red-700 dark:text-red-300">
            {fieldErrors.description}
          </p>
        ) : null}
      </div>

      {message ? (
        <p
          className={`rounded-2xl px-4 py-3 text-sm ${
            status === "success"
              ? "border border-emerald-300/40 bg-emerald-100/60 text-emerald-900 dark:border-emerald-400/20 dark:bg-emerald-950/30 dark:text-emerald-100"
              : "border border-red-300/40 bg-red-100/60 text-red-900 dark:border-red-400/20 dark:bg-red-950/30 dark:text-red-100"
          }`}
        >
          {message}
        </p>
      ) : null}

      <button
        className="inline-flex items-center justify-center rounded-full bg-(--color-accent) px-6 py-3 text-sm font-semibold text-(--color-accent-foreground) transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Saving room..." : "Save room details"}
      </button>
    </form>
  );
}
