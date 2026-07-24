import Link from "next/link";
import type { ReactElement } from "react";

import { getAuthenticatedUser } from "@/modules/auth";
import { SignOutButton } from "@/modules/auth/presentation/sign-out-button";

export async function NavigationBar(): Promise<ReactElement> {
  const authenticatedUser = await getAuthenticatedUser();

  return (
    <header className="border-b border-(--color-border) bg-surface/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-4 sm:px-10 lg:px-12">
        <div className="flex items-center gap-4">
          <Link className="text-lg font-semibold tracking-[-0.04em]" href="/">
            OpenChat
          </Link>
          <span className="hidden text-sm text-(--color-muted) sm:inline">
            Public rooms for discoverable conversations
          </span>
        </div>

        {authenticatedUser ? (
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-(--color-muted) sm:inline">
              {authenticatedUser.name}
            </span>
            <Link
              className="inline-flex items-center justify-center rounded-full border border-(--color-border) bg-(--color-page) px-4 py-2 text-sm font-medium transition hover:bg-(--color-surface-strong)"
              href="/rooms"
            >
              Rooms
            </Link>
            <Link
              className="inline-flex items-center justify-center rounded-full border border-(--color-border) bg-(--color-page) px-4 py-2 text-sm font-medium transition hover:bg-(--color-surface-strong)"
              href="/profile"
            >
              Profile
            </Link>
            <SignOutButton className="inline-flex items-center justify-center rounded-full bg-(--color-accent) px-4 py-2 text-sm font-semibold text-(--color-accent-foreground) transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70" />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              className="inline-flex items-center justify-center rounded-full border border-(--color-border) bg-(--color-page) px-4 py-2 text-sm font-medium transition hover:bg-(--color-surface-strong)"
              href="/sign-in?redirectTo=/profile"
            >
              Sign in
            </Link>
            <Link
              className="inline-flex items-center justify-center rounded-full bg-(--color-accent) px-4 py-2 text-sm font-semibold text-(--color-accent-foreground) transition hover:brightness-110"
              href="/sign-up?redirectTo=/profile"
            >
              Create account
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
