import { redirect } from "next/navigation";
import type { Metadata } from "next";
import type { ReactElement } from "react";

import { getAuthenticatedUser } from "@/modules/auth";
import { NavigationBar } from "@/modules/auth/presentation/navigation-bar";
import { SignInForm } from "@/modules/auth/presentation/sign-in-form";
import { appConfig } from "@/shared/config/app-config";

type SignInPageProps = Readonly<{
  searchParams: Promise<{
    redirectTo?: string;
  }>;
}>;

export const metadata: Metadata = {
  description:
    "Sign in to RoomSurf to continue your public conversations, join rooms, and keep your profile up to date.",
  openGraph: {
    description:
      "Sign in to RoomSurf to continue your public conversations, join rooms, and keep your profile up to date.",
    siteName: appConfig.name,
    title: "Sign in to RoomSurf",
    type: "website",
  },
  robots: {
    follow: true,
    index: false,
  },
  title: "Sign in to RoomSurf",
  twitter: {
    card: "summary",
    description:
      "Sign in to RoomSurf to continue your public conversations, join rooms, and keep your profile up to date.",
    title: "Sign in to RoomSurf",
  },
};

export default async function SignInPage({
  searchParams,
}: SignInPageProps): Promise<ReactElement> {
  const authenticatedUser = await getAuthenticatedUser();
  const resolvedSearchParams = await searchParams;
  const redirectTo = resolvedSearchParams.redirectTo ?? "/profile";

  if (authenticatedUser) {
    redirect(redirectTo);
  }

  return (
    <main className="min-h-screen bg-(--color-page)">
      <NavigationBar />
      <section className="mx-auto flex w-full max-w-6xl px-6 py-16 sm:px-10 lg:px-12">
        <div className="grid w-full gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(24rem,30rem)] lg:items-start">
          <div className="space-y-6 pt-6">
            <span className="inline-flex rounded-full border border-(--color-border) bg-(--color-surface) px-4 py-1 text-sm font-medium text-(--color-muted)">
              Sign in to RoomSurf
            </span>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                Welcome back to RoomSurf.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-(--color-muted)">
                Sign in to continue your conversations, discover public rooms,
                and keep your profile up to date.
              </p>
            </div>
          </div>

          <div className="rounded-4xl border border-(--color-border) bg-(--color-surface) p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <div className="mb-6 space-y-2">
              <h2 className="text-2xl font-semibold tracking-[-0.03em]">
                Welcome back
              </h2>
              <p className="text-sm leading-6 text-(--color-muted)">
                Use your email and password to continue.
              </p>
            </div>
            <SignInForm />
          </div>
        </div>
      </section>
    </main>
  );
}
