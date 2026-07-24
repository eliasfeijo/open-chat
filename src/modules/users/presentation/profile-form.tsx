"use client";

import {
  useActionState,
  useState,
  type ChangeEvent,
  type ReactElement,
} from "react";

import {
  type UpdateOwnUserProfileActionState,
  updateOwnUserProfileAction,
} from "@/modules/users/presentation/server/update-own-user-profile-action";
import type { UserProfile } from "@/modules/users";

type ProfileFormProps = Readonly<{
  profile: UserProfile;
}>;

const initialUpdateOwnUserProfileActionState: UpdateOwnUserProfileActionState =
  {
    fieldErrors: {},
    message: null,
    status: "idle",
  };

export function ProfileForm({ profile }: ProfileFormProps): ReactElement {
  const [actionState, formAction, isPending] = useActionState(
    updateOwnUserProfileAction,
    initialUpdateOwnUserProfileActionState,
  );
  const [formValues, setFormValues] = useState({
    bio: profile.bio ?? "",
    username: profile.username ?? "",
  });
  const fieldErrors = actionState?.fieldErrors ?? {};
  const message = actionState?.message ?? null;
  const status = actionState?.status ?? "idle";

  function updateField(fieldName: "bio" | "username", value: string): void {
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
        <label className="text-sm font-medium" htmlFor="profile-username">
          Username
        </label>
        <input
          className="w-full rounded-2xl border border-(--color-border) bg-(--color-page) px-4 py-3 text-base outline-none transition focus:border-(--color-accent)"
          id="profile-username"
          name="username"
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            updateField("username", event.target.value)
          }
          placeholder="public_handle"
          type="text"
          value={formValues.username}
        />
        <p className="text-xs text-(--color-muted)">
          Lowercase letters, numbers, and underscores only.
        </p>
        {fieldErrors.username ? (
          <p className="text-sm text-red-700 dark:text-red-300">
            {fieldErrors.username}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="profile-bio">
          Bio
        </label>
        <textarea
          className="min-h-32 w-full rounded-2xl border border-(--color-border) bg-(--color-page) px-4 py-3 text-base outline-none transition focus:border-(--color-accent)"
          id="profile-bio"
          name="bio"
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
            updateField("bio", event.target.value)
          }
          placeholder="Tell people what kind of conversations you want to have."
          value={formValues.bio}
        />
        {fieldErrors.bio ? (
          <p className="text-sm text-red-700 dark:text-red-300">
            {fieldErrors.bio}
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
        {isPending ? "Saving profile..." : "Save profile"}
      </button>
    </form>
  );
}
