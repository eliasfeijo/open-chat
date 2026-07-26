import Link from "next/link";
import type { ReactElement } from "react";

import { getAuthenticatedUser } from "@/modules/auth";
import { SignOutButton } from "@/modules/auth/presentation/sign-out-button";

export async function NavigationBar(): Promise<ReactElement> {
  const authenticatedUser = await getAuthenticatedUser();

  return (
    <header className="border-b border-(--color-border) bg-surface/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:gap-6 sm:px-10 sm:py-4 lg:px-12">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            className="text-base font-semibold tracking-[-0.04em] sm:text-lg"
            href="/"
          >
            OpenChat
          </Link>
          <span className="hidden text-sm text-(--color-muted) lg:inline">
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
          <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3">
            <Link
              className="hidden items-center justify-center rounded-full border border-(--color-border) bg-(--color-page) px-4 py-2 text-sm font-medium text-(--color-muted) transition hover:bg-(--color-surface-strong) lg:inline-flex"
              href="/"
            >
              How it works
            </Link>
            <Link
              className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-(--color-border) bg-(--color-page) px-3 py-2 text-xs font-medium transition hover:bg-(--color-surface-strong) sm:px-4 sm:text-sm"
              href="/rooms"
            >
              Browse rooms
            </Link>
            <Link
              className="hidden md:inline-flex items-center justify-center whitespace-nowrap rounded-full border border-(--color-border) bg-(--color-page) px-3 py-2 text-xs font-medium transition hover:bg-(--color-surface-strong) md:px-4 md:text-sm"
              href="/sign-in?redirectTo=/profile"
            >
              Sign in
            </Link>
            <Link
              className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-(--color-accent) px-3 py-2 text-xs font-semibold text-(--color-accent-foreground) shadow-sm transition hover:brightness-110 sm:px-4 sm:text-sm"
              href="/sign-up?redirectTo=/profile"
            >
              <span className="lg:hidden">Join</span>
              <span className="hidden lg:inline">Join OpenChat</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
