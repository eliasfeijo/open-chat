"use client";

import {
  useActionState,
  useState,
  type ChangeEvent,
  type ReactElement,
} from "react";

import {
  createRoomAction,
  type CreateRoomActionState,
} from "@/modules/rooms/presentation/server/create-room-action";

const initialCreateRoomActionState: CreateRoomActionState = {
  fieldErrors: {},
  message: null,
  status: "idle",
};

export function CreateRoomForm(): ReactElement {
  const [actionState, formAction, isPending] = useActionState(
    createRoomAction,
    initialCreateRoomActionState,
  );
  const [formValues, setFormValues] = useState({
    description: "",
    name: "",
    slug: "",
    tags: "",
    topic: "",
  });
  const fieldErrors = actionState?.fieldErrors ?? {};
  const message = actionState?.message ?? null;
  const status = actionState?.status ?? "idle";

  function updateField(
    fieldName: "description" | "name" | "slug" | "tags" | "topic",
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
      className="space-y-6 rounded-4xl border border-(--color-border) bg-(--color-surface) p-6 shadow-sm"
    >
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="room-name">
          Room name
        </label>
        <input
          className="w-full rounded-2xl border border-(--color-border) bg-(--color-page) px-4 py-3 text-base outline-none transition focus:border-(--color-accent)"
          id="room-name"
          name="name"
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            updateField("name", event.target.value)
          }
          placeholder="OpenChat Builders"
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
        <label className="text-sm font-medium" htmlFor="room-slug">
          Room slug
        </label>
        <input
          className="w-full rounded-2xl border border-(--color-border) bg-(--color-page) px-4 py-3 text-base outline-none transition focus:border-(--color-accent)"
          id="room-slug"
          name="slug"
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            updateField("slug", event.target.value)
          }
          placeholder="openchat-builders"
          type="text"
          value={formValues.slug}
        />
        <p className="text-xs text-(--color-muted)">
          Lowercase letters, numbers, and hyphens only.
        </p>
        {fieldErrors.slug ? (
          <p className="text-sm text-red-700 dark:text-red-300">
            {fieldErrors.slug}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="room-topic">
          Topic
        </label>
        <input
          className="w-full rounded-2xl border border-(--color-border) bg-(--color-page) px-4 py-3 text-base outline-none transition focus:border-(--color-accent)"
          id="room-topic"
          name="topic"
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            updateField("topic", event.target.value)
          }
          placeholder="Shipping public room creation"
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
        <label className="text-sm font-medium" htmlFor="room-tags">
          Tags
        </label>
        <input
          className="w-full rounded-2xl border border-(--color-border) bg-(--color-page) px-4 py-3 text-base outline-none transition focus:border-(--color-accent)"
          id="room-tags"
          name="tags"
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            updateField("tags", event.target.value)
          }
          placeholder="typescript, architecture, search"
          type="text"
          value={formValues.tags}
        />
        <p className="text-xs text-(--color-muted)">
          Up to 5 tags. Use lowercase words separated by commas.
        </p>
        {fieldErrors.tags ? (
          <p className="text-sm text-red-700 dark:text-red-300">
            {fieldErrors.tags}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="room-description">
          Description
        </label>
        <textarea
          className="min-h-32 w-full rounded-2xl border border-(--color-border) bg-(--color-page) px-4 py-3 text-base outline-none transition focus:border-(--color-accent)"
          id="room-description"
          name="description"
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
            updateField("description", event.target.value)
          }
          placeholder="A public room for people building the first OpenChat slices."
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
        {isPending ? "Creating room..." : "Create room"}
      </button>
    </form>
  );
}
